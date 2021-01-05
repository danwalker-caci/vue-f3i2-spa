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
      <ejs-grid
        id="FormsGrid"
        ref="FormsGrid"
        :dataSource="securityforms"
        :allowPaging="true"
        :allowReordering="false"
        :pageSettings="pageSettings"
        :editSettings="editSettings"
        :filterSettings="filterSettings"
        :toolbar="toolbar"
        :allowExcelExport="true"
        :toolbarClick="toolbarClick"
        :detailTemplate="detailTemplate"
        rowHeight="20"
        height="100%"
        width="100%"
      >
        <e-columns>
          <e-column field="Id" headerText="Id" :visible="false" textAlign="Left" width="40" :isPrimaryKey="true"></e-column>
          <e-column field="PersonName" headerText="Person Name" textAlign="Left" width="250"></e-column>
          <e-column field="Company" headerText="Company" width="100" textAlign="Left"></e-column>

          <!-- Add all of the extra fields that are hidden -->
          <e-column field="SCIStatus" headerText="SCI Status" :visible="false" textAlign="Left"></e-column>
          <e-column field="SCIIndocAssistDate" headerText="SCI Indoc Assist Date" :visible="false" textAlign="Left"></e-column>
          <e-column field="SCIPR" headerText="SCI PR" :visible="false" textAlign="Left"></e-column>
          <e-column field="SCICE" headerText="SCI CE" :visible="false" textAlign="Left"></e-column>
          <e-column field="SCIIndoc" headerText="SCI Indoc Date" :visible="false" textAlign="Left"></e-column>
          <e-column field="SCIAccessCheckDate" headerText="SCI Access Check Date" :visible="false" textAlign="Left"></e-column>
          <e-column field="CACValid" headerText="Is CAC Valid" :visible="false" textAlign="Left"></e-column>
          <e-column field="CACStatus" headerText="CAC Status" :visible="false" textAlign="Left"></e-column>
          <e-column field="CACRequestDate" headerText="CAC Request Date" :visible="false" textAlign="Left"></e-column>
          <e-column field="CACExpirationDate" headerText="CAC Expiration Date" :visible="false" textAlign="Left"></e-column>
          <e-column field="CACIssuedBy" headerText="CAC Issued By" :visible="false" textAlign="Left"></e-column>
          <e-column field="NIPRAccount" headerText="NIPR Account" :visible="false" textAlign="Left"></e-column>
          <e-column field="NIPRGovSentDate" headerText="NIPR Gov Sent Date" :visible="false" textAlign="Left"></e-column>
          <e-column field="NIPRGovCompleteDate" headerText="NIPR Gov Complete Date" :visible="false" textAlign="Left"></e-column>
          <e-column field="SIPRAccount" headerText="SIPR Account" :visible="false" textAlign="Left"></e-column>
          <e-column field="SIPRGovSentDate" headerText="SIPR Gov Sent Date" :visible="false" textAlign="Left"></e-column>
          <e-column field="SIPRGovCompleteDate" headerText="SIPR Gov Complete Date" :visible="false" textAlign="Left"></e-column>
          <e-column field="DRENAccount" headerText="DREN Account" :visible="false" textAlign="Left"></e-column>
          <e-column field="DRENGovSentDate" headerText="DREN Gov Sent Date" :visible="false" textAlign="Left"></e-column>
          <e-column field="DRENGovCompleteDate" headerText="DREN Gov Complete Date" :visible="false" textAlign="Left"></e-column>
          <e-column field="JWICAccount" headerText="JWIC Account" :visible="false" textAlign="Left"></e-column>
          <e-column field="JWICGovSentDate" headerText="JWIC Gov Sent Date" :visible="false" textAlign="Left"></e-column>
          <e-column field="JWICGovCompleteDate" headerText="JWIC Gov Complete Date" :visible="false" textAlign="Left"></e-column>
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
import { Page, VirtualScroll, DetailRow, Toolbar, ExcelExport } from '@syncfusion/ej2-vue-grids'

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
      //toolbar: ['Edit', 'Print', 'Search', 'ExcelExport'],
      toolbar: ['ExcelExport'],
      // Add a template with logic to handle each of the account types with buttons to indicate when they were sent to/completed by the gov
      // template should also check what the formType is and only display those forms
      detailTemplate: function() {
        return {
          template: Vue.component('accountDetailTemplate', {
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
                  <!-- Account Template -->
                  <b-col cols="12" v-if="data.Accounts">
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
                          <b-tr v-for="t in data.Accounts" :key="t.Id">
                            <b-td>{{ t.account }}</b-td>
                            <b-td>
                              <span v-if="t.GovSentDate !== ''">{{ t.GovSentDate }}</span>
                              <span v-if="t.GovSentDate == ''">
                                <!-- Should only show if in Security Group -->
                                <b-button ref="NotifyGov" variant="success" :data-id="t.id" class="btn-sm" @click="NotifyGov(data, $event)">Notify Government</b-button>
                              </span>
                            </b-td>
                            <b-td>
                              <span v-if="t.GovCompleteDate !== ''">{{ t.GovCompleteDate }}</span>
                              <span v-if="t.GovCompleteDate == ''"><!-- add a check if user is in AFRL -->
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
                  <b-col v-if="data.SCI" cols="12">
                   <b-table-simple small responsive>
                        <b-thead head-variant="dark">
                          <b-tr>
                            <b-th>Date Indoctrination Assist Sent</b-th>
                            <b-th>SCI Access Check Date</b-th>
                            <b-th>SCI Status</b-th>
                            <b-th>PR Date</b-th>
                            <b-th>CE Date</b-th>
                            <b-th>Submitted Form</b-th>
                            <b-th></b-th>
                          </b-tr>
                        </b-thead>
                        <b-tbody>
                          <b-tr>
                            <b-td>
                              <ejs-datepicker id="formSCIIndocDate" @change="AssistDateChange(data)" v-model="data.SCIIndocAssistDate"></ejs-datepicker>
                            </b-td>
                            <b-td>
                              <ejs-datepicker id="formAccessCheckDate" v-model="data.SCIAccessCheckDate"></ejs-datepicker>
                            </b-td>
                            <b-td>
                              <ejs-dropdownlist v-model="data.SCIStatus" :dataSource="status" :fields="ddfields"></ejs-dropdownlist>
                            </b-td>
                            <b-td>
                              <ejs-datepicker id="formPR" v-model="data.SCIPR"></ejs-datepicker>
                            </b-td>
                            <b-td>
                              <ejs-datepicker id="formCE" v-model="data.SCICE"></ejs-datepicker>
                            </b-td>
                            <b-td>
                              <span v-for="sci in data.SCI" :key="sci.Id">
                                <a class="ellipses" :href="sci.href" target="_blank">View {{ sci.name }}</a>
                              </span>
                            </b-td>
                            <b-td>
                              <!-- Update Button -->
                              <b-button ref="updateSCI" variant="success" :data-id="data.Id" class="btn-sm" @click="updateForm(data)">Update SCI</b-button>
                            </b-td>
                          </b-tr>
                        </b-tbody>
                      </b-table-simple>
                  </b-col>
                  <b-col v-if="data.CAC" cols="12">
                    <b-table-simple small responsive>
                        <b-thead head-variant="dark">
                          <b-tr>
                            <b-th>Valid CAC</b-th>
                            <b-th>CAC Status</b-th>
                            <b-th>CAC Issued By</b-th>
                            <b-th>CAC Expiration Date</b-th>
                            <b-th>Submitted Form</b-th>
                            <b-th></b-th>
                          </b-tr>
                        </b-thead>
                        <b-tbody>
                          <b-tr>
                            <b-td>
                              <b-form-input type="text" id="formCACValid" v-model="data.CACValid" disabled></b-form-input>
                            </b-td>
                            <b-td>
                              <ejs-dropdownlist v-model="data.CACStatus" :dataSource="cacstatus" :fields="ddfields"></ejs-dropdownlist>
                            </b-td>
                            <b-td>
                              <b-form-input type="text" id="formCACIssuedBy" v-model="data.CACIssuedBy" disabled></b-form-input>
                            </b-td>
                            <b-td>
                              <ejs-datepicker id="formCACExpirationDate" v-model="data.CACExpirationDate"></ejs-datepicker>
                            </b-td>
                            <b-td>
                              <span v-for="cac in data.CAC" :key="cac.Id">
                                <a class="ellipses" :href="cac.href" target="_blank">View {{ cac.name }}</a>
                              </span>
                            </b-td>
                            <b-td>
                              <!-- Update Button -->
                              <b-button ref="updateCAC" variant="success" :data-id="data.Id" class="btn-sm" @click="updateForm(data)">Update CAC</b-button>
                            </b-td>
                          </b-tr>
                        </b-tbody>
                      </b-table-simple>
                  </b-col>
                </b-row>
              </b-container>`,
            data: function() {
              return {
                data: {},
                ddfields: { text: 'text', value: 'value' },
                status: [
                  { text: 'Not Required', value: 'Not Required' },
                  { text: 'Pending Info', value: 'Pending Info' },
                  { text: 'CACI Review', value: 'CACI Review' },
                  { text: 'Submitted', value: 'Submitted' },
                  { text: 'Indoc Assist Sent', value: 'Indoc Assist Sent' },
                  { text: 'SSO Processed', value: 'SSO Processed' },
                  { text: 'Debrief Notification Submitted', value: 'Debrief Notification Submitted' },
                  { text: 'Disposition-Transfer', value: 'Disposition-Transfer' },
                  { text: 'Disposition-Debriefed', value: 'Disposition-Debriefed' }
                ],
                cacstatus: [
                  { text: 'Not Required', value: 'Not Required' },
                  { text: 'Pending Info', value: 'Pending Info' },
                  { text: 'CACI Review', value: 'CACI Review' },
                  { text: 'Requested', value: 'Requested' },
                  { text: 'Issued', value: 'Issued' },
                  { text: 'Return Pending', value: 'Return Pending' },
                  { text: 'Disposition-Returned', value: 'Disposition-Returned' },
                  { text: 'Disposition-Transferred', value: 'Disposition-Transferred' },
                  { text: 'Non-F3I2 CAC', value: 'Non-F3I2 CAC' }
                ]
              }
            },
            methods: {
              AssistDateChange(data) {
                console.log(data.SCIStatus)
                data.SCIStatus = 'SSO Processed'
              },
              async NotifyGov(data, e) {
                let id = parseInt(e.currentTarget.dataset.id)
                let taskId, account
                let taskUserId = vm.$store.state.support.AFRLUserId
                // get the current item data
                data.Accounts.forEach(type => {
                  if (id === type.id) {
                    type.GovSentDate = this.$moment().format('MM/DD/YYYY')
                    taskId = type.task
                    account = type.account
                  }
                })
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
                data.Accounts.forEach(type => {
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
                data.Accounts.forEach(type => {
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
                data.Accounts.forEach((type, i) => {
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
                original = data.Accounts[index]
                data.Accounts.splice(index, 1)
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
                if (payload.Accounts) {
                  payload.Accounts = JSON.stringify(payload.Accounts)
                }
                if (payload.SCI) {
                  payload.SCI = JSON.stringify(payload.SCI)
                }
                if (payload.CAC) {
                  payload.CAC = JSON.stringify(payload.CAC)
                }
                /*payload.SCIIndocAssistDate = d.SCIIndocAssistDate ? this.$moment(d.SCIIndocAssistDate).format('MM-DD-YYYY') : ''
                payload.SCIPR = d.SCIPR ? this.$moment(d.SCIPR).format('MM-DD-YYYY') : ''
                payload.SCICE = d.SCICE ? this.$moment(d.SCICE).format('MM-DD-YYYY') : ''
                payload.SCIAccessCheckDate = d.SCIAccessCheckDate ? this.$moment(d.SCIAccessCheckDate).format('MM-DD-YYYY') : ''*/
                payload.CACValid = d.CACValid
                payload.CACExpirationDate = d.CACExpirationDate
                payload.CACIssuedBy = d.CACIssuedBy
                payload.SCIIndocAssistDate = d.SCIIndocAssistDate
                payload.SCIPR = d.SCIPR
                payload.SCICE = d.SCICE
                payload.SCIAccessCheckDate = d.SCIAccessCheckDate
                payload.SCIStatus = d.SCIStatus
                await Security.dispatch('updateSecurityForm', payload).then(function(result) {
                  // grab a fresh etag for the record
                  d.etag = result.headers.etag
                  /*Security.dispatch('getSecurityFormByPersonnelId', d.PersonnelId).then(function(response) {
                    d.etag = response.etag
                  })*/
                  const notification = {
                    type: 'success',
                    title: 'Succesfully Updated Security Form',
                    message: 'Updated Security form for ' + d.PersonName + ' in ' + d.Company,
                    push: true
                  }
                  vm.$store.dispatch('notification/add', notification, { root: true })
                })
                if (tId) {
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
    // get all of the entries from the SecurityForms list - Might need to check if Subcontractor and then only load related the related personnel list
  },
  methods: {
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
    },
    toolbarClick: function(args) {
      if (args.item.id === 'FormsGrid_excelexport') {
        // 'Grid_excelexport' -> Grid component id + _ + toolbar item name
        // prolly need to loop through the security forms and format the data into strings
        let data = []
        this.securityforms.forEach(sf => {
          let CurrentData = {
            Id: sf.Id,
            PersonName: sf.PersonName,
            Company: sf.Company,
            SCIStatus: sf.SCIStatus,
            SCIIndocAssistDate: sf.SCIIndocAssistDate,
            SCIPR: sf.SCIPR,
            SCICE: sf.SCICE,
            SCIIndocDate: sf.SCIIndoc,
            SCIAccessCheckDate: sf.SCIAccessCheckDate,
            IsCACValid: sf.CACValid,
            CACStatus: sf.CACStatus,
            CACRequestDate: sf.CACRequestDate,
            CACExpirationDate: sf.CACExpirationDate,
            CACIssuedBy: sf.CACIssuedBy,
            NIPRAccount: '',
            NIPRGovSentDate: '',
            NIPRGovCompleteDate: '',
            SIPRAccount: '',
            SIPRGovSentDate: '',
            SIPRGovCompleteDate: '',
            DRENAccount: '',
            DRENGovSentDate: '',
            DRENGovCompleteDate: '',
            JWICAccount: '',
            JWICGovSentDate: '',
            JWICGovCompleteDate: ''
          }
          sf.Accounts.forEach(a => {
            switch (a.account) {
              case 'NIPR':
                CurrentData['NIPRAccount'] = 'Yes'
                CurrentData['NIPRGovSentDate'] = a.GovSentDate
                CurrentData['NIPRGovCompleteDate'] = a.GovCompleteDate
                break
              case 'SIPR':
                CurrentData['SIPRAccount'] = 'Yes'
                CurrentData['SIPRGovSentDate'] = a.GovSentDate
                CurrentData['SIPRGovCompleteDate'] = a.GovCompleteDate
                break
              case 'DREN':
                CurrentData['DRENAccount'] = 'Yes'
                CurrentData['DRENGovSentDate'] = a.GovSentDate
                CurrentData['DRENGovCompleteDate'] = a.GovCompleteDate
                break
              case 'JWIC':
                CurrentData['JWICAccount'] = 'Yes'
                CurrentData['JWICGovSentDate'] = a.GovSentDate
                CurrentData['JWICGovCompleteDate'] = a.GovCompleteDate
                break
            }
          })
          data.push(CurrentData)
        })
        let excelExportProperties = {
          fileName: 'Security.xlsx',
          dataSource: data,
          includeHiddenColumn: true
        }
        this.$refs.FormsGrid.excelExport(excelExportProperties)
      }
    }
  },
  provide: {
    grid: [Page, DetailRow, VirtualScroll, Toolbar, ExcelExport]
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
<style lang="scss">
.ellipses {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  width: 10rem;
  display: inline-block;
}
</style>
