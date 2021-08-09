<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>

        <div id="main" style="width: 750px; height: 400px;"></div>
    </el-card>
  </div>
</template>

<script>
  import * as echarts from 'echarts'
  import _ from 'lodash'

  export default{

    data(){
      return {
        //需要合并的数据
          options: {
                  title: {
                    text: '用户来源'
                  },
                  tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                      type: 'cross',
                      label: {
                        backgroundColor: '#E9EEF3'
                      }
                    }
                  },
                  grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                  },
                  xAxis: [
                    {
                      boundaryGap: false
                    }
                  ],
                  yAxis: [
                    {
                      type: 'value'
                    }
                  ]
                }
      }
    },
    created(){

    },
    //此时页面上的元素已经渲染完毕
    async mounted() {
      //基于准备好的dom，初始化echarts实例
      var myChart = echarts.init(document.getElementById('main'))

      // 准备数组配置项
      const {data:res} = await this.$http.get('reports/type/1')
      if(res.meta.status !== 200) return this.$message.error('获取折现图数据失败！')


        const result = _.merge(res.data,this.options)
        //展示数据
        myChart.setOption(res.data)
    },
    methods:{

    }


  }
</script>

<style lang="less" scoped>
  .el-card{
    margin-top: 15px;
  }
</style>
