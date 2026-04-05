const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  }],
  image: {
    type: String,
    default: "https://picsum.photos/600/300"
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  views: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

PostSchema.index({ category: 1 });
PostSchema.index({ author: 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ views: -1 });
PostSchema.index({ title: "text", content: "text" });

module.exports = mongoose.model("Post", PostSchema);