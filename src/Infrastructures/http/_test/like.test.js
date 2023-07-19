const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  let token;
  let user;
  const threadId = 'thread-123';
  const commentId = 'comment-123';

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
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 404 when threadId is invalid', async () => {
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
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

    it('should response 404 when commentId is invalid', async () => {
      await ThreadsTableTestHelper.addThread({ id: threadId });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
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

    describe('when likes record does not exist', () => {
      it('should response 200 and persisted like', async () => {
        await ThreadsTableTestHelper.addThread({
          id: threadId,
          userId: user.id,
        });

        await CommentsTableTestHelper.addComment({
          id: commentId,
          threadId,
          userId: user.id,
        });

        const server = await createServer(container);

        const response = await server.inject({
          method: 'PUT',
          url: `/threads/${threadId}/comments/${commentId}/likes`,
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual('success');
      });
    });

    describe('when likes record does exist', () => {
      it('should response 200 and delete like', async () => {
        await ThreadsTableTestHelper.addThread({
          id: threadId,
          userId: user.id,
        });

        await CommentsTableTestHelper.addComment({
          id: commentId,
          threadId,
          userId: user.id,
        });

        LikesTableTestHelper.addLike({ commentId, userId: user.id });

        const server = await createServer(container);

        const response = await server.inject({
          method: 'PUT',
          url: `/threads/${threadId}/comments/${commentId}/likes`,
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
});
