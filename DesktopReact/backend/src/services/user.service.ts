export class UserService{

    private SA;
    private webAppInterface;

    constructor(SA, webAppInterface) {
        this.SA = SA,
        this.webAppInterface = webAppInterface
      }

    async profiles(){

        try {
            let queryMessage = {
                queryType: this.SA.projects.socialTrading.globals.queryTypes.UNFOLLOWED_USER_PROFILES,
                emitterUserProfileId: undefined,
                initialIndex: this.SA.projects.socialTrading.globals.queryConstants.INITIAL_INDEX_FIRST,
                amountRequested: 3,
                direction: this.SA.projects.socialTrading.globals.queryConstants.DIRECTION_UP
            }

            let query = {
                requestType: 'Query',
                queryMessage: JSON.stringify(queryMessage)
            }

            return await this.webAppInterface.messageReceived(
                JSON.stringify(query)
            );
        } catch (e) {
            console.log(e);
            return [];
        }
    }

    
    async whoToFollow() {

        try {
            let queryMessage = {
                queryType: this.SA.projects.socialTrading.globals.queryTypes.UNFOLLOWED_USER_PROFILES,
                emitterUserProfileId: undefined,
                initialIndex: this.SA.projects.socialTrading.globals.queryConstants.INITIAL_INDEX_FIRST,
                amountRequested: 3,
                direction: this.SA.projects.socialTrading.globals.queryConstants.DIRECTION_UP
            }

            let query = {
                requestType: 'Query',
                queryMessage: JSON.stringify(queryMessage)
            }

            return await this.webAppInterface.messageReceived(
                JSON.stringify(query)
            );
        } catch (e) {
            console.log(e);
            return [];
        }
    }

    async followProfile(userProfileId, eventType) {

        try {
            let queryMessage = {
                queryType: this.SA.projects.socialTrading.globals.queryTypes.UNFOLLOWED_USER_PROFILES,
                emitterUserProfileId: undefined,
                initialIndex: this.SA.projects.socialTrading.globals.queryConstants.INITIAL_INDEX_FIRST,
                amountRequested: 3,
                direction: this.SA.projects.socialTrading.globals.queryConstants.DIRECTION_UP
            }

            let query = {
                requestType: 'Query',
                queryMessage: JSON.stringify(queryMessage)
            }

            return await this.webAppInterface.messageReceived(
                JSON.stringify(query)
            );
        } catch (e) {
            console.log(e);
            return {};
        }
    }
}