import Vue from 'vue'
import App from './components/App'
import store from './js/store'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
import Snotify from 'vue-snotify'
import 'vue-snotify/styles/material.css'
import Dialog from './components/Dialog'
import DialogInfo from './components/Dialog-info'
import jQuery from 'jquery'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import drag from './js/drag'
global.$ = jQuery;
const $ = jQuery;
Vue.use(drag);
Vue.use(BootstrapVue);
Vue.component('v-dialog', Dialog);
Vue.component('v-dialog-info', DialogInfo);
Vue.component('v-icon', Icon);
Vue.use(Snotify);
Vue.config.productionTip = false;
new Vue({
    store,
    render: h => h(App)
}).$mount('#app');
