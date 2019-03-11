<template>
  <div class="content">
    <div class="col-md-8 ml-auto mr-auto">
      <h2 class="text-center">{{group.group_name}}</h2>
    </div>
    <div class="row mt-5">
      <div class="col-12">
        <card card-body-classes="table-full-width">
          <h4 slot="header" class="card-title">Response Data</h4>

          <div class="row">
            <form class="form-horizontal col-md-12 ">
              <div class="row">
                <div class="col-md-2 d-flex">
                  <el-tooltip
                    content="Return results captured after the supplied date/time."
                    effect="light"
                    :open-delay="150"
                    placement="top"
                  >
                    <base-input label="Time taken">
                      <el-date-picker
                        type="datetime"
                        placeholder="Filter since time taken"
                        v-model="dateTimePicker"
                      ></el-date-picker>
                    </base-input>
                  </el-tooltip>
                </div>

                <div class="col-md-2 d-flex">
                  <el-tooltip
                    content="Only return responses that match the host name"
                    effect="light"
                    :open-delay="150"
                    placement="bottom"
                  >
                    <base-input
                      label="Matches host"
                      v-model="filter.host_address"
                      type="text"
                      placeholder="example.com"
                    ></base-input>
                  </el-tooltip>
                </div>

                <div class="col-md-2 d-flex align-bottom">
                  <base-input class="mt-3">
                    <base-button
                      type="secondary"
                      :round="true"
                      :loading="updating"
                      @click.native="filterSince"
                    >Filter</base-button>
                  </base-input>
                </div>
              </div>
            </form>

            <!-- end row -->
          </div>

          <div class="row">
            <div class="col-md-12 text-right">
              <base-button
                type="secondary"
                :round="true"
                :loading="updating"
                @click.native="handleExport"
              >Export all</base-button>
              <base-button
                type="primary"
                icon
                round
                :loading="updating"
                @click.native="refreshTable"
              >
                <i class="tim-icons icon-refresh-02"></i>
              </base-button>
            </div>
          </div>
          <div class="col-sm-12">
            <!-- start table -->
            <el-table
              ref="websiteTable"
              :data="tableData"
              @selection-change="handleSelectionChange"
            >
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
                  <div v-if="column.prop === 'host_address'">
                    {{scope.row.host_address}}
                    <div v-if="scope.row.ip_address !== ''">({{scope.row.ip_address}})</div>
                  </div>
                  <div v-else-if="column.prop === 'url'">
                    <a :href="formatWebLink(scope.row.url)">{{ formatWebLink(scope.row.url)}}</a>
                  </div>
                  <div v-else-if="column.prop ==='snapshot_link'">
                    <img :src="'/app/data/'+scope.row.snapshot_link">
                  </div>
                  <div v-else-if="column.prop ==='technologies'">
                     <tech-data v-bind="techDataForRow(scope.row)"></tech-data>
                  </div>

                  <div v-else-if="column.prop === 'actions'">
                    <el-tooltip
                    content="Download Serialized HTML"
                    effect="light"
                    :open-delay="150"
                    placement="top"
                  >
                    <a
                      :href="'/app/data/'+scope.row.serialized_dom_link"
                    ><i class="tim-icons icon-cloud-download-93"></i></a>
                    </el-tooltip>
                  </div>
                  <div
                    v-else-if="column.prop === 'response_timestamp'"
                  >{{ formatNSTime(scope.row.response_timestamp) }}</div>
                  <div v-else>{{ scope.row[column.prop] }}</div>
                </template>
              </el-table-column>

              <template slot="append">
                <infinite-loading
                  ref="infiniteLoader"
                  slot="append"
                  spinner="waveDots"
                  :distance="10"
                  @infinite="getTableData"
                >
                  <div slot="no-more">No more websites</div>
                </infinite-loading>
              </template>
            </el-table>
          </div>
        </card>
      </div>
    </div>
  </div>
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
import TechData from 'src/pages/Web/TechData.vue';
import InfiniteLoading from 'vue-infinite-loading';
import { mapGetters, mapState } from 'vuex';
import { unixNanoToMinDate } from 'src/data/time.js';
import { formatWebLink } from 'src/data/formatters.js';
import API from 'src/api/api.js';
import Fuse from 'fuse.js';
import swal from 'sweetalert2';

