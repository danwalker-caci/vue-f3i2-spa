<template>
  <div id="app" :style="{ backgroundImage: 'url(' + image + ')' }">
    <router-view name="dialog"></router-view>
    <router-view></router-view>
  </div>
</template>

<script>
/* NOTE: Discovered during testing that according to this site: https://cli.vuejs.org/guide/mode-and-env.html#modes all vue node variables should
be prefixed with VUE_APP_  It was discovered that it would not work otherwise. This supports the dynamic image background used for the app in this case.  */
let vm = null
import Company from '@/models/Company'
import User from '@/models/User'
import Todo from '@/models/Todo'
export default {
  name: 'App',
  computed: {
    currentuser() {
      return User.getters('CurrentUser')
    },
    userloaded() {
      return User.getters('Loaded')
    },
    UserId() {
      return User.getters('CurrentUserId')
    }
  },
  data: function() {
    return {
      image: process.env.VUE_APP_BACKGROUND_IMAGE
    }
  },
  mounted: async function() {
    vm = this
    Todo.dispatch('getDigest')
    Company.dispatch('getDigest')
    this.getUserId()
  },
  methods: {
    async getUserId() {
      await User.dispatch('getUserId')
        .then(() => {
          vm.$options.interval = setInterval(vm.getUserProfile, 500)
        })
        .catch(error => {
          // do not continue if we can't get the user ID
          console.log('ERROR: ' + error)
        })
    },
    async getUserProfile() {
      if (this.UserId !== 0) {
        clearInterval(this.$options.interval)
        await User.dispatch('getUserProfile')
          .then(() => {
            vm.$options.interval = setInterval(vm.getUserGroups, 500)
          })
          .catch(error => {
            // do not continue if we can't get the user Profile
            console.log('ERROR: ' + error)
          })
      }
    },
    async getUserGroups() {
      if (this.currentuser.length == 1) {
        clearInterval(this.$options.interval)
        await User.dispatch('getUserGroups')
          .then(() => {
            vm.$options.interval = setInterval(vm.getTodosByUser, 500)
          })
          .catch(error => {
            // do not continue if we can't get the user Groups
            console.log('ERROR: ' + error)
          })
      }
    },
    async getTodosByUser() {
      if (this.userloaded && this.UserId !== 0) {
        clearInterval(this.$options.interval)
        await Todo.dispatch('getTodosByUser', this.UserId)
          .then(() => {
            console.log('APP MOUNT COMPLETED')
          })
          .catch(error => {
            // the user may not have todos but this should not result in an error
            console.log('ERROR: ' + error)
          })
      }
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #000;
  background-size: cover;
  background-position: center center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 1000 !important;
}
</style>
