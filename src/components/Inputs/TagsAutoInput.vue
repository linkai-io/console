<template>
  <div>
    <div class="row">
      <div class="col-md-12">
        <el-tag
          v-for="(tag, index) in dynamicTags"
          :key="tag + index"
          size="medium"
          :type="tagType"
          :closable="true"
          :close-transition="false"
          @close="handleClose(tag);"
        >{{ tag.display }} {{tag.value}}</el-tag>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6">
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
            ref="currentTag"
            :closable="true"
            :close-transition="false"
            @close="handleCloseSelected();"
          >{{ currentTag.display }}</el-tag>
          <input
            type="text"
            placeholder="Type to add filter"
            class="form-control input-new-tag"
            v-model="inputValue"
            ref="saveTagInput"
            :aria-labelledby="ariaLabelledBy"
            @click="showOptions"
            @input="onInput"
            @keydown.down="onArrowDown"
            @keydown.up="onArrowUp"
            @keydown.enter="onEnter"
          >
          <base-button
            type="primary"
            class="ml-1"
            size="sm"
            :disabled="inputValue === ''"
            @click="onEnter"
            icon
          >
            <i class="tim-icons icon-simple-add"></i>
          </base-button>

          <ul
            class="autocomplete-results"
            v-show="isOpen"
            :style="'margin-left: '+autoMargin+'px; width: '+autoSize+'px;'"
          >
            <li
              v-for="(result, i) in results"
              :key="i"
              @click="onClickSelect(result)"
              class="autocomplete-result"
              :class="{ 'is-active': i === arrowCounter }"
              role="option"
            >{{ result[displayField] }}</li>
          </ul>
        </div>
      </div>
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
      displayField: 'display',
      inputVisible: false,
      isOpen: false,
      autoMargin: 60,
      autoSize: 120,
      arrowCounter: -1,
      inputValue: ''
    };
  },
  methods: {
    handleClose(tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
      this.$emit('change', this.dynamicTags);
    },
    handleCloseSelected() {
      this.currentTag = {};
      this.isOpen = false;
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
      this.arrowCounter = -1;
      this.onSelect(result);
      this.$refs.saveTagInput.focus();
    },
    // we have to handle multiple cases here:
    // TODO: This *really* should be a FSM
    // 1. the option selected has_value is false, meaning the selection itself is the filter
    // 1.1 push it into the dynamicTags array and clear input
    // 1.2 we have a sub filter that we need to add
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
      // we are in a sub filter, but result isn't a real value, don't allow insertion
      if (
        result === undefined &&
        this.currentTag.filter !== undefined &&
        this.currentTag.options !== undefined
      ) {
        this.arrowCounter = -1;
        return;
      }

      // option 1.2 sub filter needs to be added
      if (
        result !== undefined &&
        this.currentTag.filter !== undefined &&
        this.currentTag.options !== undefined
      ) {
        let sub_result = {
          filter: this.currentTag.filter,
          display: this.currentTag.display,
          value: result[this.displayField]
        };
        this.dynamicTags.push(sub_result);
        this.$emit('change', this.dynamicTags);
        this.currentTag = {};
        this.inputValue = '';
        this.isOpen = false;
        this.arrowCounter = -1;
      }

      // option two, set currentTag to current selection
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
        let new_result = {
          filter: this.currentTag.filter,
          display: this.currentTag.display,
          allow_multiple: this.currentTag.allow_multiple,
          value: this.inputValue
        };
        this.dynamicTags.push(new_result);
        this.$emit('change', this.dynamicTags);
        this.currentTag = {};
        this.inputValue = '';
        this.isOpen = false;
        this.arrowCounter = -1;
      }
    },
    onInput(evt) {
      this.$emit('input', evt.target.value);
      this.filterResults();
    },
    showOptions() {
      // don't show drop down if a current tag filter is set and options are null
      if (this.currentTag.filter !== undefined) {
        this.showSubOptions();
        return;
      }
      this.displayField = 'display';
      this.autoMargin = 60;
      this.isOpen = true;
      this.results = this.tagItems;
    },
    showSubOptions() {
      if (this.currentTag.options !== undefined) {
        this.autoMargin = this.$refs.currentTag.$el.offsetWidth + 20;
        this.isOpen = true;
        this.displayField = this.currentTag.option_field;
        this.results = this.currentTag.options;
      }
    },
    filterResults() {
      if (this.currentTag.filter !== undefined) {
        this.filterSubField();
        return;
      }
      this.autoMargin = 60;
      this.displayField = 'display';
      this.results = this.tagItems.filter(
        item =>
          item.display.toLowerCase().indexOf(this.inputValue.toLowerCase()) > -1
      );

      if (this.results.length === 0) {
        this.results = [];
        this.isOpen = false;
      } else {
        this.isOpen = true;
      }
    },
    filterSubField() {
      if (this.currentTag.options !== undefined) {
        this.displayField = this.currentTag.option_field;
        this.autoMargin = this.$refs.currentTag.$el.offsetWidth + 20;
        this.results = this.currentTag.options.filter(item => {
          return (
            item[this.displayField]
              .toLowerCase()
              .indexOf(this.inputValue.toLowerCase()) > -1
          );
        });

        if (this.results.length === 0) {
          this.results = [];
          this.isOpen = false;
        } else {
          this.isOpen = true;
        }
      }
    }
  },
  mounted() {
    this.autoSize = this.$refs.saveTagInput.offsetWidth;
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
  width: 60% !important;
  height: 40px;
  display: inline-block;
}
.autocomplete {
  overflow: auto;
}

.autocomplete-results {
  padding: 0;
  margin: 0;
  width: 60% !important;
  position: absolute;
  z-index: 100;
  margin-left: 60px;
  border: 1px solid #e14eca;
  height: 120px;
  overflow: auto;
  background: #525f7f;
}

.autocomplete-result {
  list-style: none;
  text-align: left;
  overflow: auto;
  padding: 4px 2px;
  cursor: pointer;
}

.autocomplete-result.is-active,
.autocomplete-result:hover {
  background-color: #e14eca;
  color: white;
}
</style>