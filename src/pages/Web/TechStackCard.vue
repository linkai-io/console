<template>
  <card card-body-classes="table-full-width">
    <template slot="header">
      <div class="row">
        <div class="col-sm-6 text-left">
          <h5 class="card-category">Technologies &amp; Dependencies</h5>
          <h2 class="card-title">{{group_name}}</h2>
        </div>
        <div class="col-sm-6">
          <div class="btn-group btn-group-toggle float-right" data-toggle="buttons">
            <label
              v-for="(option, index) in buttonCategories"
              :key="option"
              class="btn btn-sm btn-primary btn-simple"
              :class="{ active: display.activeIndex === index }"
              :id="index"
            >
              <input
                type="radio"
                @click="display.activeIndex = index;"
                name="options"
                autocomplete="off"
                :checked="display.activeIndex === index"
              >
              {{ option }}
            </label>
          </div>
        </div>
      </div>
    </template>
    <div class="row" v-show="buttonCategories[display.activeIndex] === 'Technologies'">
      <div v-for="category in techCategories" :key="category">
        <div class="col-sm-12">
          <h6>{{category}}</h6>
          <hr>
          <div v-for="(tech, index) in tableData" :key="index">
            <div v-if="tech.category === category">
              <base-button type="sm" class="mt-2" @click.native="loadTable(tech.technologies)">
                <div v-if="tech.icon !== ''">
                  <img height="16" width="16" :src="'img/tech/'+tech.icon">&nbsp;
                </div>
                {{tech.technologies}} - {{tech.assets.length}}
              </base-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row" v-show="buttonCategories[display.activeIndex] === 'Dependencies'">
      <div class="col-sm-12">
        <domain-dependency v-bind:group_id="group_id"></domain-dependency>
      </div>
    </div>
    <div id="table_start">
      <div v-if="shouldLoad">
        <hr>
        <filtered-snapshot-table
          v-bind:group_id="group_id"
          v-bind:group_name="group_name"
          v-bind:filter="getFilter"
        ></filtered-snapshot-table>
      </div>
    </div>
  </card>
</template>
<script>
import { mapGetters, mapState } from 'vuex';
import FilteredSnapshotTable from 'src/pages/Web/FilteredSnapshotTable.vue';
import DomainDependency from 'src/pages/Web/DomainDependency.vue';
import { unixNanoToMinDate } from 'src/data/time.js';
import { formatWebLink } from 'src/data/formatters.js';
import API from 'src/api/api.js';

