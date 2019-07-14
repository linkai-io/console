<template>
  <div class="content">
    <div class="col-md-8 ml-auto mr-auto">
      <h2 class="text-center">{{group.group_name}}</h2>
    </div>
    <div class="row">
      <div class="col-12">
        <card card-body-classes="table-full-width">
          <h4 slot="header" class="card-title">Port Scan Results</h4>
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
            <el-table 
              header-row-class-name="border-bottom"
              ref="hostTable" :data="tableData">
              <el-table-column
                v-for="column in tableColumns"
                :key="column.label"
                :min-width="column.minWidth"
                :prop="column.prop"
                sortable
                :label="column.label"
                class=""
              >
                <template slot-scope="scope">
                  <div v-if="column.prop === 'host_address'" style="vertical-align: middle;" class="mb-3 port-border-right">{{ scope.row.host_address }}</div>

                  <!-- start scan results -->
                  <div v-else-if="column.prop === 'current'" class="mb-3 port-border-right">
                    <div class="row" v-if="hasPorts(scope.row.port_data.current.tcp_ports)">
                      <h6 class="col-sm-6">TCP Port</h6>
                      <h6 class="col-sm-6">Service</h6>
                    </div>
                    <div class="row" v-else>
                      <div class="col-sm-12">No open ports identified</div>
                    </div>
                    <div
                      v-for="port in scope.row.port_data.current.tcp_ports"
                      class="row"
                      :key="port"
                    >
                      <div class="col-sm-6">
                        <span class="open-port"></span>
                        &nbsp;{{port}}
                      </div>
                      <div class="col-sm-6">{{formatValues('tcp', port)}}</div>
                    </div>
                    <div class="row">
                      <div class="col-sm-12"></div>
                    </div>
                    <div class="row mt-4">
                      <div class="col-sm-6">IP Address:</div>
                      <div class="col-sm-6">{{ scope.row.port_data.current.ip_address }}</div>
                    </div>
                    <div class="row mt-1">
                      <div class="col-sm-6">Last Scanned:</div>
                      <div
                        class="col-sm-6"
                      >{{ formatValues('timestamp', scope.row.scanned_timestamp) }}</div>
                    </div>
                  </div>
                  <!-- end  scan results -->

                  <!-- start previous scan results -->
                  <div v-else-if="column.prop === 'previous'" class="mb-3">
                    <div class="row" v-if="hasPorts(scope.row.port_data.previous.tcp_ports)" >
                      <h6 class="col-sm-6">TCP Port</h6>
                      <h6 class="col-sm-6">Service</h6>
                    </div>
                    <div class="row" v-else>
                      <div class="col-sm-12">No open ports identified</div>
                    </div>
                    <div
                      v-for="port in scope.row.port_data.previous.tcp_ports"
                      class="row"
                      :key="port"
                    >
                      <div class="col-sm-6">
                        <span class="open-port"></span>
                        &nbsp;{{port}}
                      </div>
                      <div class="col-sm-6">{{formatValues('tcp', port)}}</div>
                    </div>
                    <div class="row">
                      <div class="col-sm-12"></div>
                    </div>
                    <div class="row mt-4" v-if="scope.row.port_data.previous.ip_address !== ''">
                      <div class="col-sm-6">IP Address:</div>
                      <div class="col-sm-6">{{ scope.row.port_data.previous.ip_address }}</div>
                    </div>
                    <div class="row mt-1" v-if="scope.row.port_data.previous.ip_address !== ''">
                      <div class="col-sm-6">Last Scanned:</div>
                      <div
                        class="col-sm-6"
                      >{{ formatValues('timestamp', scope.row.previous_scanned_timestamp) }}</div>
                    </div>
                  </div>
                  <!-- end previous scan results -->
                </template>
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
import { Table, TableColumn, Select, Option } from 'element-ui';
//import { Collapse, CollapseItem } from 'src/components';
import InfiniteLoading from 'vue-infinite-loading';
import { Collapse, CollapseItem } from 'src/components';
import { unixNanoToMinDate } from 'src/data/time.js';
import { mapGetters, mapState } from 'vuex';
import { formatTCPPort } from 'src/data/formatters.js';
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
        lastIndex: 0,
        limit: 100,
        count: 0
      },
      tableColumns: [
        {
          prop: 'host_address',
          label: 'Hostname',
          minWidth: 40
        },
        {
          prop: 'current',
          label: 'Current Results',
          minWidth: 80
        },
        {
          prop: 'previous',
          label: 'Previous Results',
          minWidth: 80
        }
      ],
      tableData: [],
      multipleSelection: []
    };
  },
  methods: {
    hasPorts(ports) {
      if (ports === null || ports.length === 0) {
        return false;
      }
      return true;
    },
    formatValues(prop, value) {
      switch (prop) {
        case 'timestamp':
          return unixNanoToMinDate(value);
        case 'tcp':
          return formatTCPPort(value);
      }
      return value;
    },

    async getTableData(state) {
      if (state === undefined) {
        return;
      }

      this.loading = true;
      let limit = this.pagination.limit;
      let start = this.pagination.lastIndex;

      try {
        let response = await API.get(
          '/address/group/' + this.group_id + '/ports',
          {
            params: {
              start: start,
              limit: limit,
              equals_confidence: 100
            }
          }
        );
        if (response.data.ports == null || response.data.ports.length === 0) {
          state.complete();
          return;
        }
        this.tableData.push(...response.data.ports);
        state.loaded();

        this.pagination.lastIndex = response.data.last_index;
        this.pagination.count = this.tableData.length;
      } catch (err) {
        console.log(err);
        state.complete();
      } finally {
        this.loading = false;
      }
    },
    refreshTable() {
      this.pagination.lastIndex = 0;
      this.tableData = [];
      let state = this.$refs.infiniteLoader.stateChanger;
      state.reset();
    },
    handleExport() {
      let details = {
        group_id: this.group_id
      };

      this.$store.dispatch('addresses/EXPORT_PORTS', details);
      return true;
    }
  },
  mounted() {},
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
<style scoped>
.port-divider {
  border: none;
  height: 1px;
  /* Set the hr color */
  color: rgb(95, 93, 93); /* old IE */
  background-color: rgb(95, 93, 93); /* Modern Browsers */
}

.open-port {
  color: rgb(64, 255, 6);
}

.open-port::before {
  color: rgb(64, 255, 6);
  content: '•';
  float: left;
  font-size: 2em;
}

.port-border-right {
    border-right: 0.0625rem solid rgba(255, 255, 255, 0.1) !important;
}

.port-border-bottom {
    border-bottom: 0.0625rem solid rgba(255, 255, 255, 0.1) !important;
}

.el-table table tbody tr td {
  vertical-align: top;
}

</style>
