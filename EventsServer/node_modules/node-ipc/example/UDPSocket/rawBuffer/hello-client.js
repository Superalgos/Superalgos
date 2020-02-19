const ipc=require('../../../node-ipc');

/***************************************\
 *
 * You should start both hello and world
 * then you will see them communicating.
 *
 * *************************************/

ipc.config.id = 'hello';
ipc.config.retry= 1500;
ipc.config.rawBuffer=true;
ipc.config.encoding='ascii';

ipc.serveNet(
    8001, //we set the port here because the world server is already using the default of 8000. So we can not bind to 8000 while world is using it.
    'udp4',
    function(){
        ipc.server.on(
            'data',
            function(data){
                ipc.log('got a message from world ', data, data.toString());
            }
        );
        ipc.server.emit(
            {
                address : 'localhost',
                port    : ipc.config.networkPort
            },
            'hello'
        );
    }
);

ipc.server.start();
