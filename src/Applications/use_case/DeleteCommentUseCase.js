class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    this._verifyPayload(useCasePayload);
    const { threadId, commentId } = useCasePayload;
    await this._threadRepository.viewThread(threadId);
    await this._commentRepository.verifyOwner(useCasePayload);
    await this._commentRepository.deleteComment(commentId);
  }

  _verifyPayload(payload) {
    if (payload == undefined) {
      throw new Error('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_PAYLOAD');
    }

    const { commentId, threadId } = payload;

    if (!commentId || !threadId) {
      throw new Error(
        'DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY'
      );
    }

    if (typeof commentId !== 'string' || typeof threadId !== 'string') {
      throw new Error(
        'DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION'
      );
    }
  }
}

module.exports = DeleteCommentUseCase;
