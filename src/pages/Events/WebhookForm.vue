<template>
  <div class="container">
    <div class="row">
      <h6 class="col-sm-2">{{title}}</h6>
      <hr />
    </div>

    <!-- single line -->
    <div class="row">
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
          <i :class="helpers.type ? 'tim-icons icon-minimal-down' : 'tim-icons icon-minimal-right'"></i>
        </base-button>
        <br />
        <el-select
          ref="eventTypes"
          class="select-primary"
          placeholder="Event Types"
          multiple
          name="events"
          id="events"
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
    <div class="row">
      <div class="col text-right">
        <div class="row">
          <div class="col">
            <base-button type="primary" size="sm" @click="testHook" :disabled="isValid">Test</base-button>

            <base-button type="primary" size="sm" @click="saveHook" :disabled="isValid">
              <div v-if="is_new">Save</div>
              <div v-else>Update</div>
            </base-button>

            <base-button
              v-show="!is_new"
              type="danger"
              size="sm"
              @click="deleteHook"
              :disabled="isValid"
            >Delete</base-button>
          </div>
        </div>
      </div>
    </div>

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

    <div v-show="helpers.enabled" class="row">
      <p class="col-sm-7">Enable or disable this webhook</p>
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
    ...mapGetters('event', ['userSubscriptions']),
    eventTypes() {
      let events = Object.assign([], this.userSubscriptions);
      return events.filter(e => e.disabled === undefined);
    },
    isValid() {
      return !this.model.url.startsWith('https://');
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
    data: {
      type: Object,
      default: function() {
        return {
          name: '',
          version: 'v1',
          type: '',
          url: '',
          events: [],
          deleted: false,
          group_id: '',
          enabled: true
        };
      }
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
        type: '',
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
    emptyModel() {},
    testHook() {
      this.$validator.validateAll().then(isValid => {
        if (!isValid) {
          console.log('invalid webhook settings');
          return;
        }
        console.log('dispatching webhook test event');
        this.$store.dispatch('event/TEST_WEBHOOK', this.model);
      });
    },
    saveHook() {
      this.$validator.validateAll().then(isValid => {
        if (!isValid) {
          console.log('invalid webhook settings');
          return;
        }
        console.log('dispatching webhook save event');
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
    getError(fieldName) {
      let error = this.errors.first(fieldName);

      if (error !== undefined) {
        console.log(error);
        let options = {
          container: 'body',
          easing: 'ease-in',
          offset: -60
        };
        this.$scrollTo('#' + fieldName, options);
      }

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
  created() {
    // stupid but make a copy so we don't mutate vuex state
    if (this.data !== undefined) {
      this.model.name = this.data.name;
      this.model.version = this.data.version;
      this.model.type = this.data.type;
      this.model.url = this.data.url;
      this.model.events = this.data.events.slice();
      this.model.deleted = this.data.deleted;
      this.model.group_id = this.data.group_id;
      this.model.enabled = this.data.enabled;
    }
  }
};
</script>