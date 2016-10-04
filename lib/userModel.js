var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  username: {type: String, unique: true},
  password: {type: String},
  todos: [String]
});

var User = mongoose.model('session', schema);

module.exports = User;
