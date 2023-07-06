const Comment = require('../Comment');

describe('a Comment entities', () => {
  it('should throw error when no payload ', () => {
    // Action and Assert
    expect(() => new Comment()).toThrowError('COMMENT.NOT_CONTAIN_PAYLOAD');
  });

  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'comment 1',
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new Comment(payload)).toThrowError(
      'COMMENT.NOT_CONTAIN_NEEDED_PROPERTY',
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
    expect(() => new Comment(payload)).toThrowError(
      'COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create Comment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'Comment 1',
      owner: 'user-123',
    };

    // Action
    const comment = new Comment(payload);

    // Assert
    expect(comment.id).toEqual(payload.id);
    expect(comment.content).toEqual(payload.content);
    expect(comment.owner).toEqual(payload.owner);
  });
});
