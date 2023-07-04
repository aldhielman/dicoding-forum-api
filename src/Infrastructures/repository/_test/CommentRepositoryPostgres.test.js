const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const Thread = require('../../../Domains/threads/entities/Thread');
const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const Comment = require('../../../Domains/comments/entities/Comment');

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
    it('should triger NotFound Exception when given commentId not found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      await expect(
        commentRepositoryPostgres.deleteComment('notFoundId')
      ).rejects.toThrowError(NotFoundError);
    });

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

  describe('verifyOwner function', () => {});
});
