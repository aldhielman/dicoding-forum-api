const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const Thread = require('../../../Domains/threads/entities/Thread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist thread and return thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'Title 1',
        body: 'Body 1',
        user_id: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await threadRepositoryPostgres.addThread(newThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById(
        'thread-123'
      );
      expect(threads).toHaveLength(1);
    });

    it('should return thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'Title 1',
        body: 'Body 1',
        user_id: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const thread = await threadRepositoryPostgres.addThread(newThread);

      // Assert
      expect(thread).toStrictEqual(
        new Thread({
          id: 'thread-123',
          title: 'Title 1',
          body: 'Body 1',
          owner: 'user-123',
        })
      );
    });
  });

  describe('viewThread function', () => {
    it('should trigger NotFound Exception when threadId not found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        {},
        commentRepositoryPostgres
      );
      await expect(
        threadRepositoryPostgres.viewThread('notFoundId')
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not trigger NotFound Exception when thread found', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        user_id: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        {},
        commentRepositoryPostgres
      );

      await expect(
        threadRepositoryPostgres.viewThread('thread-123')
      ).resolves.not.toThrowError(NotFoundError);
    });

    it('should return thread correctly', async () => {
      const date = new Date().toISOString();

      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        user_id: 'user-123',
        created_at: date,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        {},
        commentRepositoryPostgres
      );

      const thread = await threadRepositoryPostgres.viewThread('thread-123');
      // Assert
      expect(thread).toStrictEqual(
        new DetailThread({
          id: 'thread-123',
          title: 'title test',
          body: 'body test',
          date: date,
          username: 'dicoding',
          comments: [],
        })
      );
    });
  });
});
