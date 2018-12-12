import { Corporate_NewsletterSignup, Corporate_NewsletterSignupVerify, Corporate_Contact } from './sendgrid/corporate'
import { Master_NewsletterSignup, Master_NewsletterSignupVerify, Master_Feedback } from './sendgrid/master'
import { Teams_SendTeamMemberInvite, Teams_VerifyTeamMemberInviteToken, Teams_SendTeamCreateConfirmation } from './sendgrid/teams'

export const resolvers = {
  Mutation: {
    Corporate_NewsletterSignup: (parent, arg, ctx, info) => Corporate_NewsletterSignup(parent, arg, ctx, info),
    Corporate_NewsletterSignupVerify: (parent, arg, ctx, info) => Corporate_NewsletterSignupVerify(parent, arg, ctx, info),
    Corporate_Contact: (parent, arg, ctx, info) => Corporate_Contact(parent, arg, ctx, info),
    Master_NewsletterSignup: (parent, arg, ctx, info) => Master_NewsletterSignup(parent, arg, ctx, info),
    Master_NewsletterSignupVerify: (parent, arg, ctx, info) => Master_NewsletterSignupVerify(parent, arg, ctx, info),
    Master_Feedback: (parent, arg, ctx, info) => Master_Feedback(parent, arg, ctx, info),
    Teams_SendTeamMemberInvite: (parent, arg, ctx, info) => Teams_SendTeamMemberInvite(parent, arg, ctx, info),
    Teams_VerifyTeamMemberInviteToken: (parent, arg, ctx, info) => Teams_VerifyTeamMemberInviteToken(parent, arg, ctx, info),
    Teams_SendTeamCreateConfirmation: (parent, arg, ctx, info) => Teams_SendTeamCreateConfirmation(parent, arg, ctx, info)
  }
}
