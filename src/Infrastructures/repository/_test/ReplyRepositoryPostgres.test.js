const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const Reply = require('../../../Domains/replies/entities/Reply');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123' });
    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      user_id: 'user-123',
    });
    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      thread_id: 'thread-123',
      user_id: 'user-123',
    });
  });

  describe('addReply function', () => {
    it('should persist data', async () => {
      // Arrange
      const replyPayload = {
        content: 'Content 1',
        userId: 'user-123',
        commentId: 'comment-123',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await replyRepositoryPostgres.addReply(replyPayload);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies).toHaveLength(1);
    });

    it('should return Reply object correctly', async () => {
      // Arrange
      const replyPayload = {
        content: 'Content 1',
        userId: 'user-123',
        commentId: 'comment-123',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const reply = await replyRepositoryPostgres.addReply(replyPayload);

      // Assert
      expect(reply).toStrictEqual(
        new Reply({
          id: 'reply-123',
          content: 'Content 1',
          owner: 'user-123',
        }),
      );
    });
  });

  describe('deleteReply function', () => {
    it('should update is_deleted to true on table reply', async () => {
      const replyId = 'reply-123';

      await RepliesTableTestHelper.addReply({ id: replyId });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      // Action
      await replyRepositoryPostgres.deleteReply(replyId);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');

      expect(replies).toHaveLength(1);
      expect(replies[0].is_deleted).toEqual(true);
    });
  });

  describe('verifyOwner function', () => {
    it('should triger NotFound Exception when given replyId not found', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      const verifyOwnerPayload = {
        commentId: 'notFoundId',
        userId: 'user-test',
      };

      await expect(
        replyRepositoryPostgres.verifyOwner(verifyOwnerPayload),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not triger NotFound Exception when given replyId found', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        userId: 'user-123',
        commentId: 'comment-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      const verifyOwnerPayload = {
        replyId: 'reply-123',
        userId: 'user-123',
      };

      await expect(
        replyRepositoryPostgres.verifyOwner(verifyOwnerPayload),
      ).resolves.not.toThrowError(NotFoundError);
    });

    it('should triger AuthorizationError Exception when user id is not same comment owner', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        userId: 'user-123',
        commentId: 'comment-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      const verifyOwnerPayload = {
        replyId: 'reply-123',
        userId: 'user-999',
      };

      await expect(
        replyRepositoryPostgres.verifyOwner(verifyOwnerPayload),
      ).rejects.toThrowError(AuthorizationError);
    });

    it('should not triger AuthorizationError Exception when user id is same  comment owner', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        userId: 'user-123',
        commentId: 'comment-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      const verifyOwnerPayload = {
        replyId: 'reply-123',
        userId: 'user-123',
      };

      await expect(
        replyRepositoryPostgres.verifyOwner(verifyOwnerPayload),
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should return an empty array when there are no replies on a comment', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-test',
        username: 'dicodingother',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-test',
        userId: 'user-test',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-test',
        userId: 'user-test',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      const result = await replyRepositoryPostgres.getRepliesByCommentId(
        'comment-test',
      );

      expect(result).toEqual([]);
    });

    it('should return array of DetailReply when there are replies on comment', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-test',
        username: 'dicodingother',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-test',
        userId: 'user-test',
      });

      // Comment 1
      await CommentsTableTestHelper.addComment({
        id: 'comment-test',
        userId: 'user-test',
        threadId: 'thread-test',
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-test',
        commentId: 'comment-test',
        userId: 'user-test',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      const result = await replyRepositoryPostgres.getRepliesByCommentId(
        'comment-test',
      );

      expect(result).toHaveLength(1);
      result.forEach((item) => {
        expect(item).toBeInstanceOf(DetailReply);
      });
    });

    it('should return an array of DetailReply object ordered by created_at ASC', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-test',
        username: 'dicodingother',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-test',
        userId: 'user-test',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-test',
        userId: 'user-test',
        commentId: 'thread-test',
        content: 'comment lebih baru',
        createdAt: new Date().toISOString(),
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-test',
        createdAt: new Date().toISOString(),
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-456',
        commentId: 'comment-test',
        createdAt: new Date(new Date().getTime() - 3600000).toISOString(),
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      const result = await replyRepositoryPostgres.getRepliesByCommentId(
        'comment-test',
      );

      expect(result).toHaveLength(2);
      expect(result[0].id).toEqual('reply-456');
    });

    it('should return correct content when reply is deleted', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-test',
        username: 'dicodingother',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-test',
        userId: 'user-test',
      });

      // Comment 1
      await CommentsTableTestHelper.addComment({
        id: 'comment-test',
        userId: 'user-test',
        threadtId: 'thread-test',
        content: 'comment lebih baru',
        createdAt: new Date().toISOString(),
      });

      // Reply 1
      await RepliesTableTestHelper.addReply({
        id: 'reply-1',
        userId: 'user-test',
        commentId: 'comment-test',
        content: 'Reply 1',
        isDeleted: false,
      });

      // Reply 2
      await RepliesTableTestHelper.addReply({
        id: 'reply-2',
        userId: 'user-test',
        commentId: 'comment-test',
        content: 'Reply 2',
        isDeleted: true,
        createdAt: new Date(new Date().getTime() - 3600000).toISOString(),
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      const result = await replyRepositoryPostgres.getRepliesByCommentId(
        'comment-test',
      );

      expect(result).toHaveLength(2);
      expect(result[0].id).toEqual('reply-2');
      expect(result[0].content).toEqual('**balasan telah dihapus**');
      expect(result[1].id).toEqual('reply-1');
      expect(result[1].content).toEqual('Reply 1');
    });
  });
});
