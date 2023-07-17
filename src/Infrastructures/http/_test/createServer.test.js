const createServer = require('../createServer');

describe('HTTP server', () => {
  it('should response 404 when request unregistered route', async () => {
    // Arrange
    const server = await createServer({});

    // Action
    const response = await server.inject({
      method: 'GET',
      url: '/unregisteredRoute',
    });

    // Assert
    expect(response.statusCode).toEqual(404);
  });

  it('should response 401 when request protected route without token', async () => {
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const server = await createServer({});

    const postCommentResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
    });

    const deleteCommentResponse = await server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}`,
    });

    const postReplyResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments/${commentId}/replies`,
    });

    expect(postCommentResponse.statusCode).toEqual(401);
    expect(deleteCommentResponse.statusCode).toEqual(401);
    expect(postReplyResponse.statusCode).toEqual(401);
  });

  it('should response 401 when request protected route with invalid token', async () => {
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const server = await createServer({});

    const postCommentResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      headers: {
        authorizations: 'invalidtoken',
      },
    });

    const deleteCommentResponse = await server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}`,
      headers: {
        authorizations: 'invalidtoken',
      },
    });

    const postReplyResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments/${commentId}/replies`,
      headers: {
        authorizations: 'invalidtoken',
      },
    });

    expect(postCommentResponse.statusCode).toEqual(401);
    expect(deleteCommentResponse.statusCode).toEqual(401);
    expect(postReplyResponse.statusCode).toEqual(401);
  });

  it('should handle server error correctly', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'super_secret',
    };
    const server = await createServer({}); // fake injection

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/users',
      payload: requestPayload,
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(500);
    expect(responseJson.status).toEqual('error');
    expect(responseJson.message).toEqual('terjadi kegagalan pada server kami');
  });

  describe('when GET /', () => {
    it('should return 200 and hello world', async () => {
      // Arrange
      const server = await createServer({});
      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/',
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.value).toEqual('Hello world!');
    });
  });
});
