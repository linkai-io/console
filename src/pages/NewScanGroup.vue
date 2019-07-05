<template>
  <div class="col-md-12">
    <card>
      <div class="card-header">
        <h5 class="card-category">Scan Group</h5>
        <h3 class="card-title">Configuration</h3>
      </div>
          <div class="card-body mt-0">
            <p>
              Scan groups allow you to group domains or hosts to run independently of one another. While in beta, not all options are exposed nor are all user levels, making it potentially unclear as to the benefit of separating your hosts into different groups. If you are unsure, it is recommended that you put all of your assets into a single group.
            </p>
            <br>
            <h6>Settings</h6>
            <p>
              <ul>
                <li><b>Concurrent Requests</b> - This option limits how many hosts to analyze in parallel. </li>
                <li><b>Archive Stale Records After</b> - Stale DNS records (such as hosts that no longer resolve) and stale web requests will be automatically archived. Enter the number of days old results for this scan group should be archived. For DNS records, it is common for hosting providers to rotate different IP addresses for resolved hostnames. Over time, this can cause a scan groups asset list to be full of stale DNS records. The archival process is meant to remove hostname/ip address pairs that no longer resolve. Records that do resolve to the same IP are kept in the address list. The archival process is run after every iteration of a scan. If a scan group is paused, then it will only archive records the specified number of days after the last time the group was paused.</li>
                <li><b>Custom Sub-Domains</b> - This option allows you to add environment specific sub domain names that will be prepended to all domains, and sub-domains found. For example, providing "gold, silver" 
                to the custom sub domains would have the brute force module attempt: gold.example.com and silver.example.com. Note custom sub-domains are joined together with a built in list of commonly found sub-domains.</li>
                <li><b>Custom Ports</b> - By default Hakken only attempts to connect to port 80 and 443 (tls). If you wish to find additional web sites on non-standard ports you can add them here. For example, providing "8000, 8080" would 
                cause the web analysis module to attempt:
                  <ul>
                    <li>http://example.com</li>
                    <li>https://example.com</li>
                    <li>http://example.com:8000</li>
                    <li>https://example.com:8080</li> 
                    <li>http://example.com:8080</li>
                    <li>https://example.com:8080</li>
                  </ul>
                </li>
              </ul>
            </p>
          </div>
    </card>

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
                :disabled="!canCreate || !hasAccepted"
                class="mb-3" 
                size="md">
                Create
              </base-button>
            </div>
          
          <base-alert v-if="!hasAccepted" type="default" dismissible icon="tim-icons icon-alert-circle-exc">
            Unable to create new scan group because the user has not accepted the Beta Agreement.<br> 
            <base-button
              native-type="button"
              :block="false"
              type="danger"
              @click.native="goto"
              >Go to Agreement</base-button>
          </base-alert>

          <base-alert v-if="!canCreate" type="default" dismissible icon="tim-icons icon-alert-circle-exc">
            The maximum number of scan groups for this pricing plan has been reached.
          </base-alert>
          
          <base-alert v-if="groupCreated" type="success" dismissible icon="tim-icons icon-bell-55">
            Group created, go to <router-link to="/groups/list" class="alert-link">scan group list</router-link> to configure now
          </base-alert>
        <scan-group-form></scan-group-form>
      </card>
    </form>
  </div>
</template>
<script>
import { BaseAlert } from 'src/components';
import { BaseTextArea } from 'src/components/index';
import { mapState, mapGetters } from 'vuex';
import ScanGroupForm from 'src/pages/ScanGroups/ScanGroupForm.vue';

export default {
  components: {
    BaseAlert,
    BaseTextArea,
    ScanGroupForm
  },
  data() {
    return {
      model: {
        group_name: '',
        archive_after_days: 5,
        custom_sub_names: [],
        custom_ports: [],
        concurrent_requests: 5 // beta restriction to 10
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
          max_value: 20 // beta restrictions
        }
      }
    };
  },
  computed: {
    ...mapState('scangroup', ['isCreating', 'creationMsg', 'groupCreated']),
    ...mapGetters('auth', ['subscriptionID']),
    ...mapGetters('scangroup', ['groups']),
    ...mapGetters('user', ['hasAccepted']),
    canCreate: function() {
      switch (this.subscriptionID) {
        case '101':
          return Object.entries(this.groups).length >= 1 ? false : true;
          case '102':
          return Object.entries(this.groups).length >= 3 ? false : true;
      }
      
      return true;
    }
  },
  methods: {
    goto() {
      this.$router.push('/agreement');
    },
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