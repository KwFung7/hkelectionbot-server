let mongoose = require('mongoose');
let Schema = mongoose.Schema;

const contentSchema = new Schema({
  welcomeMessage: {
    type: Schema.Types.String,
    required: true
  }
});

module.exports = contentSchema;
