const DetailReply = require('../DetailReply');

describe('a DetailReply entities', () => {
  it('should throw error when no payload ', () => {
    // Action and Assert
    expect(() => new DetailReply()).toThrowError(
      'DETAIL_REPLY.NOT_CONTAIN_PAYLOAD',
    );
  });

  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment 1',
      content: 'user-123',
    };

    // Action and Assert
    expect(() => new DetailReply(payload)).toThrowError(
      'DETAIL_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: 'comment 1',
      username: {},
      date: [],
      isDeleted: 'false',
    };

    // Action and Assert
    expect(() => new DetailReply(payload)).toThrowError(
      'DETAIL_REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create DetailComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: new Date().toISOString(),
      content: 'Comment 1',
      isDeleted: false,
    };

    // Action
    const reply = new DetailReply(payload);

    // Assert
    expect(reply.id).toEqual(payload.id);
    expect(reply.username).toEqual(payload.username);
    expect(reply.date).toEqual(payload.date);
    expect(reply.content).toEqual(payload.content);
    expect(reply.isDeleted).toEqual(payload.isDeleted);
  });
});
