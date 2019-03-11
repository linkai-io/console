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

    <div class="row">
      <div class="col-12">
        <card type="chart">
          <template slot="header">
            <div class="row">
              <div class="col-sm-6 text-left">
                <h5 class="card-category">3 hour increments</h5>
                <h2 class="card-title">Assets Over Time</h2>
              </div>
              <div class="col-sm-6">
                <div class="btn-group btn-group-toggle float-right" data-toggle="buttons">
                  <label
                    v-for="(option, index) in bigLineChartCategories"
                    :key="option"
                    class="btn btn-sm btn-primary btn-simple"
                    :class="{ active: bigLineChart.activeIndex === index }"
                    :id="index"
                  >
                    <input
                      type="radio"
                      @click="initBigChart(index);"
                      name="options"
                      autocomplete="off"
                      :checked="bigLineChart.activeIndex === index"
                    >
                    {{ option }}
                  </label>
                </div>
              </div>
            </div>
          </template>
          <div class="chart-area">
            <line-chart
              style="height: 100%"
              ref="bigChart"
              :chart-data="bigLineChart.chartData"
              :gradient-colors="bigLineChart.gradientColors"
              :gradient-stops="bigLineChart.gradientStops"
              :extra-options="bigLineChart.extraOptions"
            ></line-chart>
          </div>
        </card>
      </div>
    </div>

    <div class="row">
      <div class="col-md-6 mr-auto">
        <card class="card-chart" no-footer-line>
          <template slot="header">
            <h5 class="card-category"></h5>
            <h3 class="card-title">
              <i class="tim-icons icon-bulb-63 text-info"></i> Discovery Method
            </h3>
          </template>
          <div class="chart-area">
            <bar-chart
              ref="discoChart"
              style="height: 100%"
              :chart-data="discoveredByChart.chartData"
              :gradient-stops="discoveredByChart.gradientStops"
              :extra-options="discoveredByChart.extraOptions"
            ></bar-chart>
          </div>
        </card>
      </div>

      <div class="col-md-6 ml-auto">
        <card class="card-chart" no-footer-line>
          <template slot="header">
            <h5 class="card-category"></h5>
            <h3 class="card-title">
              <i class="tim-icons icon-tv-2 text-warning"></i> Server Types
            </h3>
          </template>
          <div class="chart-area">
            <bar-chart
              ref="serverChart"
              style="height: 100%"
              :chart-data="serverTypeChart.chartData"
              :gradient-colors="serverTypeChart.gradientColors"
              :gradient-stops="serverTypeChart.gradientStops"
              :extra-options="serverTypeChart.extraOptions"
            ></bar-chart>
          </div>
        </card>
      </div>
    </div>
  </div>
</template>
<script>
import LineChart from '@/components/Charts/LineChart';
import BarChart from '@/components/Charts/BarChart';
import PieChart from 'src/components/Charts/PieChart';
import * as chartConfigs from '@/components/Charts/config';
import StatsCard from 'src/components/Cards/StatsCard';
import { mapGetters } from 'vuex';
import { Collapse, CollapseItem } from 'src/components';
import config from '@/config';

