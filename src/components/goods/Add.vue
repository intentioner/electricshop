<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告提示区域 -->
       <el-alert title="添加商品信息" type="info" :closable="false" show-icon center></el-alert>
       <!-- 步骤条 -->
       <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
         <el-step title="基本信息"></el-step>
         <el-step title="商品参数"></el-step>
         <el-step title="商品属性"></el-step>
         <el-step title="商品图片"></el-step>
         <el-step title="商品内容"></el-step>
         <el-step title="完成"></el-step>
       </el-steps>

      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
           <el-tab-pane label="基本信息" name="0">
           <el-form-item label="商品名称" prop="goods_name">
             <el-input v-model="addForm.goods_name"></el-input>
           </el-form-item>
           <el-form-item label="商品价格" prop="goods_price">
             <el-input v-model="addForm.goods_price" type="number"></el-input>
           </el-form-item>
           <el-form-item label="商品重量" prop="goods_weight" >
             <el-input v-model="addForm.goods_weight" type="number"></el-input>
           </el-form-item>
           <el-form-item label="商品数量" prop="goods_number">
             <el-input v-model="addForm.goods_number" type="number"></el-input>
           </el-form-item>
           <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                  v-model="addForm.goods_cat"
                  :options="catelist"
                  expand-trigger="hover"
                  @change="handleChange" :props="cateProps"></el-cascader>
           </el-form-item>
          </el-tab-pane>
           <el-tab-pane label="商品参数" name="1">
             <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
               <!-- 复选框组 -->
                <el-checkbox-group v-model="item.attr_vals">
                   <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
                 </el-checkbox-group>
             </el-form-item>
           </el-tab-pane>
           <el-tab-pane label="商品属性" name="2">
             <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
               <el-input v-model="item.attr_vals"></el-input>
             </el-form-item>
           </el-tab-pane>
           <el-tab-pane label="商品图片" name="3">
             <!-- action 表示图片要上传到的后台api地址 -->
             <el-upload
               :action="uploadURL"
               :on-preview="handlePreview"
               :on-remove="handleRemove"
               list-type="picture" :headers="headerObj" :on-success="handleSuccess">
               <el-button size="small" type="primary">点击上传</el-button>
             </el-upload>
           </el-tab-pane>
           <el-tab-pane label="商品内容" name="4">
             <!-- 富文本编辑器组件 -->
             <quill-editor v-model="addForm.goods_introduce"></quill-editor>
             <!-- 添加商品的按钮 -->
             <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
           </el-tab-pane>
         </el-tabs>
       </el-form>

    </el-card>
    <!-- 图片预览 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewVisible"
      width="30%">
      <img :src="previewPath" class="previewimg"/>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import _ from 'lodash'

  export default{
    name:"Add",
    data(){
      return {
        activeIndex:'0',
        //添加商品的表单对象
        addForm:{
          goods_name:'',
          goods_price:0,
          goods_weight:0,
          goods_number:0,
          //商品所属的分类数组
          goods_cat:[],
          //图片的数组
          pics:[],
          //商品的详情描述
          goods_introduce:'',
          attrs:[]
        },
        addFormRules:{
          goods_name:[
            {required:true,message:'请输入商品名称',trigger:blur}
          ],
          goods_price:[
            {required:true,message:'请输入商品价格',trigger:blur}
          ],
          goods_weight:[
            {required:true,message:'请输入商品重量',trigger:blur}
          ],
          goods_number:[
            {required:true,message:'请输入商品数量',trigger:blur}
          ],
          goods_cat:[
            {required:true,message:'请选择商品分类',trigger:blur}
          ]
        },
        //商品分类列表
        catelist:[],
        cateProps:{
          label:'cat_name',
          value:'cat_id',
          children:'children'
        },
        //动态参数列表数据
        manyTableData:[],
        //静态属性数据
        onlyTableData:[],
        //上传图片的url地址
        uploadURL:'http://127.0.0.1:8888/api/private/v1/upload',
        headerObj:{
          Authorization:window.sessionStorage.getItem('token')
        },
        previewPath:'',
        previewVisible:false
      }
    },
    created() {
     this.getCateList()
    },
    methods:{
      async getCateList() {
         const {data:res} = await this.$http.get('categories')
         if(res.meta.status !== 200) return this.$message.error('获取商品数据失败！')
          this.catelist = res.data
          
       },
       //级联选择器 选中项 触发函数
       handleChange(){
         
         if(this.addForm.goods_cat.length !== 3)
         this.addForm.goods_cat = []
       },
       beforeTabLeave(activeName,oldActiveName){
         if(oldActiveName === '0' && this.addForm.goods_cat.length !== 3)
         {
           this.$message.error('请先选择商品分类！')
           return false
         }
       },
       async tabClicked() {
         //访问动态参数面板

         
         if(this.activeIndex === '1')  {
           const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params:{sel:'many'}})
         if(res.meta.status !== 200) return this.$message.error('获取动态参数列表失败！')
           
           res.data.forEach( item => {
             item.attr_vals = item.attr_vals.length === 0 ? []: item.attr_vals.split(',')
           })
            this.manyTableData = res.data
         } else if(this.activeIndex === '2') {
           const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params:{sel:'only'}})
           if(res.meta.status !== 200) return this.$message.error("获取静态属性失败！")
           
           this.onlyTableData =res.data
         }
       },
       //处理图片预览效果
       handlePreview(file){
        console.log(file)
        this.previewPath = file.response.data.url
        this.previewVisible = true
       },
       //处理移除图片的操作
       handleRemove(file){
          
          const filePath = file.response.data.tmp_path
          const i = this.addForm.pics.findIndex(x =>
          x.pic === filePath)
          this.addForm.pics.splice(i,1)
          
       },
       handleSuccess(response){
         
         //拼接得到一个图片信息对象
           const picInfo = {pic:response.data.tmp_path}
         //将图片信息对象push到pics数组中
         this.addForm.pics.push(picInfo)
         
       },
       add(){
         
         this.$refs.addFormRef.validate(async valid => {
           if(!valid) {
             return this.$message.error('请填写必要表单项！')
           }
           const form = _.cloneDeep(this.addForm)
           form.goods_cat = form.goods_cat.join(',')
           //处理动态参数 静态属性
           this.manyTableData.forEach(item => {
             const newInfo = {attr_id:item.attr_id,attr_value:item.attr_vals.join(' ')}
             this.addForm.attrs.push(newInfo)
           })
           this.onlyTableData.forEach(item => {
             const newInfo = {attr_id:item.attr_id,attr_value:item.attr_vals}
             this.addForm.attrs.push(newInfo)
           })
           form.attrs = this.addForm.attrs
           
           //发起请求 添加商品 商品名称必须是唯一的

          const {data:res} = await this.$http.post('goods',form)
          if(res.meta.status !== 201) return this.$message.error('添加商品失败！')
          this.$message.success('添加商品成功！')
          this.$router.push('/goods')
         })
       }
    },
    computed:{
      cateId(){
        if(this.addForm.goods_cat.length === 3) {
          return this.addForm.goods_cat[2]
        }
          return null
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-card{
    margin-top: 15px;
  }
  .el-steps{
    margin-top: 15px;
  }
  .el-tabs{
    margin-top: 15px;
  }
  .el-checkbox{
    margin: 0 10px 0 0 !important;
  }
  .previewimg{
    width: 100%;
  }
  .ql-editor{
    min-height: 300px;
  }
  .btnAdd{
    margin-top: 15px;
  }
</style>
