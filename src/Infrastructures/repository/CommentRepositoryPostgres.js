const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const Comment = require('../../Domains/comments/entities/Comment');
const DetailComment = require('../../Domains/comments/entities/DetailComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator, replyRepository) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._replyRepository = replyRepository;
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

    const result = await this.verifyCommentId(commentId);

    if (result.user_id !== userId) {
      throw new AuthorizationError(
        'anda tidak dapat menghapus komentar yang tidak anda buat'
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

    return result.rows[0];
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: 'SELECT c.id, u.username, c.created_at, c.content, c.is_deleted FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE thread_id = $1 ORDER BY c.created_at ASC',
      values: [threadId],
    };

    const result = await this._pool.query(query);
    const comments = [];

    if (result.rowCount) {
      for (const item of result.rows) {
        const { id, created_at, is_deleted, content } = item;
        const replies = await this._replyRepository.getRepliesByCommentId(
          item.id
        );
        const comment = new DetailComment({
          ...item,
          date: created_at,
          content: is_deleted ? '**komentar telah dihapus**' : content,
          replies,
        });
        comments.push(comment);
      }
    }

    return comments;
  }
}

module.exports = CommentRepositoryPostgres;
