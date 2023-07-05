const DetailComment = require('../../../comments/entities/DetailComment');
const DetailThread = require('../DetailThread');

describe('a DetailThread entities', () => {
  it('should throw error when no payload ', () => {
    // Action and Assert
    expect(() => new DetailThread()).toThrowError(
      'DETAIL_THREAD.NOT_CONTAIN_PAYLOAD'
    );
  });

  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Title 1',
      username: 'dicoding',
      comments: [],
    };

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError(
      'DETAIL_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 123,
      body: true,
      date: true,
      username: 'user-123',
      comments: [{ id: 'comment-123' }],
    };

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError(
      'DETAIL_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create DetailThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Title 1',
      body: 'Body 1',
      username: 'dicoding',
      date: new Date().toISOString(),
      comments: [
        new DetailComment({
          id: 'comment-123',
          content: 'Comment 1',
          username: 'dicoding',
          date: new Date().toISOString(),
        }),
      ],
    };

    // Action
    const { id, title, body, date, username, comments } = new DetailThread(
      payload
    );

    // Assert
    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
    expect(comments).toEqual(payload.comments);
  });
});
