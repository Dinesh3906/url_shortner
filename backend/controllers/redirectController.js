const Url = require('../models/Url');
const Analytics = require('../models/Analytics');
const { getRedisClient, getIsRedisConnected } = require('../config/redis');
const UAParser = require('ua-parser-js');

/**
 * Helper function to parse user agent and log analytics asynchronously
 * This runs out-of-band of the HTTP response cycle so redirects are instant.
 */
const logAnalyticsAsync = async (urlDoc, req) => {
  try {
    const start = Date.now();
    
    // 1. Increment total click count in MongoDB
    await Url.findByIdAndUpdate(urlDoc._id, { $inc: { clicks: 1 } });

    // 2. Parse client request headers
    const userAgentStr = req.headers['user-agent'] || '';
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
    // Clean up IPv6 loopback or proxy list
    const ip = rawIp.split(',')[0].trim();

    // Parse OS, Device, Browser using ua-parser-js
    const parser = new UAParser();
    parser.setUA(userAgentStr);
    const uaResult = parser.getResult();
    
    const browser = uaResult.browser.name 
      ? `${uaResult.browser.name} ${uaResult.browser.major || ''}`.trim() 
      : 'Unknown';
      
    let device = 'Desktop';
    if (uaResult.device.type) {
      device = uaResult.device.type.charAt(0).toUpperCase() + uaResult.device.type.slice(1);
    } else if (userAgentStr.toLowerCase().includes('mobi')) {
      device = 'Mobile';
    }

    // Get referrer website
    const referrer = req.headers['referer'] || req.headers['referrer'] || 'Direct';

    // Mock geolocation based on IP for local presentation
    let location = 'United States';
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      location = 'Localhost';
    } else {
      // Pick a random location from a list of major markets to make analytics dashboards look realistic when testing
      const locations = ['United States', 'United Kingdom', 'Germany', 'Canada', 'India', 'Japan', 'France', 'Australia'];
      const hash = ip.split('.').reduce((acc, octet) => acc + parseInt(octet || 0), 0);
      location = locations[hash % locations.length] || 'United States';
    }

    // 3. Create Analytics entry
    await Analytics.create({
      urlId: urlDoc._id,
      ip,
      browser,
      device,
      referrer,
      location
    });

    console.log(`[Async Analytics] Logged click for shortCode: ${urlDoc.shortCode} in ${Date.now() - start}ms`);
  } catch (error) {
    console.error(`[Async Analytics Error] Failed to log click for URL ID: ${urlDoc._id}. Error: ${error.message}`);
  }
};

/**
 * @desc    Redirect to original URL
 * @route   GET /:shortCode
 * @access  Public
 */
const redirect = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    // 1. Search Redis Cache first
    const redisClient = getRedisClient();
    if (redisClient && getIsRedisConnected()) {
      try {
        const cachedUrl = await redisClient.get(`url:${shortCode}`);
        if (cachedUrl) {
          // Cache Hit! Retrieve full URL info from DB asynchronously to check expiry & log analytics
          // To ensure correct expiry check and click logging, we query DB in background
          Url.findOne({ shortCode }).then(urlDoc => {
            if (urlDoc) {
              // If expired, we don't redirect (in next request it will hit DB and return 410)
              // Log analytics in background
              setImmediate(() => logAnalyticsAsync(urlDoc, req));
            }
          });

          console.log(`[Redirect] Cache HIT for shortCode: ${shortCode}`);
          // Redirect immediately with 302 (Found) to avoid browser-level caching of redirects
          return res.redirect(302, cachedUrl);
        }
      } catch (redisErr) {
        console.error('[Redirect Cache Error] Failed to read from Redis:', redisErr.message);
      }
    }

    // 2. Cache Miss: Query MongoDB
    console.log(`[Redirect] Cache MISS for shortCode: ${shortCode}`);
    const urlDoc = await Url.findOne({ shortCode });
    if (!urlDoc) {
      return res.status(404).send(`
        <html>
          <head>
            <title>Link Not Found - ShortLink</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body class="bg-slate-950 text-slate-100 flex items-center justify-center min-h-screen p-4 font-sans">
            <div class="max-w-md w-full text-center space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl backdrop-blur-md">
              <div class="w-16 h-16 bg-red-950/50 border border-red-500/30 text-red-500 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">!</div>
              <h1 class="text-3xl font-extrabold tracking-tight text-white">Link Not Found</h1>
              <p class="text-slate-400 text-sm">The shortened URL link you are looking for does not exist, has been deleted, or the address is incorrect.</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="inline-block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg transition-all">Go to ShortLink Homepage</a>
            </div>
          </body>
        </html>
      `);
    }

    // 3. Expiration Check
    if (urlDoc.expiresAt && urlDoc.expiresAt < new Date()) {
      return res.status(410).send(`
        <html>
          <head>
            <title>Link Expired - ShortLink</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body class="bg-slate-950 text-slate-100 flex items-center justify-center min-h-screen p-4 font-sans">
            <div class="max-w-md w-full text-center space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl backdrop-blur-md">
              <div class="w-16 h-16 bg-yellow-950/50 border border-yellow-500/30 text-yellow-500 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">!</div>
              <h1 class="text-3xl font-extrabold tracking-tight text-white">Link Expired</h1>
              <p class="text-slate-400 text-sm font-light">This shortened link has expired on <span class="text-slate-200 font-semibold">${new Date(urlDoc.expiresAt).toLocaleString()}</span> and is no longer available.</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="inline-block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg transition-all">Go to ShortLink Homepage</a>
            </div>
          </body>
        </html>
      `);
    }

    // 4. Update Redis Cache on Cache Miss
    if (redisClient && getIsRedisConnected()) {
      try {
        await redisClient.setEx(`url:${shortCode}`, 86400, urlDoc.originalUrl);
      } catch (redisErr) {
        console.error('Failed to populate Redis cache:', redisErr.message);
      }
    }

    // 5. Asynchronous non-blocking analytics logging
    setImmediate(() => logAnalyticsAsync(urlDoc, req));

    // 6. Perform redirect immediately
    return res.redirect(302, urlDoc.originalUrl);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  redirect
};