export default {
  components: {
    LineChart,
    BarChart,
    PieChart,
    StatsCard,
    Collapse,
    CollapseItem
  },
  data() {
    return {
      addressStatsLoaded: false,
      webStatsLoaded: false,
      bigLineChart: {
        allData: [],
        activeIndex: 0,
        chartData: null,
        extraOptions: chartConfigs.purpleChartOptions,
        gradientColors: config.colors.purpleGradient,
        gradientStops: [1, 0.4, 0],
        categories: []
      },
      discoveredByChart: {
        extraOptions: chartConfigs.barChartOptions,
        chartData: {
          labels: [''],
          datasets: [
            {
              label: 'Count',
              fill: true,
              borderColor: config.colors.info,
              borderWidth: 2,
              borderDash: [],
              borderDashOffset: 0.0,
              data: [0]
            }
          ]
        },
        gradientColors: config.colors.primaryGradient,
        gradientStops: [1, 0.4, 0]
      },
      serverTypeChart: {
        extraOptions: chartConfigs.serverBarChartOptions,
        chartData: {
          labels: [''],
          datasets: [
            {
              label: 'Count',
              fill: true,
              borderColor: config.colors.orange,
              borderWidth: 2,
              borderDash: [],
              borderDashOffset: 0.0,
              data: [0]
            }
          ]
        },
        gradientColors: config.colors.orangeGradient,
        gradientStops: [1, 0.4, 0]
      }
    };
  },
  computed: {
    ...mapGetters('settings', ['shouldShowHome']),
    ...mapGetters('addresses', [
      'isLoadingAddressStats',
      'totalConfident',
      'totalTrihourlyDiscovered',
      'totalTrihourlySeen',
      'totalTrihourlyScanned',
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
    bigLineChartCategories() {
      return ['Discovered', 'Seen', 'Scanned'];
    },
    discoveredData() {
      if (this.totalTrihourlyDiscovered === undefined) {
        return [];
      }
      return this.totalTrihourlyDiscovered[1];
    },
    seenData() {
      if (this.totalTrihourlySeen.length === undefined) {
        return [];
      }
      return this.totalTrihourlySeen[1];
    },
    scannedData() {
      if (this.totalTrihourlyScanned.length === undefined) {
        return [];
      }
      return this.totalTrihourlyScanned[1];
    },
    discoveredByTypes() {
      if (this.discoveredBy === undefined) {
        return [];
      }
      return this.discoveredBy[0].map(v => v.replace(/_/g, ' '));
    },
    discoveredByValues() {
      if (this.discoveredBy === undefined) {
        return [];
      }
      return this.discoveredBy[1];
    },
    serverTypes() {
      if (this.totalWebServerTypes === undefined) {
        return [];
      }
      let len = this.totalWebServerTypes[0].length;
      return len > 10
        ? this.totalWebServerTypes[0].splice(10, len)
        : this.totalWebServerTypes[0];
    },
    serverCounts() {
      if (this.totalWebServerTypes === undefined) {
        return [];
      }
      let len = this.totalWebServerTypes[1].length;
      return len > 10
        ? this.totalWebServerTypes[1].splice(10, len)
        : this.totalWebServerTypes[1];
    }
  },
  methods: {
    onClickShowHome(val) {
      this.$store.dispatch('settings/UPDATE_SHOW_HOME', val);
    },
    initDiscoveryChart() {
      let chartData = {
        labels: this.discoveredByTypes,
        datasets: [
          {
            label: 'Count',
            fill: true,
            borderColor: config.colors.info,
            borderWidth: 2,
            borderDash: [],
            borderDashOffset: 0.0,
            data: this.discoveredByValues
          }
        ]
      };
      this.$refs.discoChart.updateGradients(chartData);
      this.discoveredByChart.chartData = chartData;
    },
    initServerTypeChart() {
      let chartData = {
        labels: this.serverTypes,
        datasets: [
          {
            label: 'Count',
            fill: true,
            borderColor: config.colors.orange,
            borderWidth: 2,
            borderDash: [],
            borderDashOffset: 0.0,
            data: this.serverCounts
          }
        ]
      };
      this.$refs.serverChart.updateGradients(chartData);
      this.serverTypeChart.chartData = chartData;
    },
    initBigChart(index) {
      this.bigLineChart.allData = [
        this.discoveredData,
        this.seenData,
        this.scannedData
      ];
      var labels = [
        this.totalTrihourlyDiscovered[0],
        this.totalTrihourlySeen[0],
        this.totalTrihourlyScanned[0]
      ];

      let chartData = {
        datasets: [
          {
            fill: true,
            borderColor: config.colors.chart,
            borderWidth: 2,
            borderDash: [],
            borderDashOffset: 0.0,
            pointBackgroundColor: config.colors.chart,
            pointBorderColor: 'rgba(255,255,255,0)',
            pointHoverBackgroundColor: config.colors.selected,
            pointBorderWidth: 20,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 15,
            pointRadius: 4,
            data: this.bigLineChart.allData[index]
          }
        ],
        labels: labels[index]
      };
      this.$refs.bigChart.updateGradients(chartData);
      this.bigLineChart.chartData = chartData;
      this.bigLineChart.activeIndex = index;
    }
  },
  watch: {
    isLoadingAddressStats(val, oldValue) {
      if (val === false && oldValue === true) {
        this.initBigChart(0);
        this.initDiscoveryChart();
      }
    },
    isLoadingWebDataStats(val, oldValue) {
      if (val === false && oldValue === true) {
        this.initServerTypeChart();
      }
    }
  },
  created() {},

  mounted() {
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
