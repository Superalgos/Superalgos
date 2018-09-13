import React from 'react'
import { Mutation } from 'react-apollo'

import Typography from '@material-ui/core/Typography'

import { getItem } from '../../../utils/local-storage'

import CREATE_TEAM from '../../../graphql/teams/CreateTeamMutation'
import GET_TEAMS_BY_OWNER from '../../../graphql/teams/GetTeamsByOwnerQuery'

const CreateTeam = () => {
  let input

  return (
    <Mutation
      mutation={CREATE_TEAM}
      update={(cache, { data: { createTeam } }) => {
        const { teamsByOwner } = cache.readQuery({ query: GET_TEAMS_BY_OWNER })
        cache.writeQuery({
          query: GET_TEAMS_BY_OWNER,
          data: { teamsByOwner: teamsByOwner.concat([createTeam]) }
        })
      }}
    >
      {(createTeam, { loading, error, data }) => {
        let errors
        let loader
        if (loading) {
          loader = (<Typography variant='caption'>Submitting team...</Typography>)
        }
        if (error) {
          errors = error.graphQLErrors.map(({ message }, i) => (
            <Typography key={i} variant='caption'>{message}</Typography>
          ))
        }
        return (
          <div>
            <form
              onSubmit={e => {
                handleSubmit(e, createTeam, input)
              }}
            >
              <input
                ref={node => {
                  input = node
                }}
              />
              <button type='submit'>Create Team</button>
            </form>
            {loader}
            {errors}
          </div>
        )
      }}
    </Mutation>
  )
}

const handleSubmit = async (e, createTeam, input) => {
  e.preventDefault()
  const currentUser = await getItem('user')
  let authId = JSON.parse(currentUser)
  authId = authId.sub
  const name = input.value
  const slug = slugify(name)
  await createTeam({ variables: { name, slug, owner: authId } })
  input.value = ''
}

const slugify = string => {
  const a = 'àáäâãåèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;'
  const b = 'aaaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
  const p = new RegExp(a.split('').join('|'), 'g')

  return string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w-]+/g, '') // Remove all non-word characters
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

export default CreateTeam
