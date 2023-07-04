class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    this._verifyPayload(useCasePayload);
    const { thread_id } = useCasePayload;
    await this._threadRepository.viewThread(thread_id);
    return this._commentRepository.addComment(useCasePayload);
  }

  _verifyPayload(payload) {
    if (payload == undefined) {
      throw new Error('ADD_COMMENT_USE_CASE.NOT_CONTAIN_PAYLOAD');
    }

    const { content, user_id, thread_id } = payload;

    if (!content || !user_id || !thread_id) {
      throw new Error(
        'ADD_COMMENT_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY'
      );
    }

    if (
      typeof content !== 'string' ||
      typeof user_id !== 'string' ||
      typeof thread_id !== 'string'
    ) {
      throw new Error(
        'ADD_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION'
      );
    }
  }
}

module.exports = AddCommentUseCase;
