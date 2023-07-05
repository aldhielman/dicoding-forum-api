class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, username, date, content } = payload;

    this.id = id;
    this.content = content;
    this.date = date;
    this.username = username;
  }

  _verifyPayload(payload) {
    if (payload == undefined) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_PAYLOAD');
    }

    const { id, content, date, username } = payload;
    if (!content || !id || !date || !username) {
      throw new Error('DETAIL_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof content !== 'string' ||
      typeof id !== 'string' ||
      typeof username !== 'string' ||
      typeof date !== 'string'
    ) {
      throw new Error(
        'DETAIL_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION'
      );
    }
  }
}

module.exports = DetailComment;
