class DeleteReplyUseCase {
  constructor({ commentRepository, replyRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._threadRepository = threadRepository;
  }
  async execute(useCasePayload) {
    this._verifyPayload(useCasePayload);
    const { replyId, commentId, threadId } = useCasePayload;
    await this._threadRepository.verifyThreadId(threadId);
    await this._commentRepository.verifyCommentId(commentId);
    await this._replyRepository.verifyOwner(useCasePayload);
    await this._replyRepository.deleteReply(replyId);
  }
  _verifyPayload(payload) {
    if (payload == undefined) {
      throw new Error('DELETE_REPLY_USE_CASE.NOT_CONTAIN_PAYLOAD');
    }
    const { commentId, replyId, userId, threadId } = payload;
    if (!commentId || !replyId || !userId || !threadId) {
      throw new Error(
        'DELETE_REPLY_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY'
      );
    }
    if (
      typeof commentId !== 'string' ||
      typeof replyId !== 'string' ||
      typeof userId !== 'string' ||
      typeof threadId !== 'string'
    ) {
      throw new Error(
        'DELETE_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION'
      );
    }
  }
}

module.exports = DeleteReplyUseCase;
