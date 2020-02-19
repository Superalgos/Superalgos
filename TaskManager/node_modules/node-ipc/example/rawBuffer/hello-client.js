'use strict';

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
ipc.config.encoding='hex';

ipc.connectTo(
    'world',
    function(){
        ipc.of.world.on(
            'connect',
            function(){
                //make a 6 byte buffer for example
                const myBuffer=new Buffer(6).fill(0);

                myBuffer.writeUInt16BE(0x02,0);
                myBuffer.writeUInt32BE(0xffeecc,2);

                ipc.log('## connected to world ##', ipc.config.delay);
                ipc.of.world.emit(
                    myBuffer
                );
            }
        );

        ipc.of.world.on(
            'data',
            function(data){
                ipc.log('got a message from world : ', data);
            }
        );
    }
);
