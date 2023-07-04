/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('comments', {
    is_deleted: {
      type: 'BOOLEAN',
      notNull: true,
      default: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('comments', 'is_deleted');
};
