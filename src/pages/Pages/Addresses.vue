<template>
  <div class="col-md-6">
    
  </div>
</template>
<script>
import { BaseAlert } from 'src/components';
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
    ...mapState('scangroup', ['isCreating', 'creationMsg'])
  },
  methods: {
    created() {
       
    },
    getError(fieldName) {
      return this.errors.first(fieldName);
    }
  },
  mounted() {
    this.$watch(
      'creationMsg',
      msg => {
        if (msg === '') {
          return;
        }

        let msgType = 'danger';

        if (msg === 'success') {
          msgType = 'success';
          msg = 'Group Created Successfully';
        }
        this.$notify({
          message: msg,
          timeout: 4000,
          icon: 'tim-icons icon-bell-55',
          horizontalAlign: 'center',
          verticalAlign: 'top',
          type: msgType
        });
        this.$store.dispatch('scangroup/CLEAR_CREATION_MSG');
      }
    );
  }
};
</script>
<style>
</style>
