class ToogleLikeUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(payload) {
    this._verifyPayload(payload);
    const { threadId, commentId, userId } = payload;
    await this._threadRepository.verifyThreadId(threadId);
    await this._commentRepository.verifyCommentId(commentId);
    const isExist = await this._likeRepository.isExist({ commentId, userId });
    if (isExist) {
      await this._likeRepository.deleteLike(payload);
    } else {
      await this._likeRepository.addLike(payload);
    }

    return { status: 'success' };
  }

  _verifyPayload(payload) {
    this.payload = payload;
    if (payload === undefined) {
      throw new Error('TOOGLE_LIKE_USE_CASE.NOT_CONTAIN_PAYLOAD');
    }
    const { userId, commentId, threadId } = payload;
    if (!userId || !commentId || !threadId) {
      throw new Error(
        'TOOGLE_LIKE_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY',
      );
    }
    if (
      typeof userId !== 'string'
      || typeof commentId !== 'string'
      || typeof threadId !== 'string'
    ) {
      throw new Error(
        'TOOGLE_LIKE_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION',
      );
    }
  }
}

module.exports = ToogleLikeUseCase;
