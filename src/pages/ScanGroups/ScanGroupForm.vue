<template>
  <div class="container">
    <div class="row">
      <el-tooltip
        content="The name of this group of addresses and hosts"
        effect="light"
        :open-delay="150"
        placement="right"
      >
        <label class="col-sm-2 col-form-label">Group Name</label>
      </el-tooltip>
      <div class="col-sm-7">
        <base-input
          name="group_name"
          required
          v-validate="modelValidations.group_name"
          v-model="model.group_name"
          :error="getError('group_name')"
        ></base-input>
      </div>
    </div>

    <div class="row">
      <el-tooltip
        content="Automatically archive stale records and results after the specified number of days"
        effect="light"
        :open-delay="150"
        placement="right"
      >
        <label class="col-sm-2 col-form-label">Archive Old Results After (Days)</label>
      </el-tooltip>
      <div class="col-sm-7">
        <base-input
          name="archive_after_days"
          required
          v-validate="modelValidations.archive_after_days"
          v-model.number="model.archive_after_days"
          :error="getError('archive_after_days')"
        ></base-input>
      </div>
    </div>

    <div class="row">
      <el-tooltip
        content="Limit the number of concurrent addresses to be tested at the same time."
        effect="light"
        :open-delay="150"
        placement="right"
      >
        <label class="col-sm-2 col-form-label">Concurrent Hosts</label>
      </el-tooltip>
      <div class="col-sm-7">
        <base-input
          name="concurrent_requests"
          required
          v-validate="modelValidations.concurrent_requests"
          v-model.number="model.concurrent_requests"
          :error="getError('concurrent_requests')"
        ></base-input>
      </div>
    </div>

    <div class="row">
      <el-tooltip
        content="Prepend these subdomain prefixes to all hostnames, on top of the default 10,000 included"
        effect="light"
        :open-delay="150"
        placement="right"
      >
        <label class="col-sm-2 col-form-label">Custom Sub Domains</label>
      </el-tooltip>
      <div class="col-sm-7">
        <base-text-area
          name="custom_sub_names"
          placeholder="sub1, sub2"
          v-model="model.custom_sub_names"
          :error="getError('custom_sub_names')"
        ></base-text-area>
      </div>
    </div>

    <div v-if="canPortScan">
      <div class="row">
        <label class="col-6 col-form-label mt-2 mb-2">Enable Port Scanning</label>
        <div class="col-6 mb-2">
          <base-checkbox v-model="model.port_scan_enabled"></base-checkbox>
        </div>
      </div>

      <div v-if="model.port_scan_enabled">
        <hr>
        <!-- disallowed TLDs -->
        <div class="row">
          <el-tooltip
            content="Enter the TLDs (such as example.com) to disallow all domains and subdomains that fall under this domain name"
            effect="light"
            :open-delay="150"
            placement="right"
          >
            <label class="col-sm-2 col-form-label">Disallowed Top Level Domains (TLDs)</label>
          </el-tooltip>
          <div class="col-sm-7">
            <base-text-area
              name="disallowed_tlds"
              placeholder="dontscanme.com"
              v-model="model.disallowed_tlds"
              :error="getError('disallowed_tlds')"
            ></base-text-area>
          </div>
        </div>
        <!-- disallowed hosts -->
        <div class="row">
          <el-tooltip
            content="Enter hostnames (such as example.com, sub.example.com) to disallow port scanning of these hosts even if in allowed TLD list)"
            effect="light"
            :open-delay="150"
            placement="right"
          >
            <label class="col-sm-2 col-form-label">Disallowed Hosts</label>
          </el-tooltip>
          <div class="col-sm-7">
            <base-text-area
              name="disallowed_hosts"
              placeholder="sub.dontscanme.com"
              v-model="model.disallowed_hosts"
              :error="getError('disallowed_hosts')"
            ></base-text-area>
          </div>
        </div>

        <!-- Allowed TLDs -->
        <div class="row">
          <el-tooltip
            content="Enter the TLDs (such as example.com) to allow all domains and subdomains that fall under this domain name to be scanned"
            effect="light"
            :open-delay="150"
            placement="right"
          >
            <label class="col-sm-2 col-form-label">Allowed Top Level Domains (TLDs)</label>
          </el-tooltip>
          <div class="col-sm-7">
            <base-text-area
              name="allowed_tlds"
              placeholder="scanme.com"
              v-model="model.allowed_tlds"
              :error="getError('allowed_tlds')"
            ></base-text-area>
          </div>
        </div>
        <!-- Allowed hosts -->
        <div class="row">
          <el-tooltip
            content="Enter hostnames (such as example.com, sub.example.com) to allow port scanning of these hosts even if in disallowed TLD list"
            effect="light"
            :open-delay="150"
            placement="right"
          >
            <label class="col-sm-2 col-form-label">Allowed Hosts</label>
          </el-tooltip>
          <div class="col-sm-7">
            <base-text-area
              name="allowed_hosts"
              placeholder="sub.scanme.com"
              v-model="model.allowed_hosts"
              :error="getError('allowed_hosts')"
            ></base-text-area>
          </div>
        </div>
        <!-- ports per second -->
        <div class="row">
          <el-tooltip
            content="Limit the number of ports tested per second for each host."
            effect="light"
            :open-delay="150"
            placement="right"
          >
            <label class="col-sm-2 col-form-label">Ports Per Second</label>
          </el-tooltip>
          <div class="col-sm-7">
            <base-input
              name="ports_per_second"
              required
              v-validate="modelValidations.ports_per_second"
              v-model.number="model.ports_per_second"
              :error="getError('ports_per_second')"
            ></base-input>
          </div>
        </div>
        <!-- tcp ports field -->
        <div class="row">
          <el-tooltip
            content="Attempt to find web servers on non-standard ports (only 80,443 will be tested by default)"
            effect="light"
            :open-delay="150"
            placement="right"
          >
            <label class="col-sm-2 col-form-label">TCP Ports</label>
          </el-tooltip>
          <div class="col-sm-7">
            <base-text-area
              name="tcp_ports"
              placeholder="8080, 4443"
              valueType="integer"
              v-model="model.tcp_ports"
              validate
              @validation="checkValidArray('tcp_ports', $event)"
              :error="getError('tcp_ports')"
            ></base-text-area>
          </div>
        </div>
        <!-- ports table view -->
        <div class="row">
          <el-tooltip
            content="Attempt to find web servers on non-standard ports (only 80,443 will be tested by default)"
            effect="light"
            :open-delay="150"
            placement="right"
          >
            <label class="col-sm-2 col-form-label">Custom Web Ports</label>
          </el-tooltip>
          <div class="col-sm-7">
            <base-text-area
              name="custom_web_ports"
              placeholder="8080, 4443"
              valueType="integer"
              v-model="model.custom_web_ports"
              validate
              @validation="checkValidArray('custom_web_ports', $event)"
              :error="getError('custom_web_ports')"
            ></base-text-area>
          </div>
        </div>
      </div>
    </div>
    <!-- PORT SCANNING NOT ENABLED FOR THIS ORGANIZATION -->
    <div v-else>
      <div class="row">
        <el-tooltip
          content="Attempt to find web servers on non-standard ports (only 80,443 will be tested by default)"
          effect="light"
          :open-delay="150"
          placement="right"
        >
          <label class="col-sm-2 col-form-label">Custom Web Ports</label>
        </el-tooltip>
        <div class="col-sm-7">
          <base-text-area
            name="custom_ports"
            placeholder="8080, 4443"
            valueType="integer"
            v-model="model.custom_web_ports"
            :error="getError('custom_web_ports')"
          ></base-text-area>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  BaseAlert,
  TextFileUpload,
  BaseSwitch,
  BaseTable,
  BaseTextArea,
  RawTextArea,
  Modal
} from 'src/components/index';
import { Table, TableColumn } from 'element-ui';
import { mapGetters } from 'vuex';

