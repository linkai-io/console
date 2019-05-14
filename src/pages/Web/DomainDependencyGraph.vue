<template>
  <card class="card-chart" no-footer-line>
    <template slot="header">
      <h5 class="card-category"></h5>
      <h3 class="card-title">
          <i class="tim-icons icon-tv-2 text-warning"></i> Domain Dependencies
          
      </h3>
      <div class="col-sm-12 text-right">
      <base-button
                type="primary"
                :round="false"
                size="sm"
                @click.native="downloadDomainDependencies"
              >Export all</base-button>
              </div>
    </template>
      <div class="col-md-12 mr-1 ml-1" ref="container">
        <div class="domain-canvas" ref="graph">No data</div>
    </div>
  </card>
</template>
<script>
import API from '../../api/api';
import ForceGraph from 'force-graph';
import { fileDownloader } from '../../data/downloader.js';
import _ from 'lodash';

export default {
  name: 'domain-dependency-graph',
  components: {},
  props: {
    group_id: {
      type: Number,
      default: 0
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      domainDependencies: {},
      downloadData: {},
      domainGraph: ForceGraph(),
      resizer: null,
      canvasVisible: null,
      noData: false
    };
  },
  computed: {},
  methods: {
    downloadDomainDependencies() {
      fileDownloader(this.downloadData, 'domain-dependencies.json', 'application/octet-stream');
    },
    handleResize() {
      if (this.domainDependencies.nodes !== undefined && this.domainDependencies.links !== undefined) {
        this.domainGraph.pauseAnimation();
        this.domainGraph.refresh();
        this.drawGraph();
      }
    },
    drawGraph() {
      // ugh
      let old = this.$refs.graph.firstElementChild;
      if (old !== null) {
        this.$refs.graph.removeChild(old);
      }

      this.domainGraph(this.$refs.graph)
        .backgroundColor('rgba(0,0,0,0.3)') // #525f7f #1e1e2f
        .linkDirectionalParticles(1)
        .linkColor(() => 'rgba(255,255,255,0.2)')
        .nodeLabel('id')
        .height(760)
        .width(this.$refs.graph.clientWidth)
        .linkDirectionalParticleSpeed(0.01)
        .nodeCanvasObject((node, ctx, globalScale) => {
          let label = node.id;
          if (label.length > 50) {
            label = '...' + label.substring(label.length - 25, label.length);
          }
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(
            n => n + fontSize * 0.01
          ); // some padding

          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.fillRect(
            node.x - bckgDimensions[0] / 2,
            node.y - bckgDimensions[1] / 2,
            ...bckgDimensions
          );
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = node.origin === 0 ? '#abb3bb' : '#f3c';
          if (label.length > 50) {
            label = '...' + label.substring(label.length - 25, label.length);
          }
          ctx.fillText(label, node.x, node.y);
          
        })

        .graphData(this.domainDependencies)
        .d3Force('link')
        .distance(() => 50);
    }
  },
  watch: {
    active: function(val, oldValue) {
      if (val === true) {
        this.drawGraph();
      }
    }
  },
  created() {
    this.resizer = _.debounce(this.handleResize, 150);
    window.addEventListener('resize', this.resizer);

    API.get('/webdata/group/' + this.group_id + '/domains').then(
      resp => {
        if (resp.data.status === 'OK') {
          this.domainDependencies = resp.data;
          delete resp.data.status;
          this.downloadData = JSON.stringify(resp.data);
          if (this.domainDependencies.links.length > 0) {
            this.drawGraph();
          }
        }
      },
      err => {
        this.domainDependencies.links = [];
        this.domainDependencies.nodes = [];
        if (err.response !== undefined && err.response.data !== undefined) {
          this.$store.dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: 'Request for domain dependencies failed: ' + err.response.data.msg,
              msgType: 'danger'
            },
            { root: true }
          );
        } else if (err.data !== undefined) {
          this.$store.dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: err.data.msg,
              msgType: 'danger'
            },
            { root: true }
          );
        } else {
          this.$store.dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: 'Request failed: ' + err.message,
              msgType: 'danger'
            },
            { root: true }
          );
        }
      }
    );
  },
  destroyed() {
    window.removeEventListener('resize', this.resizer);
  },
  mounted() {}
};
</script>
<style>
.data p,
.data span,
.data tr,
.data td {
  white-space: pre;
  white-space: pre-line;
}
.domain-canvas {
  width: 100%;
}

hr {
  height: 1px;
  color: #e14eca;
  background-color: #e14eca;
  border: none;
}
</style>
