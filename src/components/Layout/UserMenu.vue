<template>
  <div class="user">
    <b-modal id="Todos" ref="Todos" scrollable size="xl" centered hide-footer :header-bg-variant="headerBgVariant">
      <template v-slot:modal-title>My Tasks</template>
      <b-form>
        <b-table id="TodosTable" :ref="TodosTable" v-model="shownData" responsive :striped="striped" :bordered="bordered" :small="small" :hover="hover" :items="mytodos" :fields="fields" :primary-key="ID" style="table-layout: fixed;">
          <template v-slot:cell(actions)="data">
            <b-button size="sm" class="actionbutton" @click="completeme(data.index)" title="Mark Complete">
              <font-awesome-icon far icon="check-circle" class="icon" :style="{ color: 'green' }"></font-awesome-icon>
            </b-button>
            <b-button size="sm" class="actionbutton" @click="data.toggleDetails">
              <font-awesome-icon v-if="data.detailsShowing" far class="icon" icon="minus-square" :style="{ color: 'black' }"></font-awesome-icon>
              <font-awesome-icon v-else-if="shownData[data.index].Body !== ''" far class="icon" icon="plus-square" :style="{ color: 'green' }"></font-awesome-icon>
              <font-awesome-icon v-else far class="icon" icon="plus-square" :style="{ color: 'black' }"></font-awesome-icon>
            </b-button>
          </template>
          <template v-slot:row-details="data">
            <b-input-group size="sm" prepend="Description">
              <b-form-input v-model="shownData[data.index].Body"></b-form-input>
            </b-input-group>
          </template>
        </b-table>
      </b-form>
    </b-modal>
    <div class="info">
      <a data-toggle="collapse" :aria-expanded="!isClosed" @click.stop="toggleMenu" href="#">
        <span class="UserName">
          {{ userdisplayname }}
          <b-spinner v-if="!mytodosloaded" variant="danger" class="loading-spinner"></b-spinner>
          <!-- <b-spinner variant="primary" class="loading-spinner"></b-spinner> -->
          <span v-if="mytodos.length > 0" class="badge badge-xs badge-danger sidebar-badge" @click="OpenTodos">{{ mytodos.length }}</span>
          <b class="caret"></b>
        </span>
      </a>
      <div class="clearfix"></div>
      <div>
        <ul class="nav" v-show="!isClosed">
          <slot>
            <li></li>
          </slot>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
let vm = null
import User from '@/models/User'
import Personnel from '@/models/Personnel'
import Workplan from '@/models/WorkPlan'
import Company from '@/models/Company'
import Todo from '@/models/Todo'

export default {
  computed: {
    userloaded() {
      return User.getters('Loaded')
    },
    profiledata() {
      return User.query().first()
    },
    UserId() {
      return User.getters('CurrentUserId')
    },
    usergroups() {
      return User.getters('CurrentUserGroups')
    },
    mytodosloaded() {
      return Todo.getters('MyTodosLoaded')
    },
    mytodos() {
      return Todo.getters('mytodos')
    }
  },
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  data: function() {
    return {
      todocount: 0,
      userdisplayname: '',
      userurl: '#',
      isClosed: true
    }
  },
  errorCaptured(err, vm, info) {
    const notification = {
      type: 'danger',
      title: 'Error in UserMenu ' + err,
      message: info,
      push: true
    }
    this.$store.dispatch('notification/add', notification, { root: true })
  },
  mounted: function() {
    vm = this
    this.$nextTick(function() {
      Todo.dispatch('getDigest')
      Company.dispatch('getCompanies')
      Workplan.dispatch('getDigest')
      Workplan.dispatch('getWorkplans')
      Personnel.dispatch('getDigest')
      Personnel.dispatch('getPersonnel')
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
    toggleMenu() {
      this.isClosed = !this.isClosed
    },
    updateUserInfo() {
      clearInterval(this.$options.interval)
      this.userdisplayname = this.profiledata.DisplayName
      User.dispatch('getUserGroups').then(function() {
        Todo.dispatch('getTodosByUser', vm.UserId).then(function() {
          console.log('USERMENU MOUNT COMPLETED')
        })
      })
    },
    OpenTodos: function() {
      this.$bvModal.show('Todos')
    },
    refreshMyTodos: function() {
      Todo.dispatch('getTodosByUser', this.UserId)
    },
    completeme: function(idx) {
      let payload = {}
      payload.id = this.shownData[idx].id
      payload.uri = this.shownData[idx].uri
      payload.etag = this.shownData[idx].etag
      Todo.dispatch('completeTodo', payload).then(function() {
        let userid = vm.UserId
        Todo.dispatch('getTodosByUser', userid)
      })
    }
  },
  cron: [
    {
      time: 10000,
      method: 'refreshMyTodos',
      autoStart: true
    }
  ],
  beforeDestroy() {
    clearInterval(this.$options.interval)
  }
}
</script>
<style lang="css">
.collapsed {
  transition: opacity 1s;
}
.UserName {
  font-size: 14px;
}
#userbadgeA {
  float: right;
  right: 30px;
  width: 20px;
  margin-top: 1px;
}
#userbadgeB {
  width: 20px;
  float: right;
  right: -10px;
  margin-top: 4px;
}
</style>
