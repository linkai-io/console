<template>
  <div class="col-md-6">
    <form class="form-horizontal">
      <card>
          <h4 slot="header" class="card-title">New Scan Group</h4>
      
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
                >
                </base-input>
              </div>
            </div>

            <div class="row">
              <el-tooltip
                    content="Limit the number of concurrent addresses to be tested at the same time."
                    effect="light"
                    :open-delay="150"
                    placement="right"
                  >
              <label class="col-sm-2 col-form-label">Concurrent Requests</label>
              </el-tooltip>
              <div class="col-sm-7">
                <base-input
                  name="concurrent_requests"
                  required
                  v-validate="modelValidations.concurrent_requests"
                  v-model.number="model.concurrent_requests"
                  :error="getError('concurrent_requests')"
                >
                </base-input>
              </div>
            </div>

            <div class="row">
              <el-tooltip
                    content="Prepend these subdomain prefixes to all hostnames."
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
                >
                </base-text-area>
              </div>
            </div>

            <div class="row">
              <el-tooltip
                    content="Attempt to find web servers on non-standard ports (only 80,443 will be tested by default)"
                    effect="light"
                    :open-delay="150"
                    placement="right"
                  >
              <label class="col-sm-2 col-form-label">Custom Ports</label>
              </el-tooltip>
              <div class="col-sm-7">
                <base-text-area
                  name="custom_ports"
                  placeholder="8080, 4443"
                  valueType="integer"
                  v-model="model.custom_ports"
                  :error="getError('custom_ports')"
                >
                </base-text-area>
              </div>
            </div>

            <div class="text-center">
              <base-button 
                native-type="submit"
                @click.native.prevent="validate"
                type="primary"
                :loading="isCreating"
                class="mb-3" 
                size="md">
                Create
              </base-button>
            </div>

          <base-alert v-if="groupCreated" type="success" dismissible icon="tim-icons icon-bell-55">
            Group created, go to <router-link to="/groups/list" class="alert-link">scan group list</router-link> to configure now
          </base-alert>
      </card>
    </form>
  </div>
</template>
<script>
import { BaseAlert, } from 'src/components';
import { BaseTextArea } from 'src/components/index';
import { mapState } from 'vuex';

export default {
  components: {
    BaseAlert,
    BaseTextArea
  },
  data() {
    return {
      model: {
        group_name: '',
        custom_sub_names: [],
        custom_ports: [],
        concurrent_requests: 15
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
    ...mapState('scangroup', ['isCreating', 'creationMsg', 'groupCreated'])
  },
  methods: {
    created() {},
    getError(fieldName) {
      return this.errors.first(fieldName);
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
        this.model.concurrent_requests = parseInt(this.model.concurrent_requests, 10);
        this.$store.dispatch('scangroup/CREATE_GROUP', this.model);
      });
    }
  },
  beforeDestroy() {
    this.$store.dispatch('scangroup/UNSET_CREATED');
  },
  mounted() {}
};
</script>
<style>
.alert-link {
  color: black;
}
</style>