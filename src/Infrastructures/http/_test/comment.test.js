const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('/threads/{threadId}/comments endpoint', () => {
  let token;
  let user;
  let threadId = 'thread-123';
  let commentId = 'comment-123';

  // Create User and Login. Store user and token every test running
  beforeEach(async () => {
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
      payload: {
        username: 'dicoding',
        password: 'secret',
      },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);

    token = responseJson.data.accessToken;
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comment', () => {
    it('should response 404 when thread with given id not found', async () => {
      const requestPayload = {
        content: 'Comment 1',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      await ThreadsTableTestHelper.addThread({});

      // expect(true).toBe(true);

      // Arrange
      const requestPayload = {
        fakeProperty: 'fakeValue',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
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
        'tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada'
      );
    });

    it('should response 400 when request payload not meet specification', async () => {
      await ThreadsTableTestHelper.addThread({});

      // Arrange
      const requestPayload = {
        content: 123,
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
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
        'tidak dapat membuat comment baru karena tipe data tidak sesuai'
      );
    });

    it('should response 201 and persisted comment', async () => {
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        user_id: user.id,
      });

      const thread = await ThreadsTableTestHelper.findThreadsById('thread-123');

      const requestPayload = {
        content: 'Comment 1',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.id).toBeDefined();
      expect(responseJson.data.addedComment.content).toEqual('Comment 1');
      expect(responseJson.data.addedComment.owner).toEqual(user.id);
    });
  });

  describe('when DELETE /threads/{threadId}/comment/{commentId}', () => {
    it('should response 404 when comment with given threadId not found', async () => {
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 when comment with given threadId found but commentId not found', async () => {
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        user_id: user.id,
      });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should response 403 when valid threadId and commentId is valid and comment was created by other user', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-other',
        username: 'dicodingother',
      });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        user_id: user.id,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        user_id: 'user-other',
      });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'anda tidak dapat menghapus komentar yang tidak anda buat'
      );
    });

    it('should response 200 and return response deletion when threadId and commendId found using user that created comment', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-other',
        username: 'dicodingother',
      });

      await ThreadsTableTestHelper.addThread({
        id: threadId,
        user_id: 'user-other',
      });

      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread_id: threadId,
        user_id: user.id,
      });

      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
