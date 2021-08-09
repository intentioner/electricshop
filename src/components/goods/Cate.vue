<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
      <el-col :span="4">
        <el-button type="primary" class="searchRoles" @click="showAddCateDialog">添加分类</el-button>
      </el-col>
      </el-row>

      <!-- 表格 -->
       <zk-table :data="catelist" :columns="columns"
       :selection-type="false" :expand-type="false"
       :show-index="true" :border="true"
       :show-row-hover="false" class="treetable">
       <!-- 是否有效 -->
          <template slot="isok" slot-scope="scope">
            <i class="el-icon-success" v-if="scope.row.cat_deleted === false"
            style="color: green;"></i>
            <i class="el-icon-error" v-else
            style="color: red;"></i>
          </template>
          <!-- 排序模板 -->
          <template slot="order" slot-scope="scope">
            <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag type="success" v-else="scope.row.cat_level === 1">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
             <!-- 操作模板 -->
             <template slot="opt" slot-scope="scope">
               <el-button type="primary" icon="el-icon-edit" @click="editerCateDialog(scope.row)">编辑</el-button>
                <el-button icon="el-icon-delete" type="danger"  @click="removeCateId(scope.row)">删除</el-button>
             </template>
        </zk-table>
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[3,5,10]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
              </el-pagination>
      <!-- 分页 -->

    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCatedialogVisible"
      width="30%" @close="addCateDialogClosed">

      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
           <el-cascader :options="parentCateList" expand-trigger="hover"
           :props="cascaderProps" v-model="selectedKeys"
              @change="parentCateChange" clearable change-on-select></el-cascader>
        </el-form-item>
        </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑商品对话框 -->
    <el-dialog title="编辑商品" :visible.sync="editCateDialog" width="30%" @close="editDialogClosed">

       <el-form :model="addCateForm" :rules="editCateFormRules" label-width="70px" ref="editFormRef">
         <el-form-item label="分类名称">
           <el-input v-model="addCateForm.cat_Name"></el-input>
         </el-form-item>

       </el-form>
       <span slot="footer" class="dialog-footer">
         <el-button @click="editCateDialog = false">取 消</el-button>
         <el-button type="primary" @click="editCateInfo">确 定</el-button>
       </span>
     </el-dialog>
  </div>
</template>

