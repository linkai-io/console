<template>
  <base-button type="info" icon size="sm" class="btn-link">
      <i class="tim-icons icon-minimal-down"></i>
  </base-button>
</template>
<script>
export default {
  name: 'show-help',
  props: {
    fieldName: {
      type: String
    }
  }
}
</script>