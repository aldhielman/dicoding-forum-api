const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const Thread = require('../../../Domains/threads/entities/Thread');
const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const Comment = require('../../../Domains/comments/entities/Comment');
const { verify } = require('@hapi/jwt/lib/crypto');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
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
        user_id: 'user-123',
        thread_id: 'thread-123',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await commentRepositoryPostgres.addComment(commentPayload);

      // Assert
      const comments = await CommentTableTestHelper.findCommentsById(
        'comment-123'
      );
      expect(comments).toHaveLength(1);
    });

    it('should return comment correctly', async () => {
      // Arrange
      const commentPayload = {
        content: 'Comment 1',
        user_id: 'user-123',
        thread_id: 'thread-123',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const comment = await commentRepositoryPostgres.addComment(
        commentPayload
      );

      // Assert
      expect(comment).toStrictEqual(
        new Comment({
          id: 'comment-123',
          content: 'Comment 1',
          owner: 'user-123',
        })
      );
    });
  });

  describe('deleteComment function', () => {
    it('should update is_deleted to true on table comment', async () => {
      const commentId = 'comment-123';

      await CommentTableTestHelper.addComment({ id: commentId });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action
      await commentRepositoryPostgres.deleteComment(commentId);

      // Assert
      const comments = await CommentTableTestHelper.findCommentsById(
        'comment-123'
      );

      expect(comments).toHaveLength(1);
      expect(comments[0].is_deleted).toEqual(true);
    });
  });

  describe('verifyOwner function', () => {
    it('should triger NotFound Exception when given commentId not found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      verifyOwnerPayload = {
        commentId: 'notFoundId',
        userId: 'user-test',
      };

      await expect(
        commentRepositoryPostgres.verifyOwner(verifyOwnerPayload)
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not triger NotFound Exception when given commentId found', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-test',
        username: 'dicodingother',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-test',
        user_id: 'user-test',
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        user_id: 'user-test',
        thread_id: 'thread-test',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      verifyOwnerPayload = {
        commentId: 'comment-123',
        userId: 'user-test',
      };

      await expect(
        commentRepositoryPostgres.verifyOwner(verifyOwnerPayload)
      ).resolves.not.toThrowError(NotFoundError);
    });

    it('should triger AuthorizationError Exception when user id is not same comment owner', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-test',
        username: 'dicodingother',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-test',
        user_id: 'user-test',
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        user_id: 'user-test',
        thread_id: 'thread-test',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      verifyOwnerPayload = {
        commentId: 'comment-123',
        userId: 'user-999',
      };

      await expect(
        commentRepositoryPostgres.verifyOwner(verifyOwnerPayload)
      ).rejects.toThrowError(AuthorizationError);
    });

    it('should triger AuthorizationError Exception when user id is same  comment owner', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-test',
        username: 'dicodingother',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-test',
        user_id: 'user-test',
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        user_id: 'user-test',
        thread_id: 'thread-test',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      verifyOwnerPayload = {
        commentId: 'comment-123',
        userId: 'user-test',
      };

      await expect(
        commentRepositoryPostgres.verifyOwner(verifyOwnerPayload)
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
        user_id: 'user-test',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      result = await commentRepositoryPostgres.getCommentsByThreadId(
        'thread-test'
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
        user_id: 'user-test',
      });

      // Comment 1
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        user_id: 'user-test',
        thread_id: 'thread-test',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      result = await commentRepositoryPostgres.getCommentsByThreadId(
        'thread-test'
      );

      expect(result).toHaveLength(1);
      result.forEach((item) => {
        expect(item).toBeInstanceOf(DetailComment);
      });
    });

    it('should return an array of DetailComment object ordered by created_at ASC', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-test',
        username: 'dicodingother',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-test',
        user_id: 'user-test',
      });

      // Comment 1
      await CommentTableTestHelper.addComment({
        id: 'comment-1',
        user_id: 'user-test',
        thread_id: 'thread-test',
        content: 'comment lebih baru',
        created_at: new Date().toISOString(),
      });

      // Comment 1
      await CommentTableTestHelper.addComment({
        id: 'comment-2',
        user_id: 'user-test',
        thread_id: 'thread-test',
        content: 'comment lebih lama',
        created_at: new Date(new Date().getTime() - 3600000).toISOString(),
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      result = await commentRepositoryPostgres.getCommentsByThreadId(
        'thread-test'
      );

      expect(result).toHaveLength(2);
      expect(result[0].id).toEqual('comment-2');
      expect(result[0].content).toEqual('comment lebih lama');
      expect(result[1].id).toEqual('comment-1');
      expect(result[1].content).toEqual('comment lebih baru');
    });

    it('should return correct content when comment is deleted', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-test',
        username: 'dicodingother',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-test',
        user_id: 'user-test',
      });

      // Comment 1
      await CommentTableTestHelper.addComment({
        id: 'comment-1',
        user_id: 'user-test',
        thread_id: 'thread-test',
        content: 'comment lebih baru',
        created_at: new Date().toISOString(),
      });

      // Comment 1
      await CommentTableTestHelper.addComment({
        id: 'comment-2',
        user_id: 'user-test',
        thread_id: 'thread-test',
        content: 'comment lebih lama',
        is_deleted: true,
        created_at: new Date(new Date().getTime() - 3600000).toISOString(),
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      result = await commentRepositoryPostgres.getCommentsByThreadId(
        'thread-test'
      );

      expect(result).toHaveLength(2);
      expect(result[0].id).toEqual('comment-2');
      expect(result[0].content).toEqual('**komentar telah dihapus**');
      expect(result[1].id).toEqual('comment-1');
      expect(result[1].content).toEqual('comment lebih baru');
    });
  });

  describe('verifyCommentId function', () => {
    it('should triger NotFound Exception when given commentId not found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      const commentId = 'notfound';

      await expect(
        commentRepositoryPostgres.verifyCommentId(commentId)
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not triger NotFound Exception when given commentId found', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-test',
        username: 'dicodingother',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-test',
        user_id: 'user-test',
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        user_id: 'user-test',
        thread_id: 'thread-test',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      const commentId = 'comment-123';

      await expect(
        commentRepositoryPostgres.verifyCommentId(commentId)
      ).resolves.not.toThrowError(NotFoundError);
    });
  });
});
