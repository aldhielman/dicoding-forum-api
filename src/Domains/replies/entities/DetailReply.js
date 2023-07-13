class DetailReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, date, content, isDeleted,
    } = payload;

    this.id = id;
    this.content = content;
    this.date = date;
    this.username = username;
    if (isDeleted !== undefined) {
      this.isDeleted = isDeleted;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  _verifyPayload(payload) {
    if (payload === undefined) {
      throw new Error('DETAIL_REPLY.NOT_CONTAIN_PAYLOAD');
    }

    const {
      id, content, date, username, isDeleted,
    } = payload;
    if (!content || !id || !date || !username) {
      throw new Error('DETAIL_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof content !== 'string'
      || typeof id !== 'string'
      || typeof username !== 'string'
      || typeof date !== 'string'
      || (isDeleted !== undefined && typeof isDeleted !== 'boolean')
    ) {
      throw new Error('DETAIL_REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailReply;
