let mongoose = require('../db-connect.js');
const candidateSchema = require('../schemas/candidateSchema');

const Candidate = mongoose.model('Candidate', candidateSchema);

module.exports = {
    Candidate
};
