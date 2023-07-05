const Reply = require('../Reply');

describe('a Reply entities', () => {
  it('should throw error when no payload ', () => {
    // Action and Assert
    expect(() => new Reply()).toThrowError('REPLY.NOT_CONTAIN_PAYLOAD');
  });

  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'comment 1',
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new Reply(payload)).toThrowError(
      'REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: 'comment 1',
      owner: {},
    };

    // Action and Assert
    expect(() => new Reply(payload)).toThrowError(
      'REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create Reply object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'Comment 1',
      owner: 'user-123',
    };

    // Action
    const reply = new Reply(payload);

    // Assert
    expect(reply.id).toEqual(payload.id);
    expect(reply.content).toEqual(payload.content);
    expect(reply.owner).toEqual(payload.owner);
  });
});
