<template>
  <div>
    <card>
      <div class="card-header">
        <h5 class="card-category">Hakken</h5>
        <h3 class="card-title">Home</h3>
      </div>
      <collapse :multiple-active="false" :active-index="showHome">
        <collapse-item @activate="onClickShowHome">
          <div class="card-body mt-0">
            <h3>Getting Started</h3>
            <p>
              To get started with Hakken, you must create a
              <router-link to="/groups/new">new scan group</router-link>. Scan groups allow you to configure how a group of assets are to be analyzed.
              After creating a new scan group, you must upload a list of IP addresses, CIDR ranges or hostnames to have the analysis begin.
              You may pause your scan group at any time in the
              <router-link to="/groups/list">scan group list</router-link>&nbsp;page. During analysis, your
              <router-link to="/addresses">address and host list</router-link>&nbsp;will be automatically updated as new results come in.
            </p>
            <br>
            <h3>How It Works</h3>
            <p>
              Hakken is built around the concept of scan groups. Scan groups allow you to configure how a group of assets (hosts, ip addresses) will be analyzed. Once a scan group is started, the system will continuously load all known assets in batches.
              These batches will run through each analysis module, discovering more potential candidates. This cycle repeats until every asset has been analyzed at least once. After which the system will continuously scan known assets and determine if they should
              be run again, continuing the cycle.
            </p>
            <br>
            <p>Certain assets may not have all analysis modules run against them, in particular hosted services; AWS, Google Cloud Computing, Azure and more. This is due to the resolution phase which disregards domains such as aws.amazon.com.</p>
          </div>
        </collapse-item>
      </collapse>
    </card>
    <div id="loading_menu">
      <loading-main-panel v-bind:loading="isLoading"></loading-main-panel>
      <div v-if="hasGroups">
        <tabs
          type="primary"
          tabContentClasses="col-lg-12 col-md-12 d-flex"
          tabNavClasses
          square
          centered
          class="row"
          @change="handleChange"
        >
          <tab-pane
            v-for="group in this.groups"
            :key="group.group_id"
            :label="group.group_name"
            :id="group.group_id"
          >
            <div class="row">
              <!-- stat cards -->
              <div class="col-md-12 col-lg-6">
                <div class="row">
                  <div class="col-md-12">
                    <stats-card
                      subTitle="Certificates Expiring"
                      :title="certsExpiringTitle(group.group_id)"
                      type="danger"
                      icon="tim-icons icon-lock-circle"
                      :link="'/webdata/certificates/'+group.group_id"
                    >
                      <div slot="footer">
                        <div
                          v-if="certsExpiringTitle(group.group_id) === '0'"
                        >You have no certificates expiring in 30 days.</div>
                        <div v-else>
                          <base-button
                            type="primary"
                            class="btn-link"
                            @click="statsShow = 'certs'"
                          >Show certificates expiring in 30 days</base-button>
                        </div>
                      </div>
                    </stats-card>
                  </div>
                </div>
              </div>
              <div class="col-md-12 col-lg-6">
                <stats-card
                  subTitle="Notifications"
                  ref="events"
                  :title="eventCountByGroupID(group.group_id).toString()"
                  type="info"
                  icon="tim-icons icon-sound-wave"
                >
                  <div slot="footer">
                    <div v-if="!hasSubscriptions" class="row">
                      <p class="col-sm">You do not currently have any notifications enabled</p>
                    </div>
                    <div
                      v-if="eventCountByGroupID(group.group_id) === 0"
                    >You have no new events for this group.</div>
                    <div v-else>
                      <base-button
                        type="primary"
                        class="btn-link"
                        @click="statsShow = 'notifications'"
                      >Show notifications</base-button>
                    </div>
                  </div>
                </stats-card>
              </div>
            </div>
            <div class="row">
                <div v-if="statsShow == 'notifications'" class="col-lg-12 col-md-12 d-flex">
                  <event-notifications v-bind:group_id="group.group_id"></event-notifications>
                </div>
                <div v-else-if="statsShow === 'certs'" class="col-lg-12 col-md-12 d-flex">
                  <filtered-certificates-expiring
                    v-if="showExpiring(group.group_id)"
                    v-bind:group_id="group.group_id"
                    v-bind:expire_time="30"
                  ></filtered-certificates-expiring>
                </div>
            </div>
            <div class="row">
              <!-- tech stack card -->
              <div class="col-lg-12 col-md-12 d-flex">
                <tech-stack-card
                  v-bind:group_id="group.group_id"
                  v-bind:group_name="group.group_name"
                  :active="activeTabID === group.group_id"
                ></tech-stack-card>
              </div>
            </div>
          </tab-pane>
        </tabs>
      </div>
    </div>
  </div>
