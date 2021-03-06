import DashboardLayout from 'src/pages/Layout/DashboardLayout.vue';

// GeneralViews
import NotFound from 'src/pages/GeneralViews/NotFoundPage.vue';

// Dashboard pages
const Dashboard = () =>
  import(
    /* webpackChunkName: "dashboard" */ 'src/pages/Dashboard/Dashboard.vue'
  );

// Pages
const User = () =>
  import(/* webpackChunkName: "pages" */ 'src/pages/UserProfile.vue');

const Agreement = () =>
  import(/* webpackChunkName: "pages" */ 'src/pages/UserProfile/Agreement.vue');

// Hakken pages
const ScanGroup = () =>
  import(/* webpackChunkName: "pages" */ 'src/pages/ScanGroup.vue');

const NewScanGroup = () =>
  import(/* webpackChunkName: "pages" */ 'src/pages/NewScanGroup.vue');

const Addresses = () =>
  import(/* webpackChunkName: "pages" */ 'src/pages/Addresses.vue');

const PortsTable = () =>
  import(/* webpackChunkName: "pages" */ 'src/pages/Addresses/PortsTable.vue');

const AddressTable = () =>
  import(
    /* webpackChunkName: "pages" */ 'src/pages/Addresses/AddressTable.vue'
  );

const HostsTable = () =>
  import(/* webpackChunkName: "pages" */ 'src/pages/Addresses/HostsTable.vue');

const Web = () => import(/* webpackChunkName: "pages" */ 'src/pages/Web.vue');

const SnapshotTable = () =>
  import(/* webpackChunkName: "pages" */ 'src/pages/Web/SnapshotTable.vue');

const ResponseTable = () =>
  import(/* webpackChunkName: "pages" */ 'src/pages/Web/ResponseTable.vue');

const URLListTable = () =>
  import(/* webpackChunkName: "pages" */ 'src/pages/Web/URLListTable.vue');

const CertificateTable = () =>
  import(/* webpackChunkName: "pages" */ 'src/pages/Web/CertificateTable.vue');

const Settings = () =>
  import(/* webpackChunkName: "pages" */ 'src/pages/Events/EventSettings.vue');

const Webhooks = () =>
  import(/* webpackChunkName: "pages" */ 'src/pages/Events/EventWebhooks.vue');

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
        path: 'settings',
        name: 'Settings',
        components: { default: Settings }
      },
      {
        path: 'webhooks',
        name: 'Webhooks',
        components: { default: Webhooks }
      },
      {
        path: 'user',
        name: 'User Page',
        components: { default: User }
      },
      {
        path: 'agreement',
        name: 'Beta User Agreement',
        components: { default: Agreement }
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
        path: 'addresses',
        name: 'Addresses',
        components: { default: Addresses },
        props: { default: true }
      },
      {
        path: 'addresstable/:group_id',
        name: 'Address Data',
        components: { default: AddressTable },
        props: { default: true }
      },
      {
        path: 'portstable/:group_id',
        name: 'Port Scan Data',
        components: { default: PortsTable },
        props: { default: true }
      },
      {
        path: 'hoststable/:group_id',
        name: 'Host List Data',
        components: { default: HostsTable },
        props: { default: true }
      },
      {
        path: 'webdata',
        name: 'Web Results',
        components: { default: Web },
        props: { default: true }
      },
      {
        path: 'webdata/sites/:group_id',
        name: 'Web Sites',
        components: { default: SnapshotTable },
        props: { default: true }
      },
      {
        path: 'webdata/responses/:group_id',
        name: 'Web Responses',
        components: { default: ResponseTable },
        props: { default: true }
      },
      {
        path: 'webdata/urls/:group_id',
        name: 'URL List',
        components: { default: URLListTable },
        props: { default: true }
      },
      {
        path: 'webdata/certificates/:group_id',
        name: 'Web Certificates',
        components: { default: CertificateTable },
        props: { default: true }
      }
    ]
  },
  { path: '*', component: NotFound }
];

export default routes;
