import Home from './HomePageView'
import Dashboard from './Tabs/dashboardTab'

export const createRoutes = (store) => ({
  path        : 'home',
  component   : Home,
  indexRoute  : Dashboard
})

export default createRoutes
