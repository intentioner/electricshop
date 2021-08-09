<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>


    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意:只允许为第三级分类设置相关参数!" type="warning" :closable="false" show-icon></el-alert>
      <el-row>
        <el-col>
          <span>选择商品的分类：</span>
            <el-cascader
                v-model="selectedCatekeys"
                :options="catelist"
                expand-trigger="hover"
                @change="handleChange"
                :props="cateProps"></el-cascader>
        </el-col>
      </el-row>
        <el-tabs v-model="activeName" @tab-click="handleTabClick">
          <!-- 添加动态参数的面板 -->
          <el-tab-pane label="动态参数" name="many">
            <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVsible =true">添加参数</el-button>
            <!-- 动态参数表格 -->
            <el-table :data="manyTabData" border stripe>
             
              <!-- 索引列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                  </template>
                </el-table-column>
            </el-table>
          </el-tab-pane>
          <!-- 添加静态属性的面板 -->
          <el-tab-pane label="静态属性" name="only">
            <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVsible =true">添加属性</el-button>

            <!-- 静态属性表格 -->
            <el-table :data="onlyTabData" border stripe>
              <!-- 展开行 -->
              <el-table-column type="expand"></el-table-column>
              <!-- 索引列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                  </template>
                </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加'+ titleText" :visible.sync="addDialogVsible" width="30%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
       </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVsible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'修改'+ titleText" :visible.sync="editDialogVsible" width="30%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
       </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVsible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  export default{
    name:"Params",
    data(){
      return {
        //商品分类列表
        catelist:[],
        //级联选择框的配置对象
        cateProps:{
          value:'cat_id',
          label:'cat_name',
          children:'children'
        },
        //级联选择框绑定的数组
        selectedCatekeys:[],
        //被激活的页签的名称
        activeName:'many',
        //动态参数的数据
        manyTabData:[],
        //静态属性的数据
        onlyTabData:[],
        //控制添加对话框的隐藏
        addDialogVsible:false,
        // 添加参数的表单
        addForm:{
          attr_name:''
        },
        //添加表单的验证规则对象
        addFormRules:{
          attr_name:[{required:true,message:'请输入参数名称',trigger:'blur'},]
        },
        //控制编辑对话框的关闭
        editDialogVsible:false,
        //编辑表单的对象
        editForm:{},
        //编辑规则
        editFormRules:{
            attr_name:[{required:true,message:'请输入参数名称',trigger:'blur'},]
        }
      }
    },
    created(){
      this.getCatelist()
    },
    methods:{
      // 获取所有的商品分类列表
      async getCatelist(){
        const {data:res} = await this.$http.get('categories')
        if(res.meta.status !== 200) return this.$message.error('获取商品分类失败！')
        this.catelist = res.data
        
      },
      //级联选择框选中项变化，会触发这个函数
       handleChange(){
       this.getParamsData()
      },
      //tab页签点击事件处理函数
      handleTabClick(){
        
        this.getParamsData()
      },
      // 获取参数列表数据
     async getParamsData(){
            //证明选中的不是三级分类
          if(this.selectedCatekeys.length !== 3)
          {
            this.selectedCatekeys = []
            return
          }
          //证明选中的是三级分类
          


          //根据所选分类的id，和当前所处的面板，获取对应的参数
          const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:this.activeName}})
          if(res.meta.status !== 200) return this.$message.error('获取参数列表失败！')

          if(this.activeName === 'many') {this.manyTabData = res.data}
          else{
            this.onlyTabData = res.data
          }
      },
      //监听添加对话框的关闭事件
      addDialogClosed(){
        this.$refs.addFormRef.resetFields()
      },
      //点击按钮添加参数
      addParams(){
        this.$refs.addFormRef.validate(async valid => {
          if(!valid) return
         const {data:res} = await this.$http.post(`categories/${this.cateId}/attributes`,{attr_name:this.addForm.attr_name,attr_sel:this.activeName})
         if(res.meta.status !== 201) return this.$message.error('添加参数失败！')
         this.$message.success('添加参数成功！')
         this.addDialogVsible = false
         this.getParamsData()
        })
      },
      //点击按钮 展开编辑的对话框
      async showEditDialog(index){
        //查询当前参数的信息
        const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes/${index}`,{params:{attr_sel:this.activeName}})
          if(res.meta.status !== 200) return this.$message.error('获取参数信息失败！')
          this.editForm = res.data
          this.editDialogVsible = true
      },
      //监听编辑对话框的关闭
      editDialogClosed(){
        //重置修改的表单
        this.$refs.editFormRef.resetFields()
      },
      //点击按钮修改参数信息
      editParams(){
          this.$refs.editFormRef.validate(async  valid => {
            if(!valid) return
            const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{attr_name:this.editForm.attr_name,attr_sel:this.activeName})
           if(res.meta.status !== 200 ) return this.$message.error('修改参数失败！')
           this.$message.success('修改参数成功！')
           this.getParamsData()
           this.editDialogVsible = false
          })
      },
      //根据id删除对应的操作
      async removeParams(index){
        const confirm = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                }).catch(err => err)
               if(confirm !== 'confirm') {
                  return this.$message.info('已经取消删除！')
                }
                const {data:res} = await this.$http.delete(`categories/${this.cateId}/attributes/${index}`)
                  if(res.meta.status !== 200) return this.$message.error('删除参数失败！')
                  this.$message.success('删除参数成功!')
                  this.getParamsData()
      }
    },
    computed:{
      //如果按钮要被禁用 返回true  否则返回false
      isBtnDisabled(){
        if(this.selectedCatekeys.length !== 3 ) {return true}
        return false
      },
      //当前选中的三级分类的id
      cateId(){
        if(this.selectedCatekeys.length === 3)
         return this.selectedCatekeys[2]
        return null
      },
      //动态计算标题的文本
      titleText(){
        if(this.activeName === 'many') return '动态参数'
        return '静态属性'
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-card{
    margin-top: 15px;
  }
  .el-row{
    margin-top: 15px;
  }
</style>
