/* eslint-disable no-unused-vars */
const fs = require('fs');
const httpStatus = require('http-status');
const jwt = require('jwt-simple');
const { DateTime } = require('luxon');
const { Error } = require('../utils/api-response');
const { jwtSecret } = require('../config');

const capitalizeFirstLetter = (val) => val.charAt(0).toUpperCase() + val.toLowerCase().slice(1);

exports.resizeImage = (path, format, width, height) => true;

const authorize = async (req, res, next) => true;

exports.authorize = (req, res, next) => () => authorize(req, res, next);

exports.capitalizeFirstLetter = capitalizeFirstLetter;

exports.capitalizeEachLetter = (data) => data
  .toLowerCase()
  .split(' ')
  .map((word) => capitalizeFirstLetter(word))
  .join(' ');

exports.generateRandom = (length = 32, alphanumeric = true) => {
  let data = '';

  let keys = '';

  if (alphanumeric) {
    keys = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  } else {
    keys = '0123456789';
  }

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < length; i++) {
    data += keys.charAt(Math.floor(Math.random() * keys.length));
  }

  return data;
};
