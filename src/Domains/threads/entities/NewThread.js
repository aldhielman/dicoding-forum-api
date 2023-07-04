class NewThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const { title, body, user_id } = payload;

    this.title = title;
    this.body = body;
    this.user_id = user_id;
  }

  _verifyPayload(payload) {
    if (payload == undefined) {
      throw new Error('NEW_THREAD.NOT_CONTAIN_PAYLOAD');
    }

    const { title, body, user_id } = payload;
    if (!title || !body || !user_id) {
      throw new Error('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof title !== 'string' ||
      typeof body !== 'string' ||
      typeof user_id !== 'string'
    ) {
      throw new Error('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (title.length > 50) {
      throw new Error('NEW_THREAD.TITLE_LIMIT_CHAR');
    }
  }
}

module.exports = NewThread;
