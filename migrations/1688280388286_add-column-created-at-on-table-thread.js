/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('threads', {
    created_at: {
      type: 'TEXT',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('threads', 'created_at');
};
