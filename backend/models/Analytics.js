const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true,
    index: true // Fast lookup of analytics records per URL
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true // Fast date range aggregation (e.g. clicks over last 7 days)
  },
  ip: {
    type: String,
    default: 'Unknown'
  },
  browser: {
    type: String,
    default: 'Unknown'
  },
  device: {
    type: String,
    default: 'Desktop'
  },
  referrer: {
    type: String,
    default: 'Direct'
  },
  location: {
    type: String,
    default: 'Unknown'
  }
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
