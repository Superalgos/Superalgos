import { logger } from '../../../logger'

import { member, owner } from './Member'
import { teams, teamById, teamsByIds, teamByName, teamBySlug, teamWithRole, teamAuthorization, teamsByOwner, teamsByRole } from './Team'
import{ fbByTeamMember } from './TeamMember'
import{ fbByFbId, fbByFbSlug, fbByOwner } from './FinancialBeing'

export const resolvers = {
  Query: {
    member: (parent, arg, ctx, info) => member(parent, arg, ctx, info),
    teams: (parent, arg, ctx, info) => teams(parent, arg, ctx, info),
    teamById: (parent, arg, ctx, info) => teamById(parent, arg, ctx, info),
    teamsByIds: (parent, arg, ctx, info) => teamsByIds(parent, arg, ctx, info),
    teamByName: (parent, arg, ctx, info) => teamByName(parent, arg, ctx, info),
    teamBySlug: (parent, arg, ctx, info) => teamBySlug(parent, arg, ctx, info),
    teamWithRole: (parent, arg, ctx, info) => teamWithRole(parent, arg, ctx, info),
    teamAuthorization: (parent, arg, ctx, info) => teamAuthorization(parent, arg, ctx, info),
    teamsByOwner: (parent, arg, ctx, info) => teamsByOwner(parent, arg, ctx, info),
    teamsByRole: (parent, arg, ctx, info) => teamsByRole(parent, arg, ctx, info),
    owner: (parent, arg, ctx, info) => owner(parent, arg, ctx, info),
    fbByTeamMember: (parent, arg, ctx, info) => fbByTeamMember(parent, arg, ctx, info),
    fbByOwner: (parent, arg, ctx, info) => fbByOwner(parent, arg, ctx, info),
    fbByFbId: (parent, arg, ctx, info) => fbByFbId(parent, arg, ctx, info),
    fbByFbSlug: (parent, arg, ctx, info) => fbByFbSlug(parent, arg, ctx, info)
  }
}
