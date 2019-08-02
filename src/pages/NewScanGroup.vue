<template>
  <div class="col-md-12">
    <card>
      <div class="card-header">
        <h5 class="card-category">Scan Group</h5>
        <h3 class="card-title">Configuration</h3>
      </div>
      <div class="card-body mt-0">
        <p>Scan groups allow you to group domains or hosts to run independently of one another. If you are unsure, it is recommended that you put all of your assets into a single group. Please note, scan configurations can be updated or deleted at anytime.</p>
      </div>
    </card>

    <form class="form-horizontal">
      <card>
        <h4 slot="header" class="card-title">New Scan Group</h4>
        <scan-group-form ref="scanGroupForm" @submit="onFormSubmit">
          <template slot-scope="{validator}">
            <div class="text-center">
              <base-button
                native-type="submit"
                @click.native.prevent="validator"
                type="primary"
                :loading="isCreating"
                :disabled="!canCreate || !hasAccepted || accountPaused"
                class="mb-3"
                size="md"
              >Create</base-button>
            </div>
          </template>
        </scan-group-form>

        <base-alert
          v-if="accountPaused"
          type="danger"
          dismissible
          icon="tim-icons icon-alert-circle-exc"
        >Unable to create new scan group because this account is paused.</base-alert>

        <base-alert
          v-if="!hasAccepted"
          type="default"
          dismissible
          icon="tim-icons icon-alert-circle-exc"
        >
          Unable to create new scan group because the user has not accepted the Beta Agreement.
          <br />
          <base-button
            native-type="button"
            :block="false"
            type="danger"
            @click.native="goto"
          >Go to Agreement</base-button>
        </base-alert>

        <base-alert
          v-if="!canCreate"
          type="default"
          dismissible
          icon="tim-icons icon-alert-circle-exc"
        >The maximum number of scan groups for this pricing plan has been reached.</base-alert>

        <base-alert v-if="groupCreated" type="success" dismissible icon="tim-icons icon-bell-55">
          Group created, go to
          <router-link to="/groups/list" class="alert-link">scan group list</router-link>&nbsp;to configure now
        </base-alert>
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
          max_value: 20 // beta restrictions
        }
      }
    };
  },
  computed: {
    ...mapState('scangroup', ['isCreating', 'creationMsg', 'groupCreated']),
    ...mapGetters('auth', ['subscriptionID']),
    ...mapGetters('scangroup', ['groups']),
    ...mapGetters('user', ['hasAccepted', 'accountPaused']),
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
    onFormSubmit(evt) {
      this.$store.dispatch('scangroup/CREATE_GROUP', evt.updates);
    },
    goto() {
      this.$router.push('/agreement');
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