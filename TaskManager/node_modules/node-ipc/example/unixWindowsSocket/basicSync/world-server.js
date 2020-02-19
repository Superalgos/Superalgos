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

ipc.serve(
    function(){
        ipc.server.on(
            'app.message',
            function(data,socket){
                setTimeout(
                    function(){
                        ipc.server.emit(
                            socket,
                            'app.message',
                            {
                                id      : ipc.config.id,
                                message : data.message+' world!'
                            }
                        );
                    },
                    2000
                );
            }
        );
    }
);



ipc.server.start();
