import React, { Component } from 'react'
import { Route, BrowserRouter, Switch } from 'react-router-dom'

import App from '@advancedalgos/teams-client'
import App2 from '@advancedalgos/key-vault-client'

export const Master = () => (
  <BrowserRouter>
    <Switch>
      <Route exact path='/' component={App} />
      <Route exact path='/key-vault' component={App2} />
    </Switch>
  </BrowserRouter>
)

export const Temporary = () =>(
  <div>Hello Advanced Alogs!</div>
)

export default Master
