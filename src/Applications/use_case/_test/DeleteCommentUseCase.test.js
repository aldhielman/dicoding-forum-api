const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should throw error if no payload', async () => {
    // Arrange
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    // Action & Assert
    await expect(deleteCommentUseCase.execute()).rejects.toThrowError(
      'DELETE_COMMENT_USE_CASE.NOT_CONTAIN_PAYLOAD',
    );
  });

  it('should throw error when payload did not contain needed property', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'abc',
    };

    const deleteCommentUseCase = new DeleteCommentUseCase({});

    // Action and Assert
    await expect(
      deleteCommentUseCase.execute(useCasePayload),
    ).rejects.toThrowError(
      'DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 123,
      threadId: true,
      userId: {},
    };

    const deleteCommentUseCase = new DeleteCommentUseCase({});

    // Action and Assert
    await expect(
      deleteCommentUseCase.execute(useCasePayload),
    ).rejects.toThrowError(
      'DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should orchestrating the delete comment action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockCommentRepository.deleteComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    mockThreadRepository.verifyThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.verifyCommentId = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.verifyOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const getCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await getCommentUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyThreadId).toBeCalledWith(
      useCasePayload.threadId,
    );

    expect(mockCommentRepository.verifyCommentId).toBeCalledWith(
      useCasePayload.commentId,
    );

    expect(mockCommentRepository.verifyOwner).toBeCalledWith(useCasePayload);

    expect(mockCommentRepository.deleteComment).toBeCalledWith(
      useCasePayload.commentId,
    );
  });
});
