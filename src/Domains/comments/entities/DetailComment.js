const DetailReply = require('../../replies/entities/DetailReply');

class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, username, date, content, replies } = payload;

    this.id = id;
    this.content = content;
    this.date = date;
    this.username = username;
    this.replies = replies;
  }

  _verifyPayload(payload) {
    if (payload == undefined) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_PAYLOAD');
    }

    const { id, content, date, username, replies } = payload;
    if (!content || !id || !date || !username || !replies) {
      throw new Error('DETAIL_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof content !== 'string' ||
      typeof id !== 'string' ||
      typeof username !== 'string' ||
      typeof date !== 'string' ||
      !Array.isArray(replies) ||
      !replies.every((reply) => reply instanceof DetailReply)
    ) {
      throw new Error(
        'DETAIL_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION'
      );
    }
  }
}

module.exports = DetailComment;
