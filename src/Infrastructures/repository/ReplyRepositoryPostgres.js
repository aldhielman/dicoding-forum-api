const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const Reply = require('../../Domains/replies/entities/Reply');
const DetailReply = require('../../Domains/replies/entities/DetailReply');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(payload) {
    const { content, userId, commentId } = payload;
    const createdAt = new Date().toISOString();
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5) RETURNING id, content, user_id as "userId"',
      values: [id, commentId, content, createdAt, userId],
    };

    const result = await this._pool.query(query);

    return new Reply({
      ...result.rows.map((data) => ({
        ...data,
        owner: data.userId,
      }))[0],
    });
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_deleted = true WHERE id = $1',
      values: [replyId],
    };

    await this._pool.query(query);
  }

  async verifyOwner(payload) {
    const { userId, replyId } = payload;

    const query = {
      text: 'SELECT user_id AS "userId" FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (result.rows[0].userId !== userId) {
      throw new AuthorizationError(
        'anda tidak dapat menghapus balasan yang tidak anda buat',
      );
    }
  }

  async verifyReplyId(replyId) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('reply tidak ditemukan');
    }
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: 'SELECT r.id, u.username, r.created_at AS "date", r.content, r.is_deleted AS "isDeleted" FROM replies r LEFT JOIN users u ON r.user_id = u.id WHERE comment_id = $1 ORDER BY r.created_at ASC',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    const replies = [];

    if (result.rowCount) {
      result.rows.forEach((data) => {
        const reply = new DetailReply({ ...data });
        replies.push(reply);
      });
    }

    return replies;
  }
}

module.exports = ReplyRepositoryPostgres;