export default {
  name: 'tech-stack-card',
  components: {
    FilteredSnapshotTable,
    DomainDependency
  },
  props: {
    group_id: {
      type: Number
    },
    group_name: {
      type: String,
      default: ''
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters('addresses', ['getCountByID']),
    ...mapState('addresses', ['isUpdating']),
    ...mapGetters('scangroup', ['groups']),
    updating() {
      return this.isUpdating;
    },
    buttonCategories() {
      return ['Technologies', 'Dependencies'];
    },
    getFilter() {
      console.log('this getFilter called');
      console.log(this.filter);
      return this.filter;
    },
    shouldLoad() {
      return this.filtered;
    }
  },
  data() {
    return {
      tableData: [],
      techCategories: [],
      display: {
        activeIndex: 0
      },
      filter: {},
      filtered: false
    };
  },
  methods: {
    openLink(link) {
      window.open(link, '_blank');
    },
    downloadTechData() {
      fileDownloader(
        JSON.stringify(this.downloadData),
        'webtech.json',
        'application/octet-stream'
      );
    },
    loadTable(techName) {
      this.filter = { tech_type: techName };
      this.filtered = true;
      let options = {
        container: 'body',
        easing: 'ease-in',
        offset: -60
      };
      this.$scrollTo('#table_start', options);
    },
    async getTableData() {
      try {
        let response = await API.get(
          '/webdata/group/' + this.group_id + '/techdata'
        );

        if (response.data.technologies === null) {
          return;
        }
        response.data = this.fakeData();
        this.downloadData = response.data;
        let tech = response.data.technologies;
        let tech_details = response.data.tech_details;
        this.techCategories = Array.from(
          new Set(Object.keys(tech_details).map(v => tech_details[v].category))
        ).sort();
        console.log(this.techCategories);
        Object.keys(tech_details).forEach(v => {
          this.tableData.push({
            technologies: v,
            icon: tech_details[v].icon,
            website: tech_details[v].website,
            category: tech_details[v].category,
            assets: tech[v]
          });
        });
      } catch (err) {
        let msg = 'error getting data';
        if (err.data !== undefined && err.data.msg !== undefined) {
          msg = err.data.msg;
        }
        console.log(err);
        this.$store.dispatch(
          'notify/CREATE_NOTIFY_MSG',
          {
            msg: msg,
            msgType: 'danger'
          },
          { root: true }
        );
      } finally {
        this.loading = false;
      }
    },
    handleExport() {
      let details = {
        group_id: this.group_id,
        all_addresses: true
      };

      this.$store.dispatch('webdata/EXPORT_WEBSITES', details);
      return true;
    },
    fakeData() {
      return {
        technologies: {
          'Amazon Cloudfront': [
            {
              version: '',
              url: 'https://linkai.io',
              host: 'linkai.io',
              ip: '99.84.181.56',
              port: 443
            },
            {
              version: '',
              url: 'http://linkai.io',
              host: 'linkai.io',
              ip: '99.84.181.25',
              port: 443
            },
            {
              version: '',
              url: 'https://www.linkai.io',
              host: 'www.linkai.io',
              ip: '99.84.216.81',
              port: 443
            },
            {
              version: '',
              url: 'https://test.linkai.io',
              host: 'test.linkai.io',
              ip: '99.84.181.39',
              port: 443
            },
            {
              version: '',
              url: 'http://www.linkai.io',
              host: 'www.linkai.io',
              ip: '99.84.216.31',
              port: 443
            },
            {
              version: '',
              url: 'http://test.linkai.io',
              host: 'test.linkai.io',
              ip: '99.84.181.96',
              port: 80
            }
          ],
          'Amazon S3': [
            {
              version: '',
              url: 'https://linkai.io',
              host: 'linkai.io',
              ip: '99.84.181.56',
              port: 443
            },
            {
              version: '',
              url: 'http://linkai.io',
              host: 'linkai.io',
              ip: '99.84.181.25',
              port: 443
            },
            {
              version: '',
              url: 'https://www.linkai.io',
              host: 'www.linkai.io',
              ip: '99.84.216.81',
              port: 443
            },
            {
              version: '',
              url: 'https://test.linkai.io',
              host: 'test.linkai.io',
              ip: '99.84.181.39',
              port: 443
            },
            {
              version: '',
              url: 'http://www.linkai.io',
              host: 'www.linkai.io',
              ip: '99.84.216.31',
              port: 443
            }
          ],
          Bootstrap: [
            {
              version: '4.3.1',
              url: 'https://linkai.io',
              host: 'linkai.io',
              ip: '99.84.181.56',
              port: 443
            },
            {
              version: '4.3.1',
              url: 'http://linkai.io',
              host: 'linkai.io',
              ip: '99.84.181.25',
              port: 443
            },
            {
              version: '4.3.1',
              url: 'https://www.linkai.io',
              host: 'www.linkai.io',
              ip: '99.84.216.81',
              port: 443
            },
            {
              version: '4.3.1',
              url: 'http://www.linkai.io',
              host: 'www.linkai.io',
              ip: '99.84.216.31',
              port: 443
            }
          ],
          'Google Analytics': [
            {
              version: '',
              url: 'https://linkai.io',
              host: 'linkai.io',
              ip: '99.84.181.56',
              port: 443
            },
            {
              version: '',
              url: 'http://linkai.io',
              host: 'linkai.io',
              ip: '99.84.181.25',
              port: 443
            },
            {
              version: '',
              url: 'https://www.linkai.io',
              host: 'www.linkai.io',
              ip: '99.84.216.81',
              port: 443
            },
            {
              version: '',
              url: 'http://www.linkai.io',
              host: 'www.linkai.io',
              ip: '99.84.216.31',
              port: 443
            }
          ],
          'Google Font API': [
            {
              version: '',
              url: 'https://console.linkai.io',
              host: 'console.linkai.io',
              ip: '52.20.56.145',
              port: 443
            },
            {
              version: '',
              url: 'https://dev.console.linkai.io',
              host: 'dev.console.linkai.io',
              ip: '34.230.166.51',
              port: 443
            }
          ],
          Hugo: [
            {
              version: '0.55.3',
              url: 'https://linkai.io',
              host: 'linkai.io',
              ip: '99.84.181.56',
              port: 443
            },
            {
              version: '0.55.3',
              url: 'http://linkai.io',
              host: 'linkai.io',
              ip: '99.84.181.25',
              port: 443
            },
            {
              version: '0.55.3',
              url: 'https://www.linkai.io',
              host: 'www.linkai.io',
              ip: '99.84.216.81',
              port: 443
            },
            {
              version: '0.55.3',
              url: 'http://www.linkai.io',
              host: 'www.linkai.io',
              ip: '99.84.216.31',
              port: 443
            }
          ],
          Slick: [
            {
              version: '',
              url: 'https://linkai.io',
              host: 'linkai.io',
              ip: '99.84.181.56',
              port: 443
            },
            {
              version: '',
              url: 'http://linkai.io',
              host: 'linkai.io',
              ip: '99.84.181.25',
              port: 443
            },
            {
              version: '',
              url: 'https://www.linkai.io',
              host: 'www.linkai.io',
              ip: '99.84.216.81',
              port: 443
            },
            {
              version: '',
              url: 'http://www.linkai.io',
              host: 'www.linkai.io',
              ip: '99.84.216.31',
              port: 443
            }
          ],
          SweetAlert: [
            {
              version: '',
              url: 'https://linkai.io',
              host: 'linkai.io',
              ip: '99.84.181.56',
              port: 443
            },
            {
              version: '',
              url: 'http://linkai.io',
              host: 'linkai.io',
              ip: '99.84.181.25',
              port: 443
            },
            {
              version: '',
              url: 'https://www.linkai.io',
              host: 'www.linkai.io',
              ip: '99.84.216.81',
              port: 443
            },
            {
              version: '',
              url: 'http://www.linkai.io',
              host: 'www.linkai.io',
              ip: '99.84.216.31',
              port: 443
            }
          ],
          'animate.css': [
            {
              version: '',
              url: 'https://linkai.io',
              host: 'linkai.io',
              ip: '99.84.181.56',
              port: 443
            },
            {
              version: '',
              url: 'http://linkai.io',
              host: 'linkai.io',
              ip: '99.84.181.25',
              port: 443
            },
            {
              version: '',
              url: 'https://www.linkai.io',
              host: 'www.linkai.io',
              ip: '99.84.216.81',
              port: 443
            },
            {
              version: '',
              url: 'http://www.linkai.io',
              host: 'www.linkai.io',
              ip: '99.84.216.31',
              port: 443
            }
          ],
          jQuery: [
            {
              version: '1.12.4',
              url: 'https://linkai.io',
              host: 'linkai.io',
              ip: '99.84.181.56',
              port: 443
            },
            {
              version: '1.12.4',
              url: 'http://linkai.io',
              host: 'linkai.io',
              ip: '99.84.181.25',
              port: 443
            },
            {
              version: '1.12.4',
              url: 'https://www.linkai.io',
              host: 'www.linkai.io',
              ip: '99.84.216.81',
              port: 443
            },
            {
              version: '1.12.4',
              url: 'http://www.linkai.io',
              host: 'www.linkai.io',
              ip: '99.84.216.31',
              port: 443
            }
          ],
          webpack: [
            {
              version: '',
              url: 'https://console.linkai.io',
              host: 'console.linkai.io',
              ip: '52.20.56.145',
              port: 443
            },
            {
              version: '',
              url: 'https://dev.console.linkai.io',
              host: 'dev.console.linkai.io',
              ip: '34.230.166.51',
              port: 443
            }
          ]
        },
        tech_details: {
          'Amazon Cloudfront': {
            website: 'http://aws.amazon.com/cloudfront/',
            icon: 'Amazon-Cloudfront.svg',
            category: 'CDN'
          },
          'Amazon S3': {
            website: 'http://aws.amazon.com/s3/',
            icon: 'aws-s3.svg',
            category: 'Miscellaneous'
          },
          Bootstrap: {
            website: 'https://getbootstrap.com',
            icon: 'Bootstrap.png',
            category: 'Web Frameworks'
          },
          'Google Analytics': {
            website: 'http://google.com/analytics',
            icon: 'Google Analytics.svg',
            category: 'Analytics'
          },
          'Google Font API': {
            website: 'http://google.com/fonts',
            icon: 'Google Font API.png',
            category: 'Font Scripts'
          },
          Hugo: {
            website: 'http://gohugo.io',
            icon: 'Hugo.png',
            category: 'Static Site Generator'
          },
          Slick: {
            website: 'https://kenwheeler.github.io/slick',
            icon: '',
            category: 'JavaScript Libraries'
          },
          SweetAlert: {
            website: 'https://t4t5.github.io/sweetalert/',
            icon: 'SweetAlert.png',
            category: 'JavaScript Libraries'
          },
          'animate.css': {
            website: 'https://daneden.github.io/animate.css/',
            icon: '',
            category: 'Web Frameworks'
          },
          jQuery: {
            website: 'https://jquery.com',
            icon: 'jQuery.svg',
            category: 'JavaScript Libraries'
          },
          webpack: {
            website: 'https://webpack.js.org/',
            icon: 'webpack.svg',
            category: 'Miscellaneous'
          }
        }
      };
    }
  },
  mounted() {},
  created() {
    this.getTableData();
  },
  watch: {
    isUpdating(val, oldValue) {
      // reset the table data after we delete/ignore/unignore values
      if (val === false && oldValue === true) {
        this.pagination.lastIndex = 0;
        this.tableData = [];
      }
    }
  }
};
</script>
<style>
.pagination-select,
.search-input {
  width: 200px;
}
.el-table {
  overflow: hidden;
  position: relative;
}
</style>