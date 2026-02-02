import talentRepository from "../repositories/talent.repository.js";

const talentService = {
  getTalents: async (query) => {
    const { talents, totalCount } = await talentRepository.findTalents(query);
    return { talents, totalCount };
  },
};

export default talentService;
