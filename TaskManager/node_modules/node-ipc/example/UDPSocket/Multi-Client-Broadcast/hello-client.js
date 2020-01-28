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

ipc.config.id = 'hello';
ipc.config.retry= 1500;

ipc.serveNet(
    8001, //we set the port here because the world server is already using the default of 8000. So we can not bind to 8000 while world is using it.
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
                message : 'Hello'
            }
        );
    }
);



ipc.server.start();
