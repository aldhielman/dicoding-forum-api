const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

describe('likeRepositoryPostgres', () => {
  beforeEach(() => async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123' });
    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      userId: 'user-123',
    });
    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      userId: 'user-123',
      threadId: 'thread-123',
    });
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('isExist function', () => {
    it('should return false when record not exist', async () => {
      const payload = {
        commentID: 'comment-123',
        userId: 'user-not-found',
      };

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      const result = await likeRepositoryPostgres.isExist(payload);

      expect(result).toEqual(false);
    });

    it('should return true when record exist', async () => {
      await LikesTableTestHelper.addLike({
        commentId: 'comment-123',
        userId: 'user-123',
      });

      const payload = {
        commentId: 'comment-123',
        userId: 'user-123',
      };

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      const result = await likeRepositoryPostgres.isExist(payload);

      expect(result).toEqual(true);
    });
  });

  describe('addLike function', () => {
    it('should persist data', async () => {
      const payload = {
        commentId: 'comment-123',
        userId: 'user-123',
      };

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      await likeRepositoryPostgres.addLike(payload);

      const result = await LikesTableTestHelper.findLikesById(
        'comment-123',
        'user-123',
      );

      expect(result).toHaveLength(1);
    });
  });

  describe('deleteLike function', () => {
    it('should delete data on persistent storage', async () => {
      await LikesTableTestHelper.addLike({
        commentId: 'comment-123',
        userId: 'user-123',
      });

      const payload = {
        commentId: 'comment-123',
        userId: 'user-123',
      };

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      await likeRepositoryPostgres.deleteLike(payload);

      const result = await LikesTableTestHelper.findLikesById(
        'comment-123',
        'user-123',
      );

      expect(result).toHaveLength(0);
    });
  });
});
