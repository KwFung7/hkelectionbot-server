let mongoose = require('mongoose');
const dbConnection = process.env.MONGODB_URI;

mongoose.Promise = global.Promise;
mongoose.connect(dbConnection, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB.');
}, (err) => {
  console.log(err);
});

module.exports = mongoose;
