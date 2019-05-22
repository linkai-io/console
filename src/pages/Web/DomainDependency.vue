<template>
  <div>
      <div class="row">
        <div class="col-sm-6 text-left">
          <h5 class="card-category">Domains loaded by your websites</h5>
          <h2 class="card-title">Domain Dependencies</h2>
        </div>
        <div class="col-sm-6">
          <div class="btn-group btn-group-toggle float-right" data-toggle="buttons">
            <label
              v-for="(option, index) in buttonCategories"
              :key="option"
              class="btn btn-sm btn-secondary btn-simple"
              :class="{ active: display.activeIndex === index }"
              :id="index"
            >
              <input
                type="radio"
                @click="showGraph(index)"
                name="options"
                autocomplete="off"
                :checked="display.activeIndex === index"
              >
              {{ option }}
            </label>
          </div>
        </div>
      </div>
    <div class="row" v-show="buttonCategories[display.activeIndex] === 'List View'">
      <ul class="wrapped-ul">
        <li v-for="(domain, index) in domainLinks" :key="index">{{domain.id}}</li>
      </ul>
    </div>
    <div class="row" v-show="buttonCategories[display.activeIndex] === 'Graph View'">
      <div class="col-md-12 mr-1 ml-1" ref="container">
        <div class="domain-canvas" ref="graph">No data</div>
      </div>
    </div>
  </div>
</template>
<script>
import API from '../../api/api';
import ForceGraph from 'force-graph';
import { fileDownloader } from '../../data/downloader.js';
import _ from 'lodash';

export default {
  name: 'domain-dependency',
  components: {},
  props: {
    group_id: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      domainDependencies: {},
      downloadData: {},
      domainGraph: ForceGraph(),
      resizer: null,
      canvasVisible: null,
      noData: false,
      display: {
        activeIndex: 0
      }
    };
  },
  computed: {
    buttonCategories() {
      return ['List View', 'Graph View'];
    },
    domainLinks() {
      if (this.domainDependencies.nodes === undefined) {
        return [];
      }
      return this.domainDependencies.nodes.filter(v => v.origin === 0);
      //return this.fakeNodes();
    }
  },
  methods: {
    showGraph(index) {
      this.display.activeIndex = index;
      if (this.buttonCategories[this.display.activeIndex] === 'Graph View') {
        this.handleResize();
      } else {
        this.domainGraph.pauseAnimation();
      }
    },
    fakeNodes() {
      let nodes = [];
      for (let i = 0; i < 1000; i++) {
        nodes.push({ id: i + '.example.com' });
      }
      return nodes;
    },
    downloadDomainDependencies() {
      fileDownloader(
        this.downloadData,
        'domain-dependencies.json',
        'application/octet-stream'
      );
    },
    handleResize() {
      if (
        this.domainDependencies.nodes !== undefined &&
        this.domainDependencies.links !== undefined
      ) {
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
      console.log(this.$refs.graph.outerWidth);
      console.log(this.$refs.graph.clientWidth);

      this.domainGraph(this.$refs.graph)
        .backgroundColor('rgba(0,0,0,0.3)') // #525f7f #1e1e2f
        .linkDirectionalParticles(1)
        .linkColor(() => 'rgba(255,255,255,0.2)')
        .nodeLabel('id')
        .height(760)
        .width(this.$refs.container.outerWidth)
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
        console.log('drew graph');
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
            //this.drawGraph();
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
              msg:
                'Request for domain dependencies failed: ' +
                err.response.data.msg,
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

.wrapped-ul {
  list-style-type: none;
}
.wrapped-ul li {
  float: left;
  margin: 5px;
  -webkit-transition: box-shadow 0.5s ease;
  -moz-transition: box-shadow 0.5s ease;
  -o-transition: box-shadow 0.5s ease;
  -ms-transition: box-shadow 0.5s ease;
  transition: box-shadow 0.5s ease;
}

hr {
  height: 1px;
  color: #e14eca;
  background-color: #e14eca;
  border: none;
}
</style>
