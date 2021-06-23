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

  ; (function () {
    var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
    Math.uuid = function (len, radix) {
      var chars = CHARS,
        uuid = [],
        i
      radix = radix || chars.length
      if (len) {
        for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)]
      } else {
        var r
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
        uuid[14] = '4'
        for (i = 0; i < 36; i++) {
          if (!uuid[i]) {
            r = 0 | (Math.random() * 16)
            uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r]
          }
        }
      }
      return uuid.join('')
    }
  })()

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
