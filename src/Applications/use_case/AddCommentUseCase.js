class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    this._verifyPayload(useCasePayload);
    const { threadId } = useCasePayload;
    await this._threadRepository.verifyThreadId(threadId);
    return this._commentRepository.addComment(useCasePayload);
  }

  _verifyPayload(payload) {
    this.payload = payload;
    if (payload === undefined) {
      throw new Error('ADD_COMMENT_USE_CASE.NOT_CONTAIN_PAYLOAD');
    }

    const { content, userId, threadId } = payload;

    if (!content || !userId || !threadId) {
      throw new Error(
        'ADD_COMMENT_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY',
      );
    }

    if (
      typeof content !== 'string'
      || typeof userId !== 'string'
      || typeof threadId !== 'string'
    ) {
      throw new Error(
        'ADD_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION',
      );
    }
  }
}

module.exports = AddCommentUseCase;
