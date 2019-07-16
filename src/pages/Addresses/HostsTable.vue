<template>
  <div class="content">
    <div class="col-md-8 ml-auto mr-auto">
      <h2 class="text-center">{{group.group_name}}</h2>
    </div>
    <div class="row mt-5">
      <div class="col-12">
        <card card-body-classes="table-full-width">
          <h4 slot="header" class="card-title">Hostnames</h4>
          <div class="col-sm-12">
            
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
                size="sm"
                :loading="updating"
                @click.native="refreshTable"
              >
                <i class="tim-icons icon-refresh-02"></i>
              </base-button>
            </div>
          </div>
          <div class="text-right col-sm-12 ml-auto">Showing {{ count }} entries.</div>
          <div class="col-sm-12">
            <!-- start table -->
            <el-table ref="hostTable" :data="tableData" @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="55"></el-table-column>
              <el-table-column
                v-for="column in tableColumns"
                :key="column.label"
                :min-width="column.minWidth"
                :prop="column.prop"
                sortable
                :label="column.label"
              >
                <template slot-scope="scope">
                  <div v-if="column.prop ==='ip_addresses'">
                    <collapse accordion >
                      <collapse-item :title="'('+scope.row.ip_addresses.length+')'">
                        <div v-for="(ip_address, index) in scope.row.ip_addresses" :key="index">{{ip_address}}</div>
                      </collapse-item>
                    </collapse>
                  </div>
                  <div v-else-if="column.prop === 'etld'">{{ scope.row.etld }}</div>
                  <div v-else-if="column.prop === 'host_address'">{{ scope.row.host_address }}</div>
                </template>
              </el-table-column>

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
                  :distance="100"
                  @infinite="getTableData"
                >
                  <div slot="no-more">No more hosts</div>
                </infinite-loading>
              </template>
            </el-table>
            Showing {{ count }} entries.
          </div>
        </card>
      </div>
    </div>
  </div>
</template>
<script>
import { Table, TableColumn, Select, Option, } from 'element-ui';
//import { Collapse, CollapseItem } from 'src/components';
import InfiniteLoading from 'vue-infinite-loading';
import {Collapse, CollapseItem} from 'src/components'
import { unixNanoToMinDate } from 'src/data/time.js';
import { mapGetters, mapState } from 'vuex';
import { formatNSRecord } from 'src/data/formatters.js';
import API from 'src/api/api.js';
export default {
  components: {
    InfiniteLoading,
    Collapse,
    CollapseItem,
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
    updating() {
      return this.isUpdating;
    }
  },
  data() {
    return {
      pagination: {
        lastHost: '',
        limit: 100,
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
          prop: 'etld',
          label: 'Effective TLD',
          minWidth: 80
        },
        {
          prop: 'host_address',
          label: 'Hostname',
          minWidth: 80
        },
        {
          prop: 'ip_addresses',
          label: 'IP Addresses',
          minWidth: 80
        }
      ],
      tableData: [],
      multipleSelection: []
    };
  },
  methods: {
    async getTableData(state) {
      if (state === undefined) {
        return;
      }

      this.loading = true;
      let limit = this.pagination.limit;
      let start = this.pagination.lastHost;

      try {
        let response = await API.get(
          '/address/group/' + this.group_id + '/hosts',
          {
            params: {
              starts_host_address: start,
              limit: limit,
              equals_confidence: 100
            }
          }
        );
        if (response.data.hosts == null || response.data.hosts.length === 0) {
          state.complete();
          return;
        }
        this.tableData.push(...response.data.hosts);
        state.loaded();

        this.pagination.lastHost = response.data.last_host;
        this.pagination.count = this.tableData.length;
      } catch(err) {
        console.log(err);
        state.complete();
      } finally {
        this.loading = false;
      }
    },
    refreshTable() {
      this.pagination.lastHost = '';
      this.tableData = [];
      let state = this.$refs.infiniteLoader.stateChanger;
      state.reset();
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
          this.$refs.hostTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.hostTable.clearSelection();
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
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
      };

      this.$store.dispatch('addresses/EXPORT_HOSTS', details);
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
    
  },
  created() {},
  watch: {
    isUpdating(val, oldValue) {
      // reset the table data after we delete/ignore/unignore values
      if (val === false && oldValue === true) {
        this.pagination.lastHost = '';
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
<style lang="scss" scoped>

.pagination-select,
.search-input {
  width: 200px;
}
.el-table {
  overflow: hidden;
  position: relative;
}
</style>
