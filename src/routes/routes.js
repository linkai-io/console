import DashboardLayout from 'src/pages/Layout/DashboardLayout.vue';

// GeneralViews
import NotFound from 'src/pages/GeneralViews/NotFoundPage.vue';

// Dashboard pages
const Dashboard = () =>
  import(/* webpackChunkName: "dashboard" */ 'src/pages/Dashboard/Dashboard.vue');

// Pages
const User = () =>
  import(/* webpackChunkName: "pages" */ 'src/pages/UserProfile.vue');

// Hakken pages
const ScanGroup = () =>
  import(/* webpackChunkName: "pages" */ 'src/pages/ScanGroup.vue');

const NewScanGroup = () =>
  import(/* webpackChunkName: "pages" */ 'src/pages/NewScanGroup.vue');

const AddressTable = () =>
  import(/* webpackChunkName: "pages" */ 'src/pages/AddressTable.vue');

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
    name: 'Home'
  },
  {
    path: '/',
    component: DashboardLayout,
    redirect: '/dashboard',
    name: 'Dashboard layout',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        components: { default: Dashboard }
      },
      {
        path: 'user',
        name: 'User Page',
        components: { default: User }
      },
      {
        path: 'groups',
        name: 'ScanGroups',
        components: { default: NewScanGroup }
      },
      {
        path: 'groups/list',
        name: 'Scan Groups',
        components: { default: ScanGroup }
      },
      {
        path: 'groups/new',
        name: 'New Scan Group',
        components: { default: NewScanGroup }
      },
      {
        path: 'addresstable/:group_id',
        name: 'Addresses',
        components: { default: AddressTable },
        props: { default: true }
      }
    ]
  },
  { path: '*', component: NotFound }
];

export default routes;
