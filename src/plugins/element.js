import Vue from 'vue'
import {Button} from 'element-ui'
import {Form,FormItem} from 'element-ui'
import {Input} from 'element-ui'
//导入弹框提示组件
import {Message,Container,Header,Aside,Main,Menu,SubMenu,MenuItemGroup,MenuItem} from 'element-ui'
import {Breadcrumb,BreadcrumbItem,Card} from 'element-ui'

Vue.use(Button)
Vue.use(FormItem)
Vue.use(Form)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(SubMenu)
Vue.use(MenuItemGroup)
Vue.use(MenuItem)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)

Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
