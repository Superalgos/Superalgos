const fs = require('fs');
const ipc = require('../../node-ipc');

const socketPath = '/tmp/ipc.sock';

//loop forever so you can see the pid of the cluster sever change in the logs
setInterval(
  function() {
    ipc.connectTo(
      'world',
      socketPath,
      connecting
     );
  },
  2000
);

function connecting(socket) {
  ipc.of.world.on(
    'connect',
    function() {
      ipc.of.world.emit(
        'currentDate',
        {
             message: new Date().toISOString()
        }
      );
      ipc.disconnect('world');
    }
  );
}
