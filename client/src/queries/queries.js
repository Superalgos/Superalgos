import gql from 'graphql-tag';

const getUsersQuery = gql`
{
    users {
      id
      alias
      firstName
      middleName
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
      middleName
      lastName
      email
      emailVerified
      role {
        id
        name
      }
    }
}
`

const getUserByAuthIdQuery = gql`
query {
    userByAuthId{
      id
      alias
      firstName
      middleName
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
mutation(
  $id: ID!,
  $firstName:String,
  $middleName:String,
  $lastName:String,
  $email:String,
  $emailVerified:Int,
  $isDeveloper:Int,
  $isTrader:Int,
  $isDataAnalyst:Int,
  $roleId:String!
)
  {
    updateUser (
      id: $id,
      firstName:$firstName,
      middleName: $middleName,
      lastName: $lastName,
      email: $email,
      emailVerified: $emailVerified,
      isDeveloper: $isDeveloper,
      isTrader: $isTrader,
      isDataAnalyst: $isDataAnalyst,
      roleId: $roleId
    )
    {
      id
      alias
    }
}
`
export {getUsersQuery, getUserByAuthIdQuery, getRolesQuery, addUserMutation, updateUserMutation, getUserProfileQuery}
