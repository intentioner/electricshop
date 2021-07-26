<template>
    <div class="login_container">
        <div class="login_box">
          <!-- 头像区 -->
          <div class="head_box">
            <img src="../assets/img/head.jpg" />
          </div>
          <!-- 登录表单区 element ui 官网 -->
          <el-form ref="loginFormRef" label-width="0px" class="loginform" :model="loginForm" :rules="loginFormRules">
            <!-- 用户名 -->
            <el-form-item prop="username">
              <el-input prefix-icon="el-icon-s-check" v-model="loginForm.username"></el-input>
            </el-form-item>
            <!-- 密码 -->
            <el-form-item prop="password">
              <el-input prefix-icon="el-icon-key" v-model="loginForm.password" type="password" :rules="loginFormRules"></el-input>
            </el-form-item>
            <!-- 按钮 -->
            <el-form-item class="btns">
              <el-button type="primary" @click="login">登录</el-button>
              <el-button type="info" @click="resetLogin">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
    </div>
</template>

<script>
    export default{
        name:"Login",
        data(){
          return {
            //登录表单的数据绑定对象
            loginForm:{
              username:'admin',
              password:'123456'
            },
            //表单验证规则对象
            loginFormRules:{
              //验证用户名，密码是否合法
              username:[{ required: true, message: '请输入登录名称', trigger: 'blur' },
              { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }],
              password:[{ required: true, message: '请输入登录密码', trigger: 'blur' },
              { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }]
            }
          }
        },
        methods:{
          //点击重置按钮，重置表单
          resetLogin(){
             this.$refs.loginFormRef.resetFields()
          },
          login(){
            this.$refs.loginFormRef.validate(async valid => {
              if(!valid) return;
               const {data:res} =await this.$http.post("login",this.loginForm);

               if(res.meta.status !== 200)
               return this.$message.error("登录失败");
               this.$message.success('登陆成功');
               //保存token的值到客户端的sessionStorage
               //sessionStorage网页f12 application可查看
               window.sessionStorage.setItem('token',res.data.token);
               //通过编程式导航跳转到后台主页，路由地址是 /home
               this.$router.push('\home')
            })
          }
        }
    }
</script>

<style lang="less" scoped>
  .login_container{
    background-color: #2b4b6b;
    height: 100%;
  }
  .login_box{
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 5px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    .head_box{
      height: 130px;
      width: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #ddd;
      position: absolute;
      left: 50%;
      transform: translate(-52%,-50%);
      background-color: #FFFFFF;
      img{
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }
  }
  .loginform{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
  .btns{
    display: flex;
    justify-content: flex-end; //尾部对齐
  }
</style>
