const conversations = new Map();

const conversationRepository = {
  getLastResponseId(conversationId) {
    return conversations.get(conversationId);
  },

  setLastResponseId(conversationId, responseId) {
    conversations.set(conversationId, responseId);
  },
};

export default conversationRepository;