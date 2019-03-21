<template>
  <div
    class="form-group"
    :class="{
      'input-group': hasIcon,
      'input-group-focus': focused,
      'has-danger': error,
      'has-success': !error && touched,
      'has-label': label
    }"
  >
    <slot name="label">
      <label v-if="label"> {{ label }} {{ required ? '*' : '' }} </label>
    </slot>
    <slot name="addonLeft">
      <span v-if="addonLeftIcon" class="input-group-prepend">
        <div class="input-group-text"><i :class="addonLeftIcon"></i></div>
      </span>
    </slot>
    <slot>
      <textarea
        :value="value"
        v-bind="$attrs"
        v-on="listeners"
        :rows="10"
        class="form-control"
        aria-describedby="addon-right addon-left"
      />
    </slot>

    <slot name="error" v-if="error || $slots.error">
      <label class="error">{{ error }}</label>
    </slot>

    <slot name="addonRight">
      <span v-if="addonRightIcon" class="input-group-append">
        <div class="input-group-text"><i :class="addonRightIcon"></i></div>
      </span>
    </slot>
    <slot name="helperText"></slot>
  </div>
</template>
<script>
export default {
  inheritAttrs: false,
  name: 'raw-text-area',
  props: {
    required: Boolean,
    label: {
      type: String,
      description: 'Input label'
    },
    error: {
      type: String,
      description: 'Input error',
      default: ''
    },
    value: {
      type: String,
      description: 'Input value'
    },
    addonRightIcon: {
      type: String,
      description: 'Input icon on the right'
    },
    addonLeftIcon: {
      type: String,
      description: 'Input icon on the left'
    },
    rows: {
      type: String,
      description: 'Number of rows to display',
      default: '7'
    }
  },
  model: {
    prop: 'value',
    event: 'input'
  },
  data() {
    return {
      focused: false,
      touched: false
    };
  },
  computed: {
    hasIcon() {
      const { addonRight, addonLeft } = this.$slots;
      return (
        addonRight !== undefined ||
        addonLeft !== undefined ||
        this.addonRightIcon !== undefined ||
        this.addonLeftIcon !== undefined
      );
    },
    listeners() {
      return {
        ...this.$listeners,
        input: this.onInput,
        blur: this.onBlur,
        focus: this.onFocus
      };
    }
  },
  methods: {
    onInput(evt) {
      if (!this.touched) {
        this.touched = true;
      }
      this.$emit('input', evt.target.value);
    },
    onFocus() {
      this.focused = true;
    },
    onBlur() {
      this.focused = false;
    }
  }
};
</script>
<style>
</style>
