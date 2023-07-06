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

    const result = await this.verifyCommentId(commentId);

    if (result.user_id !== userId) {
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

    return result.rows[0];
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: 'SELECT c.id, u.username, c.created_at as "createdAt", c.content, c.is_deleted as "isDeleted" FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE thread_id = $1 ORDER BY c.created_at ASC',
      values: [threadId],
    };

    const result = await this._pool.query(query);
    let comments = [];

    if (result.rowCount) {
      const promises = result.rows.map(async (item) => {
        const { createdAt, isDeleted, content } = item;
        const replies = await this._replyRepository.getRepliesByCommentId(
          item.id,
        );
        const comment = new DetailComment({
          ...item,
          date: createdAt,
          content: isDeleted ? '**komentar telah dihapus**' : content,
          replies,
        });
        return comment;
      });

      comments = await Promise.all(promises);
    }

    return comments;
  }
}

module.exports = CommentRepositoryPostgres;
