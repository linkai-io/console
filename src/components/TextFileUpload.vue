<template>
  <div class="fileinput text-center">
    <div>
      <span class="btn btn-primary btn-simple btn-file">
        <span class="fileinput-new">{{
          fileExists ? changeText : selectText
        }}</span>
        <input type="hidden" value="" name="" />
        <input
          accept="text/*"
          @change="handlePreview"
          type="file"
          name="..."
          class="primary"
          :multiple="false"
          aria-invalid="false"
        />
      </span>
      <base-button v-if="fileExists" @click="removeFile" type="danger">
        <i class="fas fa-times"></i> {{ removeText }}
      </base-button>
    </div>
  </div>
</template>
<script>
export default {
  name: 'text-upload',
  props: {
    type: {
      type: String,
      default: '',
      description: 'Text upload type (""|ports|hosts|addresses)'
    },
    src: {
      type: String,
      default: '',
      description: 'Initial text to display'
    },
    selectText: {
      type: String,
      default: 'Select file'
    },
    changeText: {
      type: String,
      default: 'Select'
    },
    removeText: {
      type: String,
      default: 'Remove'
    }
  },
  data() {
    return {
      placeholder: function() {
        switch (this.type) {
          case 'ports':
          return '80,443';
          case 'hosts':
          return 'sub1,sub2';
          case 'addresses':
          return 'example.com';
        }
      },
      filePreview: null,
      target: null
    };
  },
  computed: {
    fileExists() {
      return this.filePreview !== null;
    }
  },
  methods: {
    handlePreview(event) {
      let file = event.target.files[0];
      this.target = event.target;
      this.filePreview = URL.createObjectURL(file);
      this.$emit('change', file);
    },
    removeFile() {
      URL.revokeObjectURL(this.filePreview);
      this.filePreview = null;
      this.target.value = ''; // force change event if file doesn't change.
      this.$emit('change', null);
    }
  }
};
</script>
<style></style>
