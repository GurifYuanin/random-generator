const app = new Vue({
  el: '#app',
  template: `
  <div>
    <el-card>
      <div slot="header">
        <span>参数设置</span>
      </div>
      <el-form :model="form" label-width="150px">
        <el-form-item label="奖池号码：">
          <el-input
            type="textarea"
            :rows="2"
            placeholder="请输入可能被抽中的值，使用空格或换行隔开"
            v-model="form.values">
          </el-input>
        </el-form-item>
        <el-form-item label="抽奖次数：">
          <el-input-number v-model="form.time" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="是否允许重复抽中：">
          <el-switch
            v-model="form.canRepeat">
          </el-switch>
        </el-form-item>
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
      <div v-else v-for="result in results" :key="result">
        {{ result }}
      </div>
    </el-card>
  </div>
  `,
  data() {
    return {
      form: {
        values: '',
        canRepeat: false,
        time: 1,
      },
      results: [],
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

      const clonedValues = values.map(v => v);
      const results = [];
      if (this.form.canRepeat) {
        for (let i = 0; i < this.form.time; i++) {
          const { element } = this.getRandomOneFromArray(clonedValues);
          results.push(element);
        }
      } else {
        if (values.length < this.form.time) {
          return this.$message({
            type: 'error',
            message: '不允许重复抽中的情况下，抽奖次数不得多于奖池号码的数量',
          });
        }
        for (let i = 0; i < this.form.time; i++) {
          const { element, index } = this.getRandomOneFromArray(clonedValues);
          results.push(element);
          clonedValues.splice(index, 1);
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