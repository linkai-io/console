<template>
  <div class="container">
    <div class="col-md-12">
      <form class="form-horizontal">
        <card class="mt-1 bg-dark">
          <h4 slot="header" class="card-title">
            <div class="row">
              <div class="col-md-8"></div>
              <div class="col-md-4 text-right">
                <base-button type="danger" icon size="sm" @click="closeDetails" class="btn-link">
                  <i class="tim-icons icon-simple-remove"></i>
                </base-button>
              </div>
            </div>
          </h4>

          <div class="row">
            <div class="col-md-12">
              <div v-for="(response, index) in responseData" class="row" :key="index">
                <div
                  v-for="(chunk, chunk_index) in formRows"
                  :key="chunk_index"
                  :class="chunk[0].prop=='raw_body_link' ? 'col-md-12' : 'col-md-6'"
                >
                  <div v-for="formRow in chunk" :key="formRow.label">
                    <el-tooltip
                      :content="formRow.tooltip"
                      effect="light"
                      :open-delay="150"
                      placement="left"
                    >
                      <label class="col-sm-2 col-form-label text-left">{{formRow.label}}</label>
                    </el-tooltip>
                    <div v-if="formRow.prop=='raw_body_link'">
                      <response-body :url="response[formRow.prop]"></response-body>
                    </div>
                    <div v-else-if="formRow.prop === 'url'" class="col-sm-10">
                      <a
                        :href="formatWebLink(response[formRow.prop])"
                      >{{ formatWebLink(response[formRow.prop])}}</a>
                    </div>
                    <div v-else-if="formRow.prop === 'headers'" class="col-sm-10">
                      <p v-for="(value, key, index) in response[formRow.prop]" v-bind:key="index">
                      {{key}}: {{value}}<br></p>
                    </div>
                    <div v-else class="col-sm-10">
                      <p
                        class="form-control-static text-left"
                      >{{formatValues(formRow.prop, response[formRow.prop])}}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </card>
      </form>
    </div>
  </div>
</template>
<script>
import API from 'src/api/api.js';
import { unixNanoToMinDate } from 'src/data/time.js';
import ResponseBody from 'src/pages/Web/ResponseBody.vue';
import { formatWebLink } from 'src/data/formatters.js';

export default {
  components: {
    ResponseBody
  },
  data() {
    return {
      responseData: [],
      formRows: [
        [
          {
            prop: 'url',
            label: 'URL',
            tooltip: 'URL of this response',
            minWidth: 60
          },
          {
            prop: 'address_hash',
            label: 'Address Hash',
            tooltip: 'The hash of this IP/Host pair.',
            minWidth: 60
          },
          {
            prop: 'requested_port',
            label: 'Requested Port',
            tooltip: 'The TCP port that was originally requested',
            minWidth: 40
          },
          {
            prop: 'response_port',
            label: 'Response Port',
            tooltip: 'The TCP port of the response',
            minWidth: 40
          },
          {
            prop: 'host_address',
            label: 'Hostname',
            tooltip: 'The hostname for this response',
            minWidth: 60
          },
          {
            prop: 'ip_address',
            label: 'IP Address',
            tooltip: 'The IP address for this response',
            minWidth: 50
          },
          {
            prop: 'url_request_timestamp',
            label: 'Request Timestamp',
            tooltip: 'The time this request was initiated',
            minWidth: 50
          }
        ],
        [
          {
            prop: 'status',
            label: 'Status Code',
            tooltip: 'The HTTP status code of this response',
            minWidth: 40
          },
          {
            prop: 'status_text',
            label: 'Status Text',
            tooltip: 'The HTTP status text of this response',
            minWidth: 40
          },
          {
            prop: 'mime_type',
            label: 'Mime Type',
            tooltip: 'The Mime Type of this response',
            minWidth: 40
          },
          {
            prop: 'response_timestamp',
            label: 'Response Timestamp',
            tooltip: 'The response time',
            minWidth: 40
          },
          {
            prop: 'headers',
            label: 'Headers',
            tooltip: 'The HTTP response headers',
            minWidth: 50
          }
        ],
        [
          {
            prop: 'raw_body_link',
            label: 'Raw Body',
            tooltip: 'The HTTP response body',
            minWidth: 60
          }
        ]
      ]
    };
  },
  props: {
    lookupFilter: {
      group_id: {
        type: String
      },
      url: {
        type: String
      },
      url_request_timestamp: {
        type: Number
      },
      load_host_address: {
        type: String
      },
      load_ip_address: {
        type: String
      },
      display_url_list: {
        type: Boolean
      }
    }
  },
  methods: {
    formatWebLink(value) {
      return formatWebLink(value);
    },
    closeDetails() {
      this.$emit('clicked', 'close');
    },
    async getResponseData() {
      this.loading = true;
      let limit = 1000;
      let start = 0;
      let params = {
        start: start,
        limit: limit,
        url_request_timestamp: this.lookupFilter.request_timestamp,
      };

      if (this.lookupFilter.display_url_list === true) {
        params.original_host_address = this.lookupFilter.load_host_address;
        params.original_ip_address = this.lookupFilter.load_ip_address;
      } else {
        params.host_address =  this.lookupFilter.host_address;
        params.ip_address = this.lookupFilter.ip_address;
        // TODO: re-enable this to use timestamps after a few days
        //params.response_timestamp = this.lookupFilter.response_timestamp;
        params.url = this.lookupFilter.url;
      }
     
      try {
        let response = await API.get(
          '/webdata/group/' + this.lookupFilter.group_id + '/responses',
          {
            params: params
          }
        );
        if (
          response.data.responses === null ||
          response.data.responses.length === 0
        ) {
          throw new 'unable to find response for this request'();
        }
        this.responseData.push(...response.data.responses);
      } catch (err) {
        let msg = 'Error getting response data';
        if (err.data !== undefined && err.data.msg !== undefined) {
          msg = err.data.msg;
        }
        
        this.$store.dispatch(
          'notify/CREATE_NOTIFY_MSG',
          {
            msg: msg,
            msgType: 'danger'
          },
          { root: true }
        );
      } finally {
        this.loading = false;
      }
    },
    formatValues(prop, value) {
      switch (prop) {
        case 'url_request_timestamp':
        case 'response_timestamp':
          return unixNanoToMinDate(value);
      }
      return value;
    }
  },
  mounted() {
    this.getResponseData();
  }
};
</script>
<style>
</style>