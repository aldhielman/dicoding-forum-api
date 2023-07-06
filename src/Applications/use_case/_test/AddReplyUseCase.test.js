const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const Reply = require('../../../Domains/replies/entities/Reply');
const AddReplyUseCase = require('../AddReplyUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddReplyUseCase', () => {
  it('should throw error if no payload', async () => {
    // Arrange
    const addReplyUseCase = new AddReplyUseCase({});

    // Action & Assert
    await expect(addReplyUseCase.execute()).rejects.toThrowError(
      'ADD_REPLY_USE_CASE.NOT_CONTAIN_PAYLOAD',
    );
  });

  it('should throw error when payload did not contain needed property', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Comment 1',
      userId: 'user-123',
    };

    const addReplyUseCase = new AddReplyUseCase({});

    // Action and Assert
    await expect(addReplyUseCase.execute(useCasePayload)).rejects.toThrowError(
      'ADD_REPLY_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', async () => {
    // Arrange
    const useCasePayload = {
      content: 123,
      commentId: true,
      userId: {},
      threadId: 'thread-123',
    };

    const addReplyUseCase = new AddReplyUseCase({});

    // Action and Assert
    await expect(addReplyUseCase.execute(useCasePayload)).rejects.toThrowError(
      'ADD_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Comment 1',
      threadId: 'thread-123',
      userId: 'user-123',
      commentId: 'comment-123',
    };

    const mockReply = new Reply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.userId,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockReplyRepository.addReply = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockReply));

    mockThreadRepository.verifyThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.verifyCommentId = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const getReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const comment = await getReplyUseCase.execute(useCasePayload);

    // Assert
    expect(comment).toStrictEqual(
      new Reply({
        id: 'reply-123',
        content: useCasePayload.content,
        owner: useCasePayload.userId,
      }),
    );

    expect(mockThreadRepository.verifyThreadId).toBeCalledWith(
      useCasePayload.threadId,
    );

    expect(mockCommentRepository.verifyCommentId).toBeCalledWith(
      useCasePayload.commentId,
    );
    expect(mockReplyRepository.addReply).toBeCalledWith({
      content: useCasePayload.content,
      userId: useCasePayload.userId,
      commentId: useCasePayload.commentId,
      threadId: useCasePayload.threadId,
    });
  });
});
