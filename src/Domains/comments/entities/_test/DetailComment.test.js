const DetailReply = require('../../../replies/entities/DetailReply');
const DetailComment = require('../DetailComment');

describe('a DetailComment entities', () => {
  it('should throw error when no payload ', () => {
    // Action and Assert
    expect(() => new DetailComment()).toThrowError(
      'DETAIL_COMMENT.NOT_CONTAIN_PAYLOAD',
    );
  });

  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment 1',
      content: 'user-123',
    };

    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError(
      'DETAIL_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: 'comment 1',
      username: {},
      date: [],
      replies: {},
      isDeleted: 'true',
      likeCount: '1',
    };

    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError(
      'DETAIL_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create DetailComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: new Date().toISOString(),
      content: 'Comment 1',
      likeCount: 0,
      replies: [
        new DetailReply({
          id: 'reply-123',
          content: 'Reply 1',
          username: 'dicoding',
          date: new Date().toISOString(),
        }),
      ],
      isDeleted: false,
    };

    // Action
    const comment = new DetailComment(payload);

    // Assert
    expect(comment.id).toEqual(payload.id);
    expect(comment.username).toEqual(payload.username);
    expect(comment.date).toEqual(payload.date);
    expect(comment.content).toEqual(payload.content);
    expect(comment.likeCount).toEqual(payload.likeCount);
    expect(comment.replies).toEqual(payload.replies);
    expect(comment.isDeleted).toEqual(payload.isDeleted);
  });

  it('should create DetailComment object correctly when no isDeleted property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: new Date().toISOString(),
      content: 'Comment 1',
      likeCount: 0,
      replies: [
        new DetailReply({
          id: 'reply-123',
          content: 'Reply 1',
          username: 'dicoding',
          date: new Date().toISOString(),
        }),
      ],
    };

    // Action
    const comment = new DetailComment(payload);

    // Assert
    expect(comment.id).toEqual(payload.id);
    expect(comment.username).toEqual(payload.username);
    expect(comment.date).toEqual(payload.date);
    expect(comment.content).toEqual(payload.content);
    expect(comment.replies).toEqual(payload.replies);
    expect(comment.likeCount).toEqual(payload.likeCount);
    expect(comment.isDeleted).toEqual(payload.isDeleted);
  });
});
