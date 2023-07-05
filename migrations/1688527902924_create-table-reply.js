/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('replies', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"comments"',
    },
    content: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    created_at: {
      type: 'TEXT',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
    },
    is_deleted: {
      type: 'BOOLEAN',
      notNull: true,
      default: false,
    },
  });

  pgm.createIndex('replies', 'user_id');
  pgm.createIndex('replies', 'comment_id');
};

exports.down = (pgm) => {
  pgm.dropIndex('replies', 'comment_id');
  pgm.dropIndex('replies', 'user_id');
  pgm.dropTable('replies');
};
