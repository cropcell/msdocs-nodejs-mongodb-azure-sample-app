const mongoose = require('mongoose');

const namevoteSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  userId: {
    type: String,
    trim: true,
  },
  vote: Number
});

module.exports = mongoose.model('NameVote', namevoteSchema);