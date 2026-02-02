import talentWishlistRepository from "../repositories/talentWishlist.repository.js";
import Response from "../utils/Response.js";

const talentWishlistController = {
  createTalentWishlist: async (req, res) => {
    const checkTalentWishList =
      await talentWishlistRepository.getSingleTalentWishlist({
        user: req.user._id,
        talent: req.body.talent,
      });

    if (checkTalentWishList) {
      await talentWishlistRepository.removeFromTalentWishlist(
        checkTalentWishList._id
      );
      return res.status(200).send(new Response(true, "Removed from wishlist"));
    }

    const talentWishlist = await talentWishlistRepository.createTalentWishlist({
      user: req.user._id,
      talent: req.body.talent,
    });
    return res
      .status(201)
      .send(new Response(true, "Added to wishlist", talentWishlist));
  },

  getTalentWishlist: async (req, res) => {
    const talentWishlists = await talentWishlistRepository.getTalentWishlist(
      req.user._id
    );
    return res
      .status(200)
      .send(new Response(true, "Wishlist fetched", talentWishlists));
  },
};

export default talentWishlistController;
