<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
      <el-col :span="4">
        <el-button type="primary" class="searchRoles" @click="addRoles = true" >添加角色</el-button>
      </el-col>
      </el-row>

      <el-table :data="rolelist" border stripe>
         <el-table-column type="expand">
           <template v-slot="scope">
             <el-row v-for="(item1,index1) in scope.row.children" :key="item1.id" :class="['bdbottom']">
               <!-- 渲染一级权限 -->
               <el-col :span="5">
                  <el-tag closable @close="removeRightsId(scope.row,item1.id)">{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
               </el-col>
               <!-- 渲染二级和三级权限 -->
               <el-col :span="19">
                 <!-- 通过for循环嵌套渲染二级权限 -->
                 <el-row v-for="(item2,index2) in item1.children" :key="item2.id" :class="['bdbottom']">
                   <el-col :span="6">
                     <el-tag type="success" closable @close="removeRightsId(scope.row,item2.id)">{{item2.authName}}</el-tag>
                     <i class="el-icon-caret-right"></i>
                   </el-col>
                   <el-col :span="18">
                     <el-tag v-for="(item3,index3) in item2.children" :key="item3.id" :class="['bdbottom']"
                     type="warning" closable @close="removeRightsId(scope.row,item3.id)">
                        {{item3.authName}}
                     </el-tag>
                   </el-col>
                 </el-row>
               </el-col>
             </el-row>
           </template>
         </el-table-column>
        <el-table-column label="角色名称" prop="roleName"> </el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"> </el-table-column>
        <el-table-column label="操作">
        <template v-slot="scope">
          <el-button type="primary" icon="el-icon-edit" @click="editRolesDialog(scope.row.id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" @click="removeRolesId(scope.row)">删除</el-button>
          <el-button type="warning" icon="el-icon-info" @click="showSetRightDialog(scope.row)">分配权限</el-button>
        </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 点击分配权限展开对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="30%" @close="setRightDialogClosed">
      <!-- 树形控件 -->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id"
      default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>


      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allowRights">确 定</el-button>
      </span>
    </el-dialog>



    <!-- 修改用户的对话框 -->
   <el-dialog title="修改用户" :visible.sync="editDialog" width="30%" @close="editDialogClosed">

      <el-form :model="editRolesForm" :rules="editFormRules" label-width="70px" ref="editFormRef">
        <el-form-item label="角色名称">
          <el-input v-model="editRolesForm.roleName" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialog = false">取 消</el-button>
        <el-button type="primary" @click="editRolesInfo">确 定</el-button>
      </span>
    </el-dialog>
      


  </div>
</template>

<script>
  export default{
    name:"Roles",
    data(){
      return{
        //所有角色列表数据
        rolelist:[],
        setRightDialogVisible:false,
        //所有权限的数据
        rightsList:[],
        // 树形控件的属性绑定对象
        treeProps:{
          label:'authName',
          children:'children'
        },
        //默认选中节点id值的数组
        defKeys:[],
        //当前即将分配权限的
        roleId:'',
        editRolesForm:{},
        //编辑对话框
        editDialog:false,
        editFormRules:{
          roleDesc:[ {required:true,message:'请输入角色描述' , trigger:'blur'}],
          roleName:[ {required:true,message:'请输入角色名称' , trigger:'blur'}]
        }
      }
    },
    created(){
      this.getRoleslist()
    },
    methods:{
      async getRoleslist(){
        const {data:res} = await this.$http.get('roles')
         if(res.meta.status !== 200) return this.$message.error('请求失败')
         this.rolelist = res.data
         
      },
      // 根据id删除对应的权限
      async removeRightsId(index,rightId){
        //弹框提示是否确认删除
        const confirmResult = await this.$confirm('此操作将永久删除该用户，是否继续？', '确认信息', {
                 distinguishCancelAndClose: true,
                 confirmButtonText: '确定',
                 cancelButtonText: '取消',
                 type:'warning'
               }).catch(err =>
               {return  err } )
               
               if(confirmResult !== 'confirm') {
                 return this.$message.info('已经取消删除！')
               }
               const {data:res} = await this.$http.delete(`roles/${index.id}/rights/${rightId}`)
               if(res.meta.status !== 200) return this.$message.error('删除权限失败')
               this.$message.success('删除权限成功!')
               index.children = res.data
      },
      // 展示分配权限的对话框
      async showSetRightDialog(index){
        this.roleId = index.id
        const {data:res} = await this.$http.get('rights/tree')
          if(res.meta.status !== 200) return this.$message.error('获取权限数据失败')

          //获取到的权限数据保存到data中
          this.rightsList = res.data
          
          //递归获取三级节点的id
          this.getLeafKeys(index,this.defKeys)
          this.setRightDialogVisible = true
      },
      //通过递归的形式获取所有三级权限的id 保存到defKeys的数组中
      getLeafKeys(node,arr){
        //如果当前node节点不包含children属性，则是三级节点
        if(!node.children) {
          return arr.push(node.id)
        }
        node.children.forEach(item =>
          this.getLeafKeys(item,arr))
      },
      //监听对话框的关闭事件
      setRightDialogClosed(){
        this.defKeys = []
      },
      // 点击为角色分配权限
      async allowRights(){
        const keys = [
          this.$refs.treeRef.getCheckedKeys(),
          this.$refs.treeRef.getHalfCheckedKeys()
        ]

        const idStr = keys.join(',')
        const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
        if(res.meta.status !== 200) return this.$message.error('分配权限失败！')
        this.$message.success('分配权限成功！')
        this.getRoleslist()
        this.setRightDialogVisible = false
      },
      async removeRolesId(index){
        
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
                  const {data:res} = await this.$http.delete('roles/' + index.id)
                  if(res.meta.status !== 200) return this.$message.error('删除用户失败！')
                  this.$message.success('删除用户成功!')
                  this.getRoleslist()
      },
      // 编辑对话框
      async editRolesDialog(id){
        
        const {data:res} = await this.$http.get('roles/' + id)
         if(res.meta.status !== 200) return this.$message.error('查询用户信息失败！')
          this.editRolesForm = res.data
          
          this.editDialog = true
      },
      editDialogClosed(){
        this.$refs.editFormRef.resetFields()
      },
      async editRolesInfo(){

        this.$refs.editFormRef.validate(async valid =>{
          if(!valid) return
           const {data:res} = await this.$http.put('roles/' + this.editRolesForm.roleId,{roleName:this.editRolesForm.roleName,roleDesc:this.editRolesForm.roleDesc})
            if(res.meta.status !== 200) return this.$message.error('更新用户信息失败！')

            //关闭对话框
            this.editDialog = false
            //刷新数据列表
            this.getRoleslist()
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
  .el-table{
    margin-top: 15px;
  }
  .el-tag{
    margin: 7px;
  }
  .bdbottom{
    border-bottom: 1px solid #eee;
  }
  .el-row{
    display: flex;
    align-items: center;
  }
</style>
