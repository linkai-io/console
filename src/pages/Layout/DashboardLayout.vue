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
            name: $t('sidebar.settings'), 
            icon: 'tim-icons icon-settings',
            path: '/settings' }"
        ></sidebar-item>

        <sidebar-item
          :link="{ 
            name: $t('sidebar.groups'), 
            icon: 'tim-icons icon-single-copy-04',
            path: '/groups' }"
        >
          <sidebar-item
            :link="{
                name: $t('sidebar.newgroup'),
                path: '/groups/new' }"
          ></sidebar-item>

          <sidebar-item
            :link="{
                name: $t('sidebar.grouplist'),
                path: '/groups/list' }"
          ></sidebar-item>
        </sidebar-item>

        <sidebar-item
          :link="{ 
            name: $t('sidebar.addresses'), 
            icon: 'tim-icons icon-vector',
            path: '/addresses' }"
        ></sidebar-item>
        <sidebar-item
          :link="{
            name: $t('sidebar.web'),
            icon: 'tim-icons icon-globe-2',
            path: '/webdata' }"
        ></sidebar-item>
        <sidebar-item
          @click.native="feedBack"
          :defer="true"
          :link="{
            name: $t('sidebar.feedback'),
            icon: 'tim-icons icon-send',
            path: '#feedback'
           }"
        ></sidebar-item>

        <sidebar-item
          @click.native="logout"
          :link="{ 
            name: $t('sidebar.logout'), 
            icon: 'tim-icons icon-lock-circle',
            path: '#logout' }"
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
  if (hasElement(className)) {
    new PerfectScrollbar(`.${className}`);
  } else {
    if (className === undefined) {
      return;
    }
    // try to init it later in case this component is loaded async
    setTimeout(() => {
      initScrollbar(className);
    }, 100);
  }
}

import DashboardNavbar from './DashboardNavbar.vue';
import API from '../../api/api.js';
import swal from 'sweetalert2';
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
    ...mapGetters('notify', ['getMsg', 'getMsgType', 'getMsgTimeout']),
    ...mapGetters('scangroup', ['groups', 'groupStats'])
  },
  methods: {
    logout() {
      API.get('/user/logout').then(
        resp => {
          window.location = '/login/';
        },
        err => {
          window.location = '/login/';
        }
      );
    },
    feedBack() {
      swal({
        title: 'Send Feedback or Report a Bug',
        html:
          '<select id="swal-input1" class="swal2-select">' +
          '<option value="feedback">Feedback</option>' +
          '<option value="bug">Bug</option>' +
          '<option value="feature">Feature Request</option>' +
          '</select>' +
          '<textarea id="swal-input2" placeholder="Type your response here..." class="swal2-textarea"></textarea>' +
          '<div>By clicking OK you agree to have your browser type, screen size, and current URL location sent to us.</div>',

        showCancelButton: true,
        preConfirm: () => {
          return [
            document.getElementById('swal-input1').value,
            document.getElementById('swal-input2').value
          ];
        }
      }).then(val => {
        if (val.dismiss !== undefined) {
          return;
        }

        let w = Math.max(
          document.documentElement.clientWidth,
          window.innerWidth || 0
        );
        let h = Math.max(
          document.documentElement.clientHeight,
          window.innerHeight || 0
        );
        let screen = w + 'x' + h + ' - ' + navigator.userAgent;
        API.post('/user/feedback', {
          type: val.value[0],
          message: val.value[1],
          location: document.location.toString(),
          screen: screen
        }).then(
          resp => {
            if (resp.data.status === 'OK') {
              this.$store.dispatch(
                'notify/CREATE_NOTIFY_MSG',
                {
                  msg: 'Thank you for your feedback!',
                  msgType: 'success'
                },
                { root: true }
              );
            } else {
              this.$store.dispatch(
                'notify/CREATE_NOTIFY_MSG',
                {
                  msg: 'Unable to process feedback',
                  msgType: 'danger'
                },
                { root: true }
              );
            }
          },
          err => {
            if (err.response !== undefined && err.response.data !== undefined) {
              this.$store.dispatch(
                'notify/CREATE_NOTIFY_MSG',
                {
                  msg: 'Failed to process feedback: ' + err.response.data.msg,
                  msgType: 'danger'
                },
                { root: true }
              );
            } else {
              this.$store.dispatch(
                'notify/CREATE_NOTIFY_MSG',
                {
                  msg: 'Server error processing feedback',
                  msgType: 'danger'
                },
                { root: true }
              );
            }
          }
        );
      });
    },
    toggleSidebar() {
      if (this.$sidebar.showSidebar) {
        this.$sidebar.displaySidebar(true);
      }
    },
    initScrollbar() {
      let docClasses = document.body.classList;
      let isWindows = navigator.platform.startsWith('Win');
      if (isWindows) {
        // if we are on windows OS we activate the perfectScrollbar function
        initScrollbar('sidebar');
        initScrollbar('sidebar-wrapper');

        docClasses.add('perfect-scrollbar-on');
      } else {
        docClasses.add('perfect-scrollbar-off');
      }
    }
  },
  created() {
    
  },
  mounted() {
    this.$store.dispatch('scangroup/GET_GROUPS');
    this.$store.dispatch('scangroup/GET_GROUP_STATS');
    this.$store.dispatch('event/GET_EVENTS');
    initScrollbar('sidebar-wrapper');

    this.$watch('getMsg', msg => {
      if (msg === '') {
        return;
      }

      this.$notify({
        message: msg,
        timeout: this.getMsgTimeout,
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
