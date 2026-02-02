import { Comment } from "../models/comment.model.js";

const commentRepositeory = {
  createComment: async (data) => {
    return await Comment.create(data);
  },

  updateComment: async (id, data) => {
    return await Comment.findByIdAndUpdate(id, data);
  },

  getCommentByJob: async (job) => {
    return await Comment.find({ job })
      .sort("-createdAt")
      .populate("client", "firstName lastName image")
      .populate("seller", "_id firstName lastName image");
  },

  getCommentByClient: async (seller) => {
    return await Comment.find({ seller, isOpened: false })
      .limit(5)
      .populate("client", "firstName lastName image")
      .populate("seller", "_id firstName lastName image");
  },

  getCommentById: async (id) => {
    return await Comment.findById(id)
      .populate("client", "firstName lastName image")
      .populate("seller", "_id firstName lastName image");
  },
};

export default commentRepositeory;
