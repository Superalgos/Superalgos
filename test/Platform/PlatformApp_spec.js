let PlatformApp = require('../../Platform/PlatformApp.js');
require('../helper.js');

describe('PlatformApp', function() {
    let platformApp;
    beforeEach(function(){
        platformApp = new PlatformApp();
    });
    describe('run', function() {
        it('calls setupEvents', async function() {
            let stub = Sinon.stub(platformApp,'setupEvents');
            platformApp.run({}, [], '', {});
            expect(stub).to.have.been.calledOnce
        });
        it('calls setupGlobals', async function() {
            let stub = Sinon.stub(platformApp,'setupGlobals');
            platformApp.run({}, [], '', {});
            expect(stub).to.have.been.calledOnce
        });
        it('calls setupServers', async function() {
            let stub = Sinon.stub(platformApp,'setupServers');
            platformApp.run({}, [], '', {});
            expect(stub).to.have.been.calledOnce
        });
        it('calls setupNetworkInterfaces', async function() {
            let stub = Sinon.stub(platformApp,'setupNetworkInterfaces');
            platformApp.run({}, [], '', {});
            expect(stub).to.have.been.calledOnce
        });
        it('calls logMessage', async function() {
            let stub = Sinon.stub(platformApp,'logMessage');
            platformApp.run({}, [], '', {});
            expect(stub).to.have.been.calledOnce
        });
    });
    describe('setupServers', function() {
        it('launches each provided server', function() {
            fake_server = {initialize: Sinon.stub(), run: Sinon.stub()}
            let servers = {
                KEYONE: {},
                KEYTWO: {}
            }
            let launchStub = Sinon.stub(platformApp, 'launchServer');
            platformApp.run(servers, [], '', {});
            expect(launchStub).to.have.been.calledTwice;
        });
    })
    describe('launchServer', function(){
        it('sets up the server global', function() {

        });
        it('initializes the server', function() {
            platformApp.global = {servers: []}
            let fakeServer = {initialize: Sinon.stub(), run: Sinon.stub()};
            platformApp.launchServer('SERVER_KEY', fakeServer);
            expect(fakeServer.initialize).to.have.been.calledOnce;
        });
        it('runs the server', function(){
            platformApp.global = {servers: []}
            let fakeServer = {initialize: Sinon.stub(), run: Sinon.stub()};
            platformApp.launchServer('SERVER_KEY', fakeServer);
            expect(fakeServer.run).to.have.been.calledOnce;
        });
    });
})