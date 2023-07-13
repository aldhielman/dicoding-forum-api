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
    const { content, userId, threadId } = payload;
    const createdAt = new Date().toDateString();
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, user_id as user_id',
      values: [id, threadId, content, createdAt, userId],
    };

    const result = await this._pool.query(query);

    return new Comment({
      ...result.rows.map((data) => ({
        ...data,
        owner: data.user_id,
      }))[0],
    });
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_deleted = true WHERE id = $1',
      values: [commentId],
    };

    await this._pool.query(query);
  }

  async verifyOwner(payload) {
    const { userId, commentId } = payload;

    const query = {
      text: 'SELECT user_id AS "userId" FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (result.rows[0].userId !== userId) {
      throw new AuthorizationError(
        'anda tidak dapat menghapus komentar yang tidak anda buat',
      );
    }
  }

  async verifyCommentId(commentId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: 'SELECT c.id, u.username, c.created_at as "date", c.content, c.is_deleted as "isDeleted" FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE thread_id = $1 ORDER BY c.created_at ASC',
      values: [threadId],
    };

    const result = await this._pool.query(query);
    const comments = [];

    if (result.rowCount) {
      result.rows.forEach((data) => {
        const comment = new DetailComment({ ...data, replies: [] });
        comments.push(comment);
      });
    }

    return comments;
  }
}

module.exports = CommentRepositoryPostgres;
