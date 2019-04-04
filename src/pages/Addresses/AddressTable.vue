<template>
  <div class="content">
    <div class="col-md-8 ml-auto mr-auto">
      <h2 class="text-center">{{group.group_name}}</h2>
    </div>
    <div class="row mt-5">
      <div class="col-12">
        <card card-body-classes="table-full-width">
          <h4 slot="header" class="card-title">Address Data</h4>
          <div class="row">
            <form class="form-horizontal col-md-10">
              <div class="row">
                <div class="col-md-4">
                  <el-tooltip
                    content="Return results since discovery date/time."
                    effect="light"
                    :open-delay="150"
                    placement="top"
                  >
                    <base-input>
                      <el-date-picker
                        type="datetime"
                        placeholder="Filter since discovered"
                        v-model="filter.discoveredDateTimePicker"
                      ></el-date-picker>
                    </base-input>
                  </el-tooltip>
                </div>

                <div class="col-md-4">
                  <el-tooltip
                    content="Return results since seen date/time."
                    effect="light"
                    :open-delay="150"
                    placement="top"
                  >
                    <base-input>
                      <el-date-picker
                        type="datetime"
                        placeholder="Filter since seen"
                        v-model="filter.seenDateTimePicker"
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
                      @click.native="filterResults"
                    >Filter</base-button>
                  </base-input>
                </div>
              </div>
              <div class="row">
                <div class="col-md-2">
                  <el-tooltip
                    content="Return responses that match the provided host"
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

                <div class="col-md-2">
                  <el-tooltip
                    content="Return responses for IP addresses matching the provided IP"
                    effect="light"
                    :open-delay="150"
                    placement="bottom"
                  >
                    <base-input
                      label="Matches IP"
                      v-model="filter.ip_address"
                      type="text"
                      placeholder="192.168.10.1"
                    ></base-input>
                  </el-tooltip>
                </div>

                <div class="col-md-2">
                  <el-tooltip
                    content="Starts with hostname"
                    effect="light"
                    :open-delay="150"
                    placement="bottom"
                  >
                    <base-input
                      label="Host starts with"
                      type="text"
                      v-model="filter.starts_host_address"
                      placeholder="dev"
                    ></base-input>
                  </el-tooltip>
                </div>

                <div class="col-md-2">
                  <el-tooltip
                    content="Ends with hostname"
                    effect="light"
                    :open-delay="150"
                    placement="bottom"
                  >
                    <base-input
                      label="Ends with domain"
                      type="text"
                      v-model="filter.ends_host_address"
                      placeholder="example.com"
                    ></base-input>
                  </el-tooltip>
                </div>

                <div class="col-md-2">
                  <el-tooltip
                    content="Return responses have a confidence level at or above"
                    effect="light"
                    :open-delay="150"
                    placement="bottom"
                  >
                    <base-input
                      label="Above confidence"
                      type="text"
                      v-model="filter.above_confidence"
                      placeholder="0"
                    ></base-input>
                  </el-tooltip>
                </div>
              </div>
            </form>
          </div>
          <div class="col-sm-12">
            <base-button
              type="primary"
              :round="true"
              :disabled="!hasMultiSelected"
              @click.native="handleMultiDelete"
            >Delete</base-button>
            <base-button
              type="primary"
              :round="true"
              :disabled="!hasMultiSelected"
              @click.native="handleMultiIgnore"
            >Ignore</base-button>
            <base-button
              type="primary"
              :round="true"
              :disabled="!hasMultiSelected"
              @click.native="handleMultiUnignore"
            >Unignore</base-button>
            <base-button
              type="primary"
              :round="true"
              :disabled="!hasMultiSelected"
              @click.native="handleMultiExport"
            >Export selected</base-button>

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
          <!--- show address data -->
          <div id="address_details">
            <div v-if="addressSelected === true">
              <address-card @clicked="onDetailsClick" :address="addressDetails"></address-card>
            </div>
          </div>
          <!-- show table -->
          <div class="text-right col-sm-12 ml-auto">Showing {{ count }} of {{ total }} entries.</div>
          <div class="col-sm-12">
            <!-- start table -->
            <el-table
              ref="addressTable"
              :data="tableData"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="55"></el-table-column>
              <el-table-column
                v-for="column in tableColumns"
                :key="column.label"
                :min-width="column.minWidth"
                :prop="column.prop"
                :formatter="formatColumn"
                sortable
                :label="column.label"
              ></el-table-column>
              <el-table-column min-width="50" header-align="right" align="right" label="Actions">
                <div
                  slot-scope="{
                  row,
                  $index
                }"
                  class="text-right table-actions"
                >
                  <el-tooltip
                    content="Asset details"
                    effect="light"
                    :open-delay="150"
                    placement="top"
                  >
                    <base-button
                      type="info"
                      icon
                      size="sm"
                      class="btn-link"
                      @click.native="setAddressDetails(row)"
                    >
                      <i class="tim-icons icon-notes"></i>
                    </base-button>
                  </el-tooltip>
                  <el-tooltip
                    :content="setIgnoreToolTip(row)"
                    effect="light"
                    :open-delay="150"
                    placement="top"
                  >
                    <base-button
                      type="warning"
                      icon
                      size="sm"
                      @click="handleIgnore(row)"
                      class="btn-link"
                    >
                      <i v-if="setIgnoreIcon(row)" class="tim-icons icon-simple-delete"></i>
                      <i v-else class="tim-icons icon-bulb-63"></i>
                    </base-button>
                  </el-tooltip>
                  <el-tooltip
                    content="Delete Host"
                    effect="light"
                    :open-delay="150"
                    placement="top"
                  >
                    <base-button
                      type="danger"
                      icon
                      size="sm"
                      @click="handleDelete(row)"
                      class="btn-link"
                    >
                      <i class="tim-icons icon-simple-remove"></i>
                    </base-button>
                  </el-tooltip>
                </div>
              </el-table-column>

              <template slot="append">
                <infinite-loading
                  ref="infiniteLoader"
                  slot="append"
                  spinner="waveDots"
                  :distance="10"
                  @infinite="getTableData"
                >
                  <div slot="no-more">No more addresses</div>
                </infinite-loading>
              </template>
            </el-table>
            Showing {{ count }} of {{ total }} entries.
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
import { scroller } from 'vue-scrollto/src/scrollTo';
import { unixNanoToMinDate } from 'src/data/time.js';
import { mapGetters, mapState } from 'vuex';
import { formatNSRecord } from 'src/data/formatters.js';

