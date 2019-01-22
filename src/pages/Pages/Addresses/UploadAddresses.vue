<template>
  <div>
    <h5 class="info-text">Upload file (Fileinput)</h5>
    <div class="row justify-content-center">
      <div class="col-lg-10 text-center">
        <text-file-upload
          type="addresses"
          @change="onFileChange">
        </text-file-upload>
      </div>
    </div>
  </div>
</template>

<script>
import { TextFileUpload } from 'src/components';

export default {
  props: {
    group_id: {
      type: Number,
      default: 0
    }
  },
  components: {
    TextFileUpload
  },
  data() {
    return {
      model: {
        file_details: ''
      }
    }
  },
  methods: {
    onFileChange() {
      console.log('file changed');
    }
  }
}
</script>

<style>
</style>