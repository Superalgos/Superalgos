/*

Global in-memory Sessions

Here, we are going to store some information associated to the logged in user, after it was
succesfully authenticated. This will prevent cheating, since we will use the in-Session
user-id for any transaction belonging to the user instead of whatever user id it provides
from the client app.

The key to access the in-Session information will allways be the authenticatioin token received
at the authentication transaction. This token should always come at the header of each
transactional functionality supported by this server module.

*/

global.Sessions = new Map();
