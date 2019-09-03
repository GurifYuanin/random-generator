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
        <el-form-item label="自动生成奖池号码（整数）：">
          <span> 从 </span>
          <el-input-number size="small" :max="form.autoGenerator.max" v-model="form.autoGenerator.min"></el-input-number>
          <span> 到 </span>
          <el-input-number size="small" v-model="form.autoGenerator.max"></el-input-number>
          <el-button size="small" @click="onGenerateOrderValues">顺序生成</el-button>
          <el-button size="small" @click="onGenerateRandomValues">随机生成</el-button>
        </el-form-item>
        <el-form-item label="合并奖池重复号码：">
          <el-switch
            :disabled="true"
            v-model="form.isMergeRepeat">
          </el-switch>
        </el-form-item>
        <el-form-item label="抽奖机制：">
          <el-radio v-model="form.type" :label="0">抽 n 次后结束</el-radio>
          <component :is="form.canRepeat ? 'span' : 'el-tooltip'" effect="dark" content="该功能只有打开允许重复抽中才能使用" placement="top">
            <el-radio v-model="form.type" :label="1" :disabled="!form.canRepeat">某个号码被抽中 n 次后结束</el-radio>
          </component>
        </el-form-item>
        <el-form-item label="n：">
          <el-input-number v-model="form.time" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="允许重复抽中：">
          <el-switch
            v-model="form.canRepeat">
          </el-switch>
        </el-form-item>
        <el-form-item label="合并重复抽中项：">
          <component :is="form.canRepeat ? 'span' : 'el-tooltip'" effect="dark" content="该功能只有打开允许重复抽中才能使用" placement="top">
            <el-switch
              :disabled="!form.canRepeat"
              v-model="form.showRepeatTime">
            </el-switch>
          </component>
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
        <div>共抽了 {{ totalTime }} 次</div>
      </div>
    </el-card>
  </div>
  `,
  data() {
    return {
      form: {
        autoGenerator: {
          min: 1,
          max: 1,
        },
        type: 0,
        values: '',
        time: 1,
        isMergeRepeat: true,
        canRepeat: false,
        showRepeatTime: false,
        isDesc: true
      },
      results: [],
      totalTime: 0, // 一共抽奖次数
    }
  },
  watch: {
    'form.canRepeat'(v) {
      if (!v) {
        this.form.showRepeatTime = false;
        this.form.type = 0;
      }
    }
  },
  computed: {
    sortedResults() {
      const mergedResults = this.getMergedResults(this.results);
      mergedResults.sort((a, b) => {
        return this.form.isDesc ?
          b.count - a.count :
          a.count - b.count;
      });
      return mergedResults;
    }
  },
  methods: {
    getMergedResults(results) {
      const mergedResults = [];
      for (const result of results) {
        const existResult = mergedResults.find(r => r.index === result.index);
        if (existResult) {
          existResult.count++;
        } else {
          mergedResults.push({
            ...result,
            count: 1,
          });
        }
      }
      return mergedResults;
    },
    onGenerateOrderValues() {
      const min = this.form.autoGenerator.min;
      const max = this.form.autoGenerator.max;
      this.form.values = this.getOrderValues(min, max).join(' ');
    },
    getOrderValues(min, max) {
      return Array.from({
        length: max - min + 1
      }).map((_, i) => i + min);
    },
    onGenerateRandomValues() {
      const min = this.form.autoGenerator.min;
      const max = this.form.autoGenerator.max;
      const orderValues = this.getOrderValues(min, max);
      const randomValues = [];
      for (let i = 0; i < max - min + 1; i++) {
        const { element } = this.getRandomOneFromArray(orderValues);
        randomValues.push(element);
      }
      this.form.values = randomValues.join(' ');
    },
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
        this.totalTime = 0;
        switch(this.form.type) {
          case 0: {
            for (let i = 0; i < this.form.time; i++) {
              results.push(this.getRandomOneFromArray(clonedValues));
              this.totalTime++;
            }
            break;
          }
          case 1: {
            let maxRepeatTime = 0;
            while (maxRepeatTime < this.form.time) {
              results.push(this.getRandomOneFromArray(clonedValues));
              const mergedResults = this.getMergedResults(results);
              this.totalTime++;
              mergedResults.sort((a, b) => b.count - a.count);
              maxRepeatTime = mergedResults[0].count;
            }
            break;
          }
        }
      } else {
        if (values.length < this.form.time) {
          return this.$message({
            type: 'error',
            message: '不允许重复抽中的情况下，抽奖次数不得多于奖池号码的数量',
          });
        }
        this.totalTime = 0;
        for (let i = 0; i < this.form.time; i++) {
          const result = this.getRandomOneFromArray(clonedValues)
          this.totalTime++;
          const { index } = result;
          clonedValues.splice(index, 1);
          results.push(result);
        }
      }
      this.results = results;
    },
    onReset() {
      this.form.autoGenerator.min = 1;
      this.form.autoGenerator.max = 1;
      this.form.values = '';
      this.form.time = 1;
      this.form.isMergeRepeat = true;
      this.form.canRepeat = false;
      this.form.showRepeatTime = false;
      this.form.isDesc = true;
    }
  },
})