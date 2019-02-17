<template>
  <div class="container">
    <div class="col-md-12">
      <form class="form-horizontal">
        <card>
          <div class="row"></div>
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
