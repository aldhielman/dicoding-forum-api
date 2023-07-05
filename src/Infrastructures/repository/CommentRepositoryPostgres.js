const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const Comment = require('../../Domains/comments/entities/Comment');
const DetailComment = require('../../Domains/comments/entities/DetailComment');

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

  async getCommentsByThreadId(threadId) {
    const query = {
      text: 'SELECT c.id, u.username, c.created_at, c.content, c.is_deleted FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE thread_id = $1 ORDER BY c.created_at ASC',
      values: [threadId],
    };

    const result = await this._pool.query(query);
    let comments = [];

    if (result.rowCount) {
      const comment = result.rows.map(
        ({ id, username, created_at, content, is_deleted }) => {
          return new DetailComment({
            id,
            content: is_deleted ? '**komentar telah dihapus**' : content,
            date: created_at,
            username,
          });
        }
      );
      comments.push(...comment);
    }

    return comments;
  }
}

module.exports = CommentRepositoryPostgres;
