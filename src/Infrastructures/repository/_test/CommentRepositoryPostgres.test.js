const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const Comment = require('../../../Domains/comments/entities/Comment');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ title: 'Title 1' });
  });

  describe('addComment function', () => {
    it('should persist comment and return comment correctly', async () => {
      // Arrange
      const commentPayload = {
        content: 'Comment 1',
        userId: 'user-123',
        threadId: 'thread-123',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await commentRepositoryPostgres.addComment(commentPayload);

      // Assert
      const comments = await CommentTableTestHelper.findCommentsById(
        'comment-123',
      );
      expect(comments).toHaveLength(1);
    });

    it('should return comment correctly', async () => {
      // Arrange
      const commentPayload = {
        content: 'Comment 1',
        userId: 'user-123',
        threadId: 'thread-123',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const comment = await commentRepositoryPostgres.addComment(
        commentPayload,
      );

      // Assert
      expect(comment).toStrictEqual(
        new Comment({
          id: 'comment-123',
          content: 'Comment 1',
          owner: 'user-123',
        }),
      );
    });
  });

  describe('deleteComment function', () => {
    it('should update isDeleted to true on table comment', async () => {
      const commentId = 'comment-123';

      await CommentTableTestHelper.addComment({ id: commentId });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action
      await commentRepositoryPostgres.deleteComment(commentId);

      // Assert
      const comments = await CommentTableTestHelper.findCommentsById(
        'comment-123',
      );

      expect(comments).toHaveLength(1);
      expect(comments[0].isDeleted).toEqual(true);
    });
  });

  describe('verifyOwner function', () => {
    it('should triger AuthorizationError Exception when user id is not same comment owner', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-test',
        username: 'dicodingother',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-test',
        userId: 'user-test',
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        userId: 'user-test',
        threadId: 'thread-test',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      const verifyOwnerPayload = {
        commentId: 'comment-123',
        userId: 'user-999',
      };

      await expect(
        commentRepositoryPostgres.verifyOwner(verifyOwnerPayload),
      ).rejects.toThrowError(AuthorizationError);
    });

    it('should triger AuthorizationError Exception when user id is same  comment owner', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-test',
        username: 'dicodingother',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-test',
        userId: 'user-test',
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        userId: 'user-test',
        threadId: 'thread-test',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      const verifyOwnerPayload = {
        commentId: 'comment-123',
        userId: 'user-test',
      };

      await expect(
        commentRepositoryPostgres.verifyOwner(verifyOwnerPayload),
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return an empty array when there are no comment on a thread', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-test',
        username: 'dicodingother',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-test',
        userId: 'user-test',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        {},
        replyRepositoryPostgres,
      );

      const result = await commentRepositoryPostgres.getCommentsByThreadId(
        'thread-test',
      );

      expect(result).toEqual([]);
    });

    it('should return an array of DetailComment object when there are comment on a thread', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-test',
        username: 'dicodingother',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-test',
        userId: 'user-test',
      });

      // Comment 1
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        userId: 'user-test',
        threadId: 'thread-test',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        {},
        replyRepositoryPostgres,
      );

      const result = await commentRepositoryPostgres.getCommentsByThreadId(
        'thread-test',
      );

      expect(result).toHaveLength(1);
      result.forEach((item) => {
        expect(item).toBeInstanceOf(DetailComment);
      });
    });

    it('should return an array of DetailComment object ordered by createdAt ASC', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-test',
        username: 'dicodingother',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-test',
        userId: 'user-test',
      });

      // Comment 1
      await CommentTableTestHelper.addComment({
        id: 'comment-1',
        userId: 'user-test',
        threadId: 'thread-test',
        content: 'comment lebih baru',
        createdAt: '2023-07-04T05:19:09.775Z',
      });

      // Comment 1
      await CommentTableTestHelper.addComment({
        id: 'comment-2',
        userId: 'user-test',
        threadId: 'thread-test',
        content: 'comment lebih lama',
        createdAt: '2023-07-03T05:19:09.775Z',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        {},
        replyRepositoryPostgres,
      );

      const result = await commentRepositoryPostgres.getCommentsByThreadId(
        'thread-test',
      );

      const result0 = new DetailComment({
        id: 'comment-2',
        content: 'comment lebih lama',
        username: 'dicodingother',
        date: '2023-07-03T05:19:09.775Z',
        isDeleted: false,
        likeCount: 0,
        replies: [],
      });

      const result1 = new DetailComment({
        id: 'comment-1',
        content: 'comment lebih baru',
        username: 'dicodingother',
        date: '2023-07-04T05:19:09.775Z',
        isDeleted: false,
        likeCount: 0,
        replies: [],
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toStrictEqual(result0);
      expect(result[1]).toStrictEqual(result1);
    });

    it('should return correct content when comment is deleted', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-test',
        username: 'dicodingother',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-test',
        userId: 'user-test',
      });

      // Comment 1
      await CommentTableTestHelper.addComment({
        id: 'comment-1',
        userId: 'user-test',
        threadId: 'thread-test',
        content: 'comment lebih baru',
        createdAt: '2023-07-04T05:19:09.775Z',
      });

      // Comment 2
      await CommentTableTestHelper.addComment({
        id: 'comment-2',
        userId: 'user-test',
        threadId: 'thread-test',
        content: 'comment lebih lama',
        isDeleted: true,
        createdAt: '2023-07-03T05:19:09.775Z',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      const result = await commentRepositoryPostgres.getCommentsByThreadId(
        'thread-test',
      );

      const result0 = new DetailComment({
        id: 'comment-2',
        content: 'comment lebih lama',
        username: 'dicodingother',
        date: '2023-07-03T05:19:09.775Z',
        likeCount: 0,
        isDeleted: true,
        replies: [],
      });

      const result1 = new DetailComment({
        id: 'comment-1',
        content: 'comment lebih baru',
        username: 'dicodingother',
        date: '2023-07-04T05:19:09.775Z',
        isDeleted: false,
        likeCount: 0,
        replies: [],
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toStrictEqual(result0);
      expect(result[1]).toStrictEqual(result1);
    });

    it('should return correct likeCount', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-test',
        username: 'dicodingother',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-test',
        userId: 'user-test',
      });

      // Comment 1
      await CommentTableTestHelper.addComment({
        id: 'comment-1',
        userId: 'user-test',
        threadId: 'thread-test',
        content: 'comment lebih baru',
        createdAt: '2023-07-04T05:19:09.775Z',
      });

      await LikesTableTestHelper.addLike({
        commentId: 'comment-1',
        userId: 'user-test',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      const result = await commentRepositoryPostgres.getCommentsByThreadId(
        'thread-test',
      );

      const result0 = new DetailComment({
        id: 'comment-1',
        content: 'comment lebih baru',
        username: 'dicodingother',
        date: '2023-07-04T05:19:09.775Z',
        likeCount: 1,
        isDeleted: false,
        replies: [],
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toStrictEqual(result0);
    });
  });

  describe('verifyCommentId function', () => {
    it('should triger NotFound Exception when given commentId not found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      const commentId = 'notfound';

      await expect(
        commentRepositoryPostgres.verifyCommentId(commentId),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not triger NotFound Exception when given commentId found', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-test',
        username: 'dicodingother',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-test',
        userId: 'user-test',
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        userId: 'user-test',
        threadId: 'thread-test',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      const commentId = 'comment-123';

      await expect(
        commentRepositoryPostgres.verifyCommentId(commentId),
      ).resolves.not.toThrowError(NotFoundError);
    });
  });
});
