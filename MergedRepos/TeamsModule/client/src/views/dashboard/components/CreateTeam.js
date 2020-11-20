import React from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'

import Typography from '@material-ui/core/Typography'

import { getItem } from '../../../utils/local-storage'
import { checkGraphQLError } from '../../../utils/graphql-errors'

import CREATE_TEAM from '../../../graphql/teams/CreateTeamMutation'
import GET_TEAMS_BY_OWNER from '../../../graphql/teams/GetTeamsByOwnerQuery'

import log from '../../../utils/log'

const CreateTeam = ({ authId }) => {
  let input
  log.debug('CreateTeam', authId)

  return (
    <Mutation
      mutation={CREATE_TEAM}
      refetchQueries={[
        {
          query: GET_TEAMS_BY_OWNER,
          variables: { authId }
        }
      ]}
    >
      {(createTeam, { loading, error, data }) => {
        let errors
        let loader
        if (loading) {
          loader = <Typography variant='caption'>Submitting team...</Typography>
        }
        if (error) {
          errors = error.graphQLErrors.map(({ message }, i) => {
            const displayMessage = checkGraphQLError(message)
            log.debug('createTeam error:', displayMessage)
            return (
              <Typography key={i} variant='caption'>
                {message}
              </Typography>
            )
          })
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

CreateTeam.propTypes = {
  authId: PropTypes.any
}

const handleSubmit = async (e, createTeam, input) => {
  e.preventDefault()
  const currentUser = await getItem('user')
  let authId = JSON.parse(currentUser)
  authId = authId.authId
  log.debug('createTeam submit: ', authId)
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
