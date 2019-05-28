<template>
  <div class="content">
    <div class="col-md-8 ml-auto mr-auto">
      <h2 class="text-center">{{group.group_name}}</h2>
    </div>
    <div class="row mt-5">
      <div class="col-12">
        <card card-body-classes="table-full-width">
          <h4 slot="header" class="card-title">Address Data</h4>
          <form class="form-horizontal">
            <div class="row">
                <div class="col-md-2">
                  <el-tooltip
                    content="Return results since discovery date/time."
                    effect="light"
                    :open-delay="150"
                    placement="bottom"
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

                <div class="col-md-2">
                  <el-tooltip
                    content="Return results since seen date/time."
                    effect="light"
                    :open-delay="150"
                    placement="bottom"
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
                <div class="col-md-2">
                  <base-input>
                    <base-button
                      type="primary"
                      size="sm"
                      :loading="updating"
                      @click.native="filterResults"
                    >Filter</base-button>
                  </base-input>
                </div>
              </div>
              <div class="row">
              <div class="col-md-12">
                <!-- <div>
                <label id="asset-search">Search Filter:</label>-->
                <tags-auto-input
                  :tagItems="tagItems"
                  aria-labelled-by="asset-search"
                  @change="updateSearchFilters"
                ></tags-auto-input>

                <!--</div>-->
              </div>
            </div>
          </form>

          <div class="row">
            <div class="col-md-12 text-right">
              <base-button
                type="primary"
                size="sm"
                :disabled="!hasMultiSelected"
                @click.native="handleMultiDelete"
              >Delete</base-button>
              <base-button
                type="primary"
                size="sm"
                :disabled="!hasMultiSelected"
                @click.native="handleMultiIgnore"
              >Ignore</base-button>
              <base-button
                type="primary"
                size="sm"
                :disabled="!hasMultiSelected"
                @click.native="handleMultiUnignore"
              >Unignore</base-button>
              <base-button
                type="primary"
                size="sm"
                :disabled="!hasMultiSelected"
                @click.native="handleMultiExport"
              >Export selected</base-button>

              <base-button
                type="primary"
                size="sm"
                :loading="updating"
                @click.native="handleExport"
              >Export all</base-button>

              <base-button
                type="primary"
                size="sm"
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
                  <div class="row">
                    <div class="col-md-12">
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
                  </div>
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
//import { scroller } from 'vue-scrollto/src/scrollTo';
import { unixNanoToMinDate } from 'src/data/time.js';
import { mapGetters, mapState } from 'vuex';
import { handleErrors } from 'src/data/errors.js';
import { formatNSRecord, NSRecords } from 'src/data/formatters.js';
import { TagsAutoInput } from 'src/components/index';
import AddressCard from 'src/pages/Addresses/AddressCard.vue';
import API from 'src/api/api.js';
import Fuse from 'fuse.js';

export default {
  components: {
    AddressCard,
    TagsAutoInput,
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
      selectedFilters: [],
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
      fuseSearch: null,
      tagItems: [
        {
          filter: 'ignored',
          display: 'include ignored assets',
          allow_multiple: false,
          has_value: false
        },
        {
          filter: 'not_ignored',
          display: 'exclude ignored assets',
          allow_multiple: false,
          has_value: false
        },
        {
          filter: 'wildcard',
          display: 'include wildcard domains',
          allow_multiple: false,
          has_value: false
        },
        {
          filter: 'not_wildcard',
          display: 'exclude wildcard domains',
          allow_multiple: false,
          has_value: false
        },
        {
          filter: 'hosted',
          display: 'include hosted services',
          allow_multiple: false,
          has_value: false
        },
        {
          filter: 'not_hosted',
          display: 'exclude hosted services',
          allow_multiple: false,
          has_value: false
        },
        {
          filter: 'above_confidence',
          display: 'confidence greater than',
          min: 0,
          max: 99,
          allow_multiple: false,
          has_value: true
        },
        {
          filter: 'below_confidence',
          display: 'confidence less than',
          min: 1,
          max: 99,
          allow_multiple: false,
          has_value: true
        },
        {
          filter: 'equals_confidence',
          display: 'confidence equals',
          min: 0,
          max: 100,
          allow_multiple: false,
          has_value: true
        },
        {
          filter: 'above_user_confidence',
          display: 'user confidence greater than',
          min: 0,
          max: 100,
          allow_multiple: false,
          has_value: true
        },
        {
          filter: 'below_user_confidence',
          display: 'user confidence less than',
          min: 1,
          max: 100,
          allow_multiple: false,
          has_value: true
        },
        {
          filter: 'equals_user_confidence',
          display: 'user confidence equals',
          min: 0,
          max: 100,
          allow_multiple: false,
          has_value: true
        },
        {
          filter: 'ns_record',
          display: 'NS record equals',
          options: NSRecords,
          option_field: 'record',
          allow_multiple: true,
          has_value: true
        },
        {
          filter: 'not_ns_record',
          display: 'NS record does not equal',
          options: NSRecords,
          option_field: 'record',
          allow_multiple: true,
          has_value: true
        },
        { filter: 'ip_address', display: 'IP address equals', allow_multiple: true, has_value: true },
        {
          filter: 'not_ip_address',
          display: 'IP address does not equal',
          has_value: true
        },
        { filter: 'host_address', display: 'hostname equals',allow_multiple: true, has_value: true },
        {
          filter: 'not_host_address',
          display: 'hostname does not equal',
          allow_multiple: true,
          has_value: true
        },
        {
          filter: 'ends_host_address',
          display: 'hostname ends with',
          allow_multiple: true,
          has_value: true
        },
        {
          filter: 'not_ends_host_address',
          display: 'hostname does not end with',
          allow_multiple: true,
          has_value: true
        },
        {
          filter: 'starts_host_address',
          display: 'hostname starts with',
          allow_multiple: true,
          has_value: true
        },
        {
          filter: 'not_starts_host_address',
          display: 'hostname does not start with',
          allow_multiple: true,
          has_value: true
        },
        {
          filter: 'contains_host_address',
          display: 'hostname contains',
          allow_multiple: true,
          has_value: true
        },
        {
          filter: 'not_contains_host_address',
          display: 'hostname does not contain',
          allow_multiple: true,
          has_value: true
        }
      ]
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
        this.pagination.discoveredDateTimePicker =
          discoverDate.getTime() * 1000000; // 1000000 (ns)
        this.pagination.seenDateTimePicker = seenDate.getTime() * 1000000; // 1000000 (ns)
        // force reset
        this.refreshTable();
      } catch (e) {
        console.log(e);
        this.pagination.discoveredDateTimePicker = 0;
        this.pagination.seenDateTimePicker = 0;
      }
    },
    updateSearchFilters(newFilters) {
      this.selectedFilters = newFilters;
    },
    formatColumn(row, column, cellValue) {
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
        params.after_discovered_time = this.pagination.discoveredDateTimePicker;
      }

      if (
        !Number.isNaN(this.pagination.seenDateTimePicker) &&
        this.pagination.seenDateTimePicker !== 0
      ) {
        params.after_seen_time = this.pagination.seenDateTimePicker;
      }

      this.selectedFilters.map(v => {
        if (v.has_value === false) {
          params[v.filter] = true;
          return;
        } else if (v.allow_multiple === false) {
          params[v.filter] = v.value;
          return;
        } else if (params[v.filter] === undefined) {
          params[v.filter] = [];
        }
        params[v.filter].push(v.value);
      });
      console.log(params);
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
        state.complete();
        handleErrors(this.$store.dispatch, 'getting addresses', err);
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
    onDetailsClick() {
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
