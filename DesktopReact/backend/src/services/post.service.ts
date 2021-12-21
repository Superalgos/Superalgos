export class PostService{

    private SA;
    private webAppInterface;

    constructor(SA, webAppInterface) {
        this.SA = SA,
        this.webAppInterface = webAppInterface
      }

    async  createPost(postText) {
        try {
            let eventMessage;
            let event;

            eventMessage = {
                eventType: this.SA.projects.socialTrading.globals.eventTypes.NEW_USER_POST,
                eventId: this.SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                postText: postText,
                timestamp: (new Date()).valueOf()
            }

            event = {
                requestType: 'Event',
                eventMessage: JSON.stringify(eventMessage)
            }

            return await this.webAppInterface.sendMessage(
                JSON.stringify(event)
            );
        } catch (e) {
            console.log(e);
            return {};
        }
    }
}