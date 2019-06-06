<template>

      <card :header-classes="'text-right'">
        <template slot="header">
          <h6 class="title d-inline">Certificates</h6>
          <p class="card-category d-inline"></p>
          <base-button type="danger" icon size="sm" @click="closeCertificates" class="btn-link">
            <i class="tim-icons icon-simple-remove"></i>
          </base-button>
        </template>
        <!-- start table -->
        <el-table ref="certificateTable" :data="tableData">
          <el-table-column
            v-for="column in tableColumns"
            :key="column.label"
            :min-width="column.minWidth"
            :prop="column.prop"
            :formatter="formatColumn"
            :label="column.label"
          >
            <template slot-scope="scope">
              <div v-if="column.prop === 'host_address'">
                <p>Host: {{ scope.row.host_address }}</p>
                <p v-if="scope.row.ip_address !== ''">IP: {{ scope.row.ip_address }}</p>
                <p>Issuer: {{ scope.row.issuer }}</p>
                <p>Subject Name: {{ scope.row.subjectName}}</p>
              </div>
              <div v-else-if="column.prop === 'validity'">
                <p>Valid From: {{ formatUnixTime(scope.row.validFrom) }}</p>
                <p>Valid To: {{ formatUnixTime(scope.row.validTo) }}</p>
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
              <div slot="no-more">
                <router-link :to="'/webdata/certificates/'+ group_id">See all certificates...</router-link>
              </div>
              <div slot="no-results">
                <router-link :to="'/webdata/certificates/'+ group_id">See all certificates...</router-link>
              </div>
            </infinite-loading>
          </template>
        </el-table>
      </card>
</template>
<script>
import { Table, TableColumn } from 'element-ui';
import { Collapse, CollapseItem } from 'src/components';
import moment from 'moment';
import InfiniteLoading from 'vue-infinite-loading';
import { unixNanoToMinDate, unixTimeToMinDate } from 'src/data/time.js';
import { mapGetters, mapState } from 'vuex';
import API from 'src/api/api.js';

export default {
  name: 'filtered-certificates-expiring',
  components: {
    InfiniteLoading,
    Collapse,
    CollapseItem,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn
  },
  props: {
    group_id: {
      type: Number
    },
    expire_time: {
      type: Number,
      default: 0
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
      tableColumns: [
        {
          prop: 'host_address',
          label: 'Details',
          minWidth: 120
        },
        {
          prop: 'validity',
          label: 'Validity',
          minWidth: 40
        }
      ],
      tableData: []
    };
  },
  methods: {
    closeCertificates() {
      this.$emit('close');
    },
    refreshTable() {
      this.pagination.lastIndex = 0;
      this.tableData = [];
      let state = this.$refs.infiniteLoader.stateChanger;
      state.reset();
    },
    filterSince() {
      try {
        let date = new Date(this.dateTimePicker);
        this.pagination.sinceTimeTaken = date.getTime() * 1000000;
        // force reset
        this.refreshTable();
      } catch (e) {
        console.log(e);
        this.pagination.sinceTimeTaken = 0;
      }
    },
    loadCertificateTable(value) {
      if (value === true) {
        this.refreshTable();
      }
    },
    formatNSTime(value) {
      return unixNanoToMinDate(value);
    },
    formatUnixTime(value) {
      return unixTimeToMinDate(value);
    },
    formatHeaders(value) {
      return value;
    },
    formatColumn(row, column, cellValue) {
      switch (column.property) {
        case 'response_timestamp':
          return this.formatNSTime(cellValue);
      }
      return cellValue;
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
      if (this.pagination.sinceTimeTaken !== 0) {
        params.since_response_time = this.pagination.sinceTimeTaken;
      }
      if (this.expire_time !== 0) {
        params.before_valid_to = moment()
          .add(30, 'days')
          .unix();
        params.after_valid_to = moment().unix();
      }
      try {
        let response = await API.get(
          '/webdata/group/' + this.group_id + '/certificates',
          {
            params: params
          }
        );

        if (
          response.data.certificates === null ||
          response.data.certificates.length === 0
        ) {
          state.complete();
          return;
        }
        this.tableData.push(...response.data.certificates);
        state.loaded();

        this.pagination.lastIndex = response.data.last_index;
        this.pagination.count = this.tableData.length;
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
        all: true
      };

      this.$store.dispatch('webdata/EXPORT_CERTIFICATES', details);
      return true;
    }
  },
  mounted() {
    this.loadCertificateTable();
  },
  created() {},
  watch: {
    isUpdating(val, oldValue) {
      // reset the table data after we delete/ignore/unignore values
      if (val === false && oldValue === true) {
        this.pagination.lastIndex = 0;
        this.tableData = [];
      }
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
