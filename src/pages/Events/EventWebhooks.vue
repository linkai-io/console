<template>
  <div class="col-md-12">
    <card>
      <div class="card-header">
        <h5 class="card-category">Webhooks</h5>
        <h3 class="card-title">Settings</h3>
      </div>
      <div class="card-body mt-0">
        <p>Configure a new or existing webhook to receive events. For configuring a Slack webhook, please see <a target="_blank" href="https://api.slack.com/incoming-webhooks">Slack's incoming webhooks guide</a> and paste the URL into the URL field below.</p>
      </div>

      <div class="row">
        <div class="col">
          <h3 class="card-title">Configure New Webhook</h3>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <webhook-form :is_new="true" :title="'Add New Webhook'" @saved="clearForm()" :key="update_new"></webhook-form>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <h3 class="card-title">Current Webhooks</h3>
        </div>
      </div>
      <div class="row" v-for="(hook, index) in webhooks" :key="hook.webhook_id">
        <webhook-form :is_new="false" :title="hook.name" :index="index"></webhook-form>
      </div>

      <base-alert
        v-if="accountPaused"
        type="danger"
        dismissible
        icon="tim-icons icon-alert-circle-exc"
      >Unable to create webhook because this account is paused.</base-alert>

      <base-alert
        v-if="!hasAccepted"
        type="default"
        dismissible
        icon="tim-icons icon-alert-circle-exc"
      >
        Unable to create webhook because the user has not accepted the Beta Agreement.
        <br />
        <base-button
          native-type="button"
          :block="false"
          type="danger"
          @click.native="goto"
        >Go to Agreement</base-button>
      </base-alert>
    </card>
  </div>
</template>

<script>
import { Select, Option } from 'element-ui';
import { BaseTable, BaseSwitch, BaseAlert } from 'src/components/index';
import { mapGetters } from 'vuex';
import WebhookForm from 'src/pages/Events/WebhookForm.vue';

export default {
  components: {
    [Option.name]: Option,
    [Select.name]: Select,
    BaseSwitch,
    BaseAlert,
    WebhookForm,
    BaseTable
  },
  computed: {
    ...mapGetters('event', [
      'eventByTypeID',
      'isLoading',
      'isUpdating',
      'webhooks'
    ]),
    ...mapGetters('scangroup', ['groups']),
    ...mapGetters('user', ['hasAccepted', 'accountPaused'])
  },
  data() {
    return {
      show_new: false,
      update_new: 0,
      modelValidations: {
        name: {
          required: true,
          regex: /^((?!\/).)*$/
        }
      }
    };
  },
  methods: {
    clearForm() {
      this.update_new += 1;
    },
    showAddNew() {
      this.show_new = !this.show_new;
    }
  },
  created() {},
  mounted() {}
};
</script>