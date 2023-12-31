const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

// Access chats
const accessChat = asyncHandler(async (request, response) => {
  const { userId } = request.body;

  if (!userId) {
    console.log("User ID parameter not sent with request");
    return response.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: request.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name picture email",
  });

  if (isChat.length > 0) {
    response.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [request.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({
        _id: createdChat._id,
      }).populate("users", "-password");
      response.status(200).send(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

// Fetch chat information
const fetchChat = asyncHandler(async (request, response) => {
  try {
    Chat.find({
      users: { $elemMatch: { $eq: request.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name picture email",
        });

        response.status(200).send(results);
      });
  } catch (error) {
    response.status(400);
    throw new Error(error.message);
  }
});

// Create new group chat
const createGroupChat = asyncHandler(async (request, response) => {
  if (!request.body.users || !request.body.name) {
    return response.status(400).send({
      message: "Please ensure that all fields are filled out",
    });
  }

  var users = JSON.parse(request.body.users);

  if (users.length < 2) {
    return response
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(request.user);

  try {
    const groupChat = await Chat.create({
      chatName: request.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: request.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    response.status(200).json(fullGroupChat);
  } catch (error) {
    response.status(400);
    throw new Error(error.message);
  }
});

// Rename group chat
const renameGroupChat = asyncHandler(async (request, response) => {
  const { chatId, chatName } = request.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    response.status(404);
    throw new Error("Group chat not found");
  } else {
    response.json(updatedChat);
  }
});

const addToGroupChat = asyncHandler(async (request, response) => {
  const { chatId, userId } = request.body;

  const addedToChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!addedToChat) {
    response.status(404);
    throw new Error("Group chat not found");
  } else {
    response.json(addedToChat);
  }
});

const removeFromGroupChat = asyncHandler(async (request, response) => {
  const { chatId, userId } = request.body;

  const removedFromChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removedFromChat) {
    response.status(404);
    throw new Error("Group chat not found");
  } else {
    response.json(removedFromChat);
  }
});

module.exports = {
  accessChat,
  fetchChat,
  createGroupChat,
  renameGroupChat,
  addToGroupChat,
  removeFromGroupChat,
};
