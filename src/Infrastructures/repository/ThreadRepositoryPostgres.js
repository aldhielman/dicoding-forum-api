const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const DetailThread = require('../../Domains/threads/entities/DetailThread');
const Thread = require('../../Domains/threads/entities/Thread');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(payload) {
    const { title, body, userId } = payload;
    const createdAt = new Date().toISOString();
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, user_id as "owner" ',
      values: [id, title, body, userId, createdAt],
    };

    const result = await this._pool.query(query);

    return new Thread(result.rows[0]);
  }

  async verifyThreadId(threadId) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }
  }

  async viewThread(id) {
    const query = {
      text: 'SELECT t.id, t.title, t.body, t.created_at as "date", u.username FROM threads t LEFT JOIN users u ON t.user_id = u.id WHERE t.id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    return new DetailThread({ ...result.rows[0], comments: [] });
  }
}

module.exports = ThreadRepositoryPostgres;
