import gql from 'graphql-tag'

const getUsersQuery = gql`
{
    users {
      id
      alias
      firstName
      middleName
      lastName
      bio
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
      bio
      avatarHandle      
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
      bio
      email
      emailVerified
      isDeveloper
      isDataAnalyst
      isTrader
      avatarHandle
      avatarChangeDate
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
  $bio:String,
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
      bio: $bio,
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

const updateUserImagesMutation = gql`
mutation(
  $id: ID!,
  $avatarHandle:String,
  $avatarChangeDate:String 
)
  {
    updateUser (
      id: $id,
      avatarHandle:$avatarHandle,
      avatarChangeDate: $avatarChangeDate 
    )
    {
      id
      alias
    }
}
`
export {getUsersQuery, getUserByAuthIdQuery, getRolesQuery, getUserProfileQuery, updateUserMutation, updateUserImagesMutation}
