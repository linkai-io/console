<template>
  <card>
    <div class="col-12">
        <div class="row">
          <div class="col-md-6">
            <h4 class="card-title">Scan Group: {{updatedScanGroup.group_name}}</h4>
            <div class="row">
              <div class="col-md-4">
                <p class="category">Paused</p>
                <base-switch
                  v-model="updatedScanGroup.paused"
                  type="primary"
                  on-text="Yes"
                  off-text="No"
                ></base-switch>
              </div>
              <div class="col-md-4">
                <base-button>Update</base-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!--
    <h5 slot="header" class="title">Scan Group: {{scangroup.group_name}}</h5>
    <p class="card-text">Created By: {{scangroup.created_by}} @ {{createdAt}}</p>
    <p class="card-text">Modified By: {{scangroup.modified_by}} @ {{modifiedAt}}</p>
    <p class="card-text"> {{ getCount() }}</p>
    <p class="card-text">
      -->
  </card>
</template>
<script>
import { BaseSwitch } from 'src/components/index';
import { mapState, mapGetters } from 'vuex';
import { unixNanoToDate } from 'src/data/time.js';

export default {
  components: {
    BaseSwitch
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
      updatedScanGroup: Object.assign({}, this.scangroup),
      updatedScanGroupValidations: {
        group_id: {
          required: true
        },
        group_name: {
          required: true
        },
        paused: {
          required: true
        }
      }
    };
  },
  computed: {
    ...mapState('addresses', ['scangroups', 'currentGroup']),
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
<style>
</style>
