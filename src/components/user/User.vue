<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索与添加区 -->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
              </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" class="searchUser" @click="addDialog = true">添加用户</el-button>
          </el-col>
        </el-row>

     <!-- 用户列表区域 -->
     <el-table :data="userlist" border stripe>
       <el-table-column type="index"></el-table-column>
       <el-table-column label="姓名" prop="username"></el-table-column>
       <el-table-column label="邮箱" prop="email"></el-table-column>
       <el-table-column label="电话" prop="mobile"></el-table-column>
       <el-table-column label="角色" prop="role_name"></el-table-column>
       <el-table-column label="状态">
         <template v-slot="scope">
           <!-- scope.row相当于当前行的数据对象 -->
           <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)">
           </el-switch>
         </template>
       </el-table-column>
       <el-table-column label="操作">
         <template v-slot="scope">
           <el-button type="primary" icon="el-icon-edit" size="small" @click="showEditDialog(scope.row.id)"></el-button>
           <el-button type="danger" icon="el-icon-delete" size="small" @click="removeUserId(scope.row.id)"></el-button>
           <el-tooltip effect="dark" content="分配角色" placement="top">
              <el-button type="warning" icon="el-icon-setting" size="small" @click="setRole(scope.row)"></el-button>
           </el-tooltip>
         </template>
       </el-table-column>
     </el-table>
     <!-- 分页区域 -->
     <el-pagination
           @size-change="handleSizeChange"
           @current-change="handleCurrentChange"
           :current-page="queryInfo.pagenum"
           :page-sizes="[1, 2, 3, 4]"
           :page-size="queryInfo.pagesize"
           layout="total, sizes, prev, pager, next, jumper"
           :total="total">
         </el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialog" width="30%" @close="addDialogClosed">
      <!-- 内容主题区域 -->

      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>

        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 提示框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialog = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialog" width="30%" @close="editDialogClosed">

      <el-form :model="editForm" :rules="editFormRules" label-width="70px" ref="editFormRef">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>

        <el-form-item label="密码">
          <el-input v-model="editForm.password" disabled></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>

        <el-form-item label="电话" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialog = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
     <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="30%" @close="setRoleDialogClosed">
      <div>
        <p>当前的用户： {{userInfo.username}}</p>
        <p>当前的角色:  {{userInfo.role_name}}</p>
        <p>分配新角色:
        <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
         </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  export default{
    name:"User",
    data(){
      return {
        queryInfo:{
          query:'',
          pagenum:1,
          pagesize:2
        },
        userlist:[],
        total:0,
        //控制添加用户对话框的隐藏和显示
        addDialog:false,
        //添加用户的表单数据
        addForm:{
          username:'',
          password:'',
          email:'',
          mobile:''
        },
        //添加表单的验证规则对象
        addFormRules:{
        username:[
          {required:true,message:'请输入用户名' , trigger:'blur'},
          {min:3,max:10,message:'用户名长度在3-10个字符',trigger: 'blur'}],
        password:[
          {required:true,message:'请输入用户密码' , trigger:'blur'},
          {min:6,max:15,message:'用户名长度在6-15个字符',trigger: 'blur'}
        ],
        email:[
          {required:true,message:'请输入用户邮箱' , trigger:'blur'},
        ],
        mobile:[
          {required:true,message:'请输入用户电话' , trigger:'blur'},
        ]
        },
        //控制修改用户对话框的显示与隐藏
        editDialog:false,
        //查询到的用户信息对象
        editForm:{},
        editFormRules:{
          email:[
            {required:true,message:'请输入用户邮箱' , trigger:'blur'},
          ],
          mobile:[
            {required:true,message:'请输入用户电话' , trigger:'blur'},
          ]
        },
        //控制分配角色的对话框的隐藏
        setRoleDialogVisible:false,
        //需要被分配角色的用户信息
        userInfo:{},
        //所有角色数据列表
        rolesList:[],
        //已选中select的角色
        selectedRoleId:''


      }
    },
    created(){
      this.getUserList()
    },
    methods:{
      async getUserList(){
        const {data:res} = await this.$http.get('users',{params:this.queryInfo})
         console.log(res)
        if(res.meta.status !== 200) return this.$message.error('failed')
        this.userlist = res.data.users
        this.total = res.data.total
      },
      handleSizeChange(newSize){
        this.queryInfo.pagesize = newSize
        this.getUserList()
      },
      handleCurrentChange(newPage){
        this.queryInfo.pagenum = newPage
        this.getUserList()
      },
      //监听switch开关状态改变
      async userStateChange(index){
        const {data:res} = await this.$http.put(`users/${index.id}/state/${index.mg_state}`)
        if(res.meta.status !== 200) {
          index.mg_state = !index.mg_state
        return this.$message.error('更新用户状态失败')}
        this.$message.success('更新用户状态成功')

      },
      //监听添加用户对话框的关闭事件,重置表单
      addDialogClosed(){
        this.$refs.addFormRef.resetFields()
      },
      //点击按钮添加新用户
      addUser(){
        this.$refs.addFormRef.validate(async valid =>{
          if(!valid) return
          //可以发送添加用户的网络请求
          const {data:res} = await this.$http.post('users',this.addForm)
          if(res.meta.status !== 201) return this.$message.error('添加用户失败')
          this.$message.success('添加用户成功')
          //隐藏添加用户对话框
          this.addDialog = false
          this.getUserList()
        })
      },
      //展示用户编辑的对话框
      async showEditDialog(id){
       const {data:res} = await this.$http.get('users/' + id)
       if(res.meta.status !== 200) return this.$message.error('查询用户信息失败')
        this.editForm = res.data
        this.editDialog = true
      },
      //监听修改用户对话框的修改事件
      editDialogClosed(){
        this.$refs.editFormRef.resetFields()
      },
      //修改用户信息并提交
      editUserInfo(){
        this.$refs.editFormRef.validate(async valid =>{
          if(!valid) return
           const {data:res} = await this.$http.put('users/' + this.editForm.id,{email:this.editForm.email,mobile:this.editForm.mobile})
            if(res.meta.status !== 200) return this.$message.error('更新用户信息失败！')

            //关闭对话框
            this.editDialog = false
            //刷新数据列表
            this.getUserList()
            //提示信息成功
            this.$message.success('更新用户信息成功！')
        })
      },
      //根据id删除用户的信息
      async removeUserId(index){
         const confirmResult = await this.$confirm('此操作将永久删除该用户，是否继续？', '确认信息', {
                  distinguishCancelAndClose: true,
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type:'warning'
                }).catch(err => {
                  return err })
                console.log(confirmResult)
                if(confirmResult !== 'confirm') {
                  return this.$message.info('已经取消删除！')
                }
                const {data:res} = await this.$http.delete('users/' + index)
                if(res.meta.status !== 200) return this.$message.error('删除用户失败！')
                this.$message.success('删除用户成功!')
                this.getUserList()
      },
      //展示分配角色的对话框
      async setRole(index){
        this.userInfo = index
        //在展示对话框之前获取所有值列表
        const {data:res} = await this.$http.get('roles')
        if(res.meta.status !== 200) return this.$message.error('获取角色列表失败')
        this.rolesList = res.data
        this.setRoleDialogVisible = true
      },
      async saveRoleInfo(){
        if(!this.selectedRoleId) {
          return this.$message.error('请选择要分配的角色!')
        }
       const {data:res} = await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.selectedRoleId})
       if(res.meta.status !== 200) return this.$message.error('更新角色失败！')
      this.$message.success('更新角色成功！')
      this.getUserList()
      this.setRoleDialogVisible = false
      },
      //监听分配角色对话框的分配事件
      setRoleDialogClosed(){
        this.selectedRoleId = '',
        this.userInfo = {}
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-breadcrumb{
    margin-bottom: 15px;
  }
  .el-card{
    box-shadow: 0 1px 1px rgba(0,0,0,.15);
  }
  .searchUser{
    margin-left: 5px;
  }
  .el-table{
    margin-top: 15px;
  }
  .el-pagination{
    margin-top: 15px;
  }
</style>
