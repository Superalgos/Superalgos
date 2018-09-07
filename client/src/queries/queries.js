import gql from 'graphql-tag';

const getUsersQuery = gql`
{
    users {
      id
      alias
      firstName
      lastName
      role {
        id
        name
      }
    }
}
`

const getUserProfileQuery = gql`
query($id: ID){
    user (id: $id){
      id
      alias
      firstName
      lastName
      role {
        id
        name
      }
    }
}
`

const getUserByAuthIdQuery = gql`
query($authId: String){
    userByAuthId (authId: $authId){
      id
      alias
      firstName
      lastName
      role {
        id
      }
    }
}
`

const getRolesQuery = gql`
{
    roles {
      id
      name
    }
}
`

const addUserMutation = gql`
mutation($alias: String!, $authId:String!) {
    addUser (alias: $alias, authId: $authId){
      id
      authId
    }
}
`

const updateUserMutation = gql`
mutation($id: ID!, $firstName:String, $lastName:String, $isDeveloper:Int, $isTrader:Int, $isDataAnalyst:Int, $roleId:String!) {
    updateUser (id: $id, firstName:$firstName, lastName: $lastName, isDeveloper: $isDeveloper, isTrader: $isTrader, isDataAnalyst: $isDataAnalyst, roleId: $roleId){
      id
      alias
    }
}
`
export {getUsersQuery, getUserByAuthIdQuery, getRolesQuery, addUserMutation, updateUserMutation, getUserProfileQuery}