import AddressCard from 'src/pages/Addresses/AddressCard.vue';
import API from 'src/api/api.js';
import Fuse from 'fuse.js';
import swal from 'sweetalert2';

export default {
  components: {
    AddressCard,
    [DatePicker.name]: DatePicker,
    [TimeSelect.name]: TimeSelect,
    InfiniteLoading,
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
      addressSelected: false,
      addressDetails: {},
      pagination: {
        lastIndex: 0,
        limit: 50,
        total: 0,
        count: 0,
        discoveredDateTimePicker: 0,
        seenDateTimePicker: 0
      },
      filter: {
        discoveredDateTimePicker: '',
        seenDateTimePicker: '',
        host_address: '',
        ip_address: '',
        starts_host_address: '',
        ends_host_address: '',
        above_confidence: ''
      },
      searchQuery: '',
      propsToSearch: [
        'host_address',
        'ip_address',
        'discovery_time',
        'discovered_by',
        'last_scanned_time',
        'last_seen_time',
        'confidence_score',
        'user_confidence_score',
        'is_wildcard_zone',
        'is_hosted_service',
        'ignored',
        'found_from',
        'ns_record',
        'address_hash'
      ],
      tableColumns: [
        {
          prop: 'host_address',
          label: 'Hostname',
          minWidth: 60
        },
        {
          prop: 'ip_address',
          label: 'IP Address',
          minWidth: 50
        },
        {
          prop: 'discovery_time',
          label: 'Discovered',
          minWidth: 50
        },
        {
          prop: 'discovered_by',
          label: 'Discovered By',
          minWidth: 60
        },
        {
          prop: 'last_seen_time',
          label: 'Last Seen',
          minWidth: 40
        },
        {
          prop: 'confidence_score',
          label: 'Confidence',
          minWidth: 40
        },
        {
          prop: 'ns_record',
          label: 'NS Record',
          minWidth: 40
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
      let state = this.$refs.infiniteLoader.stateChanger;
      state.reset();
    },
    filterResults() {
      try {
        let discoverDate = new Date(this.filter.discoveredDateTimePicker);
        let seenDate = new Date(this.filter.seenDateTimePicker);
        this.pagination.discoveredDateTimePicker = discoverDate.getTime() * 1000000; // 1000000 (ns)
        this.pagination.seenDateTimePicker = seenDate.getTime() * 1000000; // 1000000 (ns)
        // force reset
        this.refreshTable();
      } catch (e) {
        console.log(e);
        this.pagination.discoveredDateTimePicker = 0;
        this.pagination.seenDateTimePicker = 0;
      }
    },
    formatColumn(row, column, cellValue, index) {
      switch (column.property) {
        case 'ns_record':
          return formatNSRecord(cellValue);
        case 'ignored':
        case 'is_hosted_service':
          return cellValue === true ? 'yes' : 'no';
        case 'last_seen_time':
        case 'last_scanned_time':
        case 'discovery_time':
          return unixNanoToMinDate(cellValue);
        case 'discovered_by':
          return cellValue.replace(/_/g, ' ');
      }
      return cellValue;
    },
    setIgnoreIcon(row) {
      return !row.ignored;
    },
    setIgnoreToolTip(row) {
      return row.ignored === true ? 'Unignore Host' : 'Ignore Host';
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
    setAddressDetails(row) {
      this.addressSelected = true;
      this.addressDetails = row;
      let options = {
        container: 'body',
        easing: 'ease-in',
        offset: -60
      };
      this.$scrollTo('#address_details', options);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    async getTableData(state) {
      if (state === undefined) {
        return;
      }

      this.loading = true;
      let params = {
        start: this.pagination.lastIndex,
        limit: this.pagination.limit
      };
      if (
        !Number.isNaN(this.pagination.discoveredDateTimePicker) &&
        this.pagination.discoveredDateTimePicker !== 0
      ) {
        params.after_discovered = this.pagination.discoveredDateTimePicker;
      }

      if (
        !Number.isNaN(this.pagination.seenDateTimePicker) &&
        this.pagination.seenDateTimePicker !== 0
      ) {
        params.after_seen = this.pagination.seenDateTimePicker;
      }

      if (this.filter.host_address !== '') {
        params.host_address = this.filter.host_address;
      }

      if (this.filter.ip_address !== '') {
        params.ip_address = this.filter.ip_address;
      }

      if (this.filter.starts_host_address !== '') {
        params.starts_host_address = this.filter.starts_host_address;
      }

      if (this.filter.ends_host_address !== '') {
        params.ends_host_address = this.filter.ends_host_address;
      }

      if (this.filter.above_confidence !== '') {
        params.above_confidence = this.filter.above_confidence;
      }

      try {
        let response = await API.get('/address/group/' + this.group_id, {
          params: params
        });

        if (
          response.data.addresses == null ||
          response.data.addresses.length === 0
        ) {
          state.complete();
          return;
        }
        this.tableData.push(...response.data.addresses);
        state.loaded();

        this.pagination.lastIndex = response.data.last_index;
        this.pagination.count = this.tableData.length;
        this.pagination.total = response.data.total;
      } catch (err) {
        console.log(err);
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
    handleIgnore(row) {
      let ignore_value = false;
      if (row.ignored === false) {
        ignore_value = true;
      }
      let details = {
        group_id: this.group_id,
        address_ids: [row.address_id],
        ignore_value: ignore_value
      };
      this.$store.dispatch('addresses/IGNORE_ADDRESSES', details);
    },
    handleDelete(index, row) {
      let details = {
        group_id: this.group_id,
        address_ids: [row.address_id]
      };
      this.$store.dispatch('addresses/DELETE_ADDRESSES', details);
    },
    handleMultiDelete() {
      let details = {
        group_id: this.group_id,
        address_ids: this.getMultipleIDs()
      };
      this.$store.dispatch('addresses/DELETE_ADDRESSES', details);
    },
    handleMultiIgnore() {
      let details = {
        group_id: this.group_id,
        address_ids: this.getMultipleIDs(),
        ignore_value: true
      };
      this.$store.dispatch('addresses/IGNORE_ADDRESSES', details);
    },
    handleMultiUnignore() {
      let details = {
        group_id: this.group_id,
        address_ids: this.getMultipleIDs(),
        ignore_value: false
      };
      this.$store.dispatch('addresses/IGNORE_ADDRESSES', details);
    },
    handleMultiExport() {
      let details = {
        group_id: this.group_id,
        address_ids: this.getMultipleIDs(),
        all_addresses: false
      };
      this.$store.dispatch('addresses/EXPORT_ADDRESSES', details);
    },
    getMultipleIDs() {
      let addrIDs = [];
      for (let i = 0; i < this.multipleSelection.length; i++) {
        addrIDs.push(this.multipleSelection[i].address_id);
      }
      return addrIDs;
    },
    handleExport() {
      let details = {
        group_id: this.group_id,
        all_addresses: true
      };

      this.$store.dispatch('addresses/EXPORT_ADDRESSES', details);
      return true;
    },
    deleteRow(row) {
      let indexToDelete = this.tableData.findIndex(
        tableRow => tableRow.id === row.id
      );
      if (indexToDelete >= 0) {
        this.tableData.splice(indexToDelete, 1);
      }
    },
    onDetailsClick(value) {
      this.addressDetails = {};
      this.addressSelected = false;
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
