const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  seq: {
    type: Number,
    default: 100000000 // Starts at 100 million to ensure 5-6 char short URLs
  }
});

module.exports = mongoose.model('Counter', CounterSchema);
