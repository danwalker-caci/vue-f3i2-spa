<template>
  <b-container fluid class="contentHeight m-0">
    <div>
      <b-row class="bg-warning text-black formheader">
        <b-col cols="4" class="p-0 text-left"></b-col>
        <b-col cols="4" class="p-0 text-center font-weight-bold">
          <h3>Security Actions Tracker</h3>
        </b-col>
        <b-col cols="4" class="p-0 text-right"></b-col>
      </b-row>
      <ejs-grid id="FormsGrid" ref="FormsGrid" :dataSource="securityforms" :allowPaging="true" :allowReordering="false" :pageSettings="pageSettings" :editSettings="editSettings" :filterSettings="filterSettings" :toolbar="toolbar" :allowExcelExport="false" :detailTemplate="detailTemplate" rowHeight="20" height="100%" width="100%">
        <e-columns>
          <e-column field="PersonName" headerText="Person Name" textAlign="Left" width="250"></e-column>
          <e-column field="Company" headerText="Company" width="100" textAlign="Left"></e-column>
          <e-column field="Id" headerText="Id" :visible="false" textAlign="Left" width="40" :isPrimaryKey="true"></e-column>
          <!-- Add a hidden column that is showable using the Types entries. Need to format the Types entries and add conditional logical buttons for each. -->
          <e-column field="uri" :visible="false" textAlign="Left" width="40"></e-column>
          <e-column field="etag" :visible="false" textAlign="Left" width="40"></e-column>
        </e-columns>
      </ejs-grid>
    </div>
  </b-container>
</template>
<script>
let vm = null
//let url = _spPageContextInfo.webAbsoluteUrl
import Vue from 'vue'
import User from '@/models/User'
import Personnel from '@/models/Personnel'
import Company from '@/models/Company'
import Security from '@/models/Security'
import Todo from '@/models/Todo'
import { Page, VirtualScroll, DetailRow } from '@syncfusion/ej2-vue-grids'

export default {
  name: 'SecurityForms',
  props: {
    // Switches the form type between Account, CAC and SCI
    formType: {
      type: String
    }
  },
  computed: {
    companies() {
      return Company.getters('DropDown')
    },
    personnel() {
      return Personnel.getters('DropDown')
    },
    userid() {
      return User.getters('CurrentUserId')
    },
    currentuser() {
      return User.getters('CurrentUser')
    },
    isSecurity() {
      return User.getters('isSecurity')
    },
    isAFRL() {
      return User.getters('isAFRL')
    },
    isSubcontractor() {
      return User.getters('isSubcontractor')
    },
    securityforms() {
      return Security.getters('SecurityForms')
    }
  },
  data: function() {
    return {
      company: '',
      pageSettings: { pageSize: 15 },
      editSettings: {
        allowEditing: false,
        allowAdding: false,
        allowDeleting: false,
        mode: 'Dialog'
      },
      filterSettings: { type: 'Menu' },
      toolbar: ['Edit', 'Print', 'Search', 'ExcelExport'],
      // Add a template with logic to handle each of the account types with buttons to indicate when they were sent to/completed by the gov
      // template should also check what the formType is and only display those forms
      detailTemplate: function() {
        return {
          template: Vue.component('detailTemplate', {
            props: {
              isSecurity: {
                type: Boolean
              },
              isAFRL: {
                type: Boolean
              }
            },
            template: `
              <b-container fluid>
                <b-row>
                  <b-col cols="12">
                    <div class="detailDiv">
                      <b-table-simple small responsive>
                        <b-thead head-variant="dark">
                          <b-tr>
                            <b-th>Account</b-th>
                            <b-th>Government Sent Date</b-th>
                            <b-th>Government Completion Date</b-th>
                            <b-th>Submitted Form</b-th>
                          </b-tr>
                        </b-thead>
                        <b-tbody>
                          <b-tr v-for="t in data.Types" :key="t.Id">
                            <b-td>{{ t.account }}</b-td>
                            <b-td v-if="t.GovSentDate !== ''">{{ t.GovSentDate }}</b-td>
                            <b-td v-if="t.GovSentDate == ''">
                              <!-- Should only show if in Security Group -->
                              <b-button ref="NotifyGov" variant="success" :data-id="t.id" class="btn-sm" @click="NotifyGov(data, $event)">Notify Government</b-button>
                            </b-td>
                            <b-td v-if="t.GovCompleteDate !== ''">{{ t.GovCompleteDate }}</b-td>
                            <b-td v-if="t.GovCompleteDate == ''">
                              <span><!-- add a check if user is in AFRL -->
                                <b-button ref="CompleteGov" variant="primary" :data-id="t.id" class="btn-sm" @click="CompleteGov(data, $event)">Complete</b-button>
                                <b-button ref="RejectGov" variant="danger" :data-id="t.id" class="btn-sm" @click="RejectGov(data, $event)">Rework</b-button>
                              </span>
                            </b-td>
                            <b-td><a :href="t.href" target="_blank">View Form</a></b-td>
                          </b-tr>
                        </b-tbody>
                      </b-table-simple>
                    </div>
                  </b-col>
                </b-row>
              </b-container>`,
            data: function() {
              return {
                data: {}
              }
            },
            methods: {
              async NotifyGov(data, e) {
                let id = parseInt(e.currentTarget.dataset.id)
                let taskId, account
                let taskUserId = vm.$store.state.support.AFRLUserId
                // get the current item data
                data.Types.forEach(type => {
                  if (id === type.id) {
                    type.GovSentDate = this.$moment().format('MM/DD/YYYY')
                    taskId = type.task
                    account = type.account
                  }
                })
                console.log('TASK USER ID: ' + taskUserId)
                let payload = {
                  Title: 'Complete or Reject ' + data.PersonName + ' ' + account + ' Request',
                  //AssignedToId: vm.userid, // Hardcode to Juan
                  AssignedToId: taskUserId,
                  Description: 'Complete or reject ' + data.PersonName + ' ' + account + ' Request',
                  IsMilestone: false,
                  PercentComplete: 0,
                  TaskType: account + ' Request',
                  TaskLink: '/security/tracker/accounts'
                }
                let results = await Todo.dispatch('addTodo', payload)
                // Update the task to the new one for AFRL
                data.Types.forEach(type => {
                  if (id === type.id) {
                    type.task = results.data.d.Id
                  }
                })
                this.updateForm(data, taskId)
                // Add a task for the designated government employee for review
              },
              CompleteGov(data, e) {
                let id = parseInt(e.currentTarget.dataset.id)
                let taskId
                // get the current item data
                data.Types.forEach(type => {
                  if (id === type.id) {
                    type.GovCompleteDate = this.$moment().format('MM/DD/YYYY')
                    taskId = type.task
                  }
                })
                this.updateForm(data, taskId)
                // Remove the button and display current Date
              },
              async RejectGov(data, e) {
                let id = parseInt(e.currentTarget.dataset.id)
                // get the current item data
                let index = 0
                let original = {}
                let taskId, account
                data.Types.forEach((type, i) => {
                  if (id === type.id) {
                    // type.GovSentDate = this.$moment().format('MM/DD/YYYY')
                    // pop the index
                    index = i
                    taskId = type.task
                    account = type.account
                  }
                })
                let taskUserId = null
                if (account == 'NIPR' || account == 'SIPR' || account == 'DREN' || account == 'JWICS') {
                  taskUserId = vm.$store.state.support.AccountUserId
                } else {
                  taskUserId = vm.$store.state.support.CACSCIUserId
                }
                console.log('TASK USER ID: ' + taskUserId)
                original = data.Types[index]
                data.Types.splice(index, 1)
                this.updateForm(data, taskId)
                Security.dispatch('DeleteForm', original)
                // Notify Monica via task list
                let payload = {
                  Title: 'AFRL Reject ' + data.PersonName + ' ' + account + ' Request',
                  //AssignedToId: vm.userid, // Hardcode to either Michelle or Monica
                  AssignedToId: taskUserId,
                  Description: 'AFRL reject ' + data.PersonName + ' ' + account + ' Request. Please notify the original submitter.',
                  IsMilestone: false,
                  PercentComplete: 0,
                  TaskType: account + ' Request',
                  TaskLink: '/security/tracker/accounts'
                }
                await Todo.dispatch('addTodo', payload)
              },
              async updateForm(d, tId) {
                // Hackiness to make the data immutable...not nice!
                let payload = JSON.parse(JSON.stringify(d))
                payload.Types = JSON.stringify(payload.Types)
                await Security.dispatch('updateSecurityForm', payload).then(function(result) {
                  console.log(result)
                  // grab a fresh etag for the record
                  d.etag = result.headers.etag
                  /*Security.dispatch('getSecurityFormByPersonnelId', d.PersonnelId).then(function(response) {
                    d.etag = response.etag
                  })*/
                })
                Todo.dispatch('getTodoById', tId).then(async function(task) {
                  let payload = {
                    etag: task.__metadata.etag,
                    uri: task.__metadata.uri,
                    id: task.Id
                  }
                  Todo.dispatch('completeTodo', payload)
                })
              }
            }
          })
        }
      }
    }
  },
  mounted: async function() {
    vm = this
    // First get current user informaiton
    // Setup a timing chaing so that we don't try to get the personnel by Company Dropdown until the state is loaded.
    await Security.dispatch('getDigest')
    await Todo.dispatch('getDigest')
    if (this.isSubcontractor) {
      Company.dispatch('getCompanies').then(function() {
        // Add notification
        vm.$options.interval = setInterval(vm.waitForPersonnel, 1500)
      })
    } else {
      this.getUserIDs()
      await Security.dispatch('getSecurityForms')
    }
    console.log('IS SECURITY: ' + this.isSecurity)
    console.log('IS AFRL: ' + this.isAFRL)
    // get all of the entries from the SecurityForms list - Might need to check if Subcontractor and then only load related the related personnel list
  },
  methods: {
    /*checkType: async function() {
      switch (this.formType) {
        case 'accounts': 

        case 'CAC':
          this.library = 'CACForms'
          this.libraryUrl = this.CACForms
          break
        case 'SCI':
          this.library = 'SCIForms'
          this.libraryUrl = this.SCIForms
          break
      }
    },*/

    getUserIDs: async function() {
      this.$store.dispatch('support/getAccountUser')
      this.$store.dispatch('support/getAFRLUser')
      this.$store.dispatch('support/getCACSCIUser')
    },
    waitForPersonnel: async function() {
      if (this.currentuser) {
        // finally have user - now get the personnel based on their company
        this.company = this.currentuser[0].Company ? this.currentuser[0].Company : this.companies[0]
        let payload = {}
        payload.company = this.company
        await Personnel.dispatch('getPersonnelByCompany', payload)
        await Security.dispatch('getSecurityFormsByCompany', payload)
        clearInterval(vm.$options.interval)
      }
    },
    getPersonnelByCompany: async function() {
      let payload = {
        company: this.form.Company
      }
      await Personnel.dispatch('getPersonnelByCompany', payload)
    }
  },
  provide: {
    grid: [Page, DetailRow, VirtualScroll]
  }
  /*actionBegin(args) {
    switch (args.requestType) {
      case 'add':
        args.cancel = true
        this.$router.push({ name: 'New Travel', params: { back: 'Travel Tracker' } })
        break
    }
  }*/
}
</script>
<style lang="scss"></style>
