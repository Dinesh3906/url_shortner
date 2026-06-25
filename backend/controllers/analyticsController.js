const Url = require('../models/Url');
const Analytics = require('../models/Analytics');

const getBaseUrl = (req) => {
  const host = req.get('host');
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  return `${protocol}://${host}`;
};

/**
 * @desc    Get analytics for a specific shortened URL
 * @route   GET /api/analytics/:urlId
 * @access  Private
 */
const getUrlAnalytics = async (req, res, next) => {
  try {
    const { urlId } = req.params;
    const userId = req.user.id;

    // 1. Find URL and verify existence
    const url = await Url.findById(urlId);
    if (!url) {
      res.status(404);
      throw new Error('Short URL not found');
    }

    // 2. Verify ownership (only the owner can view detailed analytics)
    if (!url.userId || url.userId.toString() !== userId) {
      res.status(403);
      throw new Error('You are not authorized to view analytics for this URL');
    }

    // 3. Define time boundary for click history (e.g. past 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0); // Start of day 7 days ago

    // 4. Run Aggregations in parallel using Promise.all for high performance
    const [
      clicksOverTime,
      deviceBreakdown,
      browserBreakdown,
      locationBreakdown,
      referrerBreakdown
    ] = await Promise.all([
      // Clicks aggregated by day (YYYY-MM-DD) for past 7 days
      Analytics.aggregate([
        {
          $match: {
            urlId: url._id,
            timestamp: { $gte: sevenDaysAgo }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            clicks: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Devices breakdown
      Analytics.aggregate([
        { $match: { urlId: url._id } },
        {
          $group: {
            _id: '$device',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Browsers breakdown
      Analytics.aggregate([
        { $match: { urlId: url._id } },
        {
          $group: {
            _id: '$browser',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Locations breakdown
      Analytics.aggregate([
        { $match: { urlId: url._id } },
        {
          $group: {
            _id: '$location',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Referrers breakdown
      Analytics.aggregate([
        { $match: { urlId: url._id } },
        {
          $group: {
            _id: '$referrer',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ])
    ]);

    // 5. Post-process click history to fill in dates with 0 clicks (critical for clean UI graphs)
    const historyMap = new Map();
    clicksOverTime.forEach(item => {
      historyMap.set(item._id, item.clicks);
    });

    const clickHistory = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      clickHistory.push({
        date: dateStr,
        clicks: historyMap.get(dateStr) || 0
      });
    }

    const baseUrl = getBaseUrl(req);

    return res.json({
      success: true,
      data: {
        url: {
          _id: url._id,
          originalUrl: url.originalUrl,
          shortCode: url.shortCode,
          clicks: url.clicks,
          createdAt: url.createdAt,
          expiresAt: url.expiresAt,
          shortUrl: `${baseUrl}/${url.shortCode}`
        },
        clickHistory,
        deviceBreakdown: deviceBreakdown.map(item => ({ name: item._id, value: item.count })),
        browserBreakdown: browserBreakdown.map(item => ({ name: item._id, value: item.count })),
        locationBreakdown: locationBreakdown.map(item => ({ name: item._id, value: item.count })),
        referrerBreakdown: referrerBreakdown.map(item => ({ name: item._id, value: item.count }))
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUrlAnalytics
};
