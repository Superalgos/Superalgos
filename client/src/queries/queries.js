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
query($authId: String){
    userByAuthId (authId: $authId){
      id
      alias
      firstName
      middleName
      lastName
      email
      emailVerified
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

const updateUserMutation = gql`
mutation(
  $id: ID!,
  $firstName:String,
  $middleName:String,
  $lastName:String,
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
export {getUsersQuery, getUserByAuthIdQuery, getRolesQuery, updateUserMutation, getUserProfileQuery}
