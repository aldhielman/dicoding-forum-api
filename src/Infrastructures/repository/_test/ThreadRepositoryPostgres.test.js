const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const Thread = require('../../../Domains/threads/entities/Thread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
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
    const fakeIdGenerator = () => '123'; // stub!
    const threadRepositoryPostgres = new ThreadRepositoryPostgres(
      pool,
      fakeIdGenerator
    );

    it('should trigger NotFound Exception when thread not found', async () => {
      await expect(
        threadRepositoryPostgres.viewThread('notFoundId')
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not trigger NotFound Exception when thread found', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'Title 1',
        body: 'Body 1',
        user_id: 'user-123',
      });

      // Action
      await threadRepositoryPostgres.addThread(newThread);

      await expect(
        threadRepositoryPostgres.viewThread('thread-123')
      ).resolves.not.toThrowError(NotFoundError);
    });
  });
});
