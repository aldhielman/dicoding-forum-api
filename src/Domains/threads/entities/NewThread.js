class NewThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const { title, body, userId } = payload;

    this.title = title;
    this.body = body;
    this.userId = userId;
  }

  // eslint-disable-next-line class-methods-use-this
  _verifyPayload(payload) {
    if (payload === undefined) {
      throw new Error('NEW_THREAD.NOT_CONTAIN_PAYLOAD');
    }

    const { title, body, userId } = payload;
    if (!title || !body || !userId) {
      throw new Error('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof title !== 'string'
      || typeof body !== 'string'
      || typeof userId !== 'string'
    ) {
      throw new Error('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (title.length > 50) {
      throw new Error('NEW_THREAD.TITLE_LIMIT_CHAR');
    }
  }
}

module.exports = NewThread;
