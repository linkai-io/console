<template>
  <div class>
    <div class="col-md-2">
      <el-tooltip
        :content="tooltip.content"
        effect="light"
        :open-delay="150"
        :placement="tooltip.placement"
      >
        <base-input
          label="Does not contain header"
          type="text"
          v-model="filter.without_header"
          placeholder="x-some-header"
        ></base-input>
      </el-tooltip>
    </div>
  </div>
</template>
<script>
export default {
  name: 'filter',
  props: {
    name: {
      type: String,
      default: 'filter'
    },
    tooltip: {
      type: Object,
      content: {
        type: String,
        default: ''
      },
      placement: {
        default: 'bottom',
        validator: value => {
          let acceptedValues = ['top', 'bottom', 'left', 'right'];
          return acceptedValues.indexOf(value) !== -1;
        }
      }
    },
    input: {
      type: Object,
      label: {
        type: String,
        default: 'Filter'
      },
      inputType: {
        type: String,
        default: 'text'
      },
      placeholder: {
        type: String,
        default: 'placeholder'
      },
      result: {
        type: Object,
      }
    }
  },
  inject: ['addFilter', 'removeFilter'],
  data() {
    return {
      active: false
    };
  },
  mounted() {
    this.addFilter(this);
  },
  destroyed() {
    if (this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el);
    }
    this.removeFilter(this);
  }
};
</script>