const express = require("express");
const dotenv = require("dotenv");
const { chats } = require("./data/data");

const app = express();
dotenv.config();

app.get("/", (request, response) => {
  response.send("API is running successfully");
});

app.get("/api/chat", (request, response) => {
  response.send(chats);
});

app.get("/api/chat/:id", (request, response) => {
  const singleChat = chats.find((c) => c._id === request.params.id);
  response.send(singleChat);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on Port ${PORT}`));
