import subscribeService from "../services/subscribe.service.js";
import Response from "../utils/Response.js";

const subscribeController = {
  subscribe: async (req, res) => {
    const subscriber = await subscribeService.subscribe(req.body.email);
    return res.status(201).send(new Response(true, "Subscribed", subscriber));
  },
};

export default subscribeController;
