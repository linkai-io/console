<template>
  <div>
    <el-tag
      v-for="(tag, index) in dynamicTags"
      :key="tag + index"
      size="medium"
      :type="tagType"
      :closable="true"
      :close-transition="false"
      @close="handleClose(tag);"
    >{{ tag.display }} {{tag.value}}</el-tag>

    <div
      class="autocomplete"
      role="combobox"
      aria-haspopup="listbox"
      aria-owns="autocomplete-results"
      :aria-expanded="isOpen"
    >
      <el-tag
        v-model="currentTag"
        size="medium"
        type="info"
        :closable="true"
        :close-transition="false"
        @close="handleCloseSelected(currentTag);"
      >{{ currentTag.display }}</el-tag>
      <input
        type="text"
        placeholder="Type to add filter"
        class="form-control input-new-tag"
        v-model="inputValue"
        ref="saveTagInput"
        :aria-labelledby="ariaLabelledBy"
        @input="onInput"
        @keydown.down="onArrowDown"
        @keydown.up="onArrowUp"
        @keydown.enter="onEnter"
      >
      <!-- @blur="handleInputConfirm" -->
      <ul class="autocomplete-results" v-show="isOpen">
        <li
          v-for="(result, i) in results"
          :key="i"
          @click="onClickSelect(result)"
          class="autocomplete-result"
          :class="{ 'is-active': i === arrowCounter }"
          role="option"
        >{{ result.display }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { Tag } from 'element-ui';

export default {
  name: 'tags-auto-input',
  components: {
    [Tag.name]: Tag
  },
  props: {
    ariaLabelledBy: {
      type: String,
      required: true
    },
    value: {
      type: Array,
      default: () => [],
      description: 'List of tags'
    },
    tagType: {
      type: String,
      default: 'primary',
      description: 'Tag type (primary|danger etc)'
    },
    tagItems: {
      type: Array,
      default: () => [],
      description: 'List of values for autocomplete'
    }
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  data() {
    return {
      dynamicTags: [],
      currentTag: {},
      results: [],
      inputVisible: false,
      isOpen: false,
      arrowCounter: -1,
      inputValue: ''
    };
  },
  methods: {
    handleClose(tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
      this.$emit('change', this.dynamicTags);
    },
    handleCloseSelected(tag) {
      this.currentTag = {};
    },
    showInput() {
      this.inputVisible = true;
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    handleClickOutside(evt) {
      if (!this.$el.contains(evt.target)) {
        this.isOpen = false;
        this.arrowCounter = -1;
      }
    },
    onArrowDown() {
      if (this.arrowCounter < this.results.length) {
        this.arrowCounter = this.arrowCounter + 1;
      }
    },
    onArrowUp() {
      if (this.arrowCounter > 0) {
        this.arrowCounter = this.arrowCounter - 1;
      }
    },
    onEnter() {
      this.onSelect(this.results[this.arrowCounter]);
    },
    onClickSelect(result) {
      this.onSelect(result);
      this.$refs.saveTagInput.focus();
    },
    // we have to handle multiple cases here:
    // 1. the option selected has_value is false, meaning the selection itself is the filter
    // 1.1 push it into the dynamicTags array and clear input
    // 2. the user selected a new filter that requires a value
    // 2.1 pop the current filter into the currentTag
    // 2.2 clear the inputValue
    //
    onSelect(result) {
      // option 1 selection is the filter itself
      if (result !== undefined && result.has_value === false) {
        this.dynamicTags.push(result);
        this.$emit('change', this.dynamicTags);
        this.inputVisible = false;
        this.inputValue = '';
        this.isOpen = false;
        return;
      }
      // option two set currentTag to current selection
      if (this.currentTag.filter === undefined && result !== undefined) {
        this.currentTag = result;
        this.isOpen = false;
        this.arrowCounter = -1;
        this.inputValue = '';
        return;
      }
      // 2.1 set currentTag filter value to inputValue
      if (this.currentTag.filter !== undefined && this.inputValue !== '') {
        this.currentTag.value = this.inputValue;
        this.dynamicTags.push(this.currentTag);
        this.currentTag = {};
        this.inputValue = '';
        this.isOpen = false;
        this.arrowCounter = -1;
      }
    },
    handleInputConfirm() {
      let inputValue = this.inputValue;
      if (inputValue) {
        this.dynamicTags.push(inputValue);
        this.$emit('change', this.dynamicTags);
      }
      this.inputVisible = false;
      this.inputValue = '';
    },
    onInput(evt) {
      this.$emit('input', evt.target.value);
      this.filterResults();
    },
    filterResults() {
      if (this.currentTag.filter !== undefined) {
        return;
      }
      this.results = this.tagItems.filter(
        item =>
          item.display.toLowerCase().indexOf(this.inputValue.toLowerCase()) > -1
      );
      console.log(this.results.length);
      if (this.inputValue === '' || this.results.length === 0) {
        this.results = [];
        this.isOpen = false;
      } else {
        this.isOpen = true;
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  destroyed() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  created() {
    this.$watch(
      'value',
      newVal => {
        this.dynamicTags = [...newVal];
      },
      { immediate: true }
    );
  }
};
</script>
<style scoped>
.input-new-tag {
  margin-left: 10px;
  width: 50% !important;
  height: 32px;
  display: inline;
}
.autocomplete {
  position: relative;
  width: 50% !important;
}

.autocomplete-results {
  padding: 0;
  margin: 0;
  border: 1px solid #e14eca;
  height: 120px;
  overflow: auto;
}

.autocomplete-result {
  list-style: none;
  text-align: left;
  padding: 4px 2px;
  cursor: pointer;
}

.autocomplete-result.is-active,
.autocomplete-result:hover {
  background-color: #e14eca;
  color: white;
}
</style>