let mongoose = require('../db-connect.js');
const candidateSchema = require('../schemas/candidateSchema');
const contentSchema = require('../schemas/contentSchema');

const Candidates = mongoose.model('Candidates', candidateSchema);
const Contents = mongoose.model('Contents', contentSchema);

module.exports = {
  Candidates,
  Contents
};
