<template>
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
</template>
<script>
import BarChart from '@/components/Charts/BarChart';
import { mapGetters } from 'vuex';
import * as chartConfigs from '@/components/Charts/config';
import config from '@/config';

export default {
  components: {
    BarChart
  },
  name: 'server-type-chart',
  props: {
    group_id: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
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
    ...mapGetters('webdata', [
      'isLoadingWebDataStats',
      'webServerTypesByID',
      'webServerTypeCountsByID'
    ]),
    serverTypes() {
      if (this.webServerTypesByID(this.group_id) === undefined) {
        return [];
      }
      let len = this.webServerTypesByID(this.group_id).length;
      return len > 10
        ? this.webServerTypesByID(this.group_id).slice().splice(0, 10)
        : this.webServerTypesByID(this.group_id);
    },
    serverCounts() {
      if (this.webServerTypeCountsByID(this.group_id) === undefined) {
        return [];
      }
      let len = this.webServerTypeCountsByID(this.group_id).length;
      return len > 10
        ? this.webServerTypeCountsByID(this.group_id).slice().splice(0, 10)
        : this.webServerTypeCountsByID(this.group_id);
    }
  },
  watch: {
    isLoadingWebDataStats(val, oldValue) {
      if (val === false && oldValue === true) {
        this.initServerTypeChart();
      }
    },
    active(val, oldValue) {
      if (val === true) {
        this.initServerTypeChart();
      }
    }
  },
  methods: {
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
    }
  },
  mounted() {
    this.initServerTypeChart();
  }
};
</script>
