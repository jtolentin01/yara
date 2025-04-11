const { chats } = require("../models/index");
const { parseUserData } = require("./utils/restapis-utils");
const openAichatExec = require("./middlewares/openAi-middleware");

const newChat = async (req, res, next) => {
  const user = parseUserData(req);
  const { message } = req.body;
  try {
    const gptMessage = await openAichatExec(message);
    await chats.create({
      chatId: Math.floor(1e9 + Math.random() * 9e9).toString(),
      participants: [
        {
          _id: user._id,
          name: `${user.firstname} ${user.lastname}`,
        },
      ],
      messages: [...message, gptMessage],
      createby: `${user.firstname} ${user.lastname}`,
      updatedby: `${user.firstname} ${user.lastname}`,
    });

    res.status(200).json({ success: true, gptMessage });
  } catch (error) {
    next(error);
  }
};

const chatOnExec = async (req, res, next) => {
  const chatId = req.params.id;
  const { message } = req.body;

  try {
    const chatHistory = await chats.findOne({ chatId: chatId });
    if (!chatHistory) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    }
    chatHistory.messages.push(message);
    await chatHistory.save();
    const gptMessage = await openAichatExec(chatHistory.messages);
    chatHistory.messages.push(gptMessage);
    await chatHistory.save();
    res.status(200).json({ success: true, gptMessage });
  } catch (error) {
    next(error);
  }
};

const chatHistory = async (req, res, next) => {
  const chatId = req.params.id;
  try {
    const chatHistory = await chats.findOne({ chatId: chatId });
    if (!chatHistory) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    }
    res.status(200).json({ messages: chatHistory.messages });
  } catch (error) {
    next(error);
  }
};

const getUserChatId = async (req, res, next) => {
  const user = parseUserData(req);
  try {
    const userChat = await chats.findOne({ "participants._id": user._id });

    if (!userChat) {
      return res.status(200).json({
        chatId: null,
      });
    }

    res.status(200).json({ chatId: userChat.chatId });
  } catch (error) {
    next(error);
  }
};


const deleteConversation = async (req, res, next) => {
  const chatId = req.params.id;
  try {
    const userChat = await chats.findOneAndDelete({ chatId: chatId })
    if (!userChat) {
      res.status(200).json({
        success: false,
        message: "Cannot clear empty conversation"
      });
    }

    res.status(200).json({
      success: true,
      message: "Deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { newChat, chatOnExec, chatHistory, getUserChatId, deleteConversation };
