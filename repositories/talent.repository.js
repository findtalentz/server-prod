import { User } from "../models/user.model.js";

const talentRepository = {
  findTalents: async ({ search, page = 1, pageSize = 12 }) => {
    let filter = { role: "SELLER" };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { about: { $regex: search, $options: "i" } },
        { skills: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    const sort = { createdAt: -1 };

    const talents = await User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(pageSize));

    const totalCount = await User.countDocuments(filter);

    return { talents, totalCount };
  },
};

export default talentRepository;
