import commentRepositeory from "../repositories/comment.repository.js";
import commentService from "../services/comment.service.js";
import Response from "../utils/Response.js";

const commentController = {
  createComment: async (req, res) => {
    const comment = await commentService.createComment(req.body);
    return res.status(201).send(new Response(true, "Comment created", comment));
  },
  updateComment: async (req, res) => {
    const updatedComment = await commentService.updateComment(
      req.params.id,
      req.body
    );
    return res
      .status(200)
      .send(new Response(true, "Comment updated", updatedComment));
  },
  getCommentByJob: async (req, res) => {
    const comments = await commentRepositeory.getCommentByJob(req.params.jobId);
    return res.status(200).send(new Response(true, "Success", comments));
  },
  getCommentByClient: async (req, res) => {
    const comments = await commentRepositeory.getCommentByClient(req.user._id);
    return res.status(200).send(new Response(true, "Success", comments));
  },
  approveTimeRequest: async (req, res) => {
    await commentService.approveTimeRequest(req.body);
    return res.status(200).send(new Response(true, "Success"));
  },
  approveDelivery: async (req, res) => {
    await commentService.approveDelivery({
      ...req.body,
      clientId: req.user._id,
    });
    return res.status(200).send(new Response(true, "Success"));
  },
};

export default commentController;
