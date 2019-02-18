<template>
  <div class="container">
    <div class="col-md-12">
      <form class="form-horizontal">
        <card class="mt-1 bg-dark">
          <h4 slot="header" class="card-title">
            <div class="row">
              <div class="col-md-8">{{address.host_address }} - {{address.ip_address}}</div>
              <div class="col-md-4 text-right">
                <base-button type="danger" icon size="sm" @click="closeDetails" class="btn-link">
                  <i class="tim-icons icon-simple-remove"></i>
                </base-button>
              </div>
            </div>
          </h4>

          <div class="row">
            <div v-for="chunk in formRows" class="col-md-4">
              <div v-for="(formRow, index) in chunk" :key="formRow.label">
                <el-tooltip
                  :content="formRow.tooltip"
                  effect="light"
                  :open-delay="150"
                  placement="left"
                >
                  <label class="col-sm-2 col-form-label">{{formRow.label}}</label>
                </el-tooltip>
                <div class="col-sm-7">
                  <p
                    class="form-control-static text-right"
                  >{{formatValues(formRow.prop, address[formRow.prop])}}</p>
                </div>
              </div>
            </div>
          </div>
        </card>
      </form>
    </div>
  </div>
</template>
<script>
import {
  BaseAlert,
  TextFileUpload,
  BaseSwitch,
  BaseTextArea,
  Modal
} from 'src/components/index';
import { mapState, mapGetters } from 'vuex';
import { unixNanoToMinDate } from 'src/data/time.js';
import { formatNSRecord } from 'src/data/addresses.js';

export default {
  components: {
    TextFileUpload,
    Modal,
    BaseAlert,
    BaseSwitch,
    BaseTextArea
  },
  props: {
    address: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      formRows: [
        [
          {
            prop: 'address_id',
            label: 'Address ID',
            tooltip: 'The unique address ID for this record',
            minWidth: 60
          },
          {
            prop: 'address_hash',
            label: 'Address Hash',
            tooltip: 'A simple hash of the ip address and host name together',
            minWidth: 40
          },
          {
            prop: 'found_from',
            label: 'Found from Hash',
            tooltip: 'The address hash that this record was found from',
            minWidth: 40
          },
          {
            prop: 'host_address',
            label: 'Hostname',
            tooltip: 'The hostname for this record',
            minWidth: 60
          },
          {
            prop: 'ip_address',
            label: 'IP Address',
            tooltip: 'The IP address for this record',
            minWidth: 50
          }
        ],
        [
          {
            prop: 'discovery_time',
            label: 'Discovered',
            tooltip: 'When this asset was first discovered',
            minWidth: 50
          },
          {
            prop: 'discovered_by',
            label: 'Discovered By',
            tooltip: 'How this asset was discovered',
            minWidth: 60
          },
          {
            prop: 'last_seen_time',
            label: 'Last Seen',
            tooltip: 'The last time this asset was seen during analysis',
            minWidth: 40
          },
          {
            prop: 'last_scanned_time',
            label: 'Last Scanned',
            tooltip:
              'The last time this asset was successfully completed full analysis',
            minWidth: 40
          }
        ],
        [
          {
            prop: 'user_confidence_score',
            label: 'Custom Confidence Score',
            tooltip:
              'A custom score (0-100) that you may set for this asset. Values > 75 will be allowed to undergo full analysis',
            minWidth: 40
          },
          {
            prop: 'confidence_score',
            label: 'Confidence',
            tooltip:
              'A custom score (0-100) that this service set in how confident this asset belongs to the scan group or organization',
            minWidth: 40
          },
          {
            prop: 'is_wildcard_domain',
            label: 'Wildcard Domain',
            tooltip:
              'If true, this domain was not brute forced due to all NS queries returning valid results',
            minWidth: 40
          },
          {
            prop: 'is_hosted_service',
            label: 'Hosted Service',
            tooltip:
              'This asset exists in a hosted service (such as AWS, GCP, Azure), domains that match these services will skip certain analysis types',
            minWidth: 40
          },
          {
            prop: 'ns_record',
            label: 'NS Record',
            tooltip:
              'The DNS record type that was queried for this host that returned a valid response',
            minWidth: 30
          }
        ]
      ],
      model: {},
      modelValidations: {
        group_name: {
          required: true,
          regex: /^((?!\/).)*$/
        },
        concurrent_requests: {
          required: true,
          min_value: 1,
          max_value: 25
        }
      }
    };
  },
  computed: {
    ...mapState('scangroup', ['updateGroups']),
    ...mapState('addresses', ['isUploading']),
    ...mapGetters('addresses', ['addrCounts', 'getCountByID']),
    ...mapGetters('scangroup', ['isUpdating']),
    createdAt: function() {
      return unixNanoToDate(this.group.creation_time);
    },
    modifiedAt: function() {
      return unixNanoToDate(this.group.modified_time);
    },
    status: function() {
      return this.group.paused === false;
    },
    addrCount: function() {
      return this.addrCounts[this.group.group_id] === undefined
        ? 1 // seems silly but set it to one whilst we wait for the real count to load so we don't show the upload notification
        : this.addrCounts[this.group.group_id].count;
    }
  },
  methods: {
    closeDetails() {
      this.$emit('clicked', 'close');
    },
    log(data) {
      console.log('LOGGING:');
      console.log(data);
    },
    getError(fieldName) {
      return this.errors.first(fieldName);
    },
    validate() {
      this.$validator.validateAll().then(isValid => {
        if (!isValid) {
          return;
        }
      });
    },
    formatValues(prop, value) {
      switch (prop) {
        case 'ns_record':
          return formatNSRecord(value);
        case 'found_from':
          if (value === '') {
            return 'none';
          }
        case 'ignored':
        case 'is_wildcard_domain':
        case 'is_hosted_service':
          return value === true ? 'yes' : 'no';
        case 'last_seen_time':
        case 'last_scanned_time':
        case 'discovery_time':
          return unixNanoToMinDate(value);
        case 'discovered_by':
          return value.replace(/_/g, ' ');
      }
      return value;
    }
  },
  created() {},
  mounted() {}
};
</script>
<style lang="scss" scoped>
.card .alert {
  position: relative !important;
  width: 100%;
}
</style>
