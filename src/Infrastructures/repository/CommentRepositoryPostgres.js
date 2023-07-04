const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const Comment = require('../../Domains/comments/entities/Comment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(payload) {
    const { content, user_id, thread_id } = payload;
    const created_at = new Date().toDateString();
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, user_id',
      values: [id, thread_id, content, created_at, user_id],
    };

    const result = await this._pool.query(query);

    return new Comment({
      ...result.rows.map(({ id, content, user_id }) => ({
        id,
        content,
        owner: user_id,
      }))[0],
    });
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_deleted = true WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async verifyOwner(payload) {
    const { userId, commentId } = payload;

    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }

    if (result.rows[0].user_id !== userId) {
      throw new AuthorizationError(
        'anda tidak dapat menghapus komentar yang tidak anda buat'
      );
    }
  }
}

module.exports = CommentRepositoryPostgres;
