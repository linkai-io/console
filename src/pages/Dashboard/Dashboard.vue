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

    <!-- stat cards -->
    <div class="row">
      <div class="col-lg-3 col-md-3 d-flex">
        <stats-card
          subTitle="Unique Web Servers"
          :title="totalUniqueWebServers.toString()"
          class="results-card"
          type="info"
          icon="tim-icons icon-globe-2"
        >
          <div slot="footer">Unique web servers found on host, IP, and port combinations</div>
        </stats-card>
      </div>

      <div class="col-lg-3 col-md-3 d-flex">
        <stats-card
          subTitle="Certificates"
          :title="totalCertsThirty.toString()"
          class="results-card"
          type="danger"
          icon="tim-icons icon-lock-circle"
        >
          <div slot="footer">Certificates expiring in 30 days</div>
        </stats-card>
      </div>

      <div class="col-lg-3 col-md-3 d-flex">
        <stats-card
          subTitle="Assets"
          :title="totalConfident.toString()"
          class="results-card"
          type="info"
          icon="tim-icons icon-shape-star"
        >
          <div slot="footer">Total assets found with 100% confidence</div>
        </stats-card>
      </div>

      <div class="col-lg-3 col-md-3 d-flex">
        <stats-card
          subTitle="Discovered in last 24h"
          :title="totalAssetsDay.toString()"
          class="results-card"
          type="warning"
          icon="tim-icons icon-vector"
        >
          <div slot="footer">Total assets discovered in the last 24 hours</div>
        </stats-card>
      </div>
    </div>
    <!-- notifications table -->
    <div class="row">
      <div class="col-lg-12 col-md-12 d-flex">
        <card type="notifications" :header-classes="'text-right'">
          <template slot="header">
            <h6 class="title d-inline">Notifications ({{events.length}})</h6>
            <p class="card-category d-inline"></p>
            <base-dropdown
              menu-on-right
              tag="div"
              title-classes="btn btn-link btn-icon"
              class="float-right"
            >
              <i slot="title" class="tim-icons icon-settings-gear-63"></i>

              <a class="dropdown-item" @click="sendOnlyMarkedRead">Mark selected as read</a>
              <a class="dropdown-item" @click="sendAllRead">Mark all as read</a>
              <a class="dropdown-item" @click="configureNotifications">Configure notifications</a>
            </base-dropdown>
          </template>
          <div v-if="!hasSubscriptions" class="row">
            <p class="col-sm">You do not currently have any notifications enabled</p>
          </div>
          <div class="table-full-width table-responsive table-notifications">
            <event-notifications></event-notifications>
          </div>
        </card>
      </div>
    </div>

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
          <asset-chart v-bind:group_id="group.group_id" v-bind:group_name="group.group_name" :active="activeTabID === group.group_id"></asset-chart>
          <div class="row">
            <div class="col-md-6 mr-auto">
              <discovered-by-chart v-bind:group_id="group.group_id" :active="activeTabID === group.group_id"></discovered-by-chart>
            </div>
            <div class="col-md-6 mr-auto">
              <server-type-chart v-bind:group_id="group.group_id" :active="activeTabID === group.group_id"></server-type-chart>
            </div>
            
            <!-- domain dependencies graph -->
            <div class="col-lg-12 col-md-12 d-flex">
              <domain-dependency-graph v-bind:group_id="group.group_id" :active="activeTabID === group.group_id"></domain-dependency-graph>
            </div>
              <!-- tech data table -->
            <div class="col-lg-12 col-md-12 d-flex">
              <card type="notifications">
                <template slot="header">
                  <h6 class="title d-inline">Technology Data (Last 7 Days)</h6>
                  <p class="card-category d-inline"></p>
                </template>
                <div>
                  <tech-table v-bind:group_id="group.group_id"></tech-table>
                </div>
              </card>
            </div>
            
          </div>
        </tab-pane>
      </tabs>
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
import TechTable from 'src/pages/Web/TechTable.vue';

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
    Tabs,
    TabPane,
    AssetChart,
    DiscoveredByChart,
    ServerTypeChart,
    StatsCard,
    TechTable,
    Collapse,
    CollapseItem
  },
  data() {
    return {
      addressStatsLoaded: false,
      webStatsLoaded: false,
      activeTab: 0,
    };
  },
  computed: {
    ...mapGetters('event', ['events', 'hasSubscriptions']),
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
      'totalWebServerTypes'
    ]),
    showHome() {
      return this.shouldShowHome;
    },
    hasGroups() {
      return Object.entries(this.groups).length !== 0;
    },
    activeTabID() {
      return this.activeTab;
    }
  },
  methods: {
    sendAllRead() {
      this.$store.dispatch('event/MARK_READ', 'all');
    },
    sendOnlyMarkedRead() {
      this.$store.dispatch('event/MARK_READ');
    },
    onClickShowHome(val) {
      this.$store.dispatch('settings/UPDATE_SHOW_HOME', val);
    },
    configureNotifications() {
      this.$router.push('/settings');
    },
    handleChange(tabID) {
      this.activeTab = tabID;
      console.log(this.activeTab);
    }
  },
  created() {
  },
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
<style>
</style>
