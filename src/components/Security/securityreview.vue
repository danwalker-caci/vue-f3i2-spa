<template>
  <!-- Add Form where users can download master docs and upload the changed docs. -->
  <b-container fluid class="contentHeight p-0" id="MainContainer">
    <b-form class="bg-light w-100 overflow-x-hidden">
      <b-row class="bg-light-blue formheader">
        <b-col cols="4" class="p-0 text-left"></b-col>
        <b-col cols="4" class="p-0 text-center font-weight-bold">
          <h3 class="text-white">{{ formTitle }}</h3>
        </b-col>
        <b-col cols="4" class="p-0 text-right"></b-col>
      </b-row>
      <div class="p-3">
        <b-form-row>
          <b-col>
            <b-button @click="$router.push({ path: '/security/tracker' })" variant="secondary">Return to Tracker</b-button>
          </b-col>
        </b-form-row>
        <div v-if="persons.length > 0">
          <b-form-row v-for="person in persons" :key="person.SecurityID">
            <b-col>
              Company: <strong>{{ person.Company }}</strong>
              <!--<b-form-group label="Company: " label-for="company">
                <b-form-input id="company" v-model="company" value="{{ company }}" disabled />
              </b-form-group>-->
            </b-col>
            <b-col>
              Name: <strong>{{ person.FirstName }} {{ person.LastName }}</strong>
            </b-col>
            <b-col>
              Date Submitted: <strong>{{ submittedDate }}</strong>
            </b-col>
          </b-form-row>
        </div>
        <b-form-row v-else>
          <b-col>
            Company: <strong>{{ company }}</strong>
          </b-col>
          <b-col>
            Name: <strong>{{ name }}</strong>
          </b-col>
          <b-col>
            Date Submitted: <strong>{{ submittedDate }}</strong>
          </b-col>
        </b-form-row>
        <b-form-row v-if="sciType">
          <b-col>
            SCI Type: <strong>{{ sciType }}</strong>
          </b-col>
        </b-form-row>
        <!-- don't load until everything else has come in -->
        <!-- Loop through the type of account and each of the forms. -->
        <div v-if="loaded && securityForms.forms && securityForms.forms.length > 0">
          <div v-for="form in securityForms.forms" :key="form.id">
            <div v-if="securityForms.GovCompleteDate === '' && securityForms.GovSentDate === '' && securityForms.GovRejectDate === ''">
              <b-form-row v-if="form.status !== 'Approved' && form.status !== 'Rejected'">
                <b-col cols="10"></b-col>
                <b-col cols="2" v-if="isSecurity && form.rejectReason === ''" v-bind:id="form.id">
                  <b-button variant="danger" class="formbutton" @click="rejectForm(form)">Reject</b-button>
                  <b-button variant="success" class="formbutton" @click="approveForm(form)">Approve</b-button>
                </b-col>
              </b-form-row>
              <b-form-row v-if="showDenial" class="pl-2 pr-2">
                <p class="font-weight-bold">FSO Denial Reason:</p>
                <b-textarea id="fsoDenial" v-model="fsoDenialInput" :state="fsoDenialInput.length >= 20" placeholder="Please enter at least 20 characters..." rows="2" max-rows="4"></b-textarea>
                <p class="text-danger" v-show="showDenialError">Please fill out a valid reason for rejection.</p>
                <b-button variant="outline-primary" class="mt-2" @click="submitRejection(form)">Submit</b-button>
              </b-form-row>
              <b-form-row class="pl-2 pr-2" v-if="form.rejectReason && form.rejectReason !== ''">
                <p><span class="font-weight-bold">FSO Rejection Reason: </span>{{ form.rejectReason }}</p>
              </b-form-row>
            </div>
            <b-form-row class="p-1" v-if="form.href">
              <b-embed type="iframe" :src="form.href" allowfullscreen></b-embed>
            </b-form-row>
          </div>
        </div>
        <div v-else-if="!securityForms.forms">
          <h4 class="pt-3 text-center">No Forms Uploaded</h4>
        </div>
        <!-- Add a Notify Government button -->
        <b-button v-if="isSecurity && showNotify" variant="primary" class="formbutton p-1 float-right" @click="NotifyGov">Notify Government</b-button>
      </div>
    </b-form>
  </b-container>
