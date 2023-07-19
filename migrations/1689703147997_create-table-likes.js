/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('likes', {
    user_id: {
      type: 'VARCHAR(50)',
    },
    comment_id: {
      type: 'VARCHAR(50)',
    },
  });

  pgm.createConstraint('likes', 'pk_user_id_comment_id', {
    primaryKey: ['user_id', 'comment_id'],
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('likes', 'pk_user_id_comment_id');
  pgm.dropTable('likes');
};
