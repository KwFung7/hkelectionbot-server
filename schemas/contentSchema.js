let mongoose = require('mongoose');
let Schema = mongoose.Schema;

const contentSchema = new Schema({
  welcomeMessage: {
    type: Schema.Types.String,
    required: true
  },
  feedback: {
    text: {
      type: Schema.Types.String,
      required: true
    },
    buttonLabel: {
      type: Schema.Types.String,
      required: true
    },
    link: {
      type: Schema.Types.String,
      required: true
    }
  },
  about: {
    type: Schema.Types.String,
    require: true
  }
});

module.exports = contentSchema;
