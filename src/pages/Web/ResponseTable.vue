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
                        v-model="dateTimePicker"
                      ></el-date-picker>
                    </base-input>
                  </el-tooltip>
                </div>

                <div class="col-md-4">
                  <base-input>
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
              ><i class="tim-icons icon-refresh-02"></i>            
              </base-button>
            </div>
          </div>
          <div class="col-sm-12">
            <!-- start table -->
            <el-table
              ref="responsesTable"
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
                  <div v-if="column.prop ==='url'">
                    <a :href="formatWebLink(scope.row.url)">{{formatWebLink(scope.row.url)}}</a>
                  </div>
                  <div v-else-if="column.prop === 'raw_body_link'">
                    <a :href="'/app/data/'+scope.row.raw_body_link">{{ scope.row.raw_body_hash }}</a>
                  </div>
                  <div v-else-if="column.prop === 'headers'">
                    <ul v-for="(value, key, index) in scope.row.headers" v-bind:key="index">
                      <li>{{key}}: {{value}}</li>
                    </ul>
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
import { mapGetters, mapState } from 'vuex';
import API from 'src/api/api.js';
import Fuse from 'fuse.js';
import swal from 'sweetalert2';

export default {
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
      searchQuery: '',
      tableColumns: [
        {
          prop: 'address_id_host_address',
          label: 'Original Host',
          minWidth: 60
        },
        {
          prop: 'url',
          label: 'URL',
          minWidth: 100
        },
        {
          prop: 'response_port',
          label: 'Port',
          minWidth: 25
        },
        {
          prop: 'mime_type',
          label: 'Response Type',
          minWidth: 40
        },
        {
          prop: 'headers',
          label: 'Response Headers',
          minWidth: 80
        },
        {
          prop: 'raw_body_link',
          label: 'Link to Data',
          minWidth: 50
        },
        {
          prop: 'response_timestamp',
          label: 'Time Taken',
          minWidth: 50
        }
      ],
      tableData: [],
      multipleSelection: [],
      fuseSearch: null
    };
  },
  methods: {
    refreshTable() {
      // force reset
      this.pagination.lastIndex = 0;
      this.tableData = [];
      this.getTableData(this.$refs.infiniteLoader.stateChanger);
    },
    filterSince() {
      try {
        let date = new Date(this.dateTimePicker);
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
      console.log(value);
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
      console.log(val);
      this.multipleSelection = val;
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
        limit: limit
      };
      if (this.pagination.sinceTimeTaken !== 0) {
        params.since_response_time = this.pagination.sinceTimeTaken;
      }
      try {
        let response = await API.get(
          '/webdata/group/' + this.group_id + '/responses',
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
