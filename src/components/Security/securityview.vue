<template>
  <!-- Add Form where users can download master docs and upload the changed docs. -->
  <b-container fluid class="contentHeight p-0" id="MainContainer">
    <!-- Use the upload travel docs as a template for uploading documents -->
    <!-- If user is SUBC, only load the related personnel to their company. 
         Otherwise, load companies into dropdown and on user selection load all personnel related to that company into a dropdown. -->
    <!-- on submission, split the personnel first name, last name out of the dropdown. -->
    <div id="form" class="col-12 p-4">
      <b-card no-body class="p-3">
        <b-form-row>
          <b-col>
            <b-form-group label="Company: " label-for="company">
              <b-form-input id="company" v-model="company" value="{{ company }}"/>
            </b-form-group>
          </b-col>
          <b-col>
            <b-form-group label="Name: " label-for="name">
              <b-form-input id="name" v-model="name" value="{{ name }}"/>
            </b-form-group>
          </b-col>
        <b-form-row v-if="scitype">
          <b-col>
            <b-form-group label="SCI Type: " label-for="scitype">
              <b-form-input id="scitype" v-model="scitype" value="{{ scitype }}"/>
            </b-form-group>
          </b-col>
        </b-form-row>
        <b-form-row>
          <b-embed type="iframe" :src="submittedform" allowfullscreen></b-embed>
        </b-form-row>
      </b-card>
    </div>
  </b-container>
</template>
<script>
let vm = null
// eslint-disable-next-line no-undef
let url = _spPageContextInfo.webAbsoluteUrl
import Security from '@/models/Security'

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
      return this.downloadUrl + '/' + this.formUrl
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
      library: '',
      formTitle: '',
      company: '',
      name: '',
      sciType: null,
      formName: '',
      formUrl: '',
      creator: null,
      etag: '',
      uri: ''
    }
  },
  mounted: async function() {
    vm = this
    this.checkType().then(function() {
      vm.getForm()
    })
  },
  methods: {
    getForm: async function() {
      // Run query to load the form
      let payload = {
        library: this.library,
        id: this.id
      }
      await Security.dispatch('getFormByTypeId', payload).then(function(results) {
        vm.company = results[0].Company
        vm.name = results[0].PersonName,
        vm.sciType = results[0].SCIType ? results[0].SCIType : null
        vm.creator = results[0].AuthorId
        vm.etag = results[0].__metadata.etag
        vm.uri = results[0].__metadata.uri,
        vm.formName = results[0].Name
        // need to check the response for the direct url to the document
      })
    },
    checkType: function() {
      switch (this.form) {
        case 'NIPR':
          // set the url for the post of file
          this.library = 'AccountsNIPR'
          this.formTitle = 'Approve/Reject Account Form'
          break
        case 'SIPR':
          this.library = 'AccountsSIPR'
          this.formTitle = 'Approve/Reject Account Form'
          break
        case 'DREN':
          this.library = 'AccountsDREN'
          this.formTitle = 'Approve/Reject Account Form'
          break
        case 'JWICS':
          this.library = 'AccountsJWICS'
          this.formTitle = 'Approve/Reject Account Form'
          break
        case 'CAC':
          this.library = 'CACForms'
          this.formTitle = 'Approve/Reject CAC Form'
          break
        case 'SCI':
          this.library = 'SCIForms'
          this.formTitle = 'Approve/Reject SCI Form'
          break
      }
    },
    approveForm: function() {
      // Post Approval data
      // Complete related task
    },
    rejectForm: function() {
      // Add task for whoever created the original form
      // Complete related task
      // Delete form from doc library      
    }
  }
}
</script>
<style lang="sass"></style>
