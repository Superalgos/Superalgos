const ipc=require('../../../node-ipc');

/***************************************\
 *
 * You should start both hello and world
 * then you will see them communicating.
 *
 * *************************************/

ipc.config.id = 'hello';
ipc.config.retry = 1000;

ipc.connectTo(
    'world',
    function(){
        ipc.of.world.on(
            'connect',
            function(){
                ipc.log('## connected to world ##', ipc.config.delay);
                ipc.of.world.emit(
                    'app.message',
                    {
                        id      : ipc.config.id,
                        message : 'hello'
                    }
                );
            }
        );
        ipc.of.world.on(
            'disconnect',
            function(){
                ipc.log('disconnected from world');
            }
        );
        ipc.of.world.on(
            'app.message',
            function(data){
                ipc.log('got a message from world : ', data);
            }
        );

        console.log(ipc.of.world.destroy);
    }
);
