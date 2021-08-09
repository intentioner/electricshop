import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import User from '../components/user/User.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
import List from '../components/goods/List.vue'
import Add from '../components/goods/Add.vue'
import Orders from '../components/orders/Orders.vue'
import Report from '../components/report/Report.vue'

Vue.use(Router)

const router = new Router({
  routes: [
   {
     path:'/login',
     component:Login
   },
   {
     path:'/',
     redirect:'/login'
   },
   {
     path:'/home',
     component:Home,
     redirect:'/welcome',
     children:[
       {path:'/welcome',
       component:Welcome
       },
       {
         path:'/users',
         component:User
       },
       {
         path:'/rights',
         component:Rights
       },
       {
         path:'/roles',
         component:Roles
       },
       {
         path:'/categories',
         component:Cate
       },
       {
         path:'/params',
         component:Params
       },
       {
         path:'/goods',
         component:List
       },
       {
         path:'/goods/add',
         component:Add
       },
       {
         path:'/orders',
         component:Orders
       },
       {
         path:'/reports',
         component:Report
       }
     ]
   }
  ]
})
//to代表将要访问的路径
//from从哪个路径跳转而来
//next 表示放行的函数  next（）放行  next（'\login'）强行跳转
router.beforeEach((to,from,next) => {
  if(to.path === '/login') return next();
  //拿到token
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login')
  next()
})

export default router
