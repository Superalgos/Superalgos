import Corporate from './sendgrid/corporate'
import Master from './sendgrid/master'
import Teams from './sendgrid/teams'

export const resolvers = {
  Mutation: {
    Corporate_NewsletterSignup: (parent, arg, ctx, info) => Corporate.Corporate_NewsletterSignup(parent, arg, ctx, info),
    Corporate_NewsletterSignupVerify: (parent, arg, ctx, info) => Corporate.Corporate_NewsletterSignupVerify(parent, arg, ctx, info),
    Corporate_Contact: (parent, arg, ctx, info) => Corporate.Corporate_Contact(parent, arg, ctx, info),
    Master_NewsletterSignup: (parent, arg, ctx, info) => Master.Master_NewsletterSignup(parent, arg, ctx, info),
    Master_NewsletterSignupVerify: (parent, arg, ctx, info) => Master.Master_NewsletterSignupVerify(parent, arg, ctx, info),
    Master_Feedback: (parent, arg, ctx, info) => Master.Master_Feedback(parent, arg, ctx, info),
    Teams_SendTeamMemberInvite: (parent, arg, ctx, info) => Teams.Teams_SendTeamMemberInvite(parent, arg, ctx, info),
    Teams_VerifyTeamMemberInviteToken: (parent, arg, ctx, info) => Teams.Teams_VerifyTeamMemberInviteToken(parent, arg, ctx, info),
    Teams_SendTeamCreateConfirmation: (parent, arg, ctx, info) => Teams.Teams_SendTeamCreateConfirmation(parent, arg, ctx, info)
  }
}
