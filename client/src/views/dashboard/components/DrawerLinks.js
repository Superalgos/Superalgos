import React from 'react'
import { Link } from 'react-router-dom'

import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import GroupIcon from '@material-ui/icons/Group'
import DashboardIcon from '@material-ui/icons/Dashboard'
import SettingsIcon from '@material-ui/icons/Settings'
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle'
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks'
import SentimentSatisfiedAltIcon from '@material-ui/icons/SentimentSatisfiedAlt'
import AndroidIcon from '@material-ui/icons/Android'

const DashboardLink = props => <Link to='/dashboard' {...props} />
const TeamsLink = props => <Link to='/manage-teams' {...props} />
const MembersLink = props => <Link to='/team-members' {...props} />
const SettingsLink = props => <Link to='/settings' {...props} />
<<<<<<< HEAD
const DocumentationLink = props => <a href='https://advancedalgos.net/documentation-quick-start.shtml' target='_blank' {...props} />
const SupportLink = props => <a href='https://t.me/advancedalgoscommunity' target='_blank' {...props} />
=======
const FBLink = props => <Link to='/financial-beings' {...props} />
const DocumentationLink = props => (
  <a
    href='https://advancedalgos.net/documentation-quick-start.shtml'
    target='_blank'
    {...props}
  />
)
const SupportLink = props => (
  <a href='https://t.me/advancedalgoscommunity' target='_blank' {...props} />
)
>>>>>>> feature/client-refactor-react

export const MainDrawerItems = (
  <div>
    <ListItem button component={DashboardLink}>
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary='Dashboard' />
    </ListItem>
    <ListItem button component={TeamsLink}>
      <ListItemIcon>
        <GroupIcon />
      </ListItemIcon>
      <ListItemText primary='Teams' />
    </ListItem>
    <ListItem button component={MembersLink}>
      <ListItemIcon>
        <SupervisedUserCircleIcon />
      </ListItemIcon>
      <ListItemText primary='Team Members' />
    </ListItem>
    <ListItem button component={FBLink}>
      <ListItemIcon>
        <AndroidIcon />
      </ListItemIcon>
      <ListItemText primary='Financial Beings' />
    </ListItem>
    <ListItem button component={SettingsLink}>
      <ListItemIcon>
        <SettingsIcon />
      </ListItemIcon>
      <ListItemText primary='Settings' />
    </ListItem>
  </div>
)

export const SecondaryDrawerItems = (
  <div>
    <ListItem button component={DocumentationLink}>
      <ListItemIcon>
        <LibraryBooksIcon />
      </ListItemIcon>
      <ListItemText primary='Documentation' />
    </ListItem>
    <ListItem button component={SupportLink}>
      <ListItemIcon>
        <SentimentSatisfiedAltIcon />
      </ListItemIcon>
      <ListItemText primary='Support' />
    </ListItem>
  </div>
)

export default MainDrawerItems
