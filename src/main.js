/* eslint-disable */
import Vue from 'vue'
import bootstrap from './bootstrap'
import App from './components/App.vue'
import router from './router'
import store from './store/store'

import { library } from '@fortawesome/fontawesome-svg-core'
import { dom } from '@fortawesome/fontawesome-svg-core'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { logger } from './applogger'

library.add(far, fas)
dom.watch()

Vue.component('font-awesome-icon', FontAwesomeIcon)
// console.log('USING BOOTSTRAP')
Vue.use(bootstrap)

import jquery from 'jquery'
Object.defineProperty(Vue.prototype, '$jQuery', { value: jquery })

Vue.config.productionTip = false

Vue.config.devtools = true

export const EventBus = new Vue()

Vue.config.errorHandler = (err, vm, info) => {
  logger.logToServer({ err, vm, info });
}

window.onerror = function(message, source, lineno, colno, error) {
  logger.logToServer({ message, source, lineno, colno, error });
}

window.addEventListener('beforeunload', function (e) {
  if (String(window.location).indexOf('msr/form') > 0) {
    EventBus.$emit('Unloading')
    e.preventDefault();
    e.returnValue = '';
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
