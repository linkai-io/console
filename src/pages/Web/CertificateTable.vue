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
            <div>
              <base-button
                type="secondary"
                :round="true"
                :loading="updating"
                @click.native="handleExport"
              >Export all</base-button>
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
                  <div v-if="column.prop === 'validFrom'">{{ formatTime(scope.row.validFrom) }}</div>
                  <div v-else-if="column.prop === 'validTo'">{{ formatTime(scope.row.validTo) }}</div>
                  <div
                    v-else-if="column.prop === 'response_timestamp'"
                  >{{ formatTime(scope.row.response_timestamp) }}</div>
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
                ></infinite-loading>
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
      /*
      'organization_id'
      'group_id'
      'certificate_id' // from DB
      'response_timestamp'
      'host_address'
      'port'
      'protocol'                          // Protocol name (e.g. "TLS 1.2" or "QUIC").
      'keyExchange'                       // Key Exchange used by the connection, or the empty string if not applicable.
      'keyExchangeGroup'        // (EC)DH group used by the connection, if applicable.
      'cipher'                            // Cipher name.
      'mac'                     // TLS MAC. Note that AEAD ciphers do not have separate MACs.
      'certificateId'                     // from browser                    // Certificate ID value.
      'subjectName'                       // Certificate subject name.
      'sanList'                           // Subject Alternative Name (SAN) DNS names and IP addresses.
      'issuer'                            // Name of the issuing CA.
      'validFrom'                         // Certificate valid from date.
      'validTo'                           // Certificate valid to (expiration) date
      'certificateTransparencyCompliance' // Whether the request complied with Certificate Transparency policy enum values: unknown, not-compliant, compliant
      'is_deleted'
      */
      tableColumns: [
        {
          prop: 'host_address',
          label: 'Host',
          minWidth: 60
        },
        {
          prop: 'port',
          label: 'Port',
          minWidth: 25
        },
        {
          prop: 'protocol',
          label: 'Protocol',
          minWidth: 40
        },
        {
          prop: 'cipher',
          label: 'Cipher',
          minWidth: 40
        },
        {
          prop: 'subjectName',
          label: 'Subject Name',
          minWidth: 50
        },
        {
          prop: 'issuer',
          label: 'Issued By',
          minWidth: 50
        },
        {
          prop: 'validFrom',
          label: 'Valid From',
          minWidth: 40
        },
        {
          prop: 'validTo',
          label: 'Valid Until',
          minWidth: 40
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
    filterSince() {
      //let date =
      try {
        let date = new Date(this.dateTimePicker);
        this.pagination.sinceTimeTaken = date.getTime();
        // force reset
        this.pagination.lastIndex = 0;
        this.tableData = [];
        this.getTableData(this.$refs.infiniteLoader.stateChanger);
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
    formatTime(value) {
      if (value === 0) {
        return 'NA';
      }
      let d = new Date();
      return (
        [d.getMonth() + 1, d.getDate(), d.getFullYear()].join('/') +
        ' ' +
        [
          d.getHours(),
          new String(d.getMinutes()).padStart(2, '0'),
          new String(d.getSeconds()).padStart(2, '0')
        ].join(':')
      );
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
          '/webdata/group/' + this.group_id + '/certificates',
          {
            params: params
          }
        );

        if (response.data.certificates.length <= 1) {
          state.complete();
          return;
        }
        this.tableData.push(...response.data.certificates);
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
        all: true
      };

      this.$store.dispatch('webdata/EXPORT_CERTIFICATES', details);
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
    isUpdating(val) {
      // reset the table data after we delete/ignore/unignore values
      if (val === false) {
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
