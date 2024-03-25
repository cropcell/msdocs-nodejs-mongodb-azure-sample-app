const mongoose = require('mongoose');

const namevoteSchema = new mongoose.Schema({
  name: String,
  userId: String,
  vote: Number
});

module.exports = mongoose.model('NameVote', namevoteSchema);