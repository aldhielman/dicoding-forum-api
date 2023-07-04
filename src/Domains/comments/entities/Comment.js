class Comment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, content, owner } = payload;

    this.id = id;
    this.content = content;
    this.owner = owner;
  }

  _verifyPayload(payload) {
    if (payload == undefined) {
      throw new Error('COMMENT.NOT_CONTAIN_PAYLOAD');
    }

    const { id, content, owner } = payload;
    if (!content || !id || !owner) {
      throw new Error('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof content !== 'string' ||
      typeof id !== 'string' ||
      typeof owner !== 'string'
    ) {
      throw new Error('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Comment;
