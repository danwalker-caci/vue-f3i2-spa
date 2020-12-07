<template>
  <div id="app">
    <router-view name="dialog"></router-view>
    <router-view></router-view>
  </div>
</template>

<script>
let vm = null
import Company from '@/models/Company'
import User from '@/models/User'
import Todo from '@/models/Todo'
export default {
  name: 'App',
  computed: {
    userloaded() {
      return User.getters('Loaded')
    },
    UserId() {
      return User.getters('CurrentUserId')
    }
  },
  mounted: function() {
    vm = this
    this.$nextTick(function() {
      Todo.dispatch('getDigest')
      Company.dispatch('getDigest')
      if (!vm.userloaded) {
        User.dispatch('getUserId').then(function() {
          User.dispatch('getUserProfile').then(function() {
            vm.$options.interval = setInterval(vm.updateUserInfo, 1000)
          })
        })
      }
    })
  },
  methods: {
    updateUserInfo() {
      clearInterval(this.$options.interval)
      User.dispatch('getUserGroups').then(function() {
        Todo.dispatch('getTodosByUser', vm.UserId).then(function() {
          console.log('APP MOUNT COMPLETED')
        })
      })
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #000;
  /* background-color: white !important; */
  background-image: url('/sites/f3i2/SiteAssets/html/static/img/background-1.JPG');
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
