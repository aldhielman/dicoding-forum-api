const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

describe('/threads endpoint', () => {
  let user;
  let token;

  beforeEach(async () => {
    const requestPayload = {
      username: 'dicoding',
      password: 'secret',
    };

    const server = await createServer(container);
    // add user
    const addUserResponse = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      },
    });

    const addUserResponseJson = JSON.parse(addUserResponse.payload);
    user = addUserResponseJson.data.addedUser;

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: requestPayload,
    });

    // Assert
    const responseJson = JSON.parse(response.payload);

    token = responseJson.data.accessToken;
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 401 when not contain header Authorization', async () => {
      // Arrange
      const requestPayload = {
        title: 'Title 1',
        body: 'Body 1',
      };
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it('should response 401 when contain invalid token', async () => {
      // Arrange
      const requestPayload = {
        title: 'Title 1',
        body: 'Body 1',
      };
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          authorization: 'Bearer invalidtoken',
        },
        payload: requestPayload,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'Title 1',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada',
      );
    });

    it('should response 400 when request payload not meet specification', async () => {
      // Arrange
      const requestPayload = {
        title: true,
        body: 123,
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat thread baru karena tipe data tidak sesuai',
      );
    });

    it('should response 201 and persisted threads', async () => {
      const requestPayload = {
        title: 'Title 1',
        body: 'Body 1',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.id).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual('Title 1');
      expect(responseJson.data.addedThread.owner).toEqual(user.id);
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 404 when threadId not found', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'GET',
        url: '/threads/notFoundId',
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    describe('when no replies on thread`s comment should return empty array on each DetailComment object', () => {
      it('should response 200 and return correct payload', async () => {
        await UsersTableTestHelper.addUser({ id: 'user-1', username: 'user1' });
        await UsersTableTestHelper.addUser({ id: 'user-2', username: 'user2' });

        await ThreadsTableTestHelper.addThread({
          id: 'thread-123',
          userId: 'user-1',
          createdAt: '2023-07-04T05:19:09.775Z',
        });

        await CommentsTableTestHelper.addComment({
          id: 'comment-123',
          threadId: 'thread-123',
          content: 'Content 1',
          userId: 'user-1',
          createdAt: '2023-07-04T09:19:09.775Z',
        });
        await CommentsTableTestHelper.addComment({
          id: 'comment-456',
          threadId: 'thread-123',
          content: 'Content 2',
          userId: 'user-2',
          createdAt: '2023-07-04T08:19:09.775Z',
        });

        const server = await createServer(container);

        const response = await server.inject({
          method: 'GET',
          url: '/threads/thread-123',
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual('success');
        expect(responseJson.data.thread).toBeDefined();
        expect(Object.keys(responseJson.data.thread)).toHaveLength(6);
        expect(responseJson.data.thread.id).toEqual('thread-123');
        expect(responseJson.data.thread.title).toEqual('title test');
        expect(responseJson.data.thread.body).toEqual('body test');
        expect(responseJson.data.thread.date).toEqual(
          '2023-07-04T05:19:09.775Z',
        );
        expect(responseJson.data.thread.username).toEqual('user1');
        expect(responseJson.data.thread.comments).toHaveLength(2);
        expect(Object.keys(responseJson.data.thread.comments[0])).toHaveLength(
          6,
        );
        expect(responseJson.data.thread.comments[0].id).toEqual('comment-456');
        expect(responseJson.data.thread.comments[0].content).toEqual(
          'Content 2',
        );
        expect(responseJson.data.thread.comments[0].likeCount).toEqual(0);
        expect(responseJson.data.thread.comments[0].date).toEqual(
          '2023-07-04T08:19:09.775Z',
        );
        expect(responseJson.data.thread.comments[0].username).toEqual('user2');
        expect(responseJson.data.thread.comments[0].replies).toEqual([]);

        expect(Object.keys(responseJson.data.thread.comments[1])).toHaveLength(
          6,
        );
        expect(responseJson.data.thread.comments[1].id).toEqual('comment-123');
        expect(responseJson.data.thread.comments[1].content).toEqual(
          'Content 1',
        );
        expect(responseJson.data.thread.comments[1].likeCount).toEqual(0);
        expect(responseJson.data.thread.comments[1].date).toEqual(
          '2023-07-04T09:19:09.775Z',
        );
        expect(responseJson.data.thread.comments[1].username).toEqual('user1');
        expect(responseJson.data.thread.comments[1].replies).toEqual([]);
      });
    });

    describe('when there are replies on thread`s comment should return array of DetailReplies wih correct properties and sorting on each DetailComment object', () => {
      it('should response 200 and return correct payload', async () => {
        await UsersTableTestHelper.addUser({ id: 'user-1', username: 'user1' });
        await UsersTableTestHelper.addUser({ id: 'user-2', username: 'user2' });

        await ThreadsTableTestHelper.addThread({
          id: 'thread-123',
          userId: 'user-1',
          createdAt: '2023-07-04T05:19:09.775Z',
        });

        await CommentsTableTestHelper.addComment({
          id: 'comment-123',
          threadId: 'thread-123',
          content: 'Content 1',
          userId: 'user-1',
          createdAt: '2023-07-04T09:19:09.775Z',
        });

        await LikesTableTestHelper.addLike({
          commentId: 'comment-123',
          userId: 'user-123',
        });

        await RepliesTableTestHelper.addReply({
          id: 'reply-123',
          commentId: 'comment-123',
          content: 'Reply 1',
          userId: 'user-2',
          createdAt: '2023-07-04T08:19:09.775Z',
        });

        await RepliesTableTestHelper.addReply({
          id: 'reply-456',
          commentId: 'comment-123',
          content: 'Reply 2',
          userId: 'user-2',
          createdAt: '2023-07-03T08:19:09.775Z',
        });

        const server = await createServer(container);

        const response = await server.inject({
          method: 'GET',
          url: '/threads/thread-123',
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual('success');
        expect(responseJson.data.thread).toBeDefined();
        expect(Object.keys(responseJson.data.thread)).toHaveLength(6);
        expect(responseJson.data.thread.id).toEqual('thread-123');
        expect(responseJson.data.thread.title).toEqual('title test');
        expect(responseJson.data.thread.body).toEqual('body test');
        expect(responseJson.data.thread.date).toEqual(
          '2023-07-04T05:19:09.775Z',
        );
        expect(responseJson.data.thread.username).toEqual('user1');
        expect(responseJson.data.thread.comments).toHaveLength(1);
        expect(Object.keys(responseJson.data.thread.comments[0])).toHaveLength(
          6,
        );
        expect(responseJson.data.thread.comments[0].id).toEqual('comment-123');
        expect(responseJson.data.thread.comments[0].content).toEqual(
          'Content 1',
        );
        expect(responseJson.data.thread.comments[0].likeCount).toEqual(1);
        expect(responseJson.data.thread.comments[0].date).toEqual(
          '2023-07-04T09:19:09.775Z',
        );
        expect(responseJson.data.thread.comments[0].username).toEqual('user1');
        expect(responseJson.data.thread.comments[0].replies).toHaveLength(2);
      });
    });
  });
});
