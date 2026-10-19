export interface NavItem {
  icon: string
  title: string
  path: string
}

export const navItems: NavItem[] = [
  { icon: 'mdi-home', title: 'Home', path: 'home' },
  { icon: 'mdi-view-dashboard', title: 'Dashboard', path: 'dashboard' },
  { icon: 'mdi-chart-bar', title: 'Charts', path: 'charts' },
  { icon: 'mdi-chart-arc', title: 'Portfolio', path: 'portfolio' },
  { icon: 'mdi-account-group', title: 'Users', path: 'users' },
  { icon: 'mdi-robot', title: 'T-Bots', path: 'bots' },
  { icon: 'mdi-bank', title: 'exchange', path: 'todos' },
  { icon: 'mdi-account-network', title: 'Networks', path: 'networks' },
  { icon: 'mdi-walk', title: 'Follow', path: 'followers' },
]

export const userSettingsItem = {
  icon: 'mdi-account-cog',
  title: 'User settings',
}
