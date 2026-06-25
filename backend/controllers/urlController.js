const Url = require('../models/Url');
const Counter = require('../models/Counter');
const { encodeBase62 } = require('../utils/base62');
const { getRedisClient, getIsRedisConnected } = require('../config/redis');
const validator = require('validator');

const getBaseUrl = (req) => {
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL;
  }
  const host = req.get('host');
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  return `${protocol}://${host}`;
};

/**
 * @desc    Shorten a long URL
 * @route   POST /api/url/shorten
 * @access  Public (Optional auth)
 */
const shorten = async (req, res, next) => {
  try {
    const { originalUrl, expiresAt, customAlias } = req.body;
    const userId = req.user ? req.user.id : null;

    // 1. Validate original URL
    if (!originalUrl) {
      res.status(400);
      throw new Error('Please provide a URL to shorten');
    }

    let urlToShorten = originalUrl.trim();
    if (!urlToShorten.startsWith('http://') && !urlToShorten.startsWith('https://')) {
      urlToShorten = 'https://' + urlToShorten;
    }

    if (!validator.isURL(urlToShorten, { require_protocol: true })) {
      res.status(400);
      throw new Error('Invalid URL format. Please provide a valid web address.');
    }

    let shortCode;

    // If custom alias is provided
    if (customAlias && customAlias.trim() !== '') {
      const alias = customAlias.trim();
      
      // Validate alias (alphanumeric and dashes/underscores, between 3 and 30 characters)
      const aliasRegex = /^[a-zA-Z0-9-_]+$/;
      if (!aliasRegex.test(alias)) {
        res.status(400);
        throw new Error('Custom name must be alphanumeric and can only contain dashes or underscores.');
      }
      if (alias.length < 3 || alias.length > 30) {
        res.status(400);
        throw new Error('Custom name must be between 3 and 30 characters long.');
      }

      // Check availability
      const existing = await Url.findOne({ shortCode: alias });
      if (existing) {
        res.status(400);
        throw new Error('This custom name is already in use. Please try another one.');
      }
      
      shortCode = alias;
    } else {
      // 2. Fetch or Initialize counter document
      let counter = await Counter.findById('url_id');
      if (!counter) {
        counter = await Counter.create({ _id: 'url_id', seq: 0 });
      } else if (counter.seq >= 100000000) {
        // Reset old high counter to generate much shorter codes
        counter.seq = 0;
        await counter.save();
      }

      // 3. Atomically increment the counter to get a unique sequential ID
      counter = await Counter.findByIdAndUpdate(
        'url_id',
        { $inc: { seq: 1 } },
        { new: true }
      );

      // 4. Encode the sequential ID to Base62 short code
      shortCode = encodeBase62(counter.seq);
    }

    // 5. Build expiry date if provided
    let expiryDate = null;
    if (expiresAt) {
      expiryDate = new Date(expiresAt);
      if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
        res.status(400);
        throw new Error('Expiration date must be a valid date in the future');
      }
    }

    // 6. Save URL mapping to MongoDB
    const newUrl = await Url.create({
      userId,
      originalUrl: urlToShorten,
      shortCode,
      expiresAt: expiryDate
    });

    // 7. Store in Redis cache (Cache-Aside pattern: store on write)
    const redisClient = getRedisClient();
    if (redisClient && getIsRedisConnected()) {
      try {
        await redisClient.setEx(`url:${shortCode}`, 86400, urlToShorten);
      } catch (redisErr) {
        console.error('Failed to write to Redis cache:', redisErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      data: {
        _id: newUrl._id,
        originalUrl: newUrl.originalUrl,
        shortCode: newUrl.shortCode,
        clicks: newUrl.clicks,
        createdAt: newUrl.createdAt,
        expiresAt: newUrl.expiresAt,
        shortUrl: `${getBaseUrl(req)}/${newUrl.shortCode}`
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all URLs created by the authenticated user
 * @route   GET /api/url/my-urls
 * @access  Private
 */
const getUserUrls = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const urls = await Url.find({ userId }).sort({ createdAt: -1 });

    const baseUrl = getBaseUrl(req);
    const formattedUrls = urls.map(url => ({
      ...url.toObject(),
      shortUrl: `${baseUrl}/${url.shortCode}`
    }));

    return res.json({
      success: true,
      data: formattedUrls
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a shortened URL
 * @route   DELETE /api/url/:id
 * @access  Private
 */
const deleteUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find URL
    const url = await Url.findById(id);
    if (!url) {
      res.status(404);
      throw new Error('Short URL not found');
    }

    // Verify ownership
    if (url.userId.toString() !== userId) {
      res.status(403);
      throw new Error('You are not authorized to delete this URL');
    }

    // Delete from MongoDB
    await Url.findByIdAndDelete(id);

    // Remove from Redis cache
    const redisClient = getRedisClient();
    if (redisClient && getIsRedisConnected()) {
      try {
        await redisClient.del(`url:${url.shortCode}`);
      } catch (redisErr) {
        console.error('Failed to delete from Redis cache:', redisErr.message);
      }
    }

    return res.json({
      success: true,
      message: 'Short URL deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  shorten,
  getUserUrls,
  deleteUrl
};
