const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

const registerUser = asyncHandler(async (request, response) => {
  const { name, email, password, picture } = request.body;

  if (!name || !email || !password) {
    response.status(400);
    throw new Error("Please ensure that all fields are filled out");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    response.status(400);
    throw new Error("A user has already been registered with that email");
  }

  const user = await User.create({
    name,
    email,
    password,
    picture,
  });

  if (user) {
    response.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      token: generateToken(user._id),
    });
  } else {
    response.status(400);
    throw new Error("Failed to create new user");
  }
});

const authUser = asyncHandler(async (request, response) => {
  const { email, password } = request.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    response.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      token: generateToken(user._id),
    });
  } else {
    response.status(401);
    throw new Error("Invalid email address or password");
  }
});

module.exports = { registerUser, authUser };
