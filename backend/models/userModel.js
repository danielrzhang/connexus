const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
    required: true,
    default: "https://icons8.com/icon/teAmm8wzAnK7/test-account"
  },
},
{
  timestamps: true
});

const User = mongoose.model("User", userSchema);

module.exports = User;