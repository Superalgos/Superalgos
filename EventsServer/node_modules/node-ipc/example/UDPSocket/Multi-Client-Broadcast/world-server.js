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
 ***************************************/

ipc.config.id = 'world';
ipc.config.retry= 1500;

var messages={
    goodbye:false,
    hello:false
};

ipc.serveNet(
    'udp4',
    function(){
        console.log(123);
        ipc.server.on(
            'message',
            function(data,socket){
                ipc.log('got a message from ', data.id ,' : ', data.message);
                messages[data.id]=true;
                ipc.server.emit(
                    socket,
                    'message',
                    {
                        id      : ipc.config.id,
                        message : data.message+' world!'
                    }
                );

                if(messages.hello && messages.goodbye){
                    ipc.log('got all required events, telling evryone how muchg I am loved!');
                    ipc.server.broadcast(
                        'message',
                        {
                            id      : ipc.config.id,
                            message : 'Everybody Loves The World! Got messages from hello and goodbye!'
                        }
                    );
                }
            }
        );

        console.log(ipc.server);
    }
);



ipc.server.start();
