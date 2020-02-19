const ipc=require('../../../node-ipc');

/***************************************\
 *
 * UDP Client is really a UDP server
 *
 * Dedicated UDP sockets on the same
 * machine can not be bound to in the
 * traditional client/server method
 *
 * Every UDP socket is it's own UDP server
 * And so must have a unique port on its
 * machine, unlike TCP or Unix Sockts
 * which can share on the same machine.
 *
 * Since there is no open client server
 * relationship, you should start world
 * first and then hello.
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
