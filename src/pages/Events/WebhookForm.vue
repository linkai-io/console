<template>
  <div class="container">
    <div class="row">
      <h6 class="col-sm-2">{{title}}</h6>
      <hr />
    </div>

    <!-- single line -->
    <div class="row form-group">
      <div class="col">
        <label for="name">Webhook Name</label>
        <base-button
          v-show="is_new"
          type="info"
          icon
          size="sm"
          class="btn-link"
          @click="showHelp('name')"
        >
          <i :class="helpers.name ? 'tim-icons icon-minimal-down' : 'tim-icons icon-minimal-right'"></i>
        </base-button>
        <base-input
          name="name"
          id="name"
          required
          v-validate="modelValidations.name"
          :disabled="!is_new"
          v-model="model.name"
          :error="getError('name')"
        ></base-input>
      </div>

      <div class="col">
        <label for="name">Scan Group</label>
        <base-button
          v-show="is_new"
          type="info"
          icon
          size="sm"
          class="btn-link"
          @click="showHelp('group_id')"
        >
          <i
            :class="helpers.group_id ? 'tim-icons icon-minimal-down' : 'tim-icons icon-minimal-right'"
          ></i>
        </base-button>
        <el-select
          ref="scanGroupName"
          class="select-primary"
          placeholder="Group"
          name="group_id"
          id="group_id"
          @select="clearError('group_id')"
          v-model="model.group_id"
        >
          <el-option
            v-for="(option, index) in groups"
            class="select-primary"
            :value="option.group_id"
            :label="option.group_name"
            :key="index"
          ></el-option>
        </el-select>
        <div>
          <label v-if="getError('group_id')" style="color: #ec250d;">{{ getError('group_id') }}</label>
        </div>
      </div>

      <div class="col-md-3">
        <label for="name">URL</label>
        <base-button
          v-show="is_new"
          type="info"
          icon
          size="sm"
          class="btn-link"
          @click="showHelp('url')"
        >
          <i :class="helpers.url ? 'tim-icons icon-minimal-down' : 'tim-icons icon-minimal-right'"></i>
        </base-button>
        <base-input
          name="url"
          id="url"
          required
          placeholder="https://"
          v-validate="modelValidations.url"
          v-model="model.url"
          :error="getError('url')"
        ></base-input>
      </div>

      <div class="col">
        <label for="name">Integration Type</label>
        <base-button
          v-show="is_new"
          type="info"
          icon
          size="sm"
          class="btn-link"
          @click="showHelp('type')"
        >
          <i :class="helpers.type ? 'tim-icons icon-minimal-down' : 'tim-icons icon-minimal-right'"></i>
        </base-button>
        <el-select
          ref="webhookType"
          class="select-primary"
          placeholder="Type"
          name="type"
          id="type"
          :error="getError('type')"
          v-model="model.type"
        >
          <el-option
            v-for="option in webhook_types"
            class="select-primary"
            :value="option.value"
            :label="option.label"
            :key="option.value"
          ></el-option>
        </el-select>
      </div>

      <div class="col">
        <label for="name">Event Types</label>
        <base-button
          v-show="is_new"
          type="info"
          icon
          size="sm"
          class="btn-link"
          @click="showHelp('events')"
        >
          <i
            :class="helpers.events ? 'tim-icons icon-minimal-down' : 'tim-icons icon-minimal-right'"
          ></i>
        </base-button>
        <br />
        <el-select
          ref="eventTypes"
          class="select-primary"
          placeholder="Event Types"
          multiple
          name="events"
          id="events"
          @focus="clearError('events')"
          v-model="model.events"
        >
          <el-option
            v-for="option in eventTypes"
            class="select-primary"
            :value="option.type_id"
            :label="option.short_description"
            :key="option.type_id"
          ></el-option>
        </el-select>
        <div>
          <label v-if="getError('events')" style="color: #ec250d;">{{ getError('events') }}</label>
        </div>
      </div>

      <div class="col">
        <label for="enabled">Enable</label>
        <base-button
          v-show="is_new"
          type="info"
          icon
          size="sm"
          class="btn-link"
          @click="showHelp('enabled')"
        >
          <i
            :class="helpers.enabled ? 'tim-icons icon-minimal-down' : 'tim-icons icon-minimal-right'"
          ></i>
        </base-button>
        <br />
        <base-switch
          name="enabled"
          id="enabled"
          ref="enabled"
          class="mt-2"
          v-model="model.enabled"
          type="primary"
          on-text="ON"
          off-text="OFF"
        ></base-switch>
      </div>
    </div>
    <!-- help text -->
    <div class="row">
      <div class="col">
        <div v-show="helpers.actions" class="row">
          <p class="col-sm-7">Test or save this webhook</p>
        </div>

        <div v-show="helpers.group_id" class="row">
          <p class="col-sm-7">Create this webhook for the selected scan group</p>
        </div>

        <div v-show="helpers.name" class="row">
          <p class="col-sm-7">Enter the name of this webhook, webhook names must be unique</p>
        </div>

        <div v-show="helpers.version" class="row">
          <p class="col-sm-7">The API version for this webhook</p>
        </div>

        <div v-show="helpers.url" class="row">
          <p class="col-sm-7">The URL to send events to. URLs must begin with https://</p>
        </div>

        <div v-show="helpers.type" class="row">
          <p class="col-sm-7">The webhook integration type, currently only slack is supported</p>
        </div>

        <div v-show="helpers.events" class="row">
          <p class="col-sm-7">Select which events you wish to send to this webhook</p>
        </div>

        <div v-show="helpers.enabled" class="row">
          <p class="col-sm-7">Enable or disable this webhook</p>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col text-right">
        <div class="row">
          <div class="col">
            <base-button type="primary" size="sm" @click="testHook" :disabled="!isInvalid">Test</base-button>

            <base-button
              v-if="is_new"
              type="primary"
              size="sm"
              @click="saveHook"
              :disabled="!isInvalid"
            >Save</base-button>
            <base-button
              v-else
              type="primary"
              size="sm"
              @click="updateHook"
              :disabled="!isInvalid"
            >Update</base-button>

            <base-button v-show="!is_new" type="danger" size="sm" @click="deleteHook">Delete</base-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Select, Option } from 'element-ui';
