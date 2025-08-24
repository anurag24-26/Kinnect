const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: "text" }, // text, media, etc.
    status: { 
      type: String, 
      enum: ["sent", "delivered", "read"], 
      default: "sent" 
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,   // will hold the message being replied to
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
