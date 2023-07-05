class ViewThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;
    return this._threadRepository.viewThread(threadId);
  }
}

module.exports = ViewThreadUseCase;
