let mongoose = require('../db-connect.js');
const contentSchema = require('../schemas/contentSchema');

const Contents = mongoose.model('Contents', contentSchema);

module.exports = {
  Contents
};
