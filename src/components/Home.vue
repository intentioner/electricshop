<template>
    <el-container class="home-container">
      <!-- 头部区域 -->
      <el-header>
        <div class="mixheader">
          <img src="../assets/img/head.jpg"/>
          <span>电商后台管理系统</span>
        </div>
        <el-button type="info" @click="logOut">退出</el-button>
      </el-header>
      <!-- 页面主题区域 -->
      <el-container>
        <!-- 侧边栏 -->
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <div class="CliButton" @click="ClickButton">| | |</div>
          <!-- 菜单区 -->
      <el-menu background-color="#333744" text-color="#fff"
      active-text-color="#409eff" :unique-opened="true" :collapse="isCollapse"
      :collapse-transition="false" :router="true" :default-active="activePath">
        <!-- 一级菜单 -->
        <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
          <!-- 一级菜单的模板区域 -->
          <template slot="title">
          <!-- 图标和文本 -->
             <i :class="iconlist[item.id]"></i>
             <span>{{item.authName}}</span>
           </template>

          <el-menu-item :index=" '/' + subitem.path" v-for="subitem in item.children"
          :key="subitem.id" @click="saveNavState('/' +  subitem.path)">
            <template slot="title">
               <i class="el-icon-menu"></i>
               <span>{{subitem.authName}}</span>
             </template>
          </el-menu-item>
        </el-submenu>
      </el-menu>
        </el-aside>
        <!-- 主题部分 -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
</template>

<script>
  export default{
    data(){
      return {
        menulist:[],
        iconlist:{
          '125':'el-icon-s-custom',
          '103':'el-icon-s-opportunity',
          '101':'el-icon-s-shop',
          '102':'el-icon-s-claim',
          '145':'el-icon-s-data'
        },
        isCollapse:false,
        activePath:''
      }
    },
    created(){
      this.getMenuList()
      this.activePath = window.sessionStorage.getItem('activePath')
    },
    name:"home",
    methods:{
      logOut(){
        window.sessionStorage.clear()
        this.$router.push('\login')
      },
      // 获取所有的菜单
      async getMenuList(){
         const {data:res} = await this.$http.get('menus')
         if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
         this.menulist = res.data
         
      },
      //点击按钮 折叠菜单
      ClickButton(){
        this.isCollapse = !this.isCollapse

      },
      saveNavState(activePath){
        window.sessionStorage.setItem('activePath',activePath)
        this.activePath = activePath
      }
    }
  }
</script>

<style lang="less" scoped>
   .home-container{
     height:100%;
   }
  .el-header{
    background-color: #333744;
    display: flex;
    justify-content: space-between;
    padding-left: 5;
    //退出按钮居中
    align-items: center;
    //所有的文字变为白色
    color: #fff;
    font-size: 20px;
    >div{
      display: flex;
      align-items: center;
      span {
        margin-left: 15px;
      }
    }
  }
  .el-aside{
    background-color: #333744;
  }
  .el-main{
    background-color: #eaedf1;
  }
  .mixheader{
    img{
      height: 55px;
      width: 55px;
      border-radius: 50%;
    }
  }
   .iconfont{
    margin-right: 5px;
   }
   .CliButton{
     background-color: #4a5064;
     font-size: 10px;
     text-align: center;
     color: #fff;
     line-height: 25px;
     cursor: pointer;
   }
</style>
