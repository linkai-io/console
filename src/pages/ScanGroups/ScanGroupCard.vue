<template>
<div class="col-md-12">
  <form class="form-horizontal">
    <card>
        <div class="row">
          <div class="col-md-6">
            <h4 class="card-title">Scan Group: {{model.group_name}}</h4>
            <div class="row">
              <div class="col-md-4">
                <p class="category">Paused</p>
                <base-switch
                  v-model="model.paused"
                  type="primary"
                  on-text="Yes"
                  off-text="No"
                ></base-switch>
              </div>
            
          </div>
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
        {{scangroup.created_by}} at {{ createdAt }}
      </div>
    
      <label class="col-sm-2 col-form-label">Last Modified By</label>
      <div class="col-sm-3"> 
        {{scangroup.modified_by}} at {{ modifiedAt }}
      </div>
    </div>
    <div class="row">
      <div class="col-md-3"></div>
      <div class="col-md-3">
          <base-button
            type="primary"
          >
          Update</base-button>
      </div>
      <div class="col-md-3">
          <base-button
          type="danger"
          >Delete</base-button>
      </div>
      </div>
  </card>
  </form>
</div>
</template>
<script>
import { BaseSwitch, BaseTextArea } from 'src/components/index';
import { mapState, mapGetters } from 'vuex';
import { unixNanoToDate } from 'src/data/time.js';

export default {
  components: {
    BaseSwitch,
    BaseTextArea
  },
  props: {
    scangroup: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      model: {
        group_name: this.scangroup.group_name,
        custom_sub_names: this.scangroup.module_configurations.dnsbrute_module.custom_subnames,
        custom_ports: this.scangroup.module_configurations.port_module.custom_ports,
        concurrent_requests: this.scangroup.module_configurations.ns_module.requests_per_second,
        paused: this.scangroup.paused
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
        },
        paused: {
          required: true
        }
      }
    };
  },
  computed: {
    ...mapState('addresses', ['scangroups']),
    ...mapGetters('addresses', ['addressCounts']),
    createdAt: function() {
      console.log(this.scangroup.creation_time);
      return unixNanoToDate(this.scangroup.creation_time);
    },
    modifiedAt: function() {
      return unixNanoToDate(this.scangroup.modified_time);
    },
    status: function() {
      return this.scangroup.paused === false;
    }
  },
  methods: {
    getCount() {
      for (let i = 0; i < this.addressCounts.length; i++) {
        if (this.addressCounts[i].group_id === this.scangroup.group_id) {
          return this.addressCounts[i].count;
        }
      }
      return 0;
    },
    getError(fieldName) {
      return this.errors.first(fieldName);
    },
    validate() {
      this.$validator.validateAll().then(isValid => {
        if (!isValid) {
          return;
        }
        this.$store.dispatch('scangroup/CREATE_GROUP', this.model);
      });
    }
  },
  created() {
    this.$store.dispatch(
      'addresses/GET_ADDRESS_COUNT',
      this.scangroup.group_id);
  },
  mounted() {}
};
</script>
<style lang="scss" scoped>
.disabled_input {
  color: white;
}
</style>

