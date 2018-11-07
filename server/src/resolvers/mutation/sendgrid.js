import axios from 'axios'
import jwt from 'jsonwebtoken')

const API_KEY = process.env.SG_APIKEY

const dev = process.env.NODE_ENV === 'development' ? true : false
let origin = 'https://app.advancedalgos.net'
if (dev){
  origin = 'http://localhost:3100'
}

export default {
  async sendgrid_NewsletterSignup(parent, { token }, ctx, info) {
    
  },
  async sendgrid_NewsletterSignupVerify(parent, { email }, ctx, info){

  },
  async sendgrid_Contact(parent, { email, subject, message }, ctx, info) {
  },
}
