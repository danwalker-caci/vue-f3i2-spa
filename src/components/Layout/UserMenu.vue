<template>
  <div class="user">
    <b-modal id="Todos" ref="Todos" scrollable size="xl" centered hide-footer header-bg-variant="light-blue" header-text-variant="white">
      <template v-slot:modal-title>My Tasks</template>
      <b-overlay class="w-100" :show="showLoading" :variant="overlayVariant" z-index="3000">
        <b-form>
          <ejs-grid id="TodoGrid" ref="TodoGrid" :dataSource="mytodos" :allowPaging="true" :allowReordering="false" :pageSettings="pageSettings" :editSettings="editSettings" :filterSettings="filterSettings" :toolbar="toolbar" :allowExcelExport="false" :detailTemplate="detailTemplate" rowHeight="20" height="100%" width="100%">
            <e-columns>
              <e-column headerText="Actions" textAlign="Left" width="100" :template="ActionsTemplate"></e-column>
              <e-column field="Title" headerText="Title" textAlign="Left" width="200"></e-column>
              <e-column field="Status" headerText="Status" width="100"></e-column>
              <e-column field="StartDate" headerText="Start Date" textAlign="Left" width="100"></e-column>
              <e-column field="DueDate" headerText="Due Date" textAlign="Left" width="100"></e-column>
              <e-column field="TaskType" headerText="Task Type" textAlign="Left" width="160"></e-column>
              <e-column field="Id" headerText="Id" :visible="false" textAlign="Left" width="40" :isPrimaryKey="true"></e-column>
              <e-column field="Body" :visible="false" textAlign="Left" width="40"></e-column>
              <e-column field="uri" :visible="false" textAlign="Left" width="40"></e-column>
              <e-column field="etag" :visible="false" textAlign="Left" width="40"></e-column>
              <e-column field="TaskLink" :visible="false" textAlign="Left" width="40"></e-column>
            </e-columns>
          </ejs-grid>
        </b-form>
        <template #overlay>
          <div class="text-center">
            <p id="busy-label">{{ overlayText }}</p>
          </div>
        </template>
      </b-overlay>
    </b-modal>
    <div class="info">
      <a data-toggle="collapse" :aria-expanded="!isClosed" @click.stop="toggleMenu" href="#">
        <span class="UserName">
          {{ userdisplayname }}
          <b-button v-if="mytodos.length > 0" variant="light-blue" @click="OpenTodos" class="sidebar-tasks rounded"
            >My Tasks
            <b-spinner v-if="!mytodosloaded" variant="danger" class="loading-spinner"></b-spinner>
            <span class="badge badge-xs badge-danger sidebar-badge" @click="OpenTodos">{{ mytodos.length }}</span>
          </b-button>
          <a id="UserEmailLink" href="" style="display: none;"></a>
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
import Todo from '@/models/Todo'
import Travel from '@/models/Travel'
import { Page, VirtualScroll, DetailRow } from '@syncfusion/ej2-vue-grids'

let SPCI = null
if (window._spPageContextInfo) {
  SPCI = window._spPageContextInfo
}

