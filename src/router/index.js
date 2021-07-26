import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

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
     component:Home
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
