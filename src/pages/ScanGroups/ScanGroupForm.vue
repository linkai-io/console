<template>
  <div class="container">
    <!-- group field -->
    <div class="row">
      <h6 class="col-sm-2 text-right">Setting</h6>
      <h6 class="col-sm-7">Value</h6>
      <h6 class="col-sm-2">Help</h6>
    </div>

    <div class="row">
      <label class="col-sm-2 col-form-label">Group Name</label>
      <div class="col-sm-7">
        <base-input
          name="group_name"
          required
          v-validate="modelValidations.group_name"
          v-model="model.group_name"
          :error="getError('group_name')"
        ></base-input>
      </div>
      <div class="col-sm-2">
        <base-button type="info" icon size="sm" class="btn-link" @click="showHelp('group_name')">
          <i
            :class="helpers.group_name ? 'tim-icons icon-minimal-down' : 'tim-icons icon-minimal-up'"
          ></i>
        </base-button>
      </div>
    </div>

    <div v-show="helpers.group_name" class="row">
      <div class="col-sm-2"></div>
      <p
        class="col-sm-7"
      >Enter the name of this group of addresses and hosts, group names must be unique</p>
    </div>
    <!-- end group field -->

    <!-- archive field -->
    <div class="row">
      <label class="col-sm-2 col-form-label">Archive Old Results After (Days)</label>
      <div class="col-sm-7">
        <base-input
          name="archive_after_days"
          required
          v-validate="modelValidations.archive_after_days"
          v-model.number="model.archive_after_days"
          :error="getError('archive_after_days')"
        ></base-input>
      </div>
      <div class="col-sm-2">
        <base-button
          type="info"
          icon
          size="sm"
          class="btn-link"
          @click="showHelp('archive_after_days')"
        >
          <i
            :class="helpers.archive_after_days ? 'tim-icons icon-minimal-down' : 'tim-icons icon-minimal-up'"
          ></i>
        </base-button>
      </div>
    </div>

    <div v-show="helpers.archive_after_days" class="row">
      <div class="col-sm-2"></div>
      <div class="col-sm-7">
        <p>Enter the number of days (from 2 to 14) for when outdated records should be archived. The archival process is meant to remove hostname/ip address pairs that no longer resolve.</p>
        <ul>
          <li>For DNS records, it is common for hosting providers to rotate different IP addresses for resolved hostnames. Over time, this can cause a scan groups asset list to be full of stale DNS records.</li>
          <li>Web Results will be archived automatically if the response time is older than the specified number of days.</li>
          <li>Records that do resolve to the same IP are kept in the address list.</li>
          <li>The archival process is run after every iteration of a scan.</li>
          <li>If a scan group is paused, then it will only archive records the specified number of days after the last time the group was paused.</li>
        </ul>
      </div>
    </div>
    <!-- end archive field -->

    <!-- concurrent hosts -->
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
      <div class="col-sm-2">
        <base-button
          type="info"
          icon
          size="sm"
          class="btn-link"
          @click="showHelp('concurrent_requests')"
        >
          <i
            :class="helpers.concurrent_requests ? 'tim-icons icon-minimal-down' : 'tim-icons icon-minimal-up'"
          ></i>
        </base-button>
      </div>
    </div>

    <div v-show="helpers.concurrent_requests" class="row">
      <div class="col-sm-2"></div>
      <p
        class="col-sm-7"
      >Enter the number (from 1 - 25) of hosts to test at the same time. This option limits how many hosts to analyze in parallel. If you have large groups of addresses it is recommended to have this value greater than 10 otherwise scan times may be significantly slower</p>
    </div>
    <!-- end concurrent hosts -->

    <!-- custom sub domains -->
    <div class="row">
      <label class="col-sm-2 col-form-label">Prepend Sub Domains</label>
      <div class="col-sm-7">
        <base-text-area
          name="custom_sub_names"
          placeholder="sub1, sub2"
          v-model="model.custom_sub_names"
          :error="getError('custom_sub_names')"
        ></base-text-area>
      </div>
      <div class="col-sm-2">
        <base-button
          type="info"
          icon
          size="sm"
          class="btn-link"
          @click="showHelp('custom_sub_names')"
        >
          <i
            :class="helpers.custom_sub_names ? 'tim-icons icon-minimal-down' : 'tim-icons icon-minimal-up'"
          ></i>
        </base-button>
      </div>
    </div>

    <div v-show="helpers.custom_sub_names" class="row">
      <div class="col-sm-2"></div>
      <div class="col-sm-7">
        <p>Enter single words (no dots), seperated by comma. This option allows you to add environment specific sub-domain names that will be prepended to all TLD(s) and sub-domains found.</p>
        <p>For example, providing "gold, silver" to this field would have the brute force module attempt:</p>
        <ul>
          <li>gold.example.com</li>
          <li>silver.example.com</li>
          <li>gold.sub.example.com</li>
          <li>silver.sub.example.com</li>
        </ul>
        <p>Please note custom names added here are joined together with a built-in list of commonly found sub-domains.</p>
      </div>
    </div>

    <div v-if="canPortScan">
      <div class="row">
        <label class="col-6 col-form-label mt-2 mb-2">Enable Port Scanning</label>
        <div class="col-7">
          <base-checkbox class="ml-2 mt-1" v-model="model.port_scan_enabled"></base-checkbox>
        </div>
        <div class="col-sm-2">
          <base-button
            type="info"
            icon
            size="sm"
            class="btn-link"
            @click="showHelp('port_scan_enabled')"
          >
            <i
              :class="helpers.port_scan_enabled ? 'tim-icons icon-minimal-down' : 'tim-icons icon-minimal-up'"
            ></i>
          </base-button>
        </div>
      </div>

      <div v-show="helpers.port_scan_enabled" class="row">
        <div class="col-12">
          <div class="row">
            <p class="col-2"></p>
            <div class="col-sm-7 mt-1">
              <p>Enable port scanning on assets included in the Allowed TLDs and Allowed Hosts scope.</p>
              <ul>
                <li>Portscans will be coming from a single host: scanner1.linkai.io (209.126.252.34)</li>
                <li>Currently, only IPv4 Addresses will be tested</li>
                <li>Port scanning is done via requesting a single SYN packet per port</li>
                <li>You must enter at least one TLD or host/IP address if you wish to allow port scanning for this scan group.</li>
                <li>The results of open ports found will be passed to web analysis.</li>
                <li>Hosts that fall under the initial TLD(s) or are added to the scan group as initial hosts will be scanned. This is to prevent scanning assets you do not own.</li>
                <li>You can restrict the scope of what is scanned.</li>
              </ul>
              <p>Please review the following table to understand how scope is determined for hosts that should, or should not be port scanned.</p>
            </div>
          </div>

          <div class="row">
            <div class="col-sm-12 bg-dark">
              <el-table
                header-cell-class-name="table-transparent"
                header-row-class-name="table-transparent"
                row-class-name="table-transparent"
                :data="scopeData"
              >
                <el-table-column
                  v-for="column in scopeColumns"
                  :key="column.label"
                  :min-width="column.minWidth"
                  :prop="column.prop"
                  :sortable="column.sortable"
                  :label="column.label"
                >
                  <template slot-scope="scope">
                    <div
                      v-if="column.prop === 'tld' || column.prop === 'host'"
                    >{{scope.row[column.prop]}}</div>
                    <div
                      v-else
                      :style="scope.row[column.prop] === '✔' ? 'color: green' : 'color: red'"
                    >{{scope.row[column.prop]}}</div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </div>

      <div v-if="model.port_scan_enabled">
        <hr />
        <!-- disallowed TLDs -->
        <div class="row">
          <label class="col-sm-2 col-form-label">Disallowed Top Level Domains (TLDs)</label>
          <div class="col-sm-7">
            <base-text-area
              name="disallowed_tlds"
              placeholder="dontscanme.com,dontscan.com"
              v-model="model.disallowed_tlds"
              :error="getError('disallowed_tlds')"
            ></base-text-area>
          </div>
          <div class="col-sm-2">
            <base-button
              type="info"
              icon
              size="sm"
              class="btn-link"
              @click="showHelp('disallowed_tlds')"
            >
              <i
                :class="helpers.disallowed_tlds ? 'tim-icons icon-minimal-down' : 'tim-icons icon-minimal-up'"
              ></i>
            </base-button>
          </div>
        </div>

        <div v-show="helpers.disallowed_tlds" class="row">
          <div class="col-sm-2"></div>
          <div class="col-sm-7">
            <p>Enter TLDs seperated by commas, do not add wildcard (*) or other characters, only the TLDs themselves.</p>
            <ul>
              <li>By adding TLDs (such as example.com) to this field, you will be able to disallow port scanning against all sub-domains that fall under the specified TLD(s).</li>
              <li>Web analysis checks will still be run on the ports specified in the Web Analysis Ports field.</li>
            </ul>
          </div>
        </div>
        <!-- end disallowed TLDs -->

        <!-- disallowed hosts -->
        <div class="row">
          <label class="col-sm-2 col-form-label">Disallowed Hosts</label>
          <div class="col-sm-7">
            <base-text-area
              name="disallowed_hosts"
              placeholder="sub.dontscanme.com,dont.scanme.com"
              v-model="model.disallowed_hosts"
              :error="getError('disallowed_hosts')"
            ></base-text-area>
          </div>
          <div class="col-sm-2">
            <base-button
              type="info"
              icon
              size="sm"
              class="btn-link"
              @click="showHelp('disallowed_hosts')"
            >
              <i
                :class="helpers.disallowed_hosts ? 'tim-icons icon-minimal-down' : 'tim-icons icon-minimal-up'"
              ></i>
            </base-button>
          </div>
        </div>

        <div v-show="helpers.disallowed_hosts" class="row">
          <div class="col-sm-2"></div>
          <div class="col-sm-7">
            <p>Enter hosts seperated by commas. This option allows you to enter specific hostnames that you do not want portscanned.</p>
            <ul>
              <li>Even if the TLD is allowed, any hosts entered here will not be portscanned.</li>
              <li>Web analysis checks will still be run on the ports specified in the Web Analysis Ports field.</li>
            </ul>
          </div>
        </div>

        <!-- Allowed TLDs -->
        <div class="row">
          <label class="col-sm-2 col-form-label">Allowed Top Level Domains (TLDs)</label>
          <div class="col-sm-7">
            <base-text-area
              name="allowed_tlds"
              placeholder="scanme.com,scanmetoo.com"
              v-model="model.allowed_tlds"
              :error="getError('allowed_tlds')"
            ></base-text-area>
          </div>
          <div class="col-sm-2">
            <base-button
              type="info"
              icon
              size="sm"
              class="btn-link"
              @click="showHelp('allowed_tlds')"
            >
              <i
                :class="helpers.allowed_tlds ? 'tim-icons icon-minimal-down' : 'tim-icons icon-minimal-up'"
              ></i>
            </base-button>
          </div>
        </div>

        <div v-show="helpers.allowed_tlds" class="row">
          <div class="col-sm-2"></div>
          <p
            class="col-sm-7"
          >Enter TLDs seperated by commas, do not add wildcard (*) or other characters, only the TLD(s) themselves. By adding TLDs (such as example.com) to this field, you will allow port scanning against all sub-domains that fall under the specified TLD(s).</p>
        </div>
        <!-- end allowed tlds -->

        <!-- allowed hosts -->
        <div class="row">
          <label class="col-sm-2 col-form-label">Allowed Hosts</label>
          <div class="col-sm-7">
            <base-text-area
              name="allowed_hosts"
              placeholder="sub.scanme.com,sub2.scanme.com"
              v-model="model.allowed_hosts"
              :error="getError('allowed_hosts')"
            ></base-text-area>
          </div>
          <div class="col-sm-2">
            <base-button
              type="info"
              icon
              size="sm"
              class="btn-link"
              @click="showHelp('allowed_hosts')"
            >
              <i
                :class="helpers.allowed_hosts ? 'tim-icons icon-minimal-down' : 'tim-icons icon-minimal-up'"
              ></i>
            </base-button>
          </div>
        </div>

        <div v-show="helpers.allowed_hosts" class="row">
          <div class="col-sm-2"></div>
          <div class="col-sm-7">
            <p>Enter hostnames, seperated by commas. This option allows you to enter specific hostnames that you want portscanned.</p>
            <ul>
              <li>
                Even if the TLD is disallowed, any hosts entered here
                <b>will</b> be portscanned.
              </li>
              <li>Provided the port was found to be open, web analysis checks will be run on the ports that are specified in the Web Analysis Ports field.</li>
            </ul>
          </div>
        </div>
        <!-- end allowed hosts -->

        <!-- ports per second -->
        <div class="row">
          <label class="col-sm-2 col-form-label">Ports Per Second</label>
          <div class="col-sm-7">
            <base-input
              name="ports_per_second"
              required
              v-validate="modelValidations.ports_per_second"
              v-model.number="model.ports_per_second"
              :error="getError('ports_per_second')"
            ></base-input>
          </div>
          <div class="col-sm-2">
            <base-button
              type="info"
              icon
              size="sm"
              class="btn-link"
              @click="showHelp('ports_per_second')"
            >
              <i
                :class="helpers.ports_per_second ? 'tim-icons icon-minimal-down' : 'tim-icons icon-minimal-up'"
              ></i>
            </base-button>
          </div>
        </div>

        <div v-show="helpers.ports_per_second" class="row">
          <div class="col-sm-2"></div>
          <p
            class="col-sm-7"
          >Enter the number of ports per second, from 5 to 50. This option allows you to rate limit how many ports per second are probed per host.</p>
        </div>
        <!-- end ports per second -->

        <!-- tcp ports field -->
        <div class="row">
          <label class="col-sm-2 col-form-label">TCP Ports</label>
          <div class="col-sm-7">
            <base-text-area
              name="tcp_ports"
              placeholder="21,22,23,25,53,80,135,139,443,445,1443,1723,3306,3389,5432,5900,6379,8000,8080,8443,8500,9500,27017"
              valuetype="integer"
              v-model="model.tcp_ports"
              validate
              @validation="checkValidArray('tcp_ports', $event)"
              :error="getError('tcp_ports')"
            ></base-text-area>
          </div>
          <div class="col-sm-2">
            <base-button type="info" icon size="sm" class="btn-link" @click="showHelp('tcp_ports')">
              <i
                :class="helpers.tcp_ports ? 'tim-icons icon-minimal-down' : 'tim-icons icon-minimal-up'"
              ></i>
            </base-button>
          </div>
        </div>
      </div>

      <div v-show="helpers.tcp_ports" class="row">
        <div class="col-sm-2"></div>
        <p
          class="col-sm-7"
        >Enter up to 50 unique TCP ports, seperated by commas. It is recommended that at least the following ports be tested:<br>21,22,23,25,53,80,135,139,443,445,1443,1723,3306,3389,5432,5900,6379,8000,8080,8443,8500,9500,27017</p>
      </div>
      <!-- end tcp ports field -->

      <!-- web ports field -->
      <div class="row">
        <label class="col-sm-2 col-form-label">Web Analysis Ports</label>
        <div class="col-sm-7">
          <base-text-area
            name="custom_web_ports"
            placeholder="8080, 4443"
            valuetype="integer"
            v-model="model.custom_web_ports"
            validate
            @validation="checkValidArray('custom_web_ports', $event)"
            :error="getError('custom_web_ports')"
          ></base-text-area>
        </div>
        <div class="col-sm-2">
          <base-button
            type="info"
            icon
            size="sm"
            class="btn-link"
            @click="showHelp('custom_web_ports')"
          >
            <i
              :class="helpers.custom_web_ports ? 'tim-icons icon-minimal-down' : 'tim-icons icon-minimal-up'"
            ></i>
          </base-button>
        </div>
      </div>

      <div v-show="helpers.custom_web_ports" class="row">
        <div class="col-sm-2"></div>
        <div class="col-sm-7">
          <p>Enter TCP ports you wish to have the web analysis run against, seperated by commas.</p>
          <ul>
            <li>You do not need to include ports 80 or 443 as they will be tested by default.</li>
            <li>Each port will be tested for both HTTP and HTTPS protocols.</li>
            <li>If the port is found open by the port scanning phase should be included for web analysis.</li>
            <li>If the port was found to be closed, analysis will not be completed. </li>
            <li>If the host or TLD is in the disallowed list, the ports specified in this list will still be analyzed for web services.</li>
          </ul>
          <p>It is
          <b>not</b> recommended to add web analysis checks for ports that do not usually run web services (such as 21, or 22) as this will cause scan group analysis to perform significantly slower.</p>
        </div>
      </div>
    </div>
    <!-- PORT SCANNING NOT ENABLED FOR THIS ORGANIZATION -->
    <div v-else>
      <div class="row">
        <label class="col-sm-2 col-form-label">Web Analysis Ports</label>
        <div class="col-sm-7">
          <base-text-area
            name="custom_ports"
            placeholder="8080, 4443"
            valuetype="integer"
            v-model="model.custom_web_ports"
            :error="getError('custom_web_ports')"
          ></base-text-area>
        </div>
        <div class="col-sm-2">
          <base-button
            type="info"
            icon
            size="sm"
            class="btn-link"
            @click="showHelp('custom_web_ports')"
          >
            <i
              :class="helpers.custom_web_ports ? 'tim-icons icon-minimal-down' : 'tim-icons icon-minimal-up'"
            ></i>
          </base-button>
        </div>
        <div v-show="helpers.custom_web_ports" class="row">
        <div class="col-sm-2"></div>
        <div class="col-sm-7">
          <p>Enter the ports you wish to have the web analysis run against, seperated by commas.</p>
          <ul>
            <li>You do not need to include ports 80 or 443 as they will be tested by default.</li>
            <li>Each port will be tested for both HTTP and HTTPS protocols.</li>
          </ul>
          <p>It is
          <b>not</b> recommended to add web analysis checks for ports that do not usually run web services (such as 21, or 22) as this will cause scan group analysis to perform significantly slower.</p>
        </div>
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
      scopeColumns: [
        {
          prop: 'host',
          label: 'Hostname',
          minWidth: 70
        },
        {
          prop: 'tld',
          label: 'TLD',
          minWidth: 60
        },
        {
          prop: 'disallowed_hosts',
          label: 'Disallowed Host'
        },
        {
          prop: 'allowed_hosts',
          label: 'Allowed Host'
        },
        {
          prop: 'disallowed_tld',
          label: 'Disallowed TLD'
        },
        {
          prop: 'allowed_tld',
          label: 'Allowed TLD'
        },
        {
          prop: 'will_scan',
          label: 'Will Port Scan',
          sortable: true
        }
      ],
      scopeData: [
        {
          host: 'sub.example.com',
          tld: 'example.com',
          disallowed_hosts: '✔',
          allowed_hosts: '✘',
          disallowed_tld: '✘',
          allowed_tld: '✘',
          will_scan: '✘'
        },
        {
          host: 'sub.example.com',
          tld: 'example.com',
          disallowed_hosts: '✘',
          allowed_hosts: '✘',
          disallowed_tld: '✔',
          allowed_tld: '✘',
          will_scan: '✘'
        },
        {
          host: 'sub.example.com',
          tld: 'example.com',
          disallowed_hosts: '✘',
          allowed_hosts: '✘',
          disallowed_tld: '✘',
          allowed_tld: '✘',
          will_scan: '✘'
        },
        {
          host: 'sub.example.com',
          tld: 'example.com',
          disallowed_hosts: '✔',
          allowed_hosts: '✘',
          disallowed_tld: '✘',
          allowed_tld: '✔',
          will_scan: '✘'
        },
        {
          host: 'sub.example.com',
          tld: 'example.com',
          disallowed_hosts: '✘',
          allowed_hosts: '✔',
          disallowed_tld: '✔',
          allowed_tld: '✘',
          will_scan: '✔'
        },
        {
          host: 'sub.example.com',
          tld: 'example.com',
          disallowed_hosts: '✘',
          allowed_hosts: '✔',
          disallowed_tld: '✘',
          allowed_tld: '✘',
          will_scan: '✔'
        },
        {
          host: 'sub.example.com',
          tld: 'example.com',
          disallowed_hosts: '✘',
          allowed_hosts: '✘',
          disallowed_tld: '✘',
          allowed_tld: '✔',
          will_scan: '✔'
        }
      ],
      text_addresses: '',
      helpers: {
        group_name: false,
        archive_after_days: false,
        concurrent_requests: false,
        custom_sub_names: false,
        port_scan_enabled: false,
        disallowed_tlds: false,
        disallowed_hosts: false,
        allowed_tlds: false,
        allowed_hosts: false,
        ports_per_second: false,
        tcp_ports: false,
        custom_web_ports: false
      },
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
      ]
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
    showHelp(field) {
      this.helpers[field] = !this.helpers[field];
    },
    setPortScanning() {
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
      this.errors.add({ field: fieldName, msg: evt });
    },
    validate() {
      this.$validator.validateAll().then(isValid => {
        console.log('validate called');
        if (!isValid) {
          return;
        }

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
  mounted() {}
};
</script>
<style lang="scss">
.el-table__body-wrapper > table > tbody > tr > td {
  padding-top: 2px;
  padding-bottom: 2px;
  border: none;
}
</style>
