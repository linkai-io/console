<template>
    <card type="chart">
      <template slot="header">
        <div class="row">
          <div class="col-sm-6 text-left">
            <h5 class="card-category">3 hour increments</h5>
            <h2 class="card-title">Assets Over Time ({{group_name}})</h2>
          </div>
          <div class="col-sm-6">
            <div class="btn-group btn-group-toggle float-right" data-toggle="buttons">
              <label
                v-for="(option, index) in assetChartCategories"
                :key="option"
                class="btn btn-sm btn-primary btn-simple"
                :class="{ active: assetChart.activeIndex === index }"
                :id="index"
              >
                <input
                  type="radio"
                  @click="initAssetChart(index);"
                  name="options"
                  autocomplete="off"
                  :checked="assetChart.activeIndex === index"
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
          ref="assetChart"
          :chart-data="assetChart.chartData"
          :gradient-colors="assetChart.gradientColors"
          :gradient-stops="assetChart.gradientStops"
          :extra-options="assetChart.extraOptions"
        ></line-chart>
      </div>
    </card>
</template>
<script>
import { mapGetters } from 'vuex';
import LineChart from '@/components/Charts/LineChart';
import * as chartConfigs from '@/components/Charts/config';
import config from '@/config';

export default {
  components: {
    LineChart
  },
  name: "asset-chart",
  props: {
    group_id: {
      type: Number,
      default: 0
    },
    group_name: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      assetChart: {
        allData: [],
        activeIndex: 0,
        chartData: null,
        extraOptions: chartConfigs.purpleChartOptions,
        gradientColors: config.colors.purpleGradient,
        gradientStops: [1, 0.4, 0],
        categories: []
      }
    }
  },
  computed: {
        ...mapGetters('addresses', [
      'isLoadingAddressStats',
      'discoveryTrihourlyCountByID',
      'seenTrihourlyCountByID',
      'scannedTrihourlyCountByID',
      'discoveryTrihourlyTimeByID',
      'seenTrihourlyTimeByID',
      'scannedTrihourlyTimeByID'
    ]),
    assetChartCategories() {
      return ['Discovered', 'Seen', 'Scanned'];
    }
  },
  methods: {
    initAssetChart(index) {
      this.assetChart.allData = [
        this.discoveryTrihourlyCountByID(this.group_id),
        this.seenTrihourlyCountByID(this.group_id),
        this.scannedTrihourlyCountByID(this.group_id),
      ];

      var labels = [
        this.discoveryTrihourlyTimeByID(this.group_id),
        this.seenTrihourlyTimeByID(this.group_id),
        this.scannedTrihourlyTimeByID(this.group_id)
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
            data: this.assetChart.allData[index]
          }
        ],
        labels: labels[index]
      };
      this.$refs.assetChart.updateGradients(chartData);
      this.assetChart.chartData = chartData;
      this.assetChart.activeIndex = index;
    }
  },
  watch: {
    isLoadingAddressStats(val, oldValue) {
      if (val === false && oldValue === true) {
        this.initAssetChart(0);
      }
    }
  },
  mounted() {
    this.initAssetChart(0);
  }
}
</script>
