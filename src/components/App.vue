<template>
  <div id="app">
    <router-view name="dialog"></router-view>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { UserInt } from '../interfaces/User'
import Company from '../models/Company'
import User from '../models/User'
import Todo from '../models/Todo'

const users = namespace('users')
let vm: any

@Component
export default class App extends Vue {
  // mixing javascript and typescript calls for getting user informatiuon

  public userid!: number

  @users.Action
  public getUserId!: () => Promise<UserInt>

  @users.Action
  public getUserProfile!: () => Promise<boolean>

  @users.Action
  public getUserPermissions!: (id: number) => Promise<UserInt>

  @users.Action
  public getTodosByUser!: () => Promise<boolean>

  /** @method - lifecycle hook */
  public created(): void {
    vm = this
    this.getUserId().then(response => {
      this.userid = response.userid // sets local variable to user id and can be used in ts and js versions
      this.getUserProfile().then(response => {
        if (response === true) {
          this.getUserPermissions(this.userid).then(response => {
            if (response) {
              this.getTodosByUser().then(response => {
                if (response) {
                  // call javascript version to populate for still existing javascript modules
                  this.getUserIdJS()
                }
              })
            } else {
              console.log('Error getting user permissions.')
            }
          })
        } else {
          console.log('Error getting user profile.')
        }
      })
    })
  }

  /** @method - lifecycle hook */
  public mounted(): void {
    Todo.dispatch('getDigest')
    Company.dispatch('getDigest')
  }

  public async getUserIdJS() {
    await User.dispatch('getUserId')
      .then(() => {
        vm.$options.interval = setInterval(vm.getUserProfileJS, 500)
      })
      .catch(error => {
        // do not continue if we can't get the user ID
        console.log('ERROR: ' + error)
      })
  }

  public async getUserProfileJS() {
    if (this.userid !== 0) {
      clearInterval(vm.$options.interval)
      await User.dispatch('getUserProfile')
        .then(() => {
          vm.$options.interval = setInterval(vm.getUserGroupsJS, 500)
        })
        .catch(error => {
          // do not continue if we can't get the user Profile
          console.log('ERROR: ' + error)
        })
    }
  }

  public async getUserGroupsJS() {
    clearInterval(vm.$options.interval)
    await User.dispatch('getUserGroups')
      .then(() => {
        vm.$options.interval = setInterval(vm.getTodosByUserJS, 500)
      })
      .catch(error => {
        // do not continue if we can't get the user Groups
        console.log('ERROR: ' + error)
      })
  }

  public async getTodosByUserJS() {
    if (this.userid !== 0) {
      clearInterval(vm.$options.interval)
      await Todo.dispatch('getTodosByUser', this.userid)
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
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #000;
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
