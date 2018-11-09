import axios from 'axios'
import jwt from 'jsonwebtoken')

const API_KEY = process.env.SG_APIKEY

const dev = process.env.NODE_ENV === 'development' ? true : false
let origin = 'https://app.advancedalgos.net'
if (dev){
  origin = 'http://localhost:3100'
}

export default {
  async sgSendNewsletterVerify(parent, { email }, ctx, info){

  },
  async sgNewsletterSignup(parent, { token }, ctx, info) {
  },

  async sgContact(parent, { email, subject, message }, ctx, info) {
  },
}
