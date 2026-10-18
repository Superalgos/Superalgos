export interface NavItem {
  icon: string
  title: string
  to: string
}

export const navItems: NavItem[] = [
  { icon: 'mdi-home', title: 'Home', to: '/' },
  { icon: 'mdi-view-dashboard', title: 'Dashboard', to: '/dashboard' },
  { icon: 'mdi-chart-bar', title: 'Charts', to: '/charts' },
  { icon: 'mdi-chart-arc', title: 'Portfolio', to: '/portfolio' },
  { icon: 'mdi-account-group', title: 'Users', to: '/users' },
  { icon: 'mdi-robot', title: 'T-Bots', to: '/bots' },
  { icon: 'mdi-bank', title: 'exchange', to: '/todos' },
  { icon: 'mdi-account-network', title: 'Networks', to: '/networks' },
  { icon: 'mdi-walk', title: 'Follow', to: '/followers' },
]

export const userSettingsItem = {
  icon: 'mdi-account-cog',
  title: 'User settings',
}