</template>
<script>
let vm = null
// eslint-disable-next-line no-undef
let url = _spPageContextInfo.webAbsoluteUrl
import moment from 'moment'
import Security from '@/models/Security'
import Todo from '@/models/Todo'
import User from '@/models/User'

export default {
  name: 'Review Security',
  props: {
    // Switches the form type between NIPR, SIPR, DREN, JWICS, CAC and SCI
    form: {
      type: String
    },
    id: {
      type: Number
    }
  },
  computed: {
    userid() {
      return User.getters('CurrentUserId')
    },
    isSecurity() {
      return User.getters('isSecurity')
    },
    afrlgroup() {
      return Security.getters('AFRLGroup')
    },
    accountgroup() {
      return Security.getters('AccountGroup')
    },
    cacgroup() {
      return Security.getters('CACGroup')
    },
    scigroup() {
      return Security.getters('SCIGroup')
    }
  },
  data: function() {
    return {
      downloadUrl: url + '/_layouts/download.aspx?SourceUrl=' + url + '/SiteCollectionDocuments',
      AccountsNIPRForms: url + '/AccountsNIPR/',
      AccountsDRENForms: url + '/AccountsDREN/',
      AccountsSIPRForms: url + '/AccountsSIPR/',
      AccountsJWICSForms: url + '/AccountsJWICS/',
      CACForms: url + '/CACForms/',
      SCIForms: url + '/SCIForms/',
      AFRLGroup: [],
      authorId: '',
      libraryUrl: '',
      library: '',
      loaded: false,
      securityForms: {},
      Active: '',
      formTitle: '',
      formName: '',
      formUrl: '',
      formId: null,
      company: '',
      name: '',
      personId: null,
      persons: [],
      sciType: null,
      creator: null,
      taskId: null,
      isSCITransfer: false,
      submittedDate: '',
      showNotify: false,
      totalForms: '',
      rejectedForm: false,
      fsoDenialInput: '',
      showDenial: false,
      showDenialError: false,
      etag: '',
      uri: ''
    }
  },
  mounted: async function() {
    vm = this
    this.$nextTick(async () => {
      await Security.dispatch('getDigest')
      if (this.afrlgroup.length === 0 || this.accountgroup === 0 || this.cacgroup === 0 || this.scigroup === 0) await Security.dispatch('getSecurityGroups')
      await this.checkType()
      if (this.$route.query.transfer) {
        this.isSCITransfer = true
      }
      await this.getForms()
    })
  },
  methods: {
    getForms: async function() {
      // Run query to load the form
      let payload = {
        Id: this.id
      }
      if (this.isSCITransfer) {
        Security.dispatch('getSecuritySCITransfer', payload)
          .then(function(results) {
            vm.persons = results.Persons
            vm.sciType = 'Transfer'
            vm.etag = results.etag
            vm.uri = results.uri
            vm.securityForms = results.Form
            results.Persons.forEach(person => {
              vm.name += person.FirstName + ' ' + person.LastName + '-'
            })
            // task will be held in the
            vm.taskId = results.TaskId
            // Format the Created column using moment
            vm.submittedDate = moment(results.Created).format('MM-DD-YYYY')
            if (vm.securityForms.forms) {
              vm.totalForms = vm.securityForms.forms.length
            }
            // need to check the response for the direct url to the document
            vm.loaded = true
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
      } else {
        Security.dispatch('getSecurityFormById', payload)
          .then(function(results) {
            vm.Active = results.Active
            vm.company = results.Company
            vm.name = results.FirstName + ' ' + results.LastName
            vm.personId = results.PersonnelID
            vm.sciType = results.SCIType ? results.SCIType : null
            vm.etag = results.etag
            vm.uri = results.uri
            switch (vm.form) {
              case 'NIPR':
                vm.securityForms = results.NIPR
                break
              case 'SIPR':
                vm.securityForms = results.SIPR
                break
              case 'DREN':
                vm.securityForms = results.DREN
                break
              case 'JWICS':
                vm.securityForms = results.JWICS
                break
              case 'CAC':
                vm.securityForms = results.CAC
                break
              case 'SCI':
                vm.securityForms = results.SCI
                break
            }
            // task will be held in the
            vm.taskId = vm.securityForms.task
            // Format the Created column using moment
            vm.submittedDate = moment(results.Created).format('MM-DD-YYYY')
            if (vm.securityForms.forms) {
              vm.totalForms = vm.securityForms.forms.length
            }
            // need to check the response for the direct url to the document
            vm.loaded = true
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
      }
      await Security.dispatch('getFormDigest')
    },
    checkType: async function() {
      switch (this.form) {
        case 'NIPR':
          // set the url for the post of file
          this.library = 'AccountsNIPR'
          this.libraryUrl = this.AccountsNIPRForms
          this.formTitle = 'Approve/Reject NIPR Forms'
          break
        case 'SIPR':
          this.library = 'AccountsSIPR'
          this.libraryUrl = this.AccountsSIPRForms
          this.formTitle = 'Approve/Reject SIPR Forms'
          break
        case 'DREN':
          this.library = 'AccountsDREN'
          this.libraryUrl = this.AccountsDRENForms
          this.formTitle = 'Approve/Reject DREN Forms'
          break
        case 'JWICS':
          this.library = 'AccountsJWICS'
          this.libraryUrl = this.AccountsJWICSForms
          this.formTitle = 'Approve/Reject JWICS Forms'
          break
        case 'CAC':
          this.library = 'CACForms'
          this.libraryUrl = this.CACForms
          this.formTitle = 'Approve/Reject CAC Forms'
          break
        case 'SCI':
          this.library = 'SCIForms'
          this.libraryUrl = this.SCIForms
          this.formTitle = 'Approve/Reject SCI Forms'
          break
      }
    },
    approveForm: async function(info) {
      // Post Approval data
      if (this.isSCITransfer) {
        this.fsoDenialInput = ''
        this.showDenialError = false
        this.showDenial = false
        this.securityForms.forms.forEach(form => {
          if (form.id === info.id) {
            form.status = 'Approved'
            vm.authorId = info.submitterId
          }
        })
        let payload = {
          etag: this.etag,
          uri: this.uri,
          Form: JSON.stringify(this.securityForms)
        }
        try {
          await Security.dispatch('updateSecuritySCITransfer', payload).then(results => {
            //console.log('Update Security Results: ' + JSON.stringify(results))
            //vm.uri = results.header.uri
            vm.etag = results.headers.etag
            //document.getElementById("'" + info.id + "'").classList.toggle('hidden')
            const notification = {
              type: 'success',
              title: 'Approved Form',
              message: 'Approved ' + vm.form + ' form for ' + info.name,
              push: true
            }
            vm.$store.dispatch('notification/add', notification, { root: true })
            vm.totalForms--
            if (vm.totalForms === 0 && !vm.rejectedForm) {
              // belay the sucker
              setTimeout(() => {
                vm.showNotify = true
              }, 1000)
            }
          })
          this.asyncForEach(vm.persons, async person => {
            let security = await Security.dispatch('getSecurityFormById', { Id: person.SecurityID })
            let securityPayload = security
            security.SCI = JSON.stringify(vm.securityForms)
            security.CAC ? (securityPayload.CAC = JSON.stringify(security.CAC)) : null
            security.SIPR ? (securityPayload.SIPR = JSON.stringify(security.SIPR)) : null
            security.NIPR ? (securityPayload.NIPR = JSON.stringify(security.NIPR)) : null
            security.DREN ? (securityPayload.DREN = JSON.stringify(security.DREN)) : null
            security.JWICS ? (securityPayload.JWICS = JSON.stringify(security.JWICS)) : null
            await Security.dispatch('updateSecurityForm', security)
          })
        } catch (e) {
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
        }
      } else {
        this.fsoDenialInput = ''
        this.showDenialError = false
        this.showDenial = false
        this.securityForms.forms.forEach(form => {
          if (form.id === info.id) {
            form.status = 'Approved'
            vm.authorId = info.submitterId
          }
        })
        let payload = {
          Active: true,
          etag: this.etag,
          uri: this.uri
        }
        switch (vm.form) {
          case 'NIPR':
            payload.NIPR = JSON.stringify(vm.securityForms)
            break
          case 'SIPR':
            payload.SIPR = JSON.stringify(vm.securityForms)
            break
          case 'DREN':
            payload.DREN = JSON.stringify(vm.securityForms)
            break
          case 'JWICS':
            payload.JWICS = JSON.stringify(vm.securityForms)
            break
          case 'CAC':
            payload.CAC = JSON.stringify(vm.securityForms)
            break
          case 'SCI':
            payload.SCI = JSON.stringify(vm.securityForms)
            break
        }
        try {
          await Security.dispatch('updateSecurityForm', payload).then(results => {
            //console.log('Update Security Results: ' + JSON.stringify(results))
            //vm.uri = results.header.uri
            vm.etag = results.headers.etag
            //document.getElementById(info.id).classList.toggle('hidden')
            const notification = {
              type: 'success',
              title: 'Approved Form',
              message: 'Approved ' + vm.form + ' form for ' + info.name,
              push: true
            }
            vm.$store.dispatch('notification/add', notification, { root: true })
            vm.totalForms--
            if (vm.totalForms === 0 && !vm.rejectedForm) {
              // belay the sucker
              setTimeout(() => {
                vm.showNotify = true
              }, 1000)
            }
          })
        } catch (e) {
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
        }
      }
    },
    rejectForm: async function() {
      this.showDenial = true
      this.securityForms.forms.forEach(form => {
        vm.authorId = form.submitterId
      })
    },
    submitRejection: async function(info) {
      if (!(this.fsoDenialInput.length > 20)) {
        this.showDenialError = true
      } else {
        let type = ''
        // Delete form from doc library
        let payload = {
          id: info.id,
          library: info.library,
          name: info.name,
          uri: info.uri,
          etag: info.etag
        }
        Security.dispatch('DeleteForm', payload).then(async function() {
          // Need to update the SecurityForms Types with the deleted ID
          vm.totalForms--
          vm.rejectedForm = true
          if (vm.totalForms === 0) {
            vm.showNotify = false
          }
          let payload = {
            Active: true,
            etag: vm.etag,
            uri: vm.uri
          }
          //let index = 0
          /*vm.securityForms.forms.forEach(form => {
            if (info.id === form.id) {
              form.name = ''
              form.href = ''
              form.etag = ''
              form.uri = ''
              form.rejectReason = vm.fsoDenialInput
              vm.authorId = form.submitterId
            }
          })*/
          vm.securityForms.rejectReason = vm.fsoDenialInput
          vm.securityForms.forms = []
          //vm.securityForms.forms.splice(index, 1)
          if (vm.isSCITransfer) {
            payload.Form = JSON.stringify(vm.securityForms)
            await Security.dispatch('updateSecuritySCITransfer', payload).then(results => {
              vm.etag = results.headers.etag
            })
            vm.asyncForEach(vm.persons, async person => {
              let security = await Security.dispatch('getSecurityFormById', { Id: person.SecurityID })
              let securityPayload = security
              security.SCI = JSON.stringify(vm.securityForms)
              security.CAC ? (securityPayload.CAC = JSON.stringify(security.CAC)) : null
              security.SIPR ? (securityPayload.SIPR = JSON.stringify(security.SIPR)) : null
              security.NIPR ? (securityPayload.NIPR = JSON.stringify(security.NIPR)) : null
              security.DREN ? (securityPayload.DREN = JSON.stringify(security.DREN)) : null
              security.JWICS ? (securityPayload.JWICS = JSON.stringify(security.JWICS)) : null
              await Security.dispatch('updateSecurityForm', securityPayload)
            })
          } else {
            switch (vm.form) {
              case 'NIPR':
                payload.NIPR = JSON.stringify(vm.securityForms)
                type = 'account'
                break
              case 'SIPR':
                payload.SIPR = JSON.stringify(vm.securityForms)
                type = 'account'
                break
              case 'DREN':
                payload.DREN = JSON.stringify(vm.securityForms)
                type = 'account'
                break
              case 'JWICS':
                payload.JWICS = JSON.stringify(vm.securityForms)
                type = 'account'
                break
              case 'CAC':
                payload.CAC = JSON.stringify(vm.securityForms)
                type = 'cac'
                break
              case 'SCI':
                payload.SCI = JSON.stringify(vm.securityForms)
                type = 'sci'
                break
            }
            await Security.dispatch('updateSecurityForm', payload).then(results => {
              vm.etag = results.headers.etag
            })
          }
          await Todo.dispatch('getDispatch')
          // Complete related task
          Todo.dispatch('getTodoById', vm.taskId).then(function(task) {
            payload = {
              etag: task.__metadata.etag,
              uri: task.__metadata.uri,
              id: task.Id
            }
            Todo.dispatch('completeTodo', payload)
          })
          // Add task for whoever created the original form
          payload = {
            Title: 'Correct ' + vm.name + ' by uploading a form',
            AssignedToId: vm.authorId, // TO DO: send to original Submitter
            Description: 'CACI FSO has Rejected your Request. Reason: ' + vm.fsoDenialInput,
            IsMilestone: false,
            PercentComplete: 0,
            TaskType: 'fso-reject',
            TaskLink: '/security/add/' + type
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
          // then get the user info and send an email
          let userProfile = await User.dispatch('getUserById', { id: vm.authorId })
          let emailPayload = {
            emails: [userProfile.data.d.Email],
            body: '<h3>CACI FSO has Rejected your Request</h3><p>Name: ' + vm.name + '</p><p>Form: ' + vm.form + ' Request</p><p>Reason: ' + vm.fsoDenialInput + '</p>',
            subject: '(F3I-2 Portal) FSO Rejected ' + vm.form + ' Request'
          }
          await Security.dispatch('sendEmail', emailPayload)
          vm.fsoDenialInput = ''
          vm.showDenialError = false
          vm.showDenial = false
        })
        const notification = {
          type: 'success',
          title: 'Rejected Form',
          message: 'Rejected ' + vm.form + ' form for ' + vm.name,
          push: true
        }
        this.$store.dispatch('notification/add', notification, { root: true })
      }
    },
    NotifyGov: async function() {
      let payload = {}
      let task = await Todo.dispatch('getTodoById', vm.taskId)
      payload = {
        etag: task.__metadata.etag,
        uri: task.__metadata.uri,
        id: task.Id
      }
      await Todo.dispatch('completeTodo', payload)
      // add new task for AFRL users
      let afrlTask = []
      let afrlEmail = []
      vm.afrlgroup.forEach(user => {
        afrlTask.push(user.Id)
        afrlEmail.push(user.Email)
      })
      if (this.isSCITransfer) {
        payload = {
          Title: 'Complete or Reject ' + vm.name + ' ' + vm.form + ' Request',
          AssignedToId: afrlTask,
          //AssignedToId: 25, //TESTING TASK
          Description: 'Complete or reject ' + vm.name + ' ' + vm.form + ' Request',
          IsMilestone: false,
          PercentComplete: 0,
          TaskType: vm.form + ' Request',
          TaskLink: '/security/edit/' + vm.id + '?sciTransfer=true'
        }
        let results = await Todo.dispatch('addTodo', payload)
        let newTaskId = results.data.d.Id
        let emailPayload = {
          emails: afrlEmail,
          //emails: ['alexie.hazen@caci.com'], //TESTING EMAIL
          body:
            '<h3>Please complete or reject the following.</h3><p>Name: ' +
            vm.name +
            '</p><p>Form: ' +
            vm.form +
            ' Request</p><br/><a href="' +
            url +
            '/Pages/Home.aspx#/security/edit/' +
            vm.id +
            '?sciTransfer=true">Review ' +
            vm.name +
            '</a><p><b>Please copy and paste the hyperlink into a modern browser such as Google Chrome if it is not your default.</b></p>',
          subject: '(F3I-2 Portal) ' + vm.form + ' Request'
        }
        await Security.dispatch('sendEmail', emailPayload)
        // update the securityForms object with the GovSentDate
        this.securityForms.GovSentDate = vm.$moment().format('MM/DD/YYYY')
        this.securityForms.task = newTaskId
        payload = {
          Active: true,
          uri: this.uri,
          etag: this.etag
        }
        payload.Form = JSON.stringify(vm.securityForms)
        payload.TaskId = newTaskId
        await Security.dispatch('updateSecuritySCITransfer', payload)
        vm.asyncForEach(vm.persons, async person => {
          let security = await Security.dispatch('getSecurityFormById', { Id: person.SecurityID })
          let securityPayload = security
          security.SCI = JSON.stringify(vm.securityForms)
          security.CAC ? (securityPayload.CAC = JSON.stringify(security.CAC)) : null
          security.SIPR ? (securityPayload.SIPR = JSON.stringify(security.SIPR)) : null
          security.NIPR ? (securityPayload.NIPR = JSON.stringify(security.NIPR)) : null
          security.DREN ? (securityPayload.DREN = JSON.stringify(security.DREN)) : null
          security.JWICS ? (securityPayload.JWICS = JSON.stringify(security.JWICS)) : null
          await Security.dispatch('updateSecurityForm', securityPayload)
        })
        vm.showNotify = false
      } else {
        payload = {
          Title: 'Complete or Reject ' + vm.name + ' ' + vm.form + ' Request',
          AssignedToId: afrlTask,
          //AssignedToId: 25, // TESTING TASK
          Description: 'Complete or reject ' + vm.name + ' ' + vm.form + ' Request',
          IsMilestone: false,
          PercentComplete: 0,
          TaskType: vm.form + ' Request',
          TaskLink: '/security/edit/' + vm.id
        }
        let results = await Todo.dispatch('addTodo', payload)
        let newTaskId = results.data.d.Id
        let emailPayload = {
          emails: afrlEmail,
          //emails: ['alexie.hazen@caci.com'], // TESTING TASK
          body: '<h3>Please complete or reject the following.</h3><p>Name: ' + vm.name + '</p><p>Form: ' + vm.form + ' Request</p><br/><a href="' + url + '/Pages/Home.aspx#/security/edit/' + vm.id + '">Review ' + vm.name + '</a><p><b>Please copy and paste the hyperlink into a modern browser such as Google Chrome if it is not your default.</b></p>',
          subject: '(F3I-2 Portal) ' + vm.form + ' Request'
        }
        await Security.dispatch('sendEmail', emailPayload)
        payload = {
          Active: true,
          uri: this.uri,
          etag: this.etag
        }
        // update the securityForms object with the GovSentDate
        this.securityForms.GovSentDate = vm.$moment().format('MM/DD/YYYY')
        this.securityForms.task = newTaskId
        switch (this.form) {
          case 'NIPR':
            payload.NIPR = JSON.stringify(this.securityForms)
            break
          case 'SIPR':
            payload.SIPR = JSON.stringify(this.securityForms)
            break
          case 'DREN':
            payload.DREN = JSON.stringify(this.securityForms)
            break
          case 'JWICS':
            payload.JWICS = JSON.stringify(this.securityForms)
            break
          case 'CAC':
            payload.CAC = JSON.stringify(this.securityForms)
            break
          case 'SCI':
            payload.SCI = JSON.stringify(this.securityForms)
            break
        }
        await Security.dispatch('updateSecurityForm', payload)
        const notification = {
          type: 'success',
          title: 'Approved Form',
          message: 'Approved form ' + vm.form + ' for ' + vm.formName,
          push: true
        }
        vm.$store.dispatch('notification/add', notification, { root: true })
        vm.$router.push({ path: '/security/tracker' })
      }
    },
    async asyncForEach(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
      }
    }
  }
}
</script>
<style lang="scss">
#MainContainer {
  overflow: auto;
}
#form {
  overflow-x: hidden;
}
</style>
