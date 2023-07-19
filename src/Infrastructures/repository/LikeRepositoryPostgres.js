const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async isExist(payload) {
    const { commentId, userId } = payload;
    const query = {
      text: 'SELECT * FROM likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);
    if (result.rowCount) {
      return true;
    }
    return false;
  }

  async addLike(payload) {
    const { commentId, userId } = payload;
    const query = {
      text: 'INSERT INTO likes VALUES($1,$2)',
      values: [userId, commentId],
    };

    await this._pool.query(query);
  }

  async deleteLike(payload) {
    const { commentId, userId } = payload;
    const query = {
      text: 'DELETE FROM likes WHERE user_id = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    await this._pool.query(query);
  }
}

module.exports = LikeRepositoryPostgres;
