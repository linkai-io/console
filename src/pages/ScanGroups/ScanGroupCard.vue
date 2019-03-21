<template>
  <div class="container">
    <div class="col-md-12">
      <form class="form-horizontal">
        <card>
          <div class="row">
            <base-alert type="default" icon="tim-icons icon-bell-55" v-if="addrCount === 0">
              <div class="col-md-auto">
                <span>This scan group does not have any addresses associated with it, either type in or upload the initial addresses for this group.</span>
              </div>

              <div class="row">
                <label class="col-sm-2 col-form-label">Add Hosts</label>
                <div class="col-sm-7">
                  <raw-text-area
                    name="text_hosts"
                    v-model="text_addresses"
                    rows="10"
                  ></raw-text-area>
                </div>
              </div>
              <div class="row">
                <div class="col-sm">
                  <base-button
                    type="primary"
                    :loading="isUploading"
                    :disabled="text_addresses === ''"
                    @click.native="modals.text_upload = true;"
                  >Add Hosts</base-button>
                </div>
                <div class="col-sm">
                  <base-button
                    type="primary"
                    :loading="isUploading"
                    @click.native="modals.upload = true;"
                  >Upload</base-button>
                </div>
                
              </div>
            </base-alert>
          </div>

          <div class="row">
            <div class="col-md-6">
              <h4 class="card-title">Scan Group: {{group.group_name}}</h4>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <h5 class="card-subtitle">Address Count: {{addrCount}}</h5>
            </div>
          </div>

          <div class="row">
            <label class="col-sm-2 col-form-label">GroupName</label>
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
            <label class="col-sm-2 col-form-label">Concurrent Requests</label>
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
            <label class="col-sm-2 col-form-label">Custom Sub Domains</label>
            <div class="col-sm-7">
              <base-text-area
                name="custom_sub_names"
                placeholder="sub1, sub2"
                v-model="model.custom_sub_names"
                :error="getError('custom_sub_names')"
              ></base-text-area>
            </div>
          </div>

          <div class="row">
            <label class="col-sm-2 col-form-label">Custom Ports</label>
            <div class="col-sm-7">
              <base-text-area
                name="custom_ports"
                placeholder="80, 443"
                v-model="model.custom_ports"
                :error="getError('custom_ports')"
              ></base-text-area>
            </div>
          </div>

          <div class="row">
            <label class="col-sm-2 col-form-label">Created By</label>
            <div class="col-sm-3">{{group.created_by}} at {{ createdAt }}</div>

            <label class="col-sm-2 col-form-label">Last Modified By</label>
            <div class="col-sm-3">{{group.modified_by}} at {{ modifiedAt }}</div>
          </div>
          <!-- activity details -->
          <div class="row">
            <card class="col-md-11 mt-4 mx-auto bg-dark">
              <h5 slot="header" class="card-title">
                <div class="row">
                  <div class="col-md-8">Group Activity</div>
                  <div class="col-md-4 text-right">
                    <label class>Last Updated: {{ lastUpdatedActivity }}</label>
                    <base-button
                      type="danger"
                      icon
                      size="sm"
                      @click="refreshActivity"
                      class="btn-link"
                    >
                      <i class="tim-icons icon-refresh-02"></i>
                    </base-button>
                  </div>
                </div>
              </h5>

              <div class="card-body mt-0">
                <div class="row mt-0">
                  <div class="col-md-5">
                    <div class="row">
                      <label class="col-sm-6 col-form-label">In Queue:</label>
                      <p class="col-sm-6 form-control-static mt-2 text-left">{{ batchSize }}</p>
                    </div>
                    <div class="row">
                      <label class="col-sm-6 col-form-label">Batch Started:</label>
                      <p class="col-sm-6 form-control-static mt-2 text-left">{{ batchStart }}</p>
                    </div>
                  </div>
                  <div class="col-md-7">
                    <div class="row">
                      <label class="col-sm-6 col-form-label">Undergoing Analysis:</label>
                      <p class="col-sm-6 form-control-static mt-2 text-left">{{ activeAddresses }}</p>
                    </div>
                    <div class="row">
                      <label class="col-sm-6 col-form-label">Batch Ended:</label>
                      <p class="col-sm-6 form-control-static mt-2 text-left">{{ batchEnd }}</p>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-12 md-auto"></div>
                </div>
              </div>
            </card>
          </div>
          <div class="row">
            <div class="col-md-4">
              <base-button
                type="primary"
                native-type="submit"
                :loading="isUpdating"
                @click.native.prevent="validate"
              >Update</base-button>
            </div>

            <div class="col-md-4">
              <div v-if="!group.paused">
                <base-button
                  type="danger"
                  :loading="isUpdating"
                  @click.native="modals.pause = true;"
                >Pause</base-button>
              </div>
              <div v-else>
                <base-button
                  type="primary"
                  :loading="isUpdating"
                  @click.native="modals.resume = true;"
                >Resume</base-button>
              </div>
            </div>

            <div class="col-md-4">
              <base-button
                type="danger"
                :loading="deleteDisabled"
                @click.native="modals.delete = true;"
              >Delete</base-button>
            </div>
          </div>
        </card>
      </form>
      <!-- pause modal -->
      <modal
        :show.sync="modals.pause"
        class="modal-primary"
        :show-close="true"
        headerClasses="justify-content-center"
        type="mini"
      >
        <div slot="header" class="modal-profile">
          <i class="tim-icons icon-button-pause"></i>
        </div>
        <p>Are you sure you want to pause this scangroup? It may take a few minutes to fully pause all outbound requests.</p>
        <template slot="footer">
          <base-button @click.native="pauseGroup">Yes</base-button>
          <base-button type="neutral" link @click.native="modals.pause = false;">Close</base-button>
        </template>
      </modal>

      <!-- resume modal -->
      <modal
        :show.sync="modals.resume"
        class="modal-primary"
        :show-close="true"
        headerClasses="justify-content-center"
        type="mini"
      >
        <div slot="header" class="modal-profile">
          <i class="tim-icons icon-double-right"></i>
        </div>
        <p>Are you sure you want to resume this scangroup?</p>
        <template slot="footer">
          <base-button type="secondary" @click.native="resumeGroup">Yes</base-button>
          <base-button type="neutral" link @click.native="modals.resume = false;">Close</base-button>
        </template>
      </modal>

      <!-- delete modal -->
      <modal
        :show.sync="modals.delete"
        class="modal-primary"
        :show-close="true"
        headerClasses="justify-content-center"
        type="mini"
      >
        <div slot="header" class="modal-profile">
          <i class="tim-icons icon-simple-remove"></i>
        </div>
        <p>Are you sure you want to delete this scangroup? You will lose all address information for this group.</p>
        <template slot="footer">
          <base-button type="danger" @click.native="deleteGroup">Yes</base-button>
          <base-button type="neutral" link @click.native="modals.delete = false;">Close</base-button>
        </template>
      </modal>

      <!-- upload modal -->
      <modal
        :show.sync="modals.upload"
        class="modal-classic"
        headerClasses="justify-content-center"
        :show-close="true"
      >
        <h4 slot="header" class="title title-up">Add Addresses to the group</h4>
        <p>Upload a list of ip addresses, host addresses or CIDR blocks for initial analysis. Each asset (or cidr range) must be on it's own line of the text file</p>
        <p>
          <text-file-upload type="addresses" @change="onFileChange"></text-file-upload>
        </p>
        <template slot="footer">
          <base-button @click.native="uploadAddresses">Upload</base-button>

          <base-button type="danger" @click.native="modals.upload = false;">Close</base-button>
        </template>
      </modal>

      <!-- text upload modal -->
      <modal
        :show.sync="modals.text_upload"
        class="modal-primary"
        :show-close="true"
        headerClasses="justify-content-center"
        type="mini"
      >
        <div slot="header" class="modal-profile">
          <i class="tim-icons icon-cloud-upload-94"></i>
        </div>
        <p>Are you sure you want to upload these addresses? Depending on price plan you may not be able to delete this group.</p>
        <br>
        <div class="justify-content-left" v-for="(addr, index) in text_addresses.split('\n')" v-bind:key="index">
          <li>{{ addr }}</li>
        </div>
        <template slot="footer">
          <base-button type="secondary" @click.native="uploadTextAddresses">Upload</base-button>
          <base-button type="secondary" link @click.native="modals.text_upload = false;">Close</base-button>
        </template>
      </modal>
    </div>
  </div>
