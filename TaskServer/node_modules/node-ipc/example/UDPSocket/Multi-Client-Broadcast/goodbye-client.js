const ipc=require('../../../node-ipc');

/***************************************\
 *
 * Since there is no client relationship
 * with UDP sockets sockets are not kept
 * open.
 *
 * This means the order sockets are opened
 * is important.
 *
 * Start World first. Then you can start
 * hello or goodbye in any order you
 * choose.
 *
 * *************************************/

ipc.config.id = 'goodbye';
ipc.config.retry= 1500;

ipc.serveNet(
    8002, //we set the port here because the hello client and world server are already using the default of 8000 and the port 8001. So we can not bind to those while hello and world are connected to them.
    'udp4',
    function(){
        ipc.server.on(
            'message',
            function(data){
                ipc.log('got Data');
                ipc.log('got a message from ', data.id ,' : ', data.message);
            }
        );
        ipc.server.emit(
            {
                address : 'localhost',
                port    : ipc.config.networkPort
            },
            'message',
            {
                id      : ipc.config.id,
                message : 'Goodbye'
            }
        );
    }
);



ipc.server.start();
