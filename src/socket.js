/* eslint-disable no-unused-vars */
const httpStatus = require('http-status');
const { Error } = require('./utils/api-response');

const authentication = async (data, socketId) => true;

exports.emitToSocketId = (socketId, eventName, data) => {
  console.log(`Emit ${eventName}`, socketId, data);
  global.io.to(`${socketId}`).emit(eventName, data);
};

exports.emitOverChannel = (eventName, data) => {
  console.log(`Emit over channel ${eventName}`, data);
  global.io.emit(eventName, data);
};

exports.init = async () => {
  global.io.on('connection', async (socket) => {
    const query = socket.request._query;

    authentication(query, socket.id)
      .then((result) => {
        if (result) {
          global.io.to(socket.id).emit('onAuthenticated', true);

          return;
        }

        global.io.to(socket.id).emit('onAuthenticated', false);
        global.io.sockets.sockets[socket.id].disconnect();
      })
      .catch(() => {});
  });
};
