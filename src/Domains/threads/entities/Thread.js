class Thread {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, title, owner } = payload;

    this.id = id;
    this.title = title;
    this.owner = owner;
  }

  _verifyPayload(payload) {
    if (payload == undefined) {
      throw new Error('THREAD.NOT_CONTAIN_PAYLOAD');
    }

    const { id, title, owner } = payload;
    if (!title || !id || !owner) {
      throw new Error('THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof title !== 'string' ||
      typeof id !== 'string' ||
      typeof owner !== 'string'
    ) {
      throw new Error('THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Thread;