</template>
<script>
import StatsCard from 'src/components/Cards/StatsCard';
import EventNotifications from 'src/pages/Events/EventNotifications.vue';
import AssetChart from 'src/pages/Addresses/AssetChart.vue';
import DiscoveredByChart from 'src/pages/Addresses/DiscoveredByChart.vue';
import ServerTypeChart from 'src/pages/Web/ServerTypeChart.vue';
import DomainDependencyGraph from 'src/pages/Web/DomainDependencyGraph.vue';
import FilteredCertificatesExpiring from 'src/pages/Web/FilteredCertificatesExpiring.vue';
import TechStackCard from 'src/pages/Web/TechStackCard.vue';
import TechTable from 'src/pages/Web/TechTable.vue';
import LoadingMainPanel from 'src/pages/Layout/LoadingMainPanel.vue';

import { mapGetters } from 'vuex';
import { TabPane, Tabs, Collapse, CollapseItem } from 'src/components';
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

export default {
  components: {
    EventNotifications,
    DomainDependencyGraph,
    FilteredCertificatesExpiring,
    LoadingMainPanel,
    Tabs,
    TabPane,
    AssetChart,
    DiscoveredByChart,
    ServerTypeChart,
    StatsCard,
    TechStackCard,
    TechTable,
    Collapse,
    CollapseItem
  },
  data() {
    return {
      addressStatsLoaded: false,
      webStatsLoaded: false,
      showExpiringTable: false,
      statsShow: '',
      eventCount: 0,
      activeTab: 0
    };
  },
  computed: {
    ...mapGetters('event', [
      'events',
      'hasSubscriptions',
      'isLoadingSettings',
      'isLoadingEvents',
      'eventByGroupID',
      'eventCountByGroupID'
    ]),
    ...mapGetters('scangroup', ['groups']),
    ...mapGetters('settings', ['shouldShowHome']),
    ...mapGetters('addresses', [
      'isLoadingAddressStats',
      'totalConfident',
      'totalAssetsDay',
      'discoveredBy'
    ]),
    ...mapGetters('webdata', [
      'isLoadingWebDataStats',
      'totalCertsThirty',
      'totalCertsFifteen',
      'totalUniqueWebServers',
      'totalWebServerTypes',
      'uniqueWebServersByID',
      'certsThirtyByID',
      'webServerTypesByID',
      'webServerTypeCountsByID'
    ]),
    showHome() {
      return this.shouldShowHome;
    },
    hasGroups() {
      return Object.entries(this.groups).length !== 0;
    },
    activeTabID() {
      return this.activeTab;
    },
    isLoading() {
      return !(
        this.isLoadingWebDataStats === false &&
        this.isLoadingAddressStats === false &&
        this.isLoadingEvents === false
      );
    }
  },
  methods: {
    showExpiring(group_id) {
      let expiring = this.certsThirtyByID(group_id);
      if (expiring === null || expiring === undefined || expiring === 0) {
        return false;
      }
      return true;
    },
    certsExpiringTitle(group_id) {
      let expiring = this.certsThirtyByID(group_id);
      if (expiring === 0 || expiring === null || expiring === undefined) {
        return '0';
      }
      return expiring.toString();
    },
    onClickShowHome(val) {
      this.$store.dispatch('settings/UPDATE_SHOW_HOME', val);
    },
    handleChange(tabID) {
      this.activeTab = tabID;
    }
  },
  created() {},
  mounted() {
    initScrollbar('table-notifications');
    this.$store.dispatch('settings/INIT');
    this.$store.dispatch('addresses/LOAD_ADDRESS_STATS');
    this.$store.dispatch('webdata/LOAD_WEB_STATS');

    this.i18n = this.$i18n;
  },
  beforeDestroy() {}
};
</script>
<style scoped>
.el-loading-spinner .path {
  stroke: #f3c !important;
}

.el-loading-mask {
  background: transparent !important;
}
</style>
