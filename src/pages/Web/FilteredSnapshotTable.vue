<template>
  <div class="content">
    <div class="row mt-5">
      <div class="col-12">
        <card card-body-classes="table-full-width">
          <div class="row">
            <div class="col-md-12 text-right">
              <base-button
                type="primary"
                size="sm"
                :loading="updating"
                @click.native="handleExport"
              >Export all</base-button>
              <base-button
                type="primary"
                icon
                round
                size="sm"
                :loading="updating"
                @click.native="refreshTable"
              >
                <i class="tim-icons icon-refresh-02"></i>
              </base-button>
            </div>
          </div>
          <!--- show response data -->
          <div id="response_details">
            <div v-if="responseSelected === true">
              <response-card
                @clicked="onResponseDetailsClick"
                :lookupFilter="responseDetails"
                title="Response"
              ></response-card>
            </div>
          </div>
          <!--- show url data -->
          <div id="url_details">
            <div v-if="urlSelected === true">
              <response-card
                @clicked="onURLDetailsClick"
                v-bind:lookupFilter="urlDetails"
                title="URL Details"
              ></response-card>
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
                    Host: {{scope.row.host_address}}
                    <div v-if="scope.row.ip_address !== ''"> IP Address: {{scope.row.ip_address}}</div>
                    <p>Port: {{ scope.row.response_port}}</p>
                    <p>Time: {{ formatNSTime(scope.row.response_timestamp) }}</p>
                  </div>
                  <div v-else-if="column.prop === 'url'">
                    <a :href="formatWebLink(scope.row.url)">{{ formatWebLink(scope.row.url)}}</a>
                    <div v-if="wasRedirect(scope.row)">
                      redirected from:
                      <br>
                      <a
                        :href="formatWebLink(scope.row.load_url)"
                      >{{ formatWebLink(scope.row.load_url) }}</a>
                    </div>
                  </div>
                  <div v-else-if="column.prop ==='snapshot_link'">
                    <img :src="'/app/data/'+scope.row.snapshot_link">
                  </div>
                  <div v-else-if="column.prop ==='technologies'">
                    <tech-data v-bind="techDataForRow(scope.row)"></tech-data>
                  </div>

                  <div v-else-if="column.prop === 'actions'">
                    <!-- view response -->
                    <el-tooltip
                      content="View This Response"
                      effect="light"
                      :open-delay="150"
                      placement="top"
                    >
                      <base-button
                        type="info"
                        icon
                        size="sm"
                        class="btn-link"
                        @click.native="setResponseDetails(scope.row)"
                      >
                        <i class="tim-icons icon-sound-wave"></i>
                      </base-button>
                    </el-tooltip>
                    <!-- view url -->
                    <el-tooltip
                      content="View Sub-Resource Responses"
                      effect="light"
                      :open-delay="150"
                      placement="top"
                    >
                      <base-button
                        type="info"
                        icon
                        size="sm"
                        class="btn-link"
                        @click.native="setURLDetails(scope.row)"
                      >
                        <i class="tim-icons icon-notes"></i>
                      </base-button>
                    </el-tooltip>
                    <!-- download html -->
                    <el-tooltip
                      content="Download Serialized HTML"
                      effect="light"
                      :open-delay="150"
                      placement="top"
                    >
                      <a :href="'/app/data/'+scope.row.serialized_dom_link">
                        <i class="ml-2 tim-icons icon-cloud-download-93"></i>
                      </a>
                    </el-tooltip>
                  </div>

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
import ResponseCard from 'src/pages/Web/ResponseCard.vue';
import API from 'src/api/api.js';
import Fuse from 'fuse.js';

export default {
  name: 'filtered-snapshot-table',
  components: {
    TechData,
    ResponseCard,
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
    },
    group_name: {
      type: String,
      default: ''
    },
    filter: {
      type: Object,
      default: {}
    }
  },
  computed: {
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
      responseSelected: false,
      responseDetails: {},
      urlSelected: false,
      urlDetails: {},
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
          prop: 'snapshot_link',
          label: 'Image',
          minWidth: 50
        },
        {
          prop: 'host_address',
          label: 'Load Details',
          minWidth: 80
        },
        {
          prop: 'url',
          label: 'URL',
          minWidth: 80
        },
        {
          prop: 'technologies',
          label: 'Technologies',
          minWidth: 70
        },
        {
          prop: 'actions',
          label: 'Actions',
          minWidth: 40
        }
      ],
      tableData: [],
      multipleSelection: [],
      fuseSearch: null
    };
  },
  methods: {
    wasRedirect(row) {
      return (
        row.url !== row.load_url &&
        row.load_url !== '' &&
        row.url !== row.load_url + '/'
      );
    },
    formatWebLink(value) {
      return formatWebLink(value);
    },
    techDataForRow(row) {
      return {
        tech_data: {
          tech_categories: row.tech_categories,
          tech_names: row.tech_names,
          tech_versions: row.tech_versions,
          tech_match_locations: row.tech_match_locations,
          tech_match_data: row.tech_match_data,
          tech_icons: row.tech_icons,
          tech_websites: row.tech_websites
        }
      };
    },
    filterSince() {
      try {
        let date = new Date(this.dateTimePicker);
        this.pagination.sinceTimeTaken = date.getTime() * 1000000;
        // force reset
        this.refreshTable();
      } catch (e) {
        this.pagination.sinceTimeTaken = 0;
      }
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
      if (
        !Number.isNaN(this.pagination.sinceTimeTaken) &&
        this.pagination.sinceTimeTaken !== 0
      ) {
        params.after_response_time = this.pagination.sinceTimeTaken;
      }
      if (this.filter.host_address !== '') {
        params.host_address = this.filter.host_address;
      }
      if (this.filter.tech_type !== '') {
        params.tech_type = this.filter.tech_type;
      }
      
      if (this.filter.dependent_host_address !== '') {
        params.dependent_host_address = this.filter.dependent_host_address;
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
    },
    setResponseDetails(row) {
      this.onResponseDetailsClick(null);
      this.responseDetails = row;
      this.responseSelected = true;
      this.responseDetails.display_url_list = false;
      let options = {
        container: 'body',
        easing: 'ease-in',
        offset: -60
      };
      this.$scrollTo('#response_details', options);
    },
    setURLDetails(row) {
      this.onURLDetailsClick(null);
      this.urlDetails = row;
      this.urlSelected = true;
      this.urlDetails.display_url_list = true;
      let options = {
        container: 'body',
        easing: 'ease-in',
        offset: -60
      };
      this.$scrollTo('#url_details', options);
    },
    onResponseDetailsClick(value) {
      this.responseDetails = {};
      this.responseSelected = false;
    },
    onURLDetailsClick(value) {
      this.urlDetails = {};
      this.urlSelected = false;
    }
  },
  mounted() {
    
  },
  created() {},
  watch: {
    isUpdating(val, oldValue) {
      if (val === false && oldValue === true) {
        this.pagination.lastIndex = 0;
        this.tableData = [];
      }
    },
    filter(val, oldValue) {
      console.log('calling get table data again');
      console.log(this.filter);
      this.refreshTable();
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
