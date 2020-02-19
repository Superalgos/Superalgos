const ipc=require('../../../node-ipc');

/***************************************\
 *
 * You should start both hello and world
 * then you will see them communicating.
 *
 * *************************************/

ipc.config.id = 'world';
ipc.config.retry= 1500;
ipc.config.rawBuffer=true;
ipc.config.encoding='ascii';
ipc.config.networkHost='localhost';

ipc.config.tls={
    public: __dirname+'/../../../local-node-ipc-certs/server.pub',
    private: __dirname+'/../../../local-node-ipc-certs/private/server.key',
    dhparam: __dirname+'/../../../local-node-ipc-certs/private/dhparam.pem',
    requestCert: true,
    rejectUnauthorized:true,
    trustedConnections: [
        __dirname+'/../../../local-node-ipc-certs/client.pub'
    ]
};

ipc.serveNet(
    function(){
        ipc.server.on(
            'connect',
            function(socket){
                console.log('connection detected');
                ipc.server.emit(
                    socket,
                    'hello'
                );
            }
        );

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
