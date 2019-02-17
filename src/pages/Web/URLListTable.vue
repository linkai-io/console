<template>
  <div class="content">
    <div class="col-md-8 ml-auto mr-auto">
      <h2 class="text-center">{{group.group_name}}</h2>
    </div>
    <div class="row mt-5">
      <div class="col-12">
        <card card-body-classes="table-full-width">
          <h4 slot="header" class="card-title">URL List</h4>
          <div class="row">
            <form class="form-horizontal col-md-8">
              <div class="row">
                <div class="col-md-4">
                  <el-tooltip
                    content="Return results captured after the supplied date/time."
                    effect="light"
                    :open-delay="150"
                    placement="top"
                  >
                    <base-input>
                      <el-date-picker
                        type="datetime"
                        placeholder="Filter since time taken"
                        v-model="filter.dateTimePicker"
                      ></el-date-picker>
                    </base-input>
                  </el-tooltip>
                </div>

                <div class="col-md-2">
                  <h5>Latest Results Only</h5>
                  <el-tooltip
                    content="Return only the latest results for each unique address."
                    effect="light"
                    :open-delay="150"
                    placement="top"
                  >
                    <base-input>
                      <base-switch v-model="filter.latest_only" type="secondary">
                        <i class="tim-icons icon-check-2" slot="on"></i>
                        <i class="tim-icons icon-simple-remove" slot="off"></i>
                      </base-switch>
                    </base-input>
                  </el-tooltip>
                </div>

                <div class="col-md-4">
                  <base-input>
                    <base-button
                      type="secondary"
                      :round="true"
                      :loading="updating"
                      @click.native="filterResults"
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
            <el-table ref="urlTable" :data="tableData" @selection-change="handleSelectionChange">
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
                  <div v-if="column.prop ==='urls'">
                    <el-table ref="requestedURLsTable" :data="scope.row.urls">
                      <el-table-column
                        v-for="requestColumn in requestColumns"
                        :key="requestColumn.label"
                        :min-width="requestColumn.minWidth"
                        :prop="requestColumn.prop"
                        sortable
                        :label="requestColumn.label"
                      >
                        <template slot-scope="nestedScope">
                          <div v-if="requestColumn.prop === 'url'">{{ nestedScope.row.url }}</div>
                          <div
                            v-else-if="requestColumn.prop === 'mime_type'"
                          >{{ nestedScope.row.mime_type }}</div>
                          <div v-else-if="requestColumn.prop === 'raw_body_link'">
                            <a :href="'/app/data/'+nestedScope.row.raw_body_link">link</a>
                          </div>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                  <div
                    v-else-if="column.prop === 'url_request_timestamp'"
                  >{{ formatNSTime(scope.row.url_request_timestamp) }}</div>
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
                  <div slot="no-more">No more responses</div>
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
import InfiniteLoading from 'vue-infinite-loading';
import { unixNanoToMinDate } from 'src/data/time.js';
import { BaseSwitch } from 'src/components/index';
import { mapGetters, mapState } from 'vuex';
import API from 'src/api/api.js';
import Fuse from 'fuse.js';

export default {
  components: {
    InfiniteLoading,
    BaseSwitch,
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
      filter: {
        dateTimePicker: '',
        latest_only: false
      },
      pagination: {
        lastIndex: 0,
        limit: 50,
        total: 0,
        sinceTimeTaken: 0,
        count: 0
      },
      searchQuery: '',
      tableColumns: [
        {
          prop: 'address_id_host_address',
          label: 'Original Host',
          minWidth: 60
        },
        {
          prop: 'urls',
          label: 'URLs',
          minWidth: 180
        },
        {
          prop: 'url_request_timestamp',
          label: 'Time Original URL Requested',
          minWidth: 50
        }
      ],
      requestColumns: [
        {
          label: 'URL',
          prop: 'url',
          minWidth: 60
        },
        {
          label: 'Mime Type',
          prop: 'mime_type',
          minWidth: 130
        },
        {
          label: 'Raw Data',
          prop: 'raw_body_link',
          minWidth: 50
        }
      ],
      tableData: [],
      multipleSelection: [],
      fuseSearch: null
    };
  },
  methods: {
    log(val) {
      console.log(val);
    },
    async getTableData(state) {
      if (state === undefined) {
        return;
      }
      console.log(state);

      this.loading = true;
      let limit = this.pagination.limit;
      let start = this.pagination.lastIndex;
      let params = {
        start: start,
        limit: limit,
        latest_only: this.filter.latest_only
      };

      if (
        !Number.isNaN(this.pagination.sinceTimeTaken) &&
        this.pagination.sinceTimeTaken !== 0
      ) {
        params.since_response_time = this.pagination.sinceTimeTaken;
      }

      try {
        let response = await API.get(
          '/webdata/group/' + this.group_id + '/urls',
          {
            params: params
          }
        );

        if (
          response.data.responses === null ||
          response.data.responses.length === 0
        ) {
          state.complete();
          return;
        }
        this.tableData.push(...response.data.responses);
        state.loaded();

        this.pagination.lastIndex = response.data.last_index;
        this.pagination.count = this.tableData.length;
        //this.pagination.total = response.data.total;
      } finally {
        this.loading = false;
      }
    },
    refreshTable() {
      // force reset
      this.pagination.lastIndex = 0;
      this.tableData = [];
      this.getTableData(this.$refs.infiniteLoader.stateChanger);
    },
    filterResults() {
      try {
        let date = new Date(this.filter.dateTimePicker);
        this.pagination.sinceTimeTaken = date.getTime() * 1000000; // 1000000 (ns)
        // force reset
        this.refreshTable();
      } catch (e) {
        console.log(e);
        this.pagination.sinceTimeTaken = 0;
      }
    },
    formatWebLink(value) {
      // little sanity check here...
      if (!value.startsWith('http')) {
        return 'about:blank';
      }
      return value;
    },
    formatHeaders(value) {
      return value;
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
      this.multipleSelection = val;
    },
    handleExport() {
      let details = {
        group_id: this.group_id,
        all_addresses: true
      };

      this.$store.dispatch('webdata/EXPORT_RESPONSES', details);
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
