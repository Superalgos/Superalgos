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

ipc.connectTo(
    'world',
    function(){
        ipc.of.world.on(
            'connect',
            function(){
                ipc.log('## connected to world ##', ipc.config.delay);
                ipc.of.world.emit(
                    'hello'
                );
            }
        );

        ipc.of.world.on(
            'data',
            function(data){
                ipc.log('got a message from world : ', data,data.toString());
            }
        );
    }
);
