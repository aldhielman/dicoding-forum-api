const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const ToogleLikeUseCase = require('../ToogleLikeUseCase');

describe('ToogleLikeUseCase', () => {
  it('should throw error if no payload', async () => {
    // Arrange
    const toogleLikeUseCase = new ToogleLikeUseCase({});

    // Action & Assert
    await expect(toogleLikeUseCase.execute()).rejects.toThrowError(
      'TOOGLE_LIKE_USE_CASE.NOT_CONTAIN_PAYLOAD',
    );
  });

  it('should throw error when payload did not contain needed property', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const toogleLikeUseCase = new ToogleLikeUseCase({});

    // Action and Assert
    await expect(
      toogleLikeUseCase.execute(useCasePayload),
    ).rejects.toThrowError(
      'TOOGLE_LIKE_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 1,
      commentId: [],
      userId: {},
    };

    const toogleLikeUseCase = new ToogleLikeUseCase({});

    // Action and Assert
    await expect(
      toogleLikeUseCase.execute(useCasePayload),
    ).rejects.toThrowError(
      'TOOGLE_LIKE_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  describe('when like record not exist', () => {
    it('should orchestrating toogleLikeUseCase correctly by calling addLike method', async () => {
      const useCasePayload = {
        threadId: 'thread-123',
        commentId: 'comment-123',
        userId: 'user-123',
      };

      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();
      const mockLikeRepository = new LikeRepository();

      mockThreadRepository.verifyThreadId = jest.fn(() => Promise.resolve());
      mockCommentRepository.verifyCommentId = jest.fn(() => Promise.resolve());
      mockLikeRepository.isExist = jest.fn(() => Promise.resolve(false));
      mockLikeRepository.addLike = jest.fn(() => Promise.resolve({ status: 'success' }));

      const toogleLikeUseCase = new ToogleLikeUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
        likeRepository: mockLikeRepository,
      });

      const result = await toogleLikeUseCase.execute(useCasePayload);

      expect(result).toStrictEqual({ status: 'success' });

      expect(mockThreadRepository.verifyThreadId).toBeCalledWith(
        useCasePayload.threadId,
      );
      expect(mockCommentRepository.verifyCommentId).toBeCalledWith(
        useCasePayload.commentId,
      );

      expect(mockLikeRepository.isExist).toBeCalledWith({
        commentId: useCasePayload.commentId,
        userId: useCasePayload.userId,
      });

      expect(mockLikeRepository.addLike).toBeCalledWith(useCasePayload);
    });
  });

  describe('when like record exist', () => {
    it('should orchestrating toogleLikeUseCase correctly by calling deleteLike method', async () => {
      const useCasePayload = {
        threadId: 'thread-123',
        commentId: 'comment-123',
        userId: 'user-123',
      };

      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();
      const mockLikeRepository = new LikeRepository();

      mockThreadRepository.verifyThreadId = jest.fn(() => Promise.resolve());
      mockCommentRepository.verifyCommentId = jest.fn(() => Promise.resolve());
      mockLikeRepository.isExist = jest.fn(() => Promise.resolve(true));
      mockLikeRepository.deleteLike = jest.fn(() => Promise.resolve({ status: 'success' }));

      const toogleLikeUseCase = new ToogleLikeUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
        likeRepository: mockLikeRepository,
      });

      const result = await toogleLikeUseCase.execute(useCasePayload);

      expect(result).toStrictEqual({ status: 'success' });

      expect(mockThreadRepository.verifyThreadId).toBeCalledWith(
        useCasePayload.threadId,
      );
      expect(mockCommentRepository.verifyCommentId).toBeCalledWith(
        useCasePayload.commentId,
      );

      expect(mockLikeRepository.isExist).toBeCalledWith({
        commentId: useCasePayload.commentId,
        userId: useCasePayload.userId,
      });

      expect(mockLikeRepository.deleteLike).toBeCalledWith(useCasePayload);
    });
  });
});
