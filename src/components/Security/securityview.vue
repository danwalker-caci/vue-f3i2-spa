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
        <b-form-row v-if="loaded">
          <b-embed type="iframe" :src="submittedurl" allowfullscreen></b-embed>
        </b-form-row>
        <b-row-form>
          <b-form-row>
            <b-col cols="10"></b-col>
            <b-col cols="2">
              <b-button variant="danger" class="formbutton" @click="rejectForm">Reject</b-button>
              <b-button variant="success" class="formbutton" @click="approveForm">Approve</b-button>
            </b-col>
          </b-form-row>
        </b-row-form>
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

export default {
  name: 'SecurityView',
  props: {
    // Switches the form type between Account, CAC and SCI
    form: {
      type: String
    },
    id: {
      type: Number
    }
  },
  computed: {
    submittedurl() {
      return this.libraryUrl + this.formName
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
      authorId: '',
      docLibraryType: '',
      libraryUrl: '',
      library: '',
      loaded: false,
      formType: '',
      formTitle: '',
      company: '',
      name: '',
      sciType: null,
      formName: '',
      formUrl: '',
      creator: null,
      taskId: null,
      formId: null,
      submittedDate: '',
      etag: '',
      uri: ''
    }
  },
  mounted: async function() {
    vm = this
    await this.checkType()
    await this.getForm()
  },
  methods: {
    getForm: async function() {
      // Run query to load the form
      let payload = {
        library: this.library,
        id: this.id
      }
      Security.dispatch('getFormByTypeId', payload).then(function(results) {
        vm.company = results.Company
        vm.name = results.PersonName
        vm.sciType = results.SCIType ? results[0].SCIType : null
        vm.creator = results.AuthorId
        vm.etag = results.__metadata.etag
        vm.uri = results.__metadata.uri
        vm.formName = results.Title.indexOf('.pdf') > -1 ? results.Title : results.Title + '.pdf'
        vm.taskId = results.TaskID
        vm.formId = results.Id
        vm.authorId = results.AuthorId
        vm.docLibraryType = results.__metadata.type
        // Format the Created column using moment
        vm.submittedDate = moment(results.Created).format('MM-DD-YYYY')
        // need to check the response for the direct url to the document
        vm.loaded = true
      })
      await Security.dispatch('getFormDigest')
    },
    checkType: async function() {
      switch (this.form) {
        case 'NIPR':
          // set the url for the post of file
          this.library = 'AccountsNIPR'
          this.libraryUrl = this.AccountsNIPRForms
          this.formTitle = 'Approve/Reject Account Form'
          this.formType = 'account'
          break
        case 'SIPR':
          this.library = 'AccountsSIPR'
          this.libraryUrl = this.AccountsSIPRForms
          this.formTitle = 'Approve/Reject Account Form'
          this.formType = 'account'
          break
        case 'DREN':
          this.library = 'AccountsDREN'
          this.libraryUrl = this.AccountsDRENForms
          this.formTitle = 'Approve/Reject Account Form'
          this.formType = 'account'
          break
        case 'JWICS':
          this.library = 'AccountsJWICS'
          this.libraryUrl = this.AccountsJWICSForms
          this.formTitle = 'Approve/Reject Account Form'
          this.formType = 'account'
          break
        case 'CAC':
          this.library = 'CACForms'
          this.libraryUrl = this.CACForms
          this.formTitle = 'Approve/Reject CAC Form'
          this.formType = 'cac'
          break
        case 'SCI':
          this.library = 'SCIForms'
          this.libraryUrl = this.SCIForms
          this.formTitle = 'Approve/Reject SCI Form'
          this.formType = 'sci'
          break
      }
    },
    approveForm: async function() {
      // Post Approval data
      let digest = await Security.dispatch('getDigest')
      //let digest = response.data.d.GetContextWebInformation.FormDigestValue
      let payload = {
        digest: digest,
        etag: this.etag,
        uri: this.uri,
        type: this.docLibraryType
      }
      await Security.dispatch('ApproveForm', payload)
      // Complete related task
      Todo.dispatch('getTodoById', vm.taskId).then(function(task) {
        payload = {
          digest: digest,
          etag: task.__metadata.etag,
          uri: task.__metadata.uri,
          id: task.Id
        }
        Todo.dispatch('completeTodo', payload).then(function() {
          const notification = {
            type: 'success',
            title: 'Approved Form',
            message: 'Approved form ' + vm.form + ' for ' + vm.formName,
            push: true
          }
          vm.$store.dispatch('notification/add', notification, { root: true })
        })
      })
    },
    rejectForm: async function() {
      // Delete form from doc library
      let digest = await Security.dispatch('getDigest')
      //console.log('TODO DIGEST: ' + todoDigest)
      console.log('SECURITY DIGEST: ' + digest)
      let payload = {
        id: this.formId,
        library: this.library,
        name: this.formName,
        uri: this.uri,
        etag: this.etag,
        digest: digest
      }
      Security.dispatch('DeleteForm', payload).then(async function() {
        // Add task for whoever created the original form
        let todoDigest = await Todo.dispatch('getDigest')
        payload = {
          Title: 'Correct ' + vm.formName,
          AssignedToId: this.authorId, // Hardcoding the Security Group
          Description: 'Correct ' + vm.formName + ' by uploading a form.',
          IsMilestone: false,
          PercentComplete: 0,
          TaskType: vm.form.Type + ' Request',
          TaskLink: '/security/' + this.form,
          digest: todoDigest
        }
        await Todo.dispatch('addTodo', payload)
        // Complete related task
        Todo.dispatch('getTodoById', vm.taskId).then(function(task) {
          payload = {
            digest: todoDigest,
            etag: task.__metadata.etag,
            uri: task.__metadata.uri,
            id: task.Id
          }
          Todo.dispatch('completeTodo', payload)
        })
        const notification = {
          type: 'success',
          title: 'Rejected Form',
          message: 'Rejected ' + vm.formType + ' form for ' + vm.formName,
          push: true
        }
        vm.$store.dispatch('notification/add', notification, { root: true })
      })
    }
  }
}
</script>
<style lang="sass"></style>
