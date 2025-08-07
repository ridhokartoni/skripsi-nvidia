const jwt = require('jsonwebtoken');
const express = require('express');

const router = express.Router();
const httpServer = require('http').createServer(router);


function notFound(req, res, next) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    status: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
}

function isAuthenticated(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) {
    res.status(401);
    throw new Error('Tidak Memiliki Izin, Anda tidak terautentikasi');
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.payload = payload;

    const { userId } = payload;
    req.userId = userId;
  } catch (err) {
    res.status(401);
    if (err.name === 'TokenExpiredError') {
      throw new Error(err.name);
    }
    throw new Error('Tidak Memiliki Izin');
  }
  return next();
}

module.exports = {
  notFound,
  errorHandler,
  isAuthenticated,
};