<script>
  export default{
    name:"Cate",
    data(){
      return{
        //查询条件
        queryInfo:{
          type:3,
          pagenum:1,
          pagesize:5,
          },
          //商品分类默认列表
           catelist:[],
           //总数据条数
           total:0,
           //为table指定列的定义
           columns:[
             {
               label:'分类名称',
               prop:'cat_name'
             },
             {
               label:'是否有效',
               //将当前列定义为模板列
               type:'template',
               //表示当前这一列使用的模板名称
               template:'isok'
             },
             {
               label:'排序',
               //将当前列定义为模板列
               type:'template',
               //表示当前这一列使用的模板名称
               template:'order'
             },
             {
               label:'操作',
               //将当前列定义为模板列
               type:'template',
               //表示当前这一列使用的模板名称
               template:'opt'
             }
             ],
             addCatedialogVisible: false,
             //添加分类的表单数据对象
             addCateForm:{
                cat_name:'',
                //父级分类的id
                cat_pid:0,
                cat_level:0
             },
             //添加分类标点的验证规则对象
             addCateFormRules:{
               cat_name:[
                 {required:true,message:'请输入分类的名称',trigger:'blur'}
               ]
             },
             //父级分类的列表
             parentCateList:[],
             //指定级联选择器的配置对象
             cascaderProps:{
               value:'cat_id',
               label:'cat_name',
               children:'children'
             },
             //选中的父级分类的id数组
             selectedKeys:[],
             editCateDialog:false,
             editCateFormRules:{
               cat_name:[ {required:true,message:'请输入分类名称' , trigger:'blur'}]

             }

      }
    },
    created(){
        this.getCatelist()
    },
    methods:{
      //获取商品分类数据
      async getCatelist(){
          const {data:res} = await this.$http.get('categories',{params:this.queryInfo})
          if(res.meta.status !== 200) return this.$message.error('获取商品分类数据失败！')
          this.catelist = res.data.result
          
          //为总数据条数赋值
          this.total = res.data.total
        },
        //监听pagesize 改变的事件
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            this.getCatelist()
        },
        //监听pagenum的改变
        handleCurrentChange(newPage){
          this.queryInfo.pagenum = newPage
          this.getCatelist()
        },
        showAddCateDialog(){
          //获取父级分类数据列表
          this.getParentCateList()
          this.addCatedialogVisible =true

        },
        //获取父级分类的数据列表
        async getParentCateList(){
          const {data:res} = await this.$http.get('categories',{params:{
            type:2
          }})
          if(res.meta.status !== 200) return this.$message.error('获取父级分类数据失败！')
          
           this.parentCateList = res.data
        },
        //选择项发生变化 触发这个函数
        parentCateChange(){
          
          //如果selectedKeys中的length>0 证明选中了父级分类，反之没有选中
          if(this.selectedKeys.length > 0) {
            this.addCateForm.cat_pid=this.selectedKeys[this.selectedKeys.length -1]
            this.addCateForm.cat_level = this.selectedKeys.length
            return
          }else {
            this.addCateForm.cat_pid= 0
            this.addCateForm.cat_level = 0
          }
        },
        //点击按钮，添加新的分类
        addCate(){
          
          this.$refs.addCateFormRef.validate(async valid => {
            if(!valid) return
           const {data:res} = await this.$http.post('categories',this.addCateForm)
           if(res.meta.status !== 201) this.$message.error('添加分类失败！')
           this.$message.success('添加分类成功！')
           this.getCatelist()
           this.addCatedialogVisible = false
          })
        },
        // 监听对话框的关闭事件,重置表单数据
        addCateDialogClosed(){
          this.$refs.addCateFormRef.resetFields()
          this.selectedKeys = []
          this.addCateForm.cat_level = 0
          this.addCateForm.cat_pid = 0
        },
        async removeCateId(index){
          
          const confirmResult = await this.$confirm('此操作将永久删除该用户，是否继续？', '确认信息', {
                      distinguishCancelAndClose: true,
                      confirmButtonText: '确定',
                      cancelButtonText: '取消',
                      type:'warning'
                    }).catch(err => {
                      return err })
                    
                    if(confirmResult !== 'confirm') {
                      return this.$message.info('已经取消删除！')
                    }
                    const {data:res} = await this.$http.delete('categories/' + index.cat_id)
                    if(res.meta.status !== 200) return this.$message.error('删除用户失败！')
                    this.$message.success('删除用户成功!')
                    this.getCatelist()
        },
        async editerCateDialog(id){
          
          const {data:res} = await this.$http.get('categories/' + id.cat_id)
           if(res.meta.status !== 200) return this.$message.error('查询用户信息失败！')
            this.addCateForm = res.data
            
            this.editCateDialog = true
        },
        editDialogClosed(){
          this.$refs.editFormRef.resetFields()
        },
        async editCateInfo(){
          this.$refs.editFormRef.validate(async valid =>{
            if(!valid) return
             const {data:res} = await this.$http.put('categories/' + this.addCateForm.cat_id,{cat_name:this.addCateForm.cat_name})
              if(res.meta.status !== 200) return this.$message.error('更新用户信息失败！')

              //关闭对话框
              this.editCateDialog = false
              //刷新数据列表
              this.getCatelist()
              //提示信息成功
              this.$message.success('更新用户信息成功！')
          })
        }
    }
  }
</script>

<style lang="less" scoped>
  .el-card{
    margin-top: 15px;
  }
  .treetable{
    margin-top: 15px;
  }
  .el-cascader{
    width: 100%;
  }
</style>
