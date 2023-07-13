const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should throw error if no payload', async () => {
    // Arrange
    const deleteCommentUseCase = new DeleteReplyUseCase({});

    // Action & Assert
    await expect(deleteCommentUseCase.execute()).rejects.toThrowError(
      'DELETE_REPLY_USE_CASE.NOT_CONTAIN_PAYLOAD',
    );
  });

  it('should throw error when payload did not contain needed property', async () => {
    // Arrange
    const useCasePayload = {
      replyId: 'abc',
    };

    const deleteCommentUseCase = new DeleteReplyUseCase({});

    // Action and Assert
    await expect(
      deleteCommentUseCase.execute(useCasePayload),
    ).rejects.toThrowError(
      'DELETE_REPLY_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', async () => {
    // Arrange
    const useCasePayload = {
      replyId: [],
      commentId: 123,
      userId: {},
      threadId: '123',
    };

    const deleteReplyUseCase = new DeleteReplyUseCase({});

    // Action and Assert
    await expect(
      deleteReplyUseCase.execute(useCasePayload),
    ).rejects.toThrowError(
      'DELETE_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should orchestrating the delete reply action correctly', async () => {
    const useCasePayload = {
      replyId: 'reply-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockReplyRepository.deleteReply = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    mockReplyRepository.verifyOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    mockReplyRepository.verifyReplyId = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.verifyCommentId = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    mockThreadRepository.verifyThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
    });

    await deleteReplyUseCase.execute(useCasePayload);

    // Action
    expect(mockThreadRepository.verifyThreadId).toBeCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyCommentId).toBeCalledWith(
      useCasePayload.commentId,
    );
    expect(mockReplyRepository.verifyReplyId).toBeCalledWith(
      useCasePayload.replyId,
    );
    expect(mockReplyRepository.verifyOwner).toBeCalledWith(useCasePayload);
    expect(mockReplyRepository.deleteReply).toBeCalledWith(
      useCasePayload.replyId,
    );
  });
});
