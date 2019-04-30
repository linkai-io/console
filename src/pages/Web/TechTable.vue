<template>
  <card card-body-classes="table-full-width">
    <div class="row">
      <div class="col-sm-12">
        <!-- start table -->
        <el-table ref="techDataTable" :data="tableData">
          <el-table-column
            v-for="column in tableColumns"
            :key="column.label"
            :min-width="column.minWidth"
            :prop="column.prop"
            :formatter="formatColumn"
            sortable
            :label="column.label"
          >
            <template slot-scope="scope">
              <div v-if="column.prop==='technologies'">
                <base-button type="sm" class="mt-2" @click.native="openLink(scope.row.website)">
                  <a :href="scope.row.website">
                    <div v-if="scope.row.icon !== ''">
                      <img height="16" width="16" :src="'img/tech/'+scope.row.icon">&nbsp;
                    </div>
                  </a>
                  {{ scope.row[column.prop] }}
                </base-button>
              </div>
              <div v-else>
                <div
                  v-for="asset in scope.row[column.prop]"
                  :key="asset.host+asset.ip+asset.port+asset.version"
                >
                  <el-tooltip effect="light" :open-delay="150" placement="left">
                    <template slot="content">
                      <div>IP Address: {{ asset.ip }}</div>
                      <div>Hostname: {{ asset.host }}</div>
                      <div>Port: {{ asset.port }}</div>
                    </template>
                    <div>
                      <a :href="formatWebLink(asset.url)">{{ formatWebLink(asset.url)}}</a>
                      <span v-if="asset.version !== ''">&nbsp;was found running version: {{asset.version}}</span>
                    </div>
                  </el-tooltip>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </card>
</template>
<script>
import {
  TimeSelect,
  DatePicker,
  Table,
  TableColumn,
  Select,
  Option
} from 'element-ui';
import InfiniteLoading from 'vue-infinite-loading';
import { mapGetters, mapState } from 'vuex';
import { unixNanoToMinDate } from 'src/data/time.js';
import { formatWebLink } from 'src/data/formatters.js';
import API from 'src/api/api.js';
import Fuse from 'fuse.js';

export default {
  name: 'tech-table',
  components: {
    InfiniteLoading,
    [DatePicker.name]: DatePicker,
    [TimeSelect.name]: TimeSelect,
    [Select.name]: Select,
    [Option.name]: Option,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn
  },
  props: {
    group_id: {
      type: Number
    }
  },
  computed: {
    ...mapGetters('addresses', ['getCountByID']),
    ...mapState('addresses', ['isUpdating']),
    ...mapGetters('scangroup', ['groups']),
    hasMultiSelected() {
      return this.multipleSelection.length > 0;
    },

    updating() {
      return this.isUpdating;
    }
  },
  data() {
    return {
      dateTimePicker: '',
      pagination: {
        lastIndex: 0,
        limit: 50,
        total: 0,
        sinceTimeTaken: 0,
        count: 0
      },
      filter: {
        host_address: ''
      },
      assetColumns: [
        {
          prop: 'host',
          label: 'Host',
          minWidth: 30
        },
        {
          prop: 'ip',
          label: 'IP',
          minWidth: 30
        },
        {
          prop: 'port',
          label: 'Port',
          minWidth: 30
        },
        {
          prop: 'url',
          label: 'URL',
          minWidth: 30
        },
        {
          prop: 'version',
          label: 'Version',
          minWidth: 30
        }
      ],
      searchQuery: '',
      tableColumns: [
        {
          prop: 'technologies',
          label: 'Technologies',
          minWidth: 20
        },
        {
          prop: 'assets',
          label: 'Assets',
          minWidth: 100
        }
      ],
      tableData: [],
      multipleSelection: [],
      fuseSearch: null
    };
  },
  methods: {
    openLink(link) {
      window.open(link, '_blank');
    },
    refreshTable() {
      // force reset
      this.pagination.lastIndex = 0;
      this.tableData = [];
      let state = this.$refs.infiniteLoader.stateChanger;
      state.reset();
    },
    formatColumn(row, column, cellValue) {
      switch (column.property) {
        case 'response_timestamp':
          return this.formatTime(cellValue);
      }
      return cellValue;
    },
    formatWebLink(value) {
      return formatWebLink(value);
    },
    formatNSTime(value) {
      return unixNanoToMinDate(value);
    },
    async getTableData() {
      try {
        let response = await API.get(
          '/webdata/group/' + this.group_id + '/techdata'
        );

        if (response.data.technologies === null) {
          return;
        }
        let tech = response.data.technologies;
        console.log(tech);
        let tech_details = response.data.tech_details;
        console.log(tech_details);
        Object.keys(tech_details).forEach(v => {
          this.tableData.push({
            technologies: v,
            icon: tech_details[v].icon,
            website: tech_details[v].website,
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
    }
  },
  mounted() {
    // Fuse search initialization.
    this.fuseSearch = new Fuse(this.tableData, {
      keys: ['hostname'],
      threshold: 0.3
    });
  },
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
    },
    /**
     * Searches through the table data by a given query.
     * NOTE: If you have a lot of data, it's recommended to do the search on the Server Side and only display the results here.
     * @param value of the query
     */
    searchQuery(value) {
      let result = this.tableData;
      if (value !== '') {
        result = this.fuseSearch.search(this.searchQuery);
      }
      this.searchedData = result;
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
