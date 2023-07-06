const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const Comment = require('../../../Domains/comments/entities/Comment');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should throw error if no payload', async () => {
    // Arrange
    const addCommentUseCase = new AddCommentUseCase({});

    // Action & Assert
    await expect(addCommentUseCase.execute()).rejects.toThrowError(
      'ADD_COMMENT_USE_CASE.NOT_CONTAIN_PAYLOAD',
    );
  });

  it('should throw error when payload did not contain needed property', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Comment 1',
      userId: 'user-123',
    };

    const addCommentUseCase = new AddCommentUseCase({});

    // Action and Assert
    await expect(
      addCommentUseCase.execute(useCasePayload),
    ).rejects.toThrowError(
      'ADD_COMMENT_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', async () => {
    // Arrange
    const useCasePayload = {
      content: 123,
      threadId: true,
      userId: {},
    };

    const addCommentUseCase = new AddCommentUseCase({});

    // Action and Assert
    await expect(
      addCommentUseCase.execute(useCasePayload),
    ).rejects.toThrowError(
      'ADD_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Comment 1',
      userId: 'user-123',
      threadId: 'thread-123',
    };

    const mockComment = new Comment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.userId,
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockCommentRepository.addComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockComment));

    mockThreadRepository.viewThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const getCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const comment = await getCommentUseCase.execute(useCasePayload);

    // Assert
    expect(comment).toStrictEqual(
      new Comment({
        id: 'comment-123',
        content: useCasePayload.content,
        owner: useCasePayload.userId,
      }),
    );

    expect(mockThreadRepository.viewThread).toBeCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.addComment).toBeCalledWith({
      content: useCasePayload.content,
      userId: useCasePayload.userId,
      threadId: useCasePayload.threadId,
    });
  });
});
