const app = new Vue({
  el: '#app',
  template: `
  <div>
    <el-card>
      <div slot="header">
        <span>参数设置</span>
      </div>
      <el-form :model="form" label-width="200px">
        <el-form-item label="奖池号码：">
          <el-input
            type="textarea"
            :rows="2"
            placeholder="请输入可能被抽中的值，使用空格或换行隔开"
            v-model="form.values">
          </el-input>
        </el-form-item>
        <el-form-item label="合并奖池重复号码：">
          <el-switch
            :disabled="true"
            v-model="form.isMergeRepeat">
          </el-switch>
        </el-form-item>
        <el-form-item label="抽奖次数：">
          <el-input-number v-model="form.time" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="允许重复抽中：">
          <el-switch
            v-model="form.canRepeat">
          </el-switch>
        </el-form-item>
        <el-form-item label="合并重复抽中项：">
          <el-switch
            :disabled="!form.canRepeat"
            v-model="form.showRepeatTime">
          </el-switch>
        </el-form-item>
        <el-collapse-transition>
          <el-form-item v-if="form.showRepeatTime" label="按抽中次数降序排序：">
            <el-switch
              v-model="form.isDesc">
            </el-switch>
          </el-form-item>
        </el-collapse-transition>
        <div style="text-align: center;">
          <el-button type="primary" @click="onSubmit">生成</el-button>
          <el-button @click="onReset">重置</el-button>
        </div>
      </el-form>
    </el-card>
    
    <br>
    
    <el-card>
      <div slot="header">
        <span>生成结果</span>
      </div>
      <div v-if="results.length === 0">无结果</div>
      <div v-else>
        <div v-if="this.form.showRepeatTime">
          <div v-for="sortedResult in sortedResults">
            <div>值为 {{ sortedResult.element }}，共被抽中 {{ sortedResult.count }} 次</div>
          </div>
        </div>
        <div v-else>
          <div v-for="result in results" :key="result">{{ result.element }}</div>
        </div>
      </div>
    </el-card>
  </div>
  `,
  data() {
    return {
      form: {
        values: '',
        time: 1,
        isMergeRepeat: true,
        canRepeat: false,
        showRepeatTime: false,
        isDesc: true
      },
      results: [],
    }
  },
  watch: {
    'form.canRepeat'(v) {
      if (!v) {
        this.form.showRepeatTime = false;
      }
    }
  },
  computed: {
    sortedResults() {
      const sortedResults = [];
      for (const result of this.results) {
        const existResult = sortedResults.find(r => r.element === result.element);
        if (existResult) {
          existResult.count++;
        } else {
          sortedResults.push({
            ...result,
            count: 1,
          });
        }
      }
      sortedResults.sort((a, b) => {
        return this.form.isDesc ?
          b.count - a.count :
          a.count - b.count;
      });
      return sortedResults;
    }
  },
  methods: {
    getRandomOneFromArray(array) {
      const index = Math.floor(Math.random() * array.length);
      return {
        element: array[index],
        index,
      };
    },
    onSubmit() {
      const values = this.form.values.split(/[\n\s]+/g).filter(Boolean);
      if (values.length === 0) {
        return this.$message({
          type: 'error',
          message: '请输入内容',
        });
      }

      const clonedValues = this.form.isMergeRepeat ?
        [...new Set(values.map(v => v))] :
        values.map(v => v);
      const results = [];
      if (this.form.canRepeat) {
        for (let i = 0; i < this.form.time; i++) {
          results.push(this.getRandomOneFromArray(clonedValues));
        }
      } else {
        if (values.length < this.form.time) {
          return this.$message({
            type: 'error',
            message: '不允许重复抽中的情况下，抽奖次数不得多于奖池号码的数量',
          });
        }
        for (let i = 0; i < this.form.time; i++) {
          const result = this.getRandomOneFromArray(clonedValues)
          const { index } = result;
          clonedValues.splice(index, 1);
          results.push(result);
        }
      }
      this.results = results;
    },
    onReset() {
      this.form.values = '';
      this.form.canRepeat = false,
        this.form.time = 1;
    }
  },
})