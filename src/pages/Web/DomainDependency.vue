<template>
  <div>
    <div class="row">
      <div class="col-sm-6 text-left">
        <h5 class="card-category">Domains loaded by your websites</h5>
        <h2 class="card-title"></h2>
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
      <div class="col-md-12">
        <div class="row">
          <div class="col-md-3">
            <base-input
              type="text"
              v-model="filterDomain"
              placeholder="Search domain..."
              @input="updateFilterDomain"
            ></base-input>
          </div>
        </div>
      <div class="row">
        <div class="col-md-12 domain-wrapped-list">
          <ul class="wrapped-ul">
            <li
              v-for="(domain, index) in filterDomainLinks"
              :key="index"
              @click="searchDomain(domain)"
            >{{domain.id}}</li>
          </ul>
        </div>
      </div>
      </div>
    </div>
    <div class="row" v-show="buttonCategories[display.activeIndex] === 'Graph View'">
      <div class="col-md-12 mr-1 ml-1" ref="container">
        <div id="overlay">
          <p>Click to interact with the map</p>
          <p>
            <span style="color: #e14eca">Source nodes</span> represent what the browser initially loaded
          </p>
          <p>
            <span style="color: #abb3bb">Target nodes</span> are resources that are included in the source site
          </p>
        </div>
      </div>
      <div class="domain-canvas" id="container" ref="graph" @click="enablePanZoom">No data</div>
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
      filterDomain: '',
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
    filterDomainLinks() {
      if (this.filterDomain === '') {
        return this.domainLinks;
      }

      return this.domainLinks.filter(v => {
        if (v.id === undefined) {
          return false;
        }
        return v.id.toLowerCase().startsWith(this.filterDomain.toLowerCase());
      });
    },
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
    updateFilterDomain(domain) {
      this.filterDomain = domain;
    },
    searchDomain(domain) {
      this.$emit('search', domain.id);
    },
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
    enablePanZoom() {
      this.domainGraph.enableZoomPanInteraction(true);
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
      this.domainGraph(this.$refs.graph)
        .backgroundColor('rgba(0,0,0,0.3)') // #525f7f #1e1e2f
        .linkDirectionalParticles(1)
        .linkColor(() => 'rgba(255,255,255,0.2)')
        .nodeLabel('id')
        .height(760)
        .width(this.$el.clientWidth)
        .enableZoomPanInteraction(false)
        .onNodeClick(this.searchDomain)
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
      } else {
        this.domainGraph.pauseAnimation();
        this.domainGraph = null;
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
<style scoped>
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

.domain-wrapped-list {
  overflow: auto;
}

.wrapped-ul {
  padding: 0;
  margin: 0;
  
  z-index: 100;
  height: 120px;
  overflow: auto;
}

.wrapped-ul li {
  list-style: none;
  float: left;
  overflow: auto;
  padding: 4px 2px;
  cursor: pointer;
}

.wrapped-ul li.is-active,
.wrapped-ul li:hover {
  color: #e14eca;
}

hr {
  height: 1px;
  color: #e14eca;
  background-color: #e14eca;
  border: none;
}

#container {
  margin-left: 15px;
  position: relative;
}
#container canvas,
#overlay {
  position: absolute;
  margin-left: 5px;
  margin-top: 10px;
  padding: 2px;
  z-index: 100;
  border: 1px solid white;
}
</style>
