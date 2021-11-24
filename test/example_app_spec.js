//
// describe('Application launch', function () {
//     this.timeout(10000)
//     beforeEach(async function(){
//         this.app = await startApp();
//     })
//     afterEach(function(){
//         stopApp()
//     })
//     it('shows an initial window', function () {
//         return this.app.client.getWindowCount().then(function (count) {
//             expect(count).to.equal(1)
//             // Please note that getWindowCount() will return 2 if `dev tools` are opened.
//             // expect(count).to.equal(2)
//         })
//     })
// })