<template>
  <div class="content">
    <div class="col-md-8 ml-auto mr-auto">
      <h2 class="text-center">{{group.group_name}}</h2>
    </div>
    <div class="row mt-5">
      <div class="col-12">
        <card card-body-classes="table-full-width">
          <h4 slot="header" class="card-title">Address Data</h4>
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
              ><i class="tim-icons icon-refresh-02"></i>            
              </base-button>
          </div>
          </div>
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

              <el-table-column min-width="30" header-align="right" align="right" label="Actions">
                <div
                  slot-scope="{
                  row,
                  $index
                }"
                  class="text-right table-actions"
                >
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
import { Table, TableColumn, Select, Option } from 'element-ui';
import InfiniteLoading from 'vue-infinite-loading';
import { unixNanoToMinDate } from 'src/data/time.js';
import { mapGetters, mapState } from 'vuex';
import API from 'src/api/api.js';
import Fuse from 'fuse.js';
import swal from 'sweetalert2';

export default {
  components: {
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
      pagination: {
        lastIndex: 0,
        limit: 50,
        total: 0,
        count: 0
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
          prop: 'is_hosted_service',
          label: 'Hosted Service',
          minWidth: 40
        },
        {
          prop: 'ns_record',
          label: 'NS Record',
          minWidth: 30
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
    formatColumn(row, column, cellValue, index) {
      switch (column.property) {
        case 'ns_record':
          return this.formatNSRecord(cellValue);
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
    formatNSRecord(record) {
      switch (record) {
        case 0: 
          return 'NA';
        case 1:
          return 'A';
        case 2:
          return 'NS';
        case 3:
          return 'MD';
        case 4:
          return 'MF';
        case 5:
          return 'CNAME';
        case 6:
          return 'SOA';
        case 7:
          return 'MB';
        case 8:
          return 'MG';
        case 9:
          return 'MR';
        case 10:
          return 'NULL';
        case 12:
          return 'PTR';
        case 13:
          return 'HINFO';
        case 14:
          return 'MINFO';
        case 15:
          return 'MX';
        case 16:
          return 'TXT';
        case 17:
          return 'RP';
        case 18:
          return 'AFSDB';
        case 19:
          return 'X25';
        case 20:
          return 'ISDN';
        case 21:
          return 'RT';
        case 23:
          return 'NSAPPTR';
        case 24:
          return 'SIG';
        case 25:
          return 'KEY';
        case 26:
          return 'PX';
        case 27:
          return 'GPOS';
        case 28:
          return 'AAAA';
        case 29:
          return 'LOC';
        case 30:
          return 'NXT';
        case 31:
          return 'EID';
        case 32:
          return 'NIMLOC';
        case 33:
          return 'SRV';
        case 34:
          return 'ATMA';
        case 35:
          return 'NAPTR';
        case 36:
          return 'KX';
        case 37:
          return 'CERT';
        case 39:
          return 'DNAME';
        case 41:
          return 'OPT';
        case 43:
          return 'DS';
        case 44:
          return 'SSHFP';
        case 46:
          return 'RRSIG';
        case 47:
          return 'NSEC';
        case 48:
          return 'DNSKEY';
        case 49:
          return 'DHCID';
        case 50:
          return 'NSEC3';
        case 51:
          return 'NSEC3PARAM';
        case 52:
          return 'TLSA';
        case 53:
          return 'SMIMEA';
        case 55:
          return 'HIP';
        case 56:
          return 'NINFO';
        case 57:
          return 'RKEY';
        case 58:
          return 'TALINK';
        case 59:
          return 'CDS';
        case 60:
          return 'CDNSKEY';
        case 61:
          return 'OPENPGPKEY';
        case 62:
          return 'CSYNC';
        case 99:
          return 'SPF';
        case 100:
          return 'UINFO';
        case 101:
          return 'UID';
        case 102:
          return 'GID';
        case 103:
          return 'UNSPEC';
        case 104:
          return 'NID';
        case 105:
          return 'L32';
        case 106:
          return 'L64';
        case 107:
          return 'LP';
        case 108:
          return 'EUI48';
        case 109:
          return 'EUI64';
        case 256:
          return 'URI';
        case 257:
          return 'CAA';
        case 258:
          return 'AVC';
        case 249:
          return 'TKEY';
        case 250:
          return 'TSIG';
        case 251:
          return 'IXFR';
        case 252:
          return 'AXFR';
        case 253:
          return 'MAILB';
        case 254:
          return 'MAILA';
        case 255:
          return 'ANY';
      }
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
      try {
        let response = await API.get('/address/group/' + this.group_id, {
          params: {
            start: start,
            limit: limit
          }
        });
        console.log(response.data);
        if (response.data.addresses == null || response.data.addresses.length === 0) {
          state.complete();
          return;
        }
        this.tableData.push(...response.data.addresses);
        state.loaded();

        this.pagination.lastIndex = response.data.last_index;
        this.pagination.count = this.tableData.length;
        this.pagination.total = response.data.total;
      } finally {
        this.loading = false;
      }
    },
    handleIgnore(row) {
      console.log(row);
      let ignore_value = false;
      if (row.ignored === false) {
        ignore_value = true;
      }
      let details = {
        group_id: this.group_id,
        address_ids: [row.address_id],
        ignore_value: ignore_value
      };
      console.log(row);
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
      console.log("new: " + val + " old: " + oldValue);
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
