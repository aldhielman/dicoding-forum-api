const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');

describe('/threads endpoint', () => {
  let user;
  let token;

  beforeAll(async () => {
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
    await ThreadsTableTestHelper.cleanTable();
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
        'tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada'
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
        'tidak dapat membuat thread baru karena tipe data tidak sesuai'
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
});
