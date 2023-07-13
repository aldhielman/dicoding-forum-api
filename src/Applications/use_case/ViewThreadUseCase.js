class ViewThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;
    await this._threadRepository.verifyThreadId(threadId);
    const thread = await this._threadRepository.viewThread(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(
      threadId,
    );

    for (let i = 0; i < comments.length; i += 1) {
      const comment = comments[i];
      // eslint-disable-next-line no-await-in-loop
      await this.processComment(comment);
      thread.comments[i] = comment;
      delete thread.comments[i].isDeleted;
    }

    return thread;
  }

  async processComment(comment) {
    const processedComment = { ...comment };

    if (processedComment.isDeleted) {
      processedComment.content = '**komentar telah dihapus**';
    }

    processedComment.replies = await this._replyRepository.getRepliesByCommentId(processedComment.id);

    await Promise.all(
      processedComment.replies.map(async (reply) => {
        await this.processReply(reply);
        // eslint-disable-next-line no-param-reassign
        delete reply.isDeleted;
      }),
    );

    Object.assign(comment, processedComment);
  }

  // eslint-disable-next-line class-methods-use-this
  async processReply(reply) {
    const processedReply = { ...reply };

    if (processedReply.isDeleted) {
      processedReply.content = '**balasan telah dihapus**';
    }
    delete processedReply.isDeleted;

    Object.assign(reply, processedReply);
  }
}

module.exports = ViewThreadUseCase;
