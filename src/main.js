import Vue from 'vue'
import App from './App'
import router from './router'
//全局样式
import './assets/css/global.css'
import axios from 'axios'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import ZkTable from 'vue-table-with-tree-grid'
//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 导入NProgress包对应的js 和css
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
//全局时间过滤器
Vue.filter('dateFormat',function(originVal){
  const dt = new Date(originVal)
  const y =dt.getFullYear()
  const m =(dt.getMonth() + 1 + '').padStart(2,'0')
  const d =(dt.getDate()+ '').padStart(2,'0')
  const hh = (dt.getHours() + '').padStart(2,'0')
  const mm = (dt.getMinutes() + '').padStart(2,'0')
  const ss = (dt.getSeconds() + '').padStart(2,'0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
Vue.use(ElementUI)
Vue.use(ZkTable)
//将富文本编辑器 注册为全局可用组件
Vue.use(VueQuillEditor)
//配置请求的根路径
//在request(响应)拦截器中，展示进度条 NProgress.start()
axios.defaults.baseURL='http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use( config => {
  
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 最后必须return config
  return config
})
// 在response(回应)拦截器中,影藏进度条 NProgress.done()
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false



new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
