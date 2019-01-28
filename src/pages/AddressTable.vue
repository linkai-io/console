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
            <base-input>
                <el-input
                  type="search"
                  class="mb-3 search-input"
                  clearable
                  prefix-icon="el-icon-search"
                  placeholder="Search records"
                  v-model="searchQuery"
                  aria-controls="datatables"
                >
                </el-input>
              </base-input>
            <base-button
              type="primary"
              :round="true"
              :disabled="!hasMultiSelected"
              @click.native="handleMultiDelete"
              >Delete
            </base-button>
            <base-button
              type="primary"
              :round="true"
              :disabled="!hasMultiSelected"
              @click.native="handleMultiIgnore"
              >Ignore
            </base-button>
            <base-button
              type="primary"
              :round="true"
              :disabled="!hasMultiSelected"
              @click.native="handleMultiUnignore"
              >Unignore
            </base-button>
            <base-button
              type="primary"
              :round="true"
              :disabled="!hasMultiSelected"
              @click.native="handleMultiExport"
              >Export selected
            </base-button>
            <base-button
              type="secondary"
              :round="true"
              :loading="updating"
              @click.native="handleExport"
              >Export all
            </base-button>
          </div>
          <div class="text-right col-sm-12 ml-auto">
            Showing {{ count }} of {{ total }} entries.
          </div>
          <div class="col-sm-12">
          <el-table 
            ref="addressTable" 
            :data="tableData"
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              type="selection"
              width="55">
            </el-table-column>
            <el-table-column
                v-for="column in tableColumns"
                :key="column.label"
                :min-width="column.minWidth"
                :prop="column.prop"
                sortable
                :label="column.label"
            ></el-table-column>

            <el-table-column
            min-width="150"
              header-align="right"
              align="right"
              label="Actions"
            >
              <div
                slot-scope="{
                  row,
                  $index
                }"
                class="text-right table-actions"
              >
                <el-tooltip
                  content="Ignore Host"
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

                    <i v-if="row.ignored" class="tim-icons icon-simple-delete"></i>
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
                slot="append"
                spinner="waveDots"
                :distance="10"
                @infinite="getTableData"
                >
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
          minWidth: 60
        },
        {
          prop: 'discovery_time',
          label: 'Discovered',
          minWidth: 100
        },
        {
          prop: 'discovered_by',
          label: 'Discovered By',
          minWidth: 60
        },
        {
          prop: 'last_scanned_time',
          label: 'Last Scanned',
          minWidth: 40
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
          prop: 'user_confidence_score',
          label: 'User Confidence',
          minWidth: 40
        },
        {
          prop: 'is_wildcard_zone',
          label: 'Wildcard Zone',
          minWidth: 40
        },
        {
          prop: 'is_hosted_service',
          label: 'Hosted Service',
          minWidth: 40
        },
        {
          prop: 'ignored',
          label: 'Ignored',
          minWidth: 20
        },
        {
          prop: 'found_from',
          label: 'Found From',
          minWidth: 60
        },
        {
          prop: 'ns_record',
          label: 'NS Record',
          minWidth: 30
        },
        {
          prop: 'address_hash',
          label: 'Address Hash',
          minWidth: 60
        }
      ],
      tableData: [],
      multipleSelection: [],
      fuseSearch: null
    };
  },
  methods: {
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

        if (response.data.addresses.length <= 1) {
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
    handleIgnore(index, row) {
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
        address_ids: [row.address_id],
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
