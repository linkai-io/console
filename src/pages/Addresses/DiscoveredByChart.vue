<template>
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
  name: 'discovered-by-chart',
  props: {
    group_id: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
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
    };
  },
  computed: {
    ...mapGetters('addresses', [
      'isLoadingAddressStats',
      'discoveredByID',
      'discoveredByCountByID'
    ]),
    discoveredByTypes() {
      if (this.discoveredByID(this.group_id) === undefined) {
        return [];
      }
      return this.discoveredByID(this.group_id).map(v => v.replace(/_/g, ' '));
    },
    discoveredByValues() {
      if (this.discoveredByCountByID(this.group_id) === undefined) {
        return [];
      }
      return this.discoveredByCountByID(this.group_id);
    },
  },
  watch: {
    isLoadingAddressStats(val, oldValue) {
      if (val === false && oldValue === true) {
        this.initDiscoveryChart();
      }
    }
  },
  methods: {
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
  },
  mounted() {
    this.initDiscoveryChart();
  }
};
</script>
