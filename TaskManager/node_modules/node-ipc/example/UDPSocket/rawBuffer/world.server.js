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
 ***************************************/

ipc.config.id = 'world';
ipc.config.retry= 1500;
ipc.config.rawBuffer=true;
ipc.config.encoding='ascii';

ipc.serveNet(
    'udp4',
    function(){
        ipc.server.on(
            'data',
            function(data,socket){
                ipc.log('got a message', data,data.toString());
                ipc.server.emit(
                    socket,
                    'goodbye'
                );
            }
        );
    }
);

ipc.server.start();