import { BaseSwitch } from 'src/components/index';
import { mapGetters } from 'vuex';

export default {
  name: 'webhook-form',
  components: {
    [Option.name]: Option,
    [Select.name]: Select,
    BaseSwitch
  },
  computed: {
    ...mapGetters('scangroup', ['groups']),
    ...mapGetters('event', ['userSubscriptions', 'webhooks']),
    eventTypes() {
      let events = Object.assign([], this.userSubscriptions);
      return events.filter(e => e.disabled === undefined);
    },
    isInvalid() {
      if (!this.model.url.startsWith('https://')) {
        return false;
      }
      if (this.model.events.length === 0) {
        return false;
      }
      console.log(this.model.group_id);
      if (this.model.group_id === '') {
        return false;
      }
      return true;
    }
  },
  props: {
    title: {
      type: String,
      default: 'Add New Webhook'
    },
    is_new: {
      type: Boolean,
      default: false
    },
    index: {
      type: Number
    }
  },
  data() {
    return {
      show_test_result: false,
      test_response: {},
      webhook_types: [{ label: 'Slack', value: 'slack' }],
      model: {
        name: '',
        version: 'v1',
        type: 'slack',
        url: '',
        events: [],
        deleted: false,
        group_id: '',
        enabled: true
      },
      helpers: {
        show_all: false,
        name: false,
        version: false,
        type: false,
        url: false,
        events: false,
        enabled: false,
        test: false,
        group_id: false,
        actions: false
      },

      modelValidations: {
        name: {
          required: true,
          regex: /^((?!\/).)*$/
        },
        url: {
          url: true,
          required: true
        },
        group_id: {
          required: true
        }
      }
    };
  },
  methods: {
    clearError(fieldName) {
      this.errors.remove(fieldName);
    },
    emptyModel() {
      return {
        name: '',
        version: 'v1',
        type: 'slack',
        url: '',
        events: [],
        deleted: false,
        group_id: '',
        enabled: true
      };
    },
    testHook() {
      this.$validator.validateAll().then(isValid => {
        if (!isValid) {
          console.log('invalid webhook settings');
          return false;
        }
        if (!this.validate()) {
          return false;
        }
        this.$store.dispatch('event/TEST_WEBHOOK', this.model);
      });
    },
    saveHook() {
      this.$validator.validateAll().then(isValid => {
        if (!isValid) {
          console.log('invalid webhook settings');
          return;
        }
        if (!this.validate()) {
          return false;
        }
        this.$store.dispatch('event/UPDATE_WEBHOOK', this.model);
        this.$emit('saved', {});
      });
    },
    updateHook() {
      this.$validator.validateAll().then(isValid => {
        if (!isValid) {
          console.log('invalid webhook settings');
          return;
        }
        if (!this.validate()) {
          return false;
        }
        this.$store.dispatch('event/UPDATE_WEBHOOK', this.model);
      });
    },
    deleteHook() {
      this.$validator.validateAll().then(isValid => {
        if (!isValid) {
          console.log('invalid webhook settings');
          return;
        }
        this.model.deleted = true;
        console.log('dispatching webhook delete event');
        this.$store.dispatch('event/UPDATE_WEBHOOK', this.model);
      });
    },
    validate() {
      let errors = this.errors;
      let isValid = true;
      if (this.model.events.length === 0) {
        errors.add({
          field: 'events',
          msg: 'At least one event type required'
        });
        isValid = false;
      }
      if (this.model.group_id === '') {
        errors.add({
          field: 'group_id',
          msg: 'Scan group is required'
        });
        isValid = false;
      }

      // updates do not need to check if name in use.
      if (!this.is_new) {
        return isValid;
      }
      // see if this name is in use
      let exists = this.webhooks.filter(e => e.name === this.model.name);
      if (exists.length !== 0) {
        errors.add({
          field: 'name',
          msg: 'This webhook name is already in use'
        });
        isValid = false;
      }
      return isValid;
    },
    getError(fieldName) {
      let error = this.errors.first(fieldName);
      return error;
    },
    showAllHelp() {
      this.helpers.show_all = !this.helpers.show_all;
      for (let key of Object.keys(this.helpers)) {
        this.helpers[key] = this.helpers.show_all;
      }
    },
    showHelp(field) {
      this.helpers[field] = !this.helpers[field];
    }
  },
  mounted() {
    if (this.index !== undefined) {
      this.model.webhook_id = this.webhooks[this.index].webhook_id;
      this.model.name = this.webhooks[this.index].name;
      this.model.version = this.webhooks[this.index].version;
      this.model.type = this.webhooks[this.index].type;
      this.model.url = this.webhooks[this.index].url;
      this.model.events = this.webhooks[this.index].events.slice();
      this.model.deleted = this.webhooks[this.index].deleted;
      this.model.group_id = this.webhooks[this.index].group_id;
      this.model.enabled = this.webhooks[this.index].enabled;
    }
  }
};
</script>