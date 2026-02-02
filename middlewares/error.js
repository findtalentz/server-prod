import APIError from "../utils/APIError.js";
import Response from "../utils/Response.js";

const error = (err, req, res, next) => {
  console.log(err);
  if (err instanceof APIError)
    return res.status(err.status).send(new Response(false, err.message));

  return res.status(500).send(new Response(false, "Internal server error"));
};

export default error;
