const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const Thread = require('../../Domains/threads/entities/Thread');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
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
      text: 'SELECT * from threads WHERE ID = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;
