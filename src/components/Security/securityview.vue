<template>
  <!-- Add Form where users can download master docs and upload the changed docs. -->
  <b-container fluid class="contentHeight p-0" id="MainContainer">
    <div id="form" class="col-12 p-4">
      <b-row class="bg-warning text-black formheader">
        <b-col cols="4" class="p-0 text-left"></b-col>
        <b-col cols="4" class="p-0 text-center font-weight-bold">
          <h3>{{ formTitle }}</h3>
        </b-col>
        <b-col cols="4" class="p-0 text-right"></b-col>
      </b-row>
      <b-card no-body class="p-3">
        <b-form-row>
          <b-col>
            <b-form-group label="Company: " label-for="company">
              <b-form-input id="company" v-model="company" value="{{ company }}" disabled />
            </b-form-group>
          </b-col>
          <b-col>
            <b-form-group label="Name: " label-for="name">
              <b-form-input id="name" v-model="name" value="{{ name }}" disabled />
            </b-form-group>
          </b-col>
        </b-form-row>
        <b-form-row>
          <b-col>
            <b-form-group label="Date Submitted: " label-for="date">
              <b-form-input id="submittedDate" v-model="submittedDate" value="{{ submittedDate }}" disabled />
            </b-form-group>
          </b-col>
        </b-form-row>
        <b-form-row v-if="sciType">
          <b-col>
            <b-form-group label="SCI Type: " label-for="scitype">
              <b-form-input id="scitype" v-model="sciType" value="{{ sciType }}" disabled />
            </b-form-group>
          </b-col>
        </b-form-row>
        <!-- don't load until everything else has come in -->
        <!-- Loop through the type of account and each of the forms. -->
        <div v-if="loaded">
          <div v-for="form in forms.forms" :key="form.id">
            <b-form-row>
              <b-embed type="iframe" :src="form.href" allowfullscreen></b-embed>
            </b-form-row>
            <b-row-form>
              <b-form-row>
                <b-col cols="10"></b-col>
                <b-col cols="2">
                  <b-button variant="danger" class="formbutton" @click="rejectForm(form.id)">Reject</b-button>
                  <b-button variant="success" class="formbutton" @click="approveForm(form.id)">Approve</b-button>
                </b-col>
              </b-form-row>
            </b-row-form>
          </div>
        </div>

        <!-- Add a Notify Government button -->
      </b-card>
    </div>
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
  name: 'SecurityView',
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
      AFRLUserID: null,
      AccountsUserID: null,
      CACSCIUserID: null,
      securityFormTracker: {},
      authorId: '',
      libraryUrl: '',
      library: '',
      loaded: false,
      forms: {},
      formTitle: '',
      formName: '',
      formUrl: '',
      formId: null,
      company: '',
      name: '',
      personId: null,
      sciType: null,
      creator: null,
      taskId: null,
      submittedDate: '',
      etag: '',
      uri: ''
    }
  },
  mounted: async function() {
    vm = this
    await Security.dispatch('getDigest')
    await this.getUserIDs()
    await this.checkType()
    await this.getForms()
  },
  methods: {
    getUserIDs: async function() {
      this.$store.dispatch('support/getAccountUser')
      this.$store.dispatch('support/getAFRLUser')
      this.$store.dispatch('support/getCACSCIUser')
    },
    getForms: async function() {
      // Run query to load the form
      let payload = {
        Id: this.id
      }
      Security.dispatch('getSecurityFormById', payload)
        .then(function(results) {
          vm.company = results.Company
          vm.name = results.PersonName
          vm.personId = results.PersonnelID
          vm.sciType = results.SCIType ? results.SCIType : null
          vm.etag = results.etag
          vm.uri = results.uri
          switch (vm.form) {
            case 'NIPR':
              vm.forms = results.NIPR
              break
            case 'SIPR':
              vm.forms = results.SIPR
              break
            case 'DREN':
              vm.forms = results.DREN
              break
            case 'JWICS':
              vm.forms = results.JWICS
              break
            case 'CAC':
              vm.forms = results.CAC
              break
            case 'SCI':
              vm.forms = results.SCI
              break
          }
          // task will be held in the
          vm.taskId = vm.forms.task
          // Format the Created column using moment
          vm.submittedDate = moment(results.Created).format('MM-DD-YYYY')
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
    approveForm: async function() {
      // Post Approval data
      let payload = {
        etag: this.etag,
        uri: this.uri
      }
      try {
        await Security.dispatch('ApproveForm', payload)
        // Complete related task
        Todo.dispatch('getTodoById', vm.taskId).then(async function(task) {
          payload = {
            etag: task.__metadata.etag,
            uri: task.__metadata.uri,
            id: task.Id
          }
          Todo.dispatch('completeTodo', payload).then(async function() {
            // add new task for AFRL user
            // console.log(vm.$store.state.support.AFRLUserID)
            payload = {
              Title: 'Complete or Reject ' + vm.name + ' ' + vm.form + ' Request',
              AssignedToId: vm.$store.state.support.AFRLUserID, // need to get Juan
              Description: 'Complete or reject ' + vm.name + ' ' + vm.form + ' Request',
              IsMilestone: false,
              PercentComplete: 0,
              TaskType: vm.form + ' Request',
              TaskLink: '/security/tracker/accounts'
            }
            let results = await Todo.dispatch('addTodo', payload)
            let newTaskId = results.data.d.Id
            vm.securityFormTracker.Types.forEach(type => {
              if (vm.formId === type.id) {
                // Set the task id
                type.GovSentDate = vm.$moment().format('MM/DD/YYYY')
                type.task = newTaskId
              }
            })
            vm.securityFormTracker.Types = JSON.stringify(vm.securityFormTracker.Types)
            await Security.dispatch('updateSecurityForm', vm.securityFormTracker)
            const notification = {
              type: 'success',
              title: 'Approved Form',
              message: 'Approved form ' + vm.form + ' for ' + vm.formName,
              push: true
            }
            vm.$store.dispatch('notification/add', notification, { root: true })
            vm.$router.push({ path: '/security/tracker/accounts' })
          })
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
    },
    rejectForm: async function() {
      // Delete form from doc library
      let payload = {
        id: this.formId,
        library: this.library,
        name: this.formName,
        uri: this.uri,
        etag: this.etag
      }
      Security.dispatch('DeleteForm', payload).then(async function() {
        // Need to update the SecurityForms Types with the deleted ID
        let index = 0
        vm.securityFormTracker.Accounts.forEach((type, i) => {
          if (vm.formId === type.id) {
            index = i
            // Pop it off the freaking Types
          }
        })
        vm.securityFormTracker.Types.splice(index, 1)
        vm.securityFormTracker.Types = JSON.stringify(vm.securityFormTracker.Types)
        try {
          await Security.dispatch('updateSecurityForm', vm.securityFormTracker)
          await Todo.dispatch('getDispatch')
          // Add task for whoever created the original form
          payload = {
            Title: 'Correct ' + vm.formName,
            AssignedToId: vm.authorId, // Hardcoding the Security Group
            Description: 'Correct ' + vm.formName + ' by uploading a form.',
            IsMilestone: false,
            PercentComplete: 0,
            TaskType: vm.form.Type + ' Request',
            TaskLink: '/security/' + vm.form
          }
          // Complete related task
          Todo.dispatch('getTodoById', vm.taskId).then(function(task) {
            payload = {
              etag: task.__metadata.etag,
              uri: task.__metadata.uri,
              id: task.Id
            }
            Todo.dispatch('completeTodo', payload)
          })
          const notification = {
            type: 'success',
            title: 'Rejected Form',
            message: 'Rejected ' + vm.form + ' form for ' + vm.formName,
            push: true
          }
          vm.$store.dispatch('notification/add', notification, { root: true })
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
      })
    }
  }
}
</script>
<style lang="scss">
#MainContainer {
  overflow: auto;
}
</style>
