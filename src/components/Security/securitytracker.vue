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
        id="SecurityGrid"
        ref="SecurityGrid"
        :dataSource="securityforms"
        :allowPaging="true"
        :allowReordering="true"
        :allowResizing="true"
        :pageSettings="pageSettings"
        :editSettings="editSettings"
        :filterSettings="filterSettings"
        :toolbar="toolbar"
        :allowExcelExport="true"
        :toolbarClick="toolbarClick"
        :actionComplete="actionComplete"
        :dataBound="dataBound"
        :detailTemplate="detailTemplate"
        rowHeight="20"
        height="100%"
        width="100%"
      >
        <e-columns>
          <e-column field="PersonName" headerText="Person Name" minWidth="250" textAlign="Left"></e-column>
          <e-column field="Company" headerText="Company" minWidth="100" textAlign="Left"></e-column>
          <e-column field="SCIStatus" headerText="SCI Status" minWidth="50" textAlign="Left"></e-column>
          <e-column field="SCIFormType" headerText="SCI Form" minWidth="50" textAlign="Left"></e-column>
          <e-column field="SCIFormSubmitted" headerText="SCI Submitted" minWidth="50" textAlign="Left"></e-column>
          <e-column field="SCIIndocAssistDate" headerText="SCI Indoc Assist Date" minWidth="125" textAlign="Left"></e-column>
          <e-column field="SCIPR" headerText="PR Due Date" minWidth="50" textAlign="Left"></e-column>
          <e-column field="SCICE" headerText="CE Date" minWidth="50" textAlign="Left"></e-column>
          <e-column field="SCIIndoc" headerText="SCI Indoc Date" :visible="false" textAlign="Left"></e-column>
          <e-column field="SCIAccessCheckDate" headerText="SCI Access Check Date" :visible="false" textAlign="Left"></e-column>
          <e-column field="CACValid" headerText="Is CAC Valid" minWidth="50" textAlign="Left"></e-column>
          <e-column field="CACStatus" headerText="CAC Status" minWidth="50" textAlign="Left"></e-column>
          <e-column field="CACRequestDate" headerText="CAC Request Date" minWidth="50" textAlign="Left"></e-column>
          <e-column field="CACExpirationDate" headerText="CAC Expiration Date" minWidth="50" textAlign="Left"></e-column>
          <e-column field="CACIssuedBy" headerText="CAC Issued By" minWidth="50" textAlign="Left"></e-column>
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
          <e-column field="Id" headerText="Id" :visible="false" textAlign="Left" width="40" :isPrimaryKey="true"></e-column>
        </e-columns>
      </ejs-grid>
    </div>
  </b-container>
