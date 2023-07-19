const DetailReply = require('../../replies/entities/DetailReply');

class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);
    const {
      id, username, date, content, replies, isDeleted, likeCount,
    } = payload;

    this.id = id;
    this.content = content;
    this.date = date;
    this.username = username;
    this.replies = replies;
    this.likeCount = likeCount;
    if (isDeleted !== undefined) {
      this.isDeleted = isDeleted;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  _verifyPayload(payload) {
    if (payload === undefined) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_PAYLOAD');
    }
    const {
      id, content, date, username, replies, isDeleted, likeCount,
    } = payload;
    if (
      !content
      || !id
      || !date
      || !username
      || !replies
      || likeCount === undefined
    ) {
      throw new Error('DETAIL_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof content !== 'string'
      || typeof id !== 'string'
      || typeof username !== 'string'
      || typeof date !== 'string'
      || typeof likeCount !== 'number'
      || !Array.isArray(replies)
      || (isDeleted !== undefined && typeof isDeleted !== 'boolean')
      || !replies.every((reply) => reply instanceof DetailReply)
    ) {
      throw new Error(
        'DETAIL_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION',
      );
    }
  }
}

module.exports = DetailComment;
