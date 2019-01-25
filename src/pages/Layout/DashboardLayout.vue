<template>
  <div class="wrapper" :class="{ 'nav-open': $sidebar.showSidebar }">
    <notifications></notifications>
    <sidebar-fixed-toggle-button/>
    <side-bar
      :background-color="sidebarBackground"
      :short-title="$t('sidebar.shortTitle')"
      :title="$t('sidebar.title')"
    >
      <template slot-scope="props" slot="links">
        <sidebar-item
          :link="{
            name: $t('sidebar.dashboard'),
            icon: 'tim-icons icon-chart-pie-36',
            path: '/dashboard'
          }"
        ></sidebar-item>

        <sidebar-item
          :link="{ 
            name: $t('sidebar.groups'), 
            icon: 'tim-icons icon-single-copy-04',
            path: '/pages/groups' }"
        >
          <sidebar-item
            :link="{
                name: $t('sidebar.newgroup'),
                path: '/pages/groups/new' }"
          ></sidebar-item>

          <sidebar-item
            :link="{
                name: $t('sidebar.grouplist'),
                path: '/pages/groups/list' }"
          ></sidebar-item>
        </sidebar-item>

        <sidebar-item
          :link="{ 
            name: $t('sidebar.addresses'), 
            icon: 'tim-icons icon-vector',
            path: '/pages/addresses' }"
        >
          <sidebar-item
            v-for="group in groups"
            :key="group.group_id"
            :link="{
              name: group.group_name,
              path: '/pages/addresstable/'+group.group_id
              }"
          ></sidebar-item>
        </sidebar-item>
        <sidebar-item
          :link="{ 
            name: $t('sidebar.userProfile'), 
            icon: 'tim-icons icon-single-02',
            path: '/pages/user' }"
        ></sidebar-item>
        <sidebar-item
          :link="{
            name: $t('sidebar.components'),
            icon: 'tim-icons icon-molecule-40',
            path: '/components/icons' }"
        ></sidebar-item>
      </template>
    </side-bar>
    <div class="main-panel" :data="sidebarBackground">
      <dashboard-navbar></dashboard-navbar>
      <router-view name="header"></router-view>

      <div :class="{ content: !$route.meta.hideContent }" @click="toggleSidebar">
        <zoom-center-transition :duration="200" mode="out-in">
          <!-- your content here -->
          <router-view></router-view>
        </zoom-center-transition>
      </div>
      <content-footer v-if="!$route.meta.hideFooter"></content-footer>
    </div>
  </div>
</template>
<script>
/* eslint-disable no-new */
import PerfectScrollbar from 'perfect-scrollbar';
import 'perfect-scrollbar/css/perfect-scrollbar.css';

function hasElement(className) {
  return document.getElementsByClassName(className).length > 0;
}

function initScrollbar(className) {
  console.log('initScrollbar: ' + className);
  if (hasElement(className)) {
    console.log('initing: ' + className);
    new PerfectScrollbar(`.${className}`);
  } else {
    if (className === undefined) {
      return;
    }
    // try to init it later in case this component is loaded async
    setTimeout(() => {
      console.log('initing later: ' + className);
      initScrollbar(className);
    }, 100);
  }
}

import DashboardNavbar from './DashboardNavbar.vue';
import ContentFooter from './ContentFooter.vue';
import DashboardContent from './Content.vue';
import SidebarFixedToggleButton from './SidebarFixedToggleButton.vue';
import { SlideYDownTransition, ZoomCenterTransition } from 'vue2-transitions';
import { mapGetters, mapState } from 'vuex';

export default {
  components: {
    DashboardNavbar,
    ContentFooter,
    SidebarFixedToggleButton,
    DashboardContent,
    SlideYDownTransition,
    ZoomCenterTransition
  },
  data() {
    return {
      sidebarBackground: 'black' //vue|blue|orange|green|red|primary
    };
  },
  computed: {
    ...mapState('notify', ['notifyMsg', 'notifyMsgType']),
    ...mapGetters('notify', ['getMsg', 'getMsgType']),
    ...mapGetters('scangroup', ['groups'])
  },
  methods: {
    toggleSidebar() {
      if (this.$sidebar.showSidebar) {
        this.$sidebar.displaySidebar(true);
      }
    },
    initScrollbar() {
      let docClasses = document.body.classList;
      let isWindows = navigator.platform.startsWith('Win');
      console.log('init scrollbar');
      if (isWindows) {
        // if we are on windows OS we activate the perfectScrollbar function
        initScrollbar('sidebar');
        initScrollbar('sidebar-wrapper');

        docClasses.add('perfect-scrollbar-on');
      } else {
        console.log('perfect-scrollbar-off called');
        docClasses.add('perfect-scrollbar-off');
      }
    }
  },
  created() {
    this.$store.dispatch('scangroup/GET_GROUPS');
  },
  mounted() {
    initScrollbar('sidebar-wrapper');

    this.$watch('getMsg', msg => {
      console.log('notify watch updated');
      if (msg === '') {
        return;
      }

      this.$notify({
        message: msg,
        timeout: 4000,
        icon: 'tim-icons icon-bell-55',
        horizontalAlign: 'center',
        verticalAlign: 'top',
        type: this.getMsgType
      });
    });
  }
};
</script>
<style lang="scss">
$scaleSize: 0.95;
@keyframes zoomIn95 {
  from {
    opacity: 0;
    transform: scale3d($scaleSize, $scaleSize, $scaleSize);
  }
  to {
    opacity: 1;
  }
}

.main-panel .zoomIn {
  animation-name: zoomIn95;
}

@keyframes zoomOut95 {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    transform: scale3d($scaleSize, $scaleSize, $scaleSize);
  }
}

.main-panel .zoomOut {
  animation-name: zoomOut95;
}
</style>
