import jobWishlistRepository from "../repositories/jobWishlist.repository.js";
import Response from "../utils/Response.js";

const jobWishlistController = {
  createJobWishlist: async (req, res) => {
    const checkJobWishList = await jobWishlistRepository.getSingleJobWishlist({
      user: req.user._id,
      job: req.body.job,
    });

    if (checkJobWishList) {
      await jobWishlistRepository.removeFromJobWishlist(checkJobWishList._id);
      return res.status(200).send(new Response(true, "Removed from wishlist"));
    }

    const jobWishlist = await jobWishlistRepository.createJobWishlist({
      user: req.user._id,
      job: req.body.job,
    });
    return res
      .status(201)
      .send(new Response(true, "Added to wishlist", jobWishlist));
  },

  getJobWishlist: async (req, res) => {
    const jobWishlists = await jobWishlistRepository.getJobWishlist(
      req.user._id
    );
    return res
      .status(200)
      .send(new Response(true, "Wishlist fetched", jobWishlists));
  },
};

export default jobWishlistController;