export default {
  name: 'scan-group-form',
  components: {
    TextFileUpload,
    Modal,
    BaseAlert,
    BaseSwitch,
    BaseTable,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    BaseTextArea,
    RawTextArea
  },
  props: {
    group: {
      type: Object,
      default: function() {
        return {};
      }
    },
    config: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      text_addresses: '',
      model: {
        group_name: '',
        port_scan_enabled: false,
        archive_after_days: 5,
        custom_sub_names: [],
        custom_web_ports: [],
        tcp_ports: [],
        allowed_tlds: [],
        allowed_hosts: [],
        disallowed_tlds: [],
        disallowed_hosts: [],
        ports_per_second: 5,
        concurrent_requests: 10
      },
      modelValidations: {
        group_name: {
          required: true,
          regex: /^((?!\/).)*$/
        },
        archive_after_days: {
          required: true,
          min_value: 2,
          max_value: 14
        },
        concurrent_requests: {
          required: true,
          min_value: 1,
          max_value: 20
        },
        ports_per_second: {
          required: false,
          min_value: 5,
          max_value: 50
        },
        tcpports: {
          required: true,
          min_value: 1,
          max_value: 65535
        }
      },
      ports: [],
      default_tcp_ports: [
        21,
        22,
        23,
        25,
        53,
        80,
        135,
        139,
        443,
        445,
        1443,
        1723,
        3306,
        3389,
        5432,
        5900,
        6379,
        8000,
        8080,
        8443,
        8500,
        9500,
        27017
      ],
      default_web_ports: [80, 443, 8000, 8080, 8443, 8500, 9500]
    };
  },
  computed: {
    ...mapGetters('user', ['canPortScan']),
    ...mapGetters('scangroup', ['isUpdating', 'groupStats']),
    ...mapGetters('auth', ['subscriptionID']),
    deleteDisabled: function() {
      if (this.isUpdating) {
        return true;
      }
      switch (this.subscriptionID) {
        case '101':
          return true;
      }
      return false;
    }
  },
  methods: {
    addWebPort(port, evt) {
      console.log(port);
      console.log(evt);
    },
    setPortScanning() {
      console.log(this.model.port_scan_enabled);
      this.model.port_scan_enabled = !this.model.port_scan_enabled;
    },
    getError(fieldName) {
      return this.errors.first(fieldName);
    },
    checkValidArray(fieldName, evt) {
      if (evt === '') {
        this.errors.remove(fieldName);
        return;
      }
     this.errors.add({field: fieldName, msg: evt});
    },
    validate() {
      this.$validator.validateAll().then(isValid => {
        console.log('validate called');
        if (!isValid) {
          return;
        }

        // ugh
        this.model.custom_ports = this.model.custom_ports
          .map(e => parseInt(e, 10))
          .filter(function(val) {
            if (val === null || Number.isNaN(val)) {
              return false;
            }
            return true;
          });

        this.model.custom_sub_names = this.model.custom_sub_names
          .map(e => e)
          .filter(function(val) {
            if (val === '') {
              return false;
            }
            return true;
          });

        this.model.concurrent_requests = parseInt(
          this.model.concurrent_requests,
          10
        );

        let details = {
          updates: this.model,
          group_id: this.group.group_id,
          original_name: this.group.group_name
        };
        this.$store.dispatch('scangroup/UPDATE_GROUP', details);
      });
    }
  },
  created() {},
  mounted() {
    let tcpPorts = [];
    if (this.model.tcp_ports.length === 0) {
      this.model.tcp_ports = this.default_tcp_ports;
      this.model.custom_web_ports = this.default_web_ports;
      return;
    }
  }
};
</script>
<style lang="scss">
.el-table__body-wrapper > table > tbody > tr > td {
  padding-top: 2px;
  padding-bottom: 2px;
  border: none;
}
</style>
