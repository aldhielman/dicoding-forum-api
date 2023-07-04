/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('threads', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'VARCHAR(50)',
      notNull: true,
      unique: true,
    },
    body: {
      type: 'TEXT',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('threads');
};
