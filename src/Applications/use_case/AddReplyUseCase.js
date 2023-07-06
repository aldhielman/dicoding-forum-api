class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    this._verifyPayload(useCasePayload);
    const { commentId, threadId } = useCasePayload;
    await this._threadRepository.verifyThreadId(threadId);
    await this._commentRepository.verifyCommentId(commentId);
    return this._replyRepository.addReply(useCasePayload);
  }

  _verifyPayload(payload) {
    this.payload = payload;
    if (payload === undefined) {
      throw new Error('ADD_REPLY_USE_CASE.NOT_CONTAIN_PAYLOAD');
    }
    const {
      content, userId, commentId, threadId,
    } = payload;
    if (!content || !userId || !commentId || !threadId) {
      throw new Error('ADD_REPLY_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (
      typeof content !== 'string'
      || typeof userId !== 'string'
      || typeof commentId !== 'string'
      || typeof threadId !== 'string'
    ) {
      throw new Error(
        'ADD_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION',
      );
    }
  }
}

module.exports = AddReplyUseCase;