</template>
<script>
// eslint-disable-next-line no-undef
let url = _spPageContextInfo.webAbsoluteUrl
let vm = null
//let url = _spPageContextInfo.webAbsoluteUrl
import Vue from 'vue'
import User from '@/models/User'
import Personnel from '@/models/Personnel'
import Company from '@/models/Company'
import Security from '@/models/Security'
import Todo from '@/models/Todo'
import { Page, VirtualScroll, DetailRow, Toolbar, ExcelExport, Resize, Search } from '@syncfusion/ej2-vue-grids'

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
      pageSettings: { pageSize: 20 },
      editSettings: {
        allowEditing: false,
        allowAdding: false,
        allowDeleting: false,
        mode: 'Dialog'
      },
      filterSettings: { type: 'Menu' },
      //toolbar: ['Edit', 'Print', 'Search', 'ExcelExport'],
      toolbar: ['ExcelExport', 'Search'],
      // Add a template with logic to handle each of the account types with buttons to indicate when they were sent to/completed by the gov
      // template should also check what the formType is and only display those forms
      detailTemplate: function() {
        return {
          template: Vue.component('accountDetailTemplate', {
            template: `
              <b-container fluid>
                <b-row>
                  <!-- Account Template -->
                  <b-col cols="12" v-if="data.Accounts && data.Accounts.length > 0">
                    <div class="detailDiv">
                      <b-table-simple small responsive>
                        <b-thead head-variant="dark">
                          <b-tr>
                            <b-th>Account</b-th>
                            <b-th>Government Sent Date</b-th>
                            <b-th>Government Review</b-th>
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
                                <b-button v-if="isSecurity" ref="NotifyGov" variant="success" :data-id="t.id" class="btn-sm" @click="NotifyGov(data, $event)">Notify Government</b-button>
                                <span v-if="!isSecurity">Processing</span>
                              </span>
                            </b-td>
                            <b-td>
                              <span v-if="t.GovCompleteDate !== ''">{{ t.GovCompleteDate }}</span>
                              <span v-if="t.GovRejectDate !== ''">{{ t.GovRejectDate }}</span>
                              <span v-if="t.GovCompleteDate == '' && t.GovRejectDate == ''"><!-- add a check if user is in AFRL -->
                                <!-- REMOVE DEVELOPER OPTION -->  
                                <b-button v-if="isAFRL || isDeveloper" ref="CompleteGov" variant="primary" :data-id="t.id" class="btn-sm" @click="CompleteGov(data, $event)">Complete</b-button>
                                <b-button v-if="isAFRL || isDeveloper" ref="RejectGov" variant="danger" :data-id="t.id" class="btn-sm" @click="RejectGov(data, $event)">Rework</b-button>
                                <span v-if="!isAFRL && t.GovSentDate !== ''">Processing</span>
                              </span>
                            </b-td>
                            <b-td><a v-if="t.href !== ''" :href="t.href" target="_blank">View Form</a></b-td>
                          </b-tr>
                        </b-tbody>
                      </b-table-simple>
                    </div>
                  </b-col>
                  <b-col v-if="data.SCI && data.SCI.length > 0" cols="12">
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
                              <ejs-datepicker :disable="!isSecurity" id="formSCIIndocDate" @change="AssistDateChange(data)" v-model="data.SCIIndocAssistDate"></ejs-datepicker>
                            </b-td>
                            <b-td>
                              <ejs-datepicker :disable="!isSecurity" id="formAccessCheckDate" v-model="data.SCIAccessCheckDate"></ejs-datepicker>
                            </b-td>
                            <b-td>
                              <ejs-dropdownlist :disable="!isSecurity" v-model="data.SCIStatus" :dataSource="status" :fields="ddfields"></ejs-dropdownlist>
                            </b-td>
                            <b-td>
                              <ejs-datepicker :disable="!isSecurity" id="formPR" v-model="data.SCIPR"></ejs-datepicker>
                            </b-td>
                            <b-td>
                              <ejs-datepicker :disable="!isSecurity" id="formCE" v-model="data.SCICE"></ejs-datepicker>
                            </b-td>
                            <b-td>
                              <span v-for="sci in data.SCI" :key="sci.Id">
                                <a class="ellipses" :href="sci.href" target="_blank">View {{ sci.name }}</a>
                              </span>
                            </b-td>
                            <b-td>
                              <!-- Update Button -->
                              <b-button v-if="isSecurity || isDeveloper" ref="updateSCI" variant="success" :data-id="data.Id" class="btn-sm" @click="updateForm(data)">Update SCI</b-button>
                            </b-td>
                          </b-tr>
                        </b-tbody>
                      </b-table-simple>
                  </b-col>
                  <b-col v-if="data.CAC && data.CAC.length > 0" cols="12">
                    <div v-if="data.CACValid === 'Yes'">
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
                              <b-form-input :disable="!isSecurity" type="text" id="formCACValid" v-model="data.CACValid" disabled></b-form-input>
                            </b-td>
                            <b-td>
                              <ejs-dropdownlist :disable="!isSecurity" v-model="data.CACStatus" :dataSource="cacstatus" :fields="ddfields"></ejs-dropdownlist>
                            </b-td>
                            <b-td>
                              <b-form-input :disable="!isSecurity" type="text" id="formCACIssuedBy" v-model="data.CACIssuedBy"></b-form-input>
                            </b-td>
                            <b-td>
                              <ejs-datepicker :disable="!isSecurity" id="formCACExpirationDate" v-model="data.CACExpirationDate"></ejs-datepicker>
                            </b-td>
                            <b-td>
                              <span v-for="cac in data.CAC" :key="cac.Id">
                                <a class="ellipses" :href="cac.href" target="_blank">View {{ cac.name }}</a>
                              </span>
                            </b-td>
                            <b-td>
                              <!-- Update Button -->
                              <!-- REMOVE DEVELOPER OPTION -->
                              <b-button v-if="isSecurity || isDeveloper" ref="updateCAC" variant="success" :data-id="data.Id" class="btn-sm" @click="updateForm(data)">Update CAC</b-button>
                            </b-td>
                          </b-tr>
                        </b-tbody>
                      </b-table-simple>
                    </div>
                    <div v-if="data.CACValid === 'No'">
                      <b-table-simple small responsive>
                        <b-thead head-variant="dark">
                          <b-tr>
                            <b-th>Valid CAC</b-th>
                            <b-th>CAC Status</b-th>
                            <b-th>CAC Issued By</b-th>
                            <b-th>CAC Expired On</b-th>
                            <b-th>Submitted Form</b-th>
                            <b-th></b-th>
                          </b-tr>
                        </b-thead>
                        <b-tbody>
                          <b-tr>
                            <b-td>
                              <b-form-input :disable="!isSecurity" type="text" id="formCACValid" v-model="data.CACValid" disabled></b-form-input>
                            </b-td>
                            <b-td>
                              <ejs-dropdownlist :disable="!isSecurity" v-model="data.CACStatus" :dataSource="cacstatus" :fields="ddfields"></ejs-dropdownlist>
                            </b-td>
                            <b-td>
                              <b-form-input :disable="!isSecurity" type="text" id="formCACIssuedBy" v-model="data.CACIssuedBy" disabled></b-form-input>
                            </b-td>
                            <b-td>
                              <ejs-datepicker :disable="!isSecurity" id="formCACExpirationDate" v-model="data.CACExpirationDate"></ejs-datepicker>
                            </b-td>
                            <b-td>
                              <span v-for="cac in data.CAC" :key="cac.Id">
                                <a class="ellipses" :href="cac.href" target="_blank">View {{ cac.name }}</a>
                              </span>
                            </b-td>
                            <b-td>
                              <!-- Update Button -->
                              <!-- REMOVE DEVELOPER OPTION -->
                              <b-button v-if="isSecurity || isDeveloper" ref="updateCAC" variant="success" :data-id="data.Id" class="btn-sm" @click="updateForm(data)">Update CAC</b-button>
                            </b-td>
                          </b-tr>
                        </b-tbody>
                      </b-table-simple>
                    </div>
                  </b-col>
                </b-row>
              </b-container>`,
            computed: {
              userloaded() {
                return User.getters('Loaded')
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
              isDeveloper() {
                return User.getters('isDeveloper')
              }
            },
            data: function() {
              return {
                data: {
                  GovernmentDate: '',
                  securityforms: []
                },
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
                  { text: 'Disposition-Debriefed', value: 'Disposition-Debriefed' },
                  { text: 'Transfer Notification Submitted', value: 'Transfer Notification Submitted' },
                  { text: 'Withdrawn', value: 'Withdrawn' }
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
                  { text: 'Non-F3I2 CAC', value: 'Non-F3I2 CAC' },
                  { text: 'Transfer Pending', value: 'Transfer Pending' }
                ]
              }
            },
            methods: {
              AssistDateChange(data) {
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
                payload = {
                  Title: 'Complete or Reject ' + data.PersonName + ' ' + account + ' Request',
                  //AssignedToId: vm.userid, // Hardcode to either Michelle or Monica
                  AssignedToId: vm.$store.state.support.AFRLUserId,
                  Description: 'Complete or Reject ' + data.PersonName + ' ' + account + ' Request.',
                  IsMilestone: false,
                  PercentComplete: 0,
                  TaskType: account + ' Request',
                  TaskLink: '/security/tracker/accounts'
                }
                await Todo.dispatch('addTodo', payload).catch(error => {
                  const notification = {
                    type: 'danger',
                    title: 'Portal Error',
                    message: error.message,
                    push: true
                  }
                  this.$store.dispatch('notification/add', notification, {
                    root: true
                  })
                  console.log('ERROR: ' + error.message)
                })
              },
              async CompleteGov(data, event) {
                await Security.dispatch('getDigest')
                let id = parseInt(event.currentTarget.dataset.id)
                let taskId,
                  account,
                  taskUserId = vm.$store.state.support.AccountUserId
                // get the current item data
                data.Accounts.forEach(type => {
                  if (id === type.id) {
                    type.GovCompleteDate = 'Completed On: ' + this.$moment().format('MM/DD/YYYY')
                    taskId = type.task
                    account = type.account
                  }
                })
                await this.updateForm(data, taskId)
                  .then(() => {
                    // To Do: change this to automatically download the type of account
                    data.Accounts.forEach(account => {
                      window.open(url + '/_layouts/download.aspx?SourceUrl=' + account.href, '_blank')
                    })
                  })
                  .catch(e => {
                    // Add user notification and system logging
                    const notification = {
                      type: 'danger',
                      title: 'Portal Error',
                      message: e,
                      push: true
                    }
                    this.$store.dispatch('notification/add', notification, {
                      root: true
                    })
                    console.log('ERROR: ' + e.message)
                  })
                let payload = {
                  Title: 'AFRL Completed ' + data.PersonName + ' ' + account + ' Request',
                  AssignedToId: taskUserId,
                  Description: 'AFRL Completed ' + data.PersonName + ' ' + account + ' Request. Please notify the original submitter.',
                  IsMilestone: false,
                  PercentComplete: 0,
                  TaskType: account + ' Request',
                  TaskLink: '/security/tracker/accounts'
                }
                await Todo.dispatch('addTodo', payload).catch(error => {
                  const notification = {
                    type: 'danger',
                    title: 'Portal Error',
                    message: error.message,
                    push: true
                  }
                  this.$store.dispatch('notification/add', notification, {
                    root: true
                  })
                  console.log('ERROR: ' + error.message)
                })
                // Remove the button and display current Date
              },
              async RejectGov(data, event) {
                await Security.dispatch('getDigest')
                let id = parseInt(event.currentTarget.dataset.id)
                // get the current item data
                let index = 0
                let original = {}
                let taskId, account
                data.Accounts.forEach((type, i) => {
                  if (id === type.id) {
                    type.GovRejectDate = 'Rejected On: ' + this.$moment().format('MM/DD/YYYY')
                    type.href = ''
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
                await this.updateForm(data, taskId).catch(error => {
                  const notification = {
                    type: 'danger',
                    title: 'Portal Error',
                    message: error.message,
                    push: true
                  }
                  this.$store.dispatch('notification/add', notification, {
                    root: true
                  })
                  console.log('ERROR: ' + error.message)
                })
                await Security.dispatch('DeleteForm', original).catch(error => {
                  const notification = {
                    type: 'danger',
                    title: 'Portal Error',
                    message: error,
                    push: true
                  }
                  this.$store.dispatch('notification/add', notification, {
                    root: true
                  })
                  console.log('ERROR: ' + error.message)
                })
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
                await Todo.dispatch('addTodo', payload).catch(error => {
                  const notification = {
                    type: 'danger',
                    title: 'Portal Error',
                    message: error.message,
                    push: true
                  }
                  this.$store.dispatch('notification/add', notification, {
                    root: true
                  })
                  console.log('ERROR: ' + error.message)
                })
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
                payload.CACRequestDate = d.CACRequestDate ? d.CACRequestDate : null
                payload.CACExpirationDate = d.CACExpirationDate ? d.CACExpirationDate : null
                payload.CACIssuedBy = d.CACIssuedBy
                payload.SCIIndoc = d.SCIIndoc ? d.SCIIndoc : null
                payload.SCIIndocAssistDate = d.SCIIndocAssistDate ? d.SCIIndocAssistDate : null
                payload.SCIPR = d.SCIPR ? d.SCIPR : null
                payload.SCICE = d.SCICE ? d.SCICE : null
                payload.SCIAccessCheckDate = d.SCIAccessCheckDate ? d.SCIAccessCheckDate : null
                payload.SCIStatus = d.SCIStatus
                await Security.dispatch('updateSecurityForm', payload)
                  .then(function(result) {
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
                  .catch(e => {
                    // Add user notification and system logging
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
    if (this.userloaded) {
      this.getData()
    } else {
      vm.$options.interval = setInterval(vm.getData, 1000)
    }
    // get all of the entries from the SecurityForms list - Might need to check if Subcontractor and then only load related the related personnel list
  },
  methods: {
    getUserIDs: async function() {
      this.$store.dispatch('support/getAccountUser')
      this.$store.dispatch('support/getAFRLUser')
      this.$store.dispatch('support/getCACSCIUser')
    },
    actionComplete(args) {
      // if (console) { console.log('ACTION COMPLETE: ' + args.requestType) }
      if (args.requestType == 'columnstate') {
        this.$refs['SecurityGrid'].autoFitColumns()
      }
      /*if (args.requestType == 'refresh') {
        let h1 = 0
        let h2 = this.$refs.SecurityGrid.$el.children[7].children[0].clientHeight // cildren[7] matches .e-gridconent
        h1 = Math.floor(h2 / 20)
        this.pageSettings.pageSize = h1
        this.$refs.SecurityGrid.pageSettings = { pageSize: h1 }
      }*/
    },
    dataBound: function() {
      this.$refs.SecurityGrid.autoFitColumns()
    },
    getData: async function() {
      clearInterval(vm.$options.interval)
      if (this.isSubcontractor) {
        Company.dispatch('getCompanies').then(function() {
          // Add notification
          vm.$options.interval = setInterval(vm.waitForPersonnel, 1000)
        })
      } else {
        //await this.getUserIDs()
        console.log('Getting Security Forms')
        await Security.dispatch('getSecurityForms').then(() => {
          this.securityforms.forEach(form => {
            form.CACExpirationDate = this.$moment(form.CACExpirationDate).isValid() ? this.$moment(form.CACExpirationDate).format('MM/DD/YYYY') : ''
            form.CACRequestDate = this.$moment(form.CACRequestDate).isValid() ? this.$moment(form.CACRequestDate).format('MM/DD/YYYY') : ''
            form.SCIIndocAssistDate = this.$moment(form.SCIIndocAssistDate).isValid() ? this.$moment(form.SCIIndocAssistDate).format('MM/DD/YYYY') : ''
            form.SCIAccessCheckDate = this.$moment(form.SCIAccessCheckDate).isValid() ? this.$moment(form.SCIAccessCheckDate).format('MM/DD/YYYY') : ''
            form.SCIFormSubmitted = this.$moment(form.SCIFormSubmitted).isValid() ? this.$moment(form.SCIFormSubmitted).format('MM/DD/YYYY') : ''
            form.SCIIndoc = this.$moment(form.SCIIndoc).isValid() ? this.$moment(form.SCIIndoc).format('MM/DD/YYYY') : ''
            form.SCIPR = this.$moment(form.SCIPR).isValid() ? this.$moment(form.SCIPR).format('MM/DD/YYYY') : ''
            form.SCICE = this.$moment(form.SCICE).isValid() ? this.$moment(form.SCICE).format('MM/DD/YYYY') : ''
          })
        })
      }
    },
    waitForPersonnel: async function() {
      if (this.currentuser) {
        // finally have user - now get the personnel based on their company
        this.company = this.currentuser[0].Company ? this.currentuser[0].Company : this.companies[0]
        let payload = {}
        payload.company = this.company
        await Personnel.dispatch('getPersonnelByCompany', payload).catch(error => {
          const notification = {
            type: 'danger',
            title: 'Portal Error',
            message: error.message,
            push: true
          }
          this.$store.dispatch('notification/add', notification, {
            root: true
          })
          console.log('ERROR: ' + error.message)
        })
        await Security.dispatch('getSecurityFormsByCompany', payload)
          .then(() => {
            this.securityforms.forEach(form => {
              form.CACExpirationDate = this.$moment(form.CACExpirationDate).isValid() ? this.$moment(form.CACExpirationDate).format('MM/DD/YYYY') : ''
              form.CACRequestDate = this.$moment(form.CACRequestDate).isValid() ? this.$moment(form.CACRequestDate).format('MM/DD/YYYY') : ''
              form.SCIIndocAssistDate = this.$moment(form.SCIIndocAssistDate).isValid() ? this.$moment(form.SCIIndocAssistDate).format('MM/DD/YYYY') : ''
              form.SCIAccessCheckDate = this.$moment(form.SCIAccessCheckDate).isValid() ? this.$moment(form.SCIAccessCheckDate).format('MM/DD/YYYY') : ''
              form.SCIFormSubmitted = this.$moment(form.SCIFormSubmitted).isValid() ? this.$moment(form.SCIFormSubmitted).format('MM/DD/YYYY') : ''
              form.SCIIndoc = this.$moment(form.SCIIndoc).isValid() ? this.$moment(form.SCIIndoc).format('MM/DD/YYYY') : ''
              form.SCIPR = this.$moment(form.SCIPR).isValid() ? this.$moment(form.SCIPR).format('MM/DD/YYYY') : ''
              form.SCICE = this.$moment(form.SCICE).isValid() ? this.$moment(form.SCICE).format('MM/DD/YYYY') : ''
            })
          })
          .catch(error => {
            const notification = {
              type: 'danger',
              title: 'Portal Error',
              message: error.message,
              push: true
            }
            this.$store.dispatch('notification/add', notification, {
              root: true
            })
            console.log('ERROR: ' + error.message)
          })
        clearInterval(vm.$options.interval)
      }
    },
    getPersonnelByCompany: async function() {
      let payload = {
        company: this.form.Company
      }
      await Personnel.dispatch('getPersonnelByCompany', payload).catch(error => {
        // Add user notification and system logging
        const notification = {
          type: 'danger',
          title: 'Portal Error',
          message: error.message,
          push: true
        }
        this.$store.dispatch('notification/add', notification, {
          root: true
        })
        console.log('ERROR: ' + error.message)
      })
    },
    toolbarClick: function(args) {
      if (args.item.id === 'SecurityGrid_excelexport') {
        // 'Grid_excelexport' -> Grid component id + _ + toolbar item name
        // prolly need to loop through the security forms and format the data into strings
        this.$refs.SecurityGrid.getColumns()[2].visible = true
        this.$refs.SecurityGrid.getColumns()[3].visible = true
        this.$refs.SecurityGrid.getColumns()[4].visible = true
        this.$refs.SecurityGrid.getColumns()[5].visible = true
        this.$refs.SecurityGrid.getColumns()[6].visible = true
        this.$refs.SecurityGrid.getColumns()[7].visible = true
        this.$refs.SecurityGrid.getColumns()[8].visible = true
        this.$refs.SecurityGrid.getColumns()[9].visible = true
        this.$refs.SecurityGrid.getColumns()[10].visible = true
        this.$refs.SecurityGrid.getColumns()[11].visible = true
        this.$refs.SecurityGrid.getColumns()[12].visible = true
        this.$refs.SecurityGrid.getColumns()[13].visible = true
        this.$refs.SecurityGrid.getColumns()[14].visible = true
        this.$refs.SecurityGrid.getColumns()[15].visible = true
        this.$refs.SecurityGrid.getColumns()[16].visible = true
        this.$refs.SecurityGrid.getColumns()[17].visible = true
        this.$refs.SecurityGrid.getColumns()[18].visible = true
        this.$refs.SecurityGrid.getColumns()[19].visible = true
        this.$refs.SecurityGrid.getColumns()[20].visible = true
        this.$refs.SecurityGrid.getColumns()[21].visible = true
        this.$refs.SecurityGrid.getColumns()[22].visible = true
        this.$refs.SecurityGrid.getColumns()[23].visible = true
        this.$refs.SecurityGrid.getColumns()[24].visible = true
        this.$refs.SecurityGrid.getColumns()[25].visible = true
        this.$refs.SecurityGrid.getColumns()[26].visible = true
        this.$refs.SecurityGrid.getColumns()[27].visible = false
        this.$refs.SecurityGrid.getColumns()[28].visible = false
        this.$refs.SecurityGrid.getColumns()[29].visible = false
        let data = []
        this.securityforms.forEach(sf => {
          let CurrentData = {
            //Id: sf.Id,
            PersonName: sf.PersonName,
            Company: sf.Company,
            SCIStatus: sf.SCIStatus,
            SCIFormType: sf.SCIFormType,
            SCIFormSubmitted: this.$moment(sf.SCIFormSubmitted).isValid() ? this.$moment(sf.SCIFormSubmitted).format('MM/DD/YYYY') : '',
            SCIIndocAssistDate: this.$moment(sf.SCIIndocAssistDate).isValid() ? this.$moment(sf.SCIIndocAssistDate).format('MM/DD/YYYY') : '',
            SCIPR: this.$moment(sf.SCIPR).isValid() ? this.$moment(sf.SCIPR).format('MM/DD/YYYY') : '',
            SCICE: this.$moment(sf.SCICE).isValid() ? this.$moment(sf.SCICE).format('MM/DD/YYYY') : '',
            SCIIndocDate: this.$moment(sf.SCIIndoc).isValid() ? this.$moment(sf.SCIIndoc).format('MM/DD/YYYY') : '',
            SCIAccessCheckDate: this.$moment(sf.SCIAccessCheckDate).isValid() ? this.$moment(sf.SCIAccessCheckDate).format('MM/DD/YYYY') : '',
            IsCACValid: sf.CACValid,
            CACStatus: sf.CACStatus,
            CACRequestDate: this.$moment(sf.CACRequestDate).isValid() ? this.$moment(sf.CACRequestDate).format('MM/DD/YYYY') : '',
            CACExpirationDate: this.$moment(sf.CACExpirationDate).isValid() ? this.$moment(sf.CACExpirationDate).format('MM/DD/YYYY') : '',
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
          if (sf.Accounts && sf.Accounts.length > 0) {
            sf.Accounts.forEach(a => {
              switch (a.account) {
                case 'NIPR':
                  CurrentData.NIPRAccount = 'Yes'
                  CurrentData.NIPRGovSentDate = this.$moment(a.GovSentDate).isValid() ? this.$moment(a.GovSentDate).format('MM/DD/YYYY') : ''
                  CurrentData.NIPRGovCompleteDate = this.$moment(a.GovCompleteDate).isValid() ? this.$moment(a.GovCompleteDate).format('MM/DD/YYYY') : ''
                  break
                case 'SIPR':
                  CurrentData.SIPRAccount = 'Yes'
                  CurrentData.SIPRGovSentDate = this.$moment(a.GovSentDate).isValid() ? this.$moment(a.GovSentDate).format('MM/DD/YYYY') : ''
                  CurrentData.SIPRGovCompleteDate = this.$moment(a.GovCompleteDate).isValid() ? this.$moment(a.GovCompleteDate).format('MM/DD/YYYY') : ''
                  break
                case 'DREN':
                  CurrentData.DRENAccount = 'Yes'
                  CurrentData.DRENGovSentDate = this.$moment(a.GovSentDate).isValid() ? this.$moment(a.GovSentDate).format('MM/DD/YYYY') : ''
                  CurrentData.DRENGovCompleteDate = this.$moment(a.GovCompleteDate).isValid() ? this.$moment(a.GovCompleteDate).format('MM/DD/YYYY') : ''
                  break
                case 'JWICS':
                  CurrentData.JWICAccount = 'Yes'
                  CurrentData.JWICGovSentDate = this.$moment(a.GovSentDate).isValid() ? this.$moment(a.GovSentDate).format('MM/DD/YYYY') : ''
                  CurrentData.JWICGovCompleteDate = this.$moment(a.GovCompleteDate).isValid() ? this.$moment(a.GovCompleteDate).format('MM/DD/YYYY') : ''
                  break
              }
            })
          }
          data.push(CurrentData)
        })
        let excelExportProperties = {
          fileName: 'Security.xlsx',
          dataSource: data,
          includeHiddenColumn: false
        }
        this.$refs.SecurityGrid.excelExport(excelExportProperties)
      }
    }
  },
  provide: {
    grid: [Page, DetailRow, VirtualScroll, Toolbar, ExcelExport, Resize, Search]
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
