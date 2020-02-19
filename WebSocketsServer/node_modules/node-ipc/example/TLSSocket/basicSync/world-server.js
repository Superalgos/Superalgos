const ipc=require('../../../node-ipc');

/***************************************\
 *
 * You should start both hello and world
 * then you will see them communicating.
 *
 * *************************************/

ipc.config.id = 'world';
ipc.config.retry= 1500;
ipc.config.sync= true;
ipc.config.tls={
    public: __dirname+'/../../../local-node-ipc-certs/server.pub',
    private: __dirname+'/../../../local-node-ipc-certs/private/server.key'
};

ipc.serveNet(
    function(){
        ipc.server.on(
            'message',
            function(data,socket){
                ipc.log('got a message : ', data);
                setTimeout(
                    function(){
                        ipc.server.emit(
                            socket,
                            'message',
                            data+' world!'
                        );
                    },
                    3000
                );
            }
        );

        ipc.server.on(
            'socket.disconnected',
            function(data,socket){
                console.log(arguments);
            }
        );
    }
);



ipc.server.start();
