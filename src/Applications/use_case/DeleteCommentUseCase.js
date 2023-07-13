class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    this._verifyPayload(useCasePayload);
    const { threadId, commentId } = useCasePayload;
    await this._threadRepository.verifyThreadId(threadId);
    await this._commentRepository.verifyCommentId(commentId);
    await this._commentRepository.verifyOwner(useCasePayload);
    await this._commentRepository.deleteComment(commentId);
  }

  _verifyPayload(payload) {
    this.payload = payload;
    if (payload === undefined) {
      throw new Error('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_PAYLOAD');
    }

    const { commentId, threadId, userId } = payload;

    if (!commentId || !threadId || !userId) {
      throw new Error(
        'DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY',
      );
    }

    if (
      typeof commentId !== 'string'
      || typeof threadId !== 'string'
      || typeof userId !== 'string'
    ) {
      throw new Error(
        'DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION',
      );
    }
  }
}

module.exports = DeleteCommentUseCase;