</template>
<script>
import {
  BaseAlert,
  TextFileUpload,
  BaseSwitch,
  BaseTextArea,
  RawTextArea,
  Modal
} from 'src/components/index';
import { mapState, mapGetters } from 'vuex';
import { unixNanoToDate, unixNanoToMinDate } from 'src/data/time.js';

export default {
  components: {
    TextFileUpload,
    Modal,
    BaseAlert,
    BaseSwitch,
    BaseTextArea,
    RawTextArea
  },
  props: {
    group: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      text_addresses: '',
      file: null,
      modals: {
        pause: false,
        resume: false,
        delete: false,
        upload: false,
        text_upload: false,
      },
      model: {
        group_name: this.group.group_name,
        custom_sub_names: this.group.module_configurations.dnsbrute_module
          .custom_subnames,
        custom_ports: this.group.module_configurations.port_module.custom_ports,
        concurrent_requests: this.group.module_configurations.ns_module
          .requests_per_second
      },
      modelValidations: {
        group_name: {
          required: true,
          regex: /^((?!\/).)*$/
        },
        concurrent_requests: {
          required: true,
          min_value: 1,
          max_value: 5
        }
      }
    };
  },
  computed: {
    ...mapState('scangroup', ['updateGroups']),
    ...mapState('addresses', ['isUploading']),
    ...mapGetters('addresses', ['addrCounts', 'getCountByID']),
    ...mapGetters('scangroup', ['isUpdating', 'groupStats']),
    ...mapGetters('auth', ['subscriptionID']),
    deleteDisabled: function() {
      if (this.isUpdating) {
        return true;
      }
      switch (this.subscriptionID) {
        case '101':
          return true;
          break;
      }
      return false;
    },
    activeAddresses: function() {
      let stats = this.groupStats[this.group.group_id];
      if (stats !== undefined) {
        return stats.active_addresses;
      }
      return 'Unknown';
    },
    batchSize: function() {
      let stats = this.groupStats[this.group.group_id];
      if (stats !== undefined) {
        return stats.batch_size;
      }
      return 'Unknown';
    },
    lastUpdatedActivity: function() {
      let stats = this.groupStats[this.group.group_id];
      if (stats !== undefined) {
        let active = stats.last_updated;
        if (active !== undefined && active !== 0 && !Number.isNaN(active)) {
          return unixNanoToMinDate(active);
        }
      }
      return 'Unknown';
    },
    batchStart: function() {
      let stats = this.groupStats[this.group.group_id];
      if (stats !== undefined) {
        let start = stats.batch_start;
        if (start !== undefined && start !== 0 && !Number.isNaN(start)) {
          return unixNanoToMinDate(start);
        }
      }
      return 'Unknown';
    },
    batchEnd: function() {
      let stats = this.groupStats[this.group.group_id];
      if (stats !== undefined) {
        let end = stats.batch_end;
        if (end === 0) {
          return 'Analysis in Progress';
        }
        if (end !== undefined && !Number.isNaN(end)) {
          return unixNanoToMinDate(end);
        }
      }
      return 'Unknown';
    },

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
    uploadTextAddresses() {
      this.modals.text_upload = false;
      let details = {
        group_id: this.group.group_id,
        addresses: this.text_addresses
      };
      console.log(details.addresses);
      this.$store.dispatch('addresses/UPLOAD_ADDRESSES', details);

    },
    refreshActivity() {
      this.$store.dispatch('scangroup/GET_GROUP_STATS');
    },
    getError(fieldName) {
      return this.errors.first(fieldName);
    },
    pauseGroup() {
      this.modals.pause = false;
      if (this.group.group_name != this.model.group_name) {
        // notify
        return;
      }
      let details = {
        group_name: this.group.group_name,
        group_id: this.group.group_id,
        status: 'pause'
      };
      console.log(details);
      this.$store.dispatch('scangroup/UPDATE_GROUP_STATUS', details);
      return;
    },
    resumeGroup() {
      this.modals.resume = false;
      console.log('resuming group');
      if (this.group.group_name != this.model.group_name) {
        // notify
        return;
      }
      let details = {
        group_name: this.group.group_name,
        group_id: this.group.group_id,
        status: 'resume'
      };
      console.log(details);
      this.$store.dispatch('scangroup/UPDATE_GROUP_STATUS', details);
    },
    deleteGroup() {
      this.modals.delete = false;

      let details = {
        group_name: this.group.group_name,
        group_id: this.group.group_id
      };
      this.$store.dispatch('scangroup/DELETE_GROUP', details);
    },
    uploadAddresses() {
      this.modals.upload = false;
      let details = {
        group_id: this.group.group_id,
        addresses: this.file
      };
      this.$store.dispatch('addresses/UPLOAD_ADDRESSES', details);
    },
    onFileChange(file) {
      this.file = file;
      console.log('file changed');
    },
    validate() {
      this.$validator.validateAll().then(isValid => {
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
    this.$store.dispatch('addresses/GET_ADDRESS_COUNT', this.group.group_id);
  }
};
</script>
<style lang="scss" scoped>
.card .alert {
  position: relative !important;
  width: 100%;
}
</style>
