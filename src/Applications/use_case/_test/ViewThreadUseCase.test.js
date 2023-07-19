const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const ViewThreadUseCase = require('../ViewThreadUseCase');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('ViewThreadUseCase', () => {
  describe('when no replies on thread comment', () => {
    it('should orchestrating the view thread action correctly without calling replyRepository.getRepliesByCommentId method', async () => {
      // Arrange
      const useCasePayload = {
        threadId: 'thread-123',
      };

      const mockDetailThread = new DetailThread({
        id: useCasePayload.threadId,
        title: 'Title 1',
        body: 'Body 1',
        date: '2021-08-07T07:22:33.555Z',
        username: 'dicoding',
        comments: [
          new DetailComment({
            id: 'comment-123',
            username: 'dicodingother',
            date: '2021-08-08T07:22:33.555Z',
            content: 'Comment 1',
            likeCount: 0,
            replies: [],
          }),
        ],
      });

      /** creating dependency of use case */
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();
      const mockReplyRepository = new ReplyRepository();

      /** mocking needed function */
      mockThreadRepository.verifyThreadId = jest
        .fn()
        .mockImplementation(() => Promise.resolve());

      mockThreadRepository.viewThread = jest.fn().mockImplementation(() => Promise.resolve(
        new DetailThread({
          id: useCasePayload.threadId,
          title: 'Title 1',
          body: 'Body 1',
          date: '2021-08-07T07:22:33.555Z',
          username: 'dicoding',
          comments: [],
        }),
      ));

      mockCommentRepository.getCommentsByThreadId = jest
        .fn()
        .mockImplementation(() => Promise.resolve([
          new DetailComment({
            id: 'comment-123',
            username: 'dicodingother',
            date: '2021-08-08T07:22:33.555Z',
            content: 'Comment 1',
            likeCount: 0,
            isDeleted: false,
            replies: [],
          }),
        ]));

      mockReplyRepository.getRepliesByCommentId = jest
        .fn()
        .mockImplementation(() => Promise.resolve([]));

      /** creating use case instance */
      const viewThreadUseCase = new ViewThreadUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
        replyRepository: mockReplyRepository,
      });

      // Action
      const thread = await viewThreadUseCase.execute(useCasePayload);

      // Assert
      expect(thread).toStrictEqual(mockDetailThread);

      expect(mockThreadRepository.verifyThreadId).toBeCalledWith(
        useCasePayload.threadId,
      );

      expect(mockThreadRepository.viewThread).toBeCalledWith(
        useCasePayload.threadId,
      );

      expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
        useCasePayload.threadId,
      );

      expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith(
        mockDetailThread.comments[0].id,
      );
    });

    it('should replace comment content correctly when comment is deleted', async () => {
      // Arrange
      const useCasePayload = {
        threadId: 'thread-123',
      };

      const mockDetailThread = new DetailThread({
        id: useCasePayload.threadId,
        title: 'Title 1',
        body: 'Body 1',
        date: '2021-08-07T07:22:33.555Z',
        username: 'dicoding',
        comments: [
          new DetailComment({
            id: 'comment-123',
            username: 'dicodingother',
            date: '2021-08-08T07:22:33.555Z',
            content: '**komentar telah dihapus**',
            likeCount: 0,
            replies: [],
          }),
        ],
      });

      /** creating dependency of use case */
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();
      const mockReplyRepository = new ReplyRepository();

      /** mocking needed function */
      mockThreadRepository.verifyThreadId = jest
        .fn()
        .mockImplementation(() => Promise.resolve());

      mockThreadRepository.viewThread = jest.fn().mockImplementation(() => Promise.resolve(
        new DetailThread({
          id: useCasePayload.threadId,
          title: 'Title 1',
          body: 'Body 1',
          date: '2021-08-07T07:22:33.555Z',
          username: 'dicoding',
          comments: [],
        }),
      ));

      mockCommentRepository.getCommentsByThreadId = jest
        .fn()
        .mockImplementation(() => Promise.resolve([
          new DetailComment({
            id: 'comment-123',
            username: 'dicodingother',
            date: '2021-08-08T07:22:33.555Z',
            content: 'Comment 1',
            likeCount: 0,
            isDeleted: true,
            replies: [],
          }),
        ]));

      mockReplyRepository.getRepliesByCommentId = jest
        .fn()
        .mockImplementation(() => Promise.resolve([]));

      /** creating use case instance */
      const viewThreadUseCase = new ViewThreadUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
        replyRepository: mockReplyRepository,
      });

      // Action
      const thread = await viewThreadUseCase.execute(useCasePayload);

      // Assert
      expect(thread).toStrictEqual(mockDetailThread);

      expect(mockThreadRepository.verifyThreadId).toBeCalledWith(
        useCasePayload.threadId,
      );

      expect(mockThreadRepository.viewThread).toBeCalledWith(
        useCasePayload.threadId,
      );

      expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
        useCasePayload.threadId,
      );

      expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith(
        'comment-123',
      );
    });
  });

  describe('when have replies on thread comment', () => {
    it('should orchestrating the view thread action correctly with calling replyRepository.getRepliesByCommentId method when comment have replies', async () => {
      // Arrange
      const useCasePayload = {
        threadId: 'thread-123',
      };

      const mockDetailThread = new DetailThread({
        id: useCasePayload.threadId,
        title: 'Title 1',
        body: 'Body 1',
        date: '2021-08-07T07:22:33.555Z',
        username: 'dicoding',
        comments: [
          new DetailComment({
            id: 'comment-123',
            username: 'dicodingother',
            date: '2021-08-08T07:22:33.555Z',
            content: 'Comment 1',
            likeCount: 0,
            replies: [
              new DetailReply({
                id: 'reply-123',
                username: 'dicodingother',
                date: '2021-08-08T07:22:33.555Z',
                content: 'Reply 1',
              }),
            ],
          }),
        ],
      });

      /** creating dependency of use case */
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();
      const mockReplyRepository = new ReplyRepository();

      /** mocking needed function */
      mockThreadRepository.verifyThreadId = jest
        .fn()
        .mockImplementation(() => Promise.resolve());

      mockThreadRepository.viewThread = jest.fn().mockImplementation(() => Promise.resolve(
        new DetailThread({
          id: useCasePayload.threadId,
          title: 'Title 1',
          body: 'Body 1',
          date: '2021-08-07T07:22:33.555Z',
          username: 'dicoding',
          comments: [],
        }),
      ));

      mockCommentRepository.getCommentsByThreadId = jest
        .fn()
        .mockImplementation(() => Promise.resolve([
          new DetailComment({
            id: 'comment-123',
            username: 'dicodingother',
            date: '2021-08-08T07:22:33.555Z',
            content: 'Comment 1',
            likeCount: 0,
            replies: [],
          }),
        ]));

      mockReplyRepository.getRepliesByCommentId = jest
        .fn()
        .mockImplementation(() => Promise.resolve([
          new DetailReply({
            id: 'reply-123',
            username: 'dicodingother',
            date: '2021-08-08T07:22:33.555Z',
            content: 'Reply 1',
          }),
        ]));

      /** creating use case instance */
      const viewThreadUseCase = new ViewThreadUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
        replyRepository: mockReplyRepository,
      });

      // Action
      const thread = await viewThreadUseCase.execute(useCasePayload);

      // Assert

      expect(mockThreadRepository.verifyThreadId).toBeCalledWith(
        useCasePayload.threadId,
      );

      expect(mockThreadRepository.viewThread).toBeCalledWith(
        useCasePayload.threadId,
      );

      expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
        useCasePayload.threadId,
      );

      expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith(
        mockDetailThread.comments[0].id,
      );

      expect(thread).toStrictEqual(mockDetailThread);
    });

    it('should replace reply content when deleted', async () => {
      // Arrange
      const useCasePayload = {
        threadId: 'thread-123',
      };

      const mockDetailThread = new DetailThread({
        id: useCasePayload.threadId,
        title: 'Title 1',
        body: 'Body 1',
        date: '2021-08-07T07:22:33.555Z',
        username: 'dicoding',
        comments: [
          new DetailComment({
            id: 'comment-123',
            username: 'dicodingother',
            date: '2021-08-08T07:22:33.555Z',
            content: 'Comment 1',
            likeCount: 0,
            replies: [
              new DetailReply({
                id: 'reply-123',
                username: 'dicodingother',
                date: '2021-08-08T07:22:33.555Z',
                content: '**balasan telah dihapus**',
              }),
            ],
          }),
        ],
      });

      /** creating dependency of use case */
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();
      const mockReplyRepository = new ReplyRepository();

      /** mocking needed function */
      mockThreadRepository.verifyThreadId = jest
        .fn()
        .mockImplementation(() => Promise.resolve());

      mockThreadRepository.viewThread = jest.fn().mockImplementation(() => Promise.resolve(
        new DetailThread({
          id: useCasePayload.threadId,
          title: 'Title 1',
          body: 'Body 1',
          date: '2021-08-07T07:22:33.555Z',
          username: 'dicoding',
          comments: [],
        }),
      ));

      mockCommentRepository.getCommentsByThreadId = jest
        .fn()
        .mockImplementation(() => Promise.resolve([
          new DetailComment({
            id: 'comment-123',
            username: 'dicodingother',
            date: '2021-08-08T07:22:33.555Z',
            content: 'Comment 1',
            likeCount: 0,
            isDeleted: false,
            replies: [],
          }),
        ]));

      mockReplyRepository.getRepliesByCommentId = jest
        .fn()
        .mockImplementation(() => Promise.resolve([
          new DetailReply({
            id: 'reply-123',
            username: 'dicodingother',
            date: '2021-08-08T07:22:33.555Z',
            content: 'Reply 1',
            isDeleted: true,
          }),
        ]));

      /** creating use case instance */
      const viewThreadUseCase = new ViewThreadUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
        replyRepository: mockReplyRepository,
      });

      // Action
      const thread = await viewThreadUseCase.execute(useCasePayload);

      // Assert

      expect(mockThreadRepository.verifyThreadId).toBeCalledWith(
        useCasePayload.threadId,
      );

      expect(mockThreadRepository.viewThread).toBeCalledWith(
        useCasePayload.threadId,
      );

      expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
        useCasePayload.threadId,
      );

      expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith(
        mockDetailThread.comments[0].id,
      );

      expect(thread).toStrictEqual(mockDetailThread);
    });
  });
});
