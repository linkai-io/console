import DashboardLayout from 'src/pages/Layout/DashboardLayout.vue';

// GeneralViews
import NotFound from 'src/pages/GeneralViews/NotFoundPage.vue';

// Charts
const Charts = () =>
  import(/* webpackChunkName: "dashboard" */ 'src/pages/Charts.vue');

// Components pages
const Buttons = () =>
  import(/* webpackChunkName: "components" */ 'src/pages/Components/Buttons.vue');
const GridSystem = () =>
  import(/* webpackChunkName: "components" */ 'src/pages/Components/GridSystem.vue');
const Panels = () =>
  import(/* webpackChunkName: "components" */ 'src/pages/Components/Panels.vue');
const SweetAlert = () =>
  import(/* webpackChunkName: "components" */ 'src/pages/Components/SweetAlert.vue');
const Notifications = () =>
  import(/* webpackChunkName: "components" */ 'src/pages/Components/Notifications.vue');
const Icons = () =>
  import(/* webpackChunkName: "components" */ 'src/pages/Components/Icons.vue');
const Typography = () =>
  import(/* webpackChunkName: "components" */ 'src/pages/Components/Typography.vue');

// Dashboard pages
const Dashboard = () =>
  import(/* webpackChunkName: "dashboard" */ 'src/pages/Dashboard/Dashboard.vue');
import Widgets from 'src/pages/Widgets.vue';

// Forms pages
const RegularForms = () => import('src/pages/Forms/RegularForms.vue');
const ExtendedForms = () => import('src/pages/Forms/ExtendedForms.vue');
const ValidationForms = () => import('src/pages/Forms/ValidationForms.vue');
const Wizard = () => import('src/pages/Forms/Wizard.vue');

// Pages
const User = () =>
  import(/* webpackChunkName: "pages" */ 'src/pages/Pages/UserProfile.vue');

// TableList pages
const RegularTables = () =>
  import(/* webpackChunkName: "tables" */ 'src/pages/Tables/RegularTables.vue');
const ExtendedTables = () =>
  import(/* webpackChunkName: "tables" */ 'src/pages/Tables/ExtendedTables.vue');
const PaginatedTables = () =>
  import(/* webpackChunkName: "tables" */ 'src/pages/Tables/PaginatedTables.vue');

// Hakken pages
const ScanGroup = () =>
  import(/* webpackChunkName: "pages" */ 'src/pages/Pages/ScanGroup.vue');

const NewScanGroup = () =>
  import(/* webpackChunkName: "pages" */ 'src/pages/Pages/NewScanGroup.vue');

const Addresses = () =>
  import(/* webpackChunkName: "pages" */ 'src/pages/Pages/Addresses.vue');

const UploadAddresses = () =>
  import(/* webpackChunkName: "pages" */ 'src/pages/Pages/Addresses/UploadAddresses.vue');

let componentsMenu = {
  path: '/components',
  component: DashboardLayout,
  redirect: '/components/buttons',
  name: 'Components',
  children: [
    {
      path: 'buttons',
      name: 'Buttons',
      components: { default: Buttons }
    },
    {
      path: 'grid-system',
      name: 'Grid System',
      components: { default: GridSystem }
    },
    {
      path: 'panels',
      name: 'Panels',
      components: { default: Panels }
    },
    {
      path: 'sweet-alert',
      name: 'Sweet Alert',
      components: { default: SweetAlert }
    },
    {
      path: 'notifications',
      name: 'Notifications',
      components: { default: Notifications }
    },
    {
      path: 'icons',
      name: 'Icons',
      components: { default: Icons }
    },
    {
      path: 'typography',
      name: 'Typography',
      components: { default: Typography }
    }
  ]
};
let formsMenu = {
  path: '/forms',
  component: DashboardLayout,
  redirect: '/forms/regular',
  name: 'Forms',
  children: [
    {
      path: 'regular',
      name: 'Regular Forms',
      components: { default: RegularForms }
    },
    {
      path: 'extended',
      name: 'Extended Forms',
      components: { default: ExtendedForms }
    },
    {
      path: 'validation',
      name: 'Validation Forms',
      components: { default: ValidationForms }
    },
    {
      path: 'wizard',
      name: 'Wizard',
      components: { default: Wizard }
    }
  ]
};

let tablesMenu = {
  path: '/table-list',
  component: DashboardLayout,
  redirect: '/table-list/regular',
  name: 'Tables',
  children: [
    {
      path: 'regular',
      name: 'Regular Tables',
      components: { default: RegularTables }
    },
    {
      path: 'extended',
      name: 'Extended Tables',
      components: { default: ExtendedTables }
    },
    {
      path: 'paginated',
      name: 'Paginated Tables',
      components: { default: PaginatedTables }
    }
  ]
};

let pagesMenu = {
  path: '/pages',
  component: DashboardLayout,
  name: 'Pages',
  redirect: '/pages/user',
  children: [
    {
      path: 'user',
      name: 'User Page',
      components: { default: User }
    },
    {
      path: 'groups',
      name: 'ScanGroups',
      components: { default: ScanGroup }
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
      path: 'addresses',
      name: 'Addresses',
      components: { default: Addresses }
    },
    {
      path: 'addresses/upload',
      name: 'Upload Addresses',
      components: { default: UploadAddresses }
    }
  ]
};

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
    name: 'Home'
  },
  componentsMenu,
  formsMenu,
  pagesMenu,
  tablesMenu,
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
        path: 'charts',
        name: 'Charts',
        components: { default: Charts }
      },
      {
        path: 'widgets',
        name: 'Widgets',
        components: { default: Widgets }
      }
    ]
  },
  { path: '*', component: NotFound }
];

export default routes;
