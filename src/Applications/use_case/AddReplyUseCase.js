class AddReplyUseCase {
  constructor({ replyRepository, commentRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
  }
  async execute(useCasePayload) {
    this._verifyPayload(useCasePayload);
    const { commentId } = useCasePayload;
    await this._commentRepository.verifyCommentId(commentId);
    return this._replyRepository.addReply(useCasePayload);
  }
  _verifyPayload(payload) {
    if (payload == undefined) {
      throw new Error('ADD_REPLY_USE_CASE.NOT_CONTAIN_PAYLOAD');
    }
    const { content, userId, commentId } = payload;
    if (!content || !userId || !commentId) {
      throw new Error('ADD_REPLY_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (
      typeof content !== 'string' ||
      typeof userId !== 'string' ||
      typeof commentId !== 'string'
    ) {
      throw new Error(
        'ADD_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION'
      );
    }
  }
}

module.exports = AddReplyUseCase;
