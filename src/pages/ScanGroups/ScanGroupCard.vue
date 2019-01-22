<template>
<div class="container">
  <div class="col-md-12">
  <form class="form-horizontal">
    <card>
      <div class="row">
        <base-alert type="info" icon="tim-icons icon-bell-55" v-if="getCount() === 0" >
          <div class="col-md-auto">
            <span>
              This scan group does not have any addresses associated with it, upload the initial addresses for this group.
            </span>
          </div>

          <div class="col-sm">
            <base-button
              type="primary"
              :loading="isUploading"
              @click.native="modals.upload = true;"
              >Upload
            </base-button>
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
          <h5 class="card-subtitle">Address Count: {{getCount()}}</h5>
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
          >
          </base-input>
        </div>
      </div>
      
      <div class="row">
        <label class="col-sm-2 col-form-label">Concurrent Requests</label>
        <div class="col-sm-7">
          <base-input
            name="concurrent_requests"
            required
            v-validate="modelValidations.concurrent_requests"
            v-model="model.concurrent_requests"
            :error="getError('concurrent_requests')"
          >
          </base-input>
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
          >
          </base-text-area>
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
          >
          </base-text-area>
        </div>
      </div>

      <div class="row">
        <label class="col-sm-2 col-form-label">Created By</label>
        <div class="col-sm-3"> 
          {{group.created_by}} at {{ createdAt }}
        </div>
      
        <label class="col-sm-2 col-form-label">Last Modified By</label>
        <div class="col-sm-3"> 
          {{group.modified_by}} at {{ modifiedAt }}
        </div>
      </div>

      <div class="row">
        <div class="col-md-4">
          <base-button
            type="primary"
            native-type="submit"
            :loading="updating"
            @click.native.prevent="validate"
          >
          Update</base-button>
        </div>

        <div class="col-md-4">
          <div v-if="!group.paused">
            <base-button
                type="danger"
                @click.native="modals.pause = true;"
              >
              Pause</base-button>
          </div>
          <div v-else>
            <base-button
              type="primary"
              @click.native="modals.resume = true;"
            >
            Resume</base-button>
            </div>
        </div>
      
        <div class="col-md-4">
            <base-button
            type="danger"
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
      <base-button
        type="neutral"
        link
        @click.native="modals.pause = false;"
        >Close
      </base-button>
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
      <base-button
        type="neutral"
        link
        @click.native="modals.resume = false;"
        >Close
      </base-button>
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
      <base-button
        type="neutral"
        link
        @click.native="modals.delete = false;"
        >Close
      </base-button>
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
      <p>
        Upload a list of ip addresses, host addresses or CIDR blocks for initial analysis.
      </p>
      <p>
        <text-file-upload
          type="addresses"
          @change="onFileChange">
        </text-file-upload>
        </p>
      <template slot="footer">
        <base-button
          @click.native="uploadAddresses"
        >Upload
        </base-button>
        
        <base-button
          type="danger"
          @click.native="modals.upload = false;"
          >Close
        </base-button>
      </template>
    </modal>

</div>
</div>
</template>
<script>
import { BaseAlert, TextFileUpload, BaseSwitch, BaseTextArea, Modal } from 'src/components/index';
import { mapState, mapGetters } from 'vuex';
import { unixNanoToDate } from 'src/data/time.js';

export default {
  components: {
    TextFileUpload,
    Modal,
    BaseAlert,
    BaseSwitch,
    BaseTextArea
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
      file: null,
      modals: {
        pause: false,
        resume: false,
        delete: false,
        upload: false
      },
      model: {
        group_name: this.group.group_name,
        custom_sub_names: this.group.module_configurations.dnsbrute_module.custom_subnames,
        custom_ports: this.group.module_configurations.port_module.custom_ports,
        concurrent_requests: this.group.module_configurations.ns_module.requests_per_second
      },
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
    ...mapState('scangroup', ['updateGroups', 'updateID']),
    ...mapState('addresses', ['scangroups', 'isUploading', 'uploadMsg', 'uploadMsgType']),
    ...mapGetters('addresses', ['addressCounts']),
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
    updating: function() {
      return this.isUpdating(this.group.group_id);
    }
  },
  methods: {
    getCount() {
      for (let i = 0; i < this.addressCounts.length; i++) {
        if (this.addressCounts[i].group_id === this.group.group_id) {
          return this.addressCounts[i].count;
        }
      }
      return 0;
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
      return
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
        this.model.custom_ports = this.model.custom_ports.map(e => parseInt(e, 10)).filter(function(val, idx, arry) {
          if (val === null || Number.isNaN(val)) {
            return false;
          }
          return true;
        });

        this.model.custom_sub_names = this.model.custom_sub_names.map(e => e).filter(function(val, idx, arr) {
          if (val === "") {
            return false;
          }
          return true;
        });

        let details = {
          updates: this.model,
          group_id: this.group.group_id,
          original_name: this.group.group_name
        };
        this.$store.dispatch('scangroup/UPDATE_GROUP', details);
      });
    }
  },
  created() {
    this.$store.dispatch(
      'addresses/GET_ADDRESS_COUNT',
      this.group.group_id);

    this.$store.dispatch(
      'scangroup/INIT_GROUP_STATE', 
      this.group.group_id);
  },
  mounted() {
    this.$watch(
      'updateID',
      (val) => {
        if (val === -1) {
          return;
        }
        console.log(val);
        let msg = '';
        let msgType = 'success';
        console.log('got update');
        for (let i = 0; i < this.updateGroups.length; i++) {
          console.log('group id ' + this.updateGroups[i].group_id + ' val ' + val);

          if (this.updateGroups[i].group_id === val) {
            msg = this.updateGroups[i].msg;
            msgType = this.updateGroups[i].msgType;
          }
        }
        if (msg === '') {
          return;
        }

        this.$notify({
          message: msg,
          timeout: 4000,
          icon: 'tim-icons icon-bell-55',
          horizontalAlign: 'center',
          verticalAlign: 'top',
          type: msgType
        });
        this.$store.dispatch('scangroup/INIT_GROUP_STATE', val);
      }
    );

    this.$watch(
      'uploadMsg',
      (msg) => {
        console.log(msg);
        if (msg === '') {
          return;
        }

        this.$notify({
          message: msg,
          timeout: 4000,
          icon: 'tim-icons icon-bell-55',
          horizontalAlign: 'center',
          verticalAlign: 'top',
          type: this.uploadMsgType
        });
        //this.$store.dispatch('address/INIT_GROUP_STATE', val);
      }
    );
  }
};
</script>
<style lang="scss" scoped>
.card .alert {
  position: relative !important;
  width: 100%;
}
</style>