export default {
  components: {
    TechData,
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
      type: String
    }
  },
  computed: {
    ...mapGetters('addresses', ['getCountByID']),
    ...mapState('addresses', ['isUpdating']),
    ...mapGetters('scangroup', ['groups']),
    group() {
      if (this.groups[this.group_id] === undefined) {
        return {
          group_id: this.group_id,
          group_name: ''
        };
      }
      return this.groups[this.group_id];
    },
    hasMultiSelected() {
      return this.multipleSelection.length > 0;
    },
    count() {
      return this.pagination.count;
    },
    total() {
      return this.pagination.total;
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
      searchQuery: '',
      tableColumns: [
        {
          prop: 'snapshot_link',
          label: 'Image',
          minWidth: 60
        },
        {
          prop: 'host_address',
          label: 'Host',
          minWidth: 60
        },
        {
          prop: 'url',
          label: 'URL',
          minWidth: 60
        },
        {
          prop: 'response_port',
          label: 'Port',
          minWidth: 30
        },
        {
          prop: 'technologies',
          label: 'Technologies',
          minWidth: 70
        },
        {
          prop: 'response_timestamp',
          label: 'Time Taken',
          minWidth: 50
        },
        {
          prop: 'actions',
          label: 'Actions',
          minWidth: 20
        }
      ],
      tableData: [],
      multipleSelection: [],
      fuseSearch: null
    };
  },
  methods: {
    formatWebLink(value) {
      return formatWebLink(value);
    },
    techDataForRow(row) {
      return {tech_data: {
          tech_categories: row.tech_categories,
          tech_names: row.tech_names,
          tech_versions: row.tech_versions,
          tech_match_locations: row.tech_match_locations,
          tech_match_data: row.tech_match_data,
          tech_icons: row.tech_icons,
          tech_websites: row.tech_websites}
      };
    },
    filterSince() {
      try {
        let date = new Date(this.dateTimePicker);
        this.pagination.sinceTimeTaken = date.getTime() * 1000000;
        // force reset
        this.refreshTable();
      } catch (e) {
        console.log(e);
        this.pagination.sinceTimeTaken = 0;
      }
    },
    refreshTable() {
      // force reset
      this.pagination.lastIndex = 0;
      this.tableData = [];
      let state = this.$refs.infiniteLoader.stateChanger;
      state.reset();
      this.getTableData(state);
    },
    formatColumn(row, column, cellValue, index) {
      switch (column.property) {
        case 'response_timestamp':
          return this.formatTime(cellValue);
      }
      return cellValue;
    },
    formatNSTime(value) {
      return unixNanoToMinDate(value);
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.addressTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.addressTable.clearSelection();
      }
    },
    handleSelectionChange(val) {
      console.log(val);
      this.multipleSelection = val;
    },
    async getTableData(state) {
      if (state === undefined) {
        return;
      }

      this.loading = true;
      let limit = this.pagination.limit;
      let start = this.pagination.lastIndex;
      let params = {
        start: start,
        limit: limit
      };
      if (!Number.isNaN(this.pagination.sinceTimeTaken) && this.pagination.sinceTimeTaken !== 0) {
        params.after_response_time = this.pagination.sinceTimeTaken;
      }
      if (this.filter.host_address !== '') {
        params.host_address = this.filter.host_address;
      }
      try {
        let response = await API.get(
          '/webdata/group/' + this.group_id + '/snapshots',
          {
            params: params
          }
        );

        if (
          response.data.snapshots === null ||
          response.data.snapshots.length === 0
        ) {
          state.complete();
          return;
        }
        this.tableData.push(...response.data.snapshots);
        state.loaded();

        this.pagination.lastIndex = response.data.last_index;
        this.pagination.count = this.tableData.length;
        //this.pagination.total = response.data.total;
      } catch (err) {
        state.complete();

        let msg = 'error getting data';
        if (err.data !== undefined && err.data.msg !== undefined) {
          msg = err.data.msg;
        }

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
  created() {},
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