let tripurl = SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Travel')/items("

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
      overlayText: 'Getting Task. Please Wait...',
      overlayVariant: 'light',
      showLoading: false,
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
      ActionsTemplate: function() {
        return {
          template: Vue.component('columnTemplate', {
            template: `
            <div v-if="data.TaskType == 'gov-reject' || data.TaskType == 'fso-reject' || data.TaskType == 'gov-complete' || data.TaskType == 'Personnel-Approved' || data.TaskType == 'Personnel-Rejected'">
              <b-button class="actionbutton" variant="success" @click="completeme(data)" title="Complete">
                <font-awesome-icon far icon="check-circle" class="icon"></font-awesome-icon>
              </b-button>
            </div>
            <div v-else>
              <b-button class="actionbutton" variant="info" @click="goto(data)" title="Review Details">
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
                vm.$bvModal
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
              },
              reviewtr: function(data) {
                window.open(data.TaskLink, 'blank', 'width=1200, height=800, scrollbars=yes, resizable=yes')
              },
              goto: function(data) {
                vm.showLoading = true
                setTimeout(() => {
                  vm.$bvModal.hide('Todos')
                  vm.showLoading = false
                  vm.$router.push({ path: data.TaskLink })
                }, 1000)
              },
              approveme: function(data) {
                Travel.dispatch('getDigest')
                this.$bvModal
                  .msgBoxConfirm('Approve The Trip Report?', {
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
                      let taskdata = JSON.parse(data.TaskData)
                      console.log('TASKDATA: ' + taskdata.CreatedByEmail)
                      Todo.dispatch('completeTodo', payload).then(function() {
                        // Complete the travel
                        payload = {}
                        payload.uri = tripurl
                        payload.uri += taskdata.TravelID
                        payload.uri += ')'
                        payload.status = 'Completed'
                        Travel.dispatch('updateTravelStatusByID', payload).then(function() {
                          let userid = vm.UserId
                          Todo.dispatch('getTodosByUser', userid)
                        })
                      })
                    }
                  })
                  .catch(err => {
                    console.log(err)
                  })
              },
              rejectme: function(data) {
                Travel.dispatch('getDigest')
                this.$bvModal
                  .msgBoxConfirm('Reject The Trip Report?', {
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
                      let taskdata = JSON.parse(data.TaskData)
                      Todo.dispatch('completeTodo', payload).then(function() {
                        payload = {}
                        payload.uri = tripurl
                        payload.uri += taskdata.TravelID
                        payload.uri += ')'
                        payload.status = 'ReportDue'
                        Travel.dispatch('updateTravelStatusByID', payload).then(function() {
                          let userid = vm.UserId
                          Todo.dispatch('getTodosByUser', userid)
                          let url = 'mailto:' + taskdata.CreatedByEmail + '?subject=Trip Report Rejected&body=Trip Report For IndexNumber ' + taskdata.IndexNumber
                          document.getElementById('UserEmailLink').href = url
                          document.getElementById('UserEmailLink').click()
                        })
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
      },
      LinkTemplate: function() {
        return {
          template: Vue.component('columnTemplate', {
            template: `
            <div>
              <b-button class="actionbutton" variant="primary" @click="goto(data)" title="Go To Item">
                {{ tasklink }}
              </b-button>
            </div>
            `,
            data: function() {
              return {
                data: {}
              }
            },
            computed: {
              tasklink() {
                return this.data.TaskLink
              }
            },
            methods: {
              goto: function(data) {
                vm.$router.push({ path: data.TaskLink })
                vm.isClosed = !vm.isClosed
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
    this.$nextTick(async function() {
      try {
        Todo.dispatch('getDigest')
        document.getElementById('LoadingBars').style.display = 'none'
        if (!vm.userloaded || !vm.profiledata) {
          vm.getUserInfo()
        } else {
          vm.userdisplayname = vm.profiledata.DisplayName
        }
      } catch (e) {
        const notification = {
          type: 'danger',
          title: 'Portal Error',
          message: e,
          push: true
        }
        this.$store.dispatch('notification/add', notification, {
          root: true
        })
        console.log('ERROR: ' + e)
      }
    })
  },
  methods: {
    toggleMenu() {
      this.isClosed = !this.isClosed
    },
    async getUserInfo() {
      await User.dispatch('getUserId').catch(error => {
        console.log('ERROR: ' + error)
      })
      await User.dispatch('getUserProfile')
        .then(() => {
          vm.$options.interval = setInterval(vm.updateUserInfo, 500)
        })
        .catch(error => {
          console.log('ERROR: ' + error)
        })
    },
    async updateUserInfo() {
      if (this.profiledata) {
        clearInterval(this.$options.interval)
        this.userdisplayname = this.profiledata.DisplayName
        await User.dispatch('getUserGroups').catch(error => {
          console.log('ERROR: ' + error)
        })
        await Todo.dispatch('getTodosByUser', this.UserId)
          .then(() => {
            console.log('APP MOUNT COMPLETED')
          })
          .catch(error => {
            console.log('ERROR: ' + error)
          })
      } else {
        this.getUserInfo()
      }
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
      time: 15000,
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
