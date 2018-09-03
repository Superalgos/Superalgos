import {gql} from 'apollo-boost';

const getUsersQuery = gql`
{
    users {
      id
      alias
      firstName
      lastName
      roleId
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
mutation($alias: String!, $firstName:String, $lastName:String, $roleId:String!) {
    addUser (alias: $alias, firstName:$firstName, lastName: $lastName, roleId: $roleId){
      id
      alias
    }
}
`
export {getUsersQuery, getRolesQuery, addUserMutation}
