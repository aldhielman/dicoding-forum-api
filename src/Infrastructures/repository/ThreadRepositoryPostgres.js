const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const DetailThread = require('../../Domains/threads/entities/DetailThread');
const Thread = require('../../Domains/threads/entities/Thread');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator, commentRepopsitory) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._commentRepository = commentRepopsitory;
  }

  async addThread(payload) {
    const { title, body, user_id } = payload;
    const created_at = new Date().toISOString();
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, user_id',
      values: [id, title, body, user_id, created_at],
    };

    const result = await this._pool.query(query);

    return new Thread({
      ...result.rows.map(({ id, title, user_id }) => ({
        id,
        title,
        owner: user_id,
      }))[0],
    });
  }

  async viewThread(id) {
    const query = {
      text: 'SELECT t.id, t.title, t.body, t.created_at, u.username FROM threads t LEFT JOIN users u ON t.user_id = u.id WHERE t.id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    return result.rows.map(
      async ({ id, title, body, created_at, username }) => {
        // let comments = this._commentRepository.getComment
        let comments = await this._commentRepository.getCommentsByThreadId(id);
        return new DetailThread({
          id,
          title,
          body,
          date: created_at,
          username,
          comments,
        });
      }
    )[0];
  }
}

module.exports = ThreadRepositoryPostgres;
