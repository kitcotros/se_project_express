const { JWT_SECRET = "your_very_long_and_random_secret_key_here" } =
  process.env;

module.exports = JWT_SECRET;
