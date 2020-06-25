const httpStatus = require('http-status');
const jwt = require('jwt-simple');
const { DateTime } = require('luxon');
const { Error } = require('../utils/api-response');
const { jwtSecret } = require('../config');

const authorize = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    const apiError = new Error({
      message: 'Unauthorized',
      status: httpStatus.UNAUTHORIZED,
    });

    if (!authorization) {
      return next(apiError);
    }

    const token = authorization.split(' ')[1];

    try {
      const tokenResult = jwt.decode(token, jwtSecret);

      if (!tokenResult || !tokenResult.exp || !tokenResult._id) {
        apiError.message = 'Malformed Token';

        return next(apiError);
      }

      if (tokenResult.exp - DateTime.local().toSeconds() < 0) {
        apiError.message = 'Token Expired';

        return next(apiError);
      }

      return next();
    } catch (e) {
      apiError.message = 'Token Expired';

      return next(apiError);
    }
  } catch (e) {
    return next(
      new Error({
        message: httpStatus[500],
        status: httpStatus.INTERNAL_SERVER_ERROR,
      }),
    );
  }
};

exports.authorize = () => (req, res, next) => authorize(req, res, next);
