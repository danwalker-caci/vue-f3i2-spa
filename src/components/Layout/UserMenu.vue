<template>
  <div class="user">
    <b-modal id="Todos" ref="Todos" scrollable size="xl" centered hide-footer header-bg-variant="warning" header-text-variant="white">
      <template v-slot:modal-title>My Tasks</template>
      <b-form>
        <ejs-grid id="TodoGrid" ref="TodoGrid" :dataSource="mytodos" :allowPaging="true" :allowReordering="false" :pageSettings="pageSettings" :editSettings="editSettings" :filterSettings="filterSettings" :toolbar="toolbar" :allowExcelExport="false" :detailTemplate="detailTemplate" rowHeight="20" height="100%" width="100%">
          <e-columns>
            <e-column headerText="Actions" textAlign="Left" width="100" :template="ActionsTemplate"></e-column>
            <e-column field="Title" headerText="Title" textAlign="Left" width="200"></e-column>
            <e-column field="Status" headerText="Number" width="100"></e-column>
            <e-column headerText="Go To Item" textAlign="Left" width="125" :template="GoToTemplate"></e-column>
            <e-column field="StartDate" headerText="POP Start" textAlign="Left" width="150"></e-column>
            <e-column field="DueDate" headerText="POP End" textAlign="Left" width="150"></e-column>
            <e-column field="TaskType" headerText="Manager" textAlign="Left" width="200"></e-column>
            <e-column field="Id" headerText="Id" :visible="false" textAlign="Left" width="40" :isPrimaryKey="true"></e-column>
            <e-column field="Body" :visible="false" textAlign="Left" width="40"></e-column>
            <e-column field="uri" :visible="false" textAlign="Left" width="40"></e-column>
            <e-column field="etag" :visible="false" textAlign="Left" width="40"></e-column>
          </e-columns>
        </ejs-grid>
      </b-form>
    </b-modal>
    <div class="info">
      <a data-toggle="collapse" :aria-expanded="!isClosed" @click.stop="toggleMenu" href="#">
        <span class="UserName">
          {{ userdisplayname }}
          <b-button v-if="mytodos.length > 0" variant="warning" @click="OpenTodos" class="sidebar-tasks rounded"
            >My Tasks
            <b-spinner v-if="!mytodosloaded" variant="danger" class="loading-spinner"></b-spinner>
            <span class="badge badge-xs badge-danger sidebar-badge" @click="OpenTodos">{{ mytodos.length }}</span>
          </b-button>
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
import Vue from 'vue'
import User from '@/models/User'
/* import Personnel from '@/models/Personnel'
import Workplan from '@/models/WorkPlan'
import Company from '@/models/Company' */
import Todo from '@/models/Todo'
import { Page, VirtualScroll, DetailRow } from '@syncfusion/ej2-vue-grids'

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
      isClosed: true,
      pageSettings: { pageSize: 15 },
      editSettings: {
        allowEditing: false,
        allowAdding: false,
        allowDeleting: false,
        mode: 'Dialog'
      },
      filterSettings: { type: 'Menu' },
      toolbar: ['Edit', 'Print', 'Search', 'ExcelExport'],
      GoToTemplate: function() {
        return {
          template: Vue.component('columnTemplate', {
            template: `
            <div>
              <b-button class="actionbutton" variant="primary" @click="goto(data)" title="Go To Item">
                <font-awesome-icon far icon="directions" class="icon"></font-awesome-icon>
              </b-button>
            </div>`,
            data: function() {
              return {
                data: {}
              }
            },
            methods: {
              goto: function(data) {
                vm.$router.push({ path: data.TaskLink })
              }
            }
          })
        }
      },
      ActionsTemplate: function() {
        return {
          template: Vue.component('columnTemplate', {
            template: `
            <div>
              <b-button class="actionbutton" variant="danger" @click="completeme(data)" title="Mark Complete">
                <font-awesome-icon far icon="check-circle" class="icon"></font-awesome-icon>
              </b-button>
            </div>`,
            data: function() {
              return {
                data: {}
              }
            },
            methods: {
              completeme: function(data) {
                this.$bvModal
                  .msgBoxConfirm('Complete this Task?', {
                    title: 'Please Confirm',
                    size: 'sm',
                    buttonSize: 'sm',
                    okVariant: 'danger',
                    okTitle: 'YES',
                    cancelTitle: 'NO',
                    footerClass: 'p-2',
                    hideHeaderClose: false,
                    centered: true
                  })
                  .then(value => {
                    if (value == true) {
                      console.log('COMPLETE ID: ' + data.Id)
                      let payload = {}
                      payload.etag = data.etag
                      payload.uri = data.uri
                      payload.id = data.Id
                      Todo.dispatch('completeTodo', payload).then(function() {
                        let userid = vm.UserId
                        Todo.dispatch('getTodosByUser', userid)
                      })
                    }
                  })
                  .catch(err => {
                    console.log(err)
                  })
              }
            }
          })
        }
      },
      detailTemplate: function() {
        return {
          template: Vue.component('detailTemplate', {
            template: `
              <b-container fluid>
                <b-row>
                  <b-col cols="12">
                    <div class="detailDiv" v-html="data.Body"></div>
                  </b-col>
                </b-row>
              </b-container>`,
            data: function() {
              return {
                data: {}
              }
            }
          })
        }
      }
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
      this.userdisplayname = this.profiledata.DisplayName
      /* if (!vm.userloaded) {
        User.dispatch('getUserId').then(function() {
          User.dispatch('getUserProfile').then(function() {
            vm.$options.interval = setInterval(vm.updateUserInfo, 1000)
          })
        })
      } */
    })
  },
  methods: {
    toggleMenu() {
      this.isClosed = !this.isClosed
    },
    /* updateUserInfo() {
      clearInterval(this.$options.interval)
      this.userdisplayname = this.profiledata.DisplayName
      User.dispatch('getUserGroups').then(function() {
        Todo.dispatch('getTodosByUser', vm.UserId).then(function() {
          console.log('USERMENU MOUNT COMPLETED')
        })
      })
    }, */
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
      time: 60000,
      method: 'refreshMyTodos',
      autoStart: true
    }
  ],
  beforeDestroy() {
    clearInterval(this.$options.interval)
  },
  provide: {
    grid: [Page, DetailRow, VirtualScroll]
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
.info {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
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

.e-icon-grightarrow,
.e-icon-gdownarrow {
  color: black !important;
}

.detailDiv {
  min-height: 50px;
  font-size: 14px;
  color: black !important;
}
</style>
