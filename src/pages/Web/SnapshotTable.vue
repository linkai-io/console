<template>
  <div class="content">
    <div class="col-md-8 ml-auto mr-auto">
      <h2 class="text-center">{{group.group_name}}</h2>
    </div>
    <div class="row mt-5">
      <div class="col-12">
        <card card-body-classes="table-full-width">
          <h4 slot="header" class="card-title">Response Data</h4>
          <div>
            <base-button
              type="secondary"
              :round="true"
              :loading="updating"
              @click.native="handleExport"
            >Export all</base-button>
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
              ></el-table-column>

              <template slot="append">
                <infinite-loading
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
      tableColumns: [
        {
          prop: 'snapshot_link',
          label: 'Image',
          minWidth: 60,
        },
        {
          prop: 'address_id_host_address',
          label: 'Host',
          minWidth: 60
        },
        {
          prop: 'address_id_ip_address',
          label: 'IP Address',
          minWidth: 60
        },
        {
          prop: 'serialized_dom_link',
          label: 'Link to HTML',
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
    formatColumn(row, column, cellValue, index) {
      switch (column.property) {
        case 'snapshot_link':
          return this.formatImage(cellValue);
        case 'serialized_dom_link':
          return this.formatLink(cellValue);
        case 'response_timestamp':
          return this.formatTime(cellValue);
      }
      return cellValue;
    },
    formatImage(value) {
      return new Image().src = '/data/'+value;
    },
    formatLink(value) {
      return '<a href="/data/'+value+'">'+value+'</a>';
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
      try {
        let response = await API.get('/web/snapshots/' + this.group_id, {
          params: {
            start: start,
            limit: limit
          }
        });

        if (response.data.snapshots.length <= 1) {
          state.complete();
          return;
        }
        this.tableData.push(...response.data.snapshots);
        state.loaded();

        this.pagination.lastIndex = response.data.last_index;
        this.pagination.count = this.tableData.length;
        //this.pagination.total = response.data.total;
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
