const NewThread = require('../NewThread');

describe('a NewThread entities', () => {
  it('should throw error when no payload ', () => {
    // Action and Assert
    expect(() => new NewThread()).toThrowError(
      'NEW_THREAD.NOT_CONTAIN_PAYLOAD'
    );
  });

  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'abc',
      user_id: 'user-123',
    };

    // Action and Assert
    expect(() => new NewThread(payload)).toThrowError(
      'NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      title: 123,
      body: true,
      user_id: 'user-123',
    };

    // Action and Assert
    expect(() => new NewThread(payload)).toThrowError(
      'NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should throw error when username contains more than 50 character', () => {
    // Arrange
    const payload = {
      title: 'dicodingindonesiadicodingindonesiadicodingindonesiadicoding',
      body: 'Dicoding Indonesia',
      user_id: 'user-123',
    };

    // Action and Assert
    expect(() => new NewThread(payload)).toThrowError(
      'NEW_THREAD.TITLE_LIMIT_CHAR'
    );
  });

  it('should create NewThread object correctly', () => {
    // Arrange
    const payload = {
      title: 'Title 1',
      body: 'Body 1',
      user_id: 'user-123',
    };

    // Action
    const { title, body, user_id } = new NewThread(payload);

    // Assert
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(user_id).toEqual(payload.user_id);
  });
});
