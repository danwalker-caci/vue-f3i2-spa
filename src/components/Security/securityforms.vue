/*eslint-disable no-undef: "error"*/

<template>
  <!-- Add Form where users can download master docs and upload the changed docs. -->
  <b-container fluid class="contentHeight p-0" id="MainContainer">
    <!-- Use the upload travel docs as a template for uploading documents -->
    <!-- If user is SUBC, only load the related personnel to their company. 
         Otherwise, load companies into dropdown and on user selection load all personnel related to that company into a dropdown. -->
    <!-- on submission, split the personnel first name, last name out of the dropdown. -->
    <div id="form" class="col-12 p-4">
      <b-row class="bg-warning text-black formheader">
        <b-col cols="4" class="p-0 text-left"></b-col>
        <b-col cols="4" class="p-0 text-center font-weight-bold">
          <h3>{{ formTitle }}</h3>
        </b-col>
        <b-col cols="4" class="p-0 text-right"></b-col>
      </b-row>
      <b-card no-body class="p-3">
        <b-alert v-show="formError" variant="danger">Please correct the Form</b-alert>
        <p class="font-weight-bolder">Please complete and submit the forms for each account you require.</p>
        <p v-if="formAccount" class="font-italic">All forms must be signed by a CAC.</p>
        <b-form-row>
          <b-col>
            <b-form-group label="Company: " label-for="formCompany">
              <!-- Need to load personnel dropdown after making selection of company -->
              <div v-if="!isSubcontractor">
                <b-form-select id="formCompany" v-model="form.Company" @change="getPersonnelByCompany" :options="companies" required></b-form-select>
                <b-form-invalid-feedback>
                  Select a Company.
                </b-form-invalid-feedback>
              </div>
              <div v-if="isSubcontractor">
                <b-form-input id="formCompany" v-model="form.Company" value="{{ form.Company }}" disabled></b-form-input>
                <b-form-invalid-feedback>
                  Please use your current Company.
                </b-form-invalid-feedback>
              </div>
            </b-form-group>
          </b-col>
          <b-col>
            <!-- account Type should only be loaded for the account form. Build out some nifty logic that will separate this from -->
            <b-form-group label="Type: " label-for="formType">
              <div v-if="formAccount">
                <b-form-select id="formType" v-model="form.Type" :options="accountTypes" :state="ValidateMe('FormType')" required></b-form-select>
                <b-form-invalid-feedback>
                  Select an Account Type.
                </b-form-invalid-feedback>
              </div>
              <div v-if="formCAC || formSCI">
                <b-form-input id="formType" v-model="form.Type" disabled></b-form-input>
                <b-form-invalid-feedback>
                  Please use the provided Type.
                </b-form-invalid-feedback>
              </div>
            </b-form-group>
            <div id="masterDocs" v-show="this.form.Type !== 'Select...'">
              <p>Download Form Templates</p>
              <ul>
                <li v-show="form.Type == 'NIPR'">
                  <a :href="this.masterDocs + '/DD2875-NIPRNet.pdf'">DD2875</a>
                </li>
                <li v-show="form.Type == 'NIPR'">
                  <a :href="this.masterDocs + '/af4394-NIPR.pdf'">AF4394</a>
                </li>
                <li v-show="form.Type == 'SIPR'">
                  <a :href="this.masterDocs + '/DD2875-SIPRNet.pdf'">DD2875</a>
                </li>
                <li v-show="form.Type == 'SIPR'">
                  <a :href="this.masterDocs + '/SIPREssentialsSign.pdf'">SIPR Essentials</a>
                </li>
                <li v-show="form.Type == 'DREN'">
                  <a :href="this.masterDocs + '/DD2875-DREN.pdf'">DD2875</a>
                </li>
                <li v-show="form.Type == 'JWICS'">
                  <a :href="this.masterDocs + '/DD2875-JWICS.pdf'">DD2875</a>
                </li>
                <li v-show="form.Type == 'JWICS'">
                  <a :href="this.masterDocs + '/af4394-JWICS.pdf'">AF4394</a>
                </li>
                <li v-show="form.Type == 'JWICS' || form.Type == 'NIPR'">
                  <a href="https://public.cyber.mil/training/cyber-awareness-challenge/" target="_blank">Cyber Awareness Challenge</a>
                </li>
                <li v-show="form.Type == 'CAC'">
                  <a :href="this.masterDocs + '/TASS-Form.pdf'">TASS Form</a>
                </li>
                <li v-show="form.Type == 'SCI'">
                  <a :href="this.masterDocs + '/AF-PSI-Form.pdf'">AF PSI Form</a>
                </li>
                <li v-show="form.Type == 'SCI'">
                  <a :href="this.masterDocs + '/SCI-Contract-Transfer-Form-(F3I-to-F3I-2).pdf'">SCI Contract Transfer Form (F3I to F3I 2)</a>
                </li>
                <li v-show="form.Type == 'SCI'">
                  <a :href="this.masterDocs + '/SCI-Nomination-Form.pdf'">SCI Nomination Form (F3I to F3I 2)</a>
                </li>
                <li v-show="form.Type == 'SCI'">
                  <a :href="this.masterDocs + '/SSO-Visit-Form.pdf'">SSO Visit Form</a>
                </li>
              </ul>
            </div>
          </b-col>
        </b-form-row>
        <b-form-row>
          <b-col cols="6">
            <b-form-group>
              <b-col cols="8">Form submission is for another Person: </b-col>
              <b-col cols="4">
                <b-form-checkbox id="formSetName" v-model="form.setName" value="Yes" unchecked-value="No" switch></b-form-checkbox>
              </b-col>
            </b-form-group>
          </b-col>
          <b-col cols="6">
            <div v-if="form.setName === 'Yes'">
              <b-form-group label="Select Person: " label-for="formPerson">
                <b-form-select id="formPerson" v-model="person" :options="personnel"></b-form-select>
                <b-form-invalid-feedback>
                  Select a Person
                </b-form-invalid-feedback>
              </b-form-group>
            </div>
            <div v-if="form.setName === 'No'">
              <b-form-group label="Your Name: " label-for="formPerson">
                <b-form-input id="formName" v-model="form.Name" disabled />
                <input type="hidden" id="formPerson" v-model="form.PersonnelID" />
              </b-form-group>
            </div>
          </b-col>
        </b-form-row>
        <b-form-row>
          <b-col>
            <b-form-group>
              <ejs-uploader id="formFileUpload" name="formFileUpload" :selected="onFileSelect" :multiple="false"></ejs-uploader>
            </b-form-group>
          </b-col>
        </b-form-row>
        <b-form-row>
          <b-col cols="10"></b-col>
          <b-col cols="2">
            <b-button variant="danger" class="formbutton" @click="closeForm">Cancel</b-button>
            <b-button variant="success" class="formbutton" @click="onFormSubmit">Submit</b-button>
          </b-col>
        </b-form-row>
      </b-card>
    </div>
  </b-container>
</template>
<script>
let vm = null
// eslint-disable-next-line no-undef
let url = _spPageContextInfo.webAbsoluteUrl

import User from '@/models/User'
import Personnel from '@/models/Personnel'
import Workplan from '@/models/WorkPlan'
import Company from '@/models/Company'
import Security from '@/models/Security'
export default {
  name: 'SecurityForms',
  props: {
    // Switches the form type between Account, CAC and SCI
    formType: {
      type: String,
      default: 'account'
    }
  },
  computed: {
    workplans() {
      return Workplan.getters('DropDown')
    },
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
    isSubcontractor() {
      return User.getters('isSubcontractor')
    }
  },
  data: function() {
    return {
      masterDocs: url + '/_layouts/download.aspx?SourceUrl=' + url + '/SiteCollectionDocuments',
      AccountsNIPRForms: url + '/AccountsNIPR/',
      AccountsDRENForms: url + '/AccountsDREN/',
      AccountsSIPRForms: url + '/AccountsSIPR/',
      AccountsJWICSForms: url + '/AccountsJWICS/',
      CACForms: url + '/CACForms/',
      SCIForms: url + '/SCIForms/',
      accountTypes: ['Select...', 'NIPR', 'SIPR', 'JWICS', 'DREN'],
      currentPersonnelID: '',
      form: {
        Company: '',
        Type: null,
        PersonnelID: this.person.value,
        setName: 'No',
        Name: this.person.text,
        etag: '',
        uri: ''
      },
      formAccount: false,
      formCAC: false,
      fileBuffer: null,
      formError: false,
      formSCI: false,
      fileSelected: null,
      formTitle: '',
      person: {
        value: '',
        text: ''
      },
      url: ''
    }
  },
  mounted: async function() {
    vm = this
    // First get current user informaiton
    this.checkType()
    // Setup a timing chaing so that we don't try to get the personnel by Company Dropdown until the state is loaded.
    Company.dispatch('getCompanies').then(function() {
      vm.$options.interval = setInterval(vm.waitForPersonnel, 1500)
    })
  },
  methods: {
    waitForPersonnel: async function() {
      if (this.currentuser) {
        // finally have user - now get the personnel based on their company
        this.form.Company = this.currentuser[0].Company ? this.currentuser[0].Company : this.companies[0]
        let payload = {}
        payload.company = this.form.Company
        Personnel.dispatch('getPersonnelByCompany', payload).then(function() {
          // Company loaded into state
          Personnel.dispatch('getPersonnelByUserAccount', vm.userid).then(function(result) {
            vm.person.value = result ? result[0].Id : 'S'
            vm.currentPersonnelID = result ? result[0].Id : ''
            vm.person.text = result ? result[0].FirstName + ' ' + result[0].LastName : ''
          })
        })
        clearInterval(vm.$options.interval)
      }
    },
    getPersonnelByCompany: async function() {
      let payload = {
        company: this.form.Company
      }
      await Personnel.dispatch('getPersonnelByCompany', payload).then(function() {
        if (vm.form.setName === 'Yes') {
          vm.form.PersonnelID = 'S'
        }
      })
    },
    checkType: function() {
      switch (this.formType) {
        case 'account':
          vm.formCAC = false
          vm.formSCI = false
          vm.formAccount = true
          vm.formTitle = 'Upload Account Forms'
          vm.form.Type = vm.accountTypes[0]
          // Set the correct document library to post to
          // Load the Account form
          break
        case 'cac':
          vm.formAccount = false
          vm.formSCI = false
          vm.formCAC = true
          vm.formTitle = 'Upload CAC Forms'
          vm.form.Type = 'CAC'
          // Set the correct document library to post to
          // Load CAC Form
          break
        case 'sci':
          vm.formAccount = false
          vm.formCAC = false
          vm.formSCI = true
          vm.formTitle = 'Upload SCI Forms'
          vm.form.Type = 'SCI'
          // Set the correct document library to post to
          // Load SCI Form
          break
      }
    },
    closeForm: function() {
      vm.$router.push({ path: '/pages/home' })
    },
    onFormSubmit: async function() {
      // VALIDATE SUBK && FORM
      this.formError = false
      if (this.isSubcontractor && this.form.Company !== this.currentuser[0].Company) {
        this.formError = true
      }

      if (this.formType === 'account' && this.form.Type === 'S') {
        this.formError = true
      }
      if (!this.formError) {
        // Add post to correct document library with required MetaData
        let library = ''
        let payload = {}
        switch (this.form.Type) {
          case 'NIPR':
            // set the url for the post of file
            library = 'AccountsNIPR'
            break
          case 'SIPR':
            library = 'AccountsSIPR'
            break
          case 'DREN':
            library = 'AccountsDREN'
            break
          case 'JWICS':
            library = 'AccountsJWICS'
            break
          case 'CAC':
            library = 'CAC'
            break
          case 'SCI':
            library = 'SCI'
            break
        }
        payload.library = library
        let response = await Security.dispatch('getDigest')
        let digest = response.data.d.GetContextWebInformation.FormDigestValue
        let name = this.form.PersonnelID + '-' + '-' + this.form.Name + this.fileSelected.split('.')[0]
        this.fileName = name
        payload.file = this.fileSelected
        payload.name = name
        payload.buffer = this.fileBuffer
        payload.digest = digest
        let item = await Security.dispatch('uploadForm', payload)
        let itemlink = item.data.d.ListItemAllFields.__deferred.uri
        let form = await Security.dispatch('getForm', itemlink)
        payload = form.data.d.__metadata
        this.form.etag = payload.etag
        this.form.uri = payload.uri
        payload.file = this.fileSelected
        payload.digest = digest
        payload.name = name
        // spayload.IndexNumber = this.IndexNumber
        payload.Company = this.form.Company
        payload.PersonnelID = this.form.PersonnelID
        Security.dispatch('updateForm', payload).then(function() {
          // Add a task to the task list for Security Group

          vm.$store.dispatch('support/addActivity', '<div class="bg-success">' + vm.formType + ' Form Uploaded.</div>')
          let event = []
          event.push({
            name: vm.fileName,
            Status: 'SecurityReview',
            Form: library + vm.fileSelected,
            etag: vm.form.etag,
            uri: vm.form.uri
          })
        })
        // Clear form after submission
        if (this.formType === 'account') {
          this.form.Type = this.accountTypes[0]
        }
        document.querySelector('.e-upload-files').removeChild(document.querySelector('.e-upload-file-list'))
        this.fileSelected = null
        this.fileBuffer = null
      }
    },
    async onFileSelect(args) {
      vm.fileSelected = args.filesData[0].name
      let buffer = vm.getFileBuffer(args.filesData[0].rawFile)
      buffer.then(function(buff) {
        vm.fileBuffer = buff
      })
    },
    getFileBuffer(file) {
      let p = new Promise(function(resolve, reject) {
        var reader = new FileReader()
        reader.onloadend = function(e) {
          resolve(e.target.result)
        }
        reader.onerror = function(e) {
          reject(e.target.error)
        }
        reader.readAsArrayBuffer(file)
      })
      return p
    },
    // Removing Validation because it doesn't work for on load and there isn't any free text.
    ValidateMe(input) {
      this.formError = false
      let ret = false
      switch (input) {
        case 'Company':
          if (this.form.Company != '') {
            ret = true
          }
          break
        case 'Person':
          if (this.form.PersonnelID != '') {
            ret = true
          }
          break
        case 'Type':
          if (this.form.Type !== '' || this.form.Type !== 'S') {
            ret = true
          }
          break
      }
      this.formError = ret
      return ret
    }
  },
  watch: {
    // eslint-disable-next-line no-unused-vars
    $route(to, from) {
      this.checkType(to.params.formType)
    }
  }
}
</script>
<style lang="scss">
.formbutton {
  margin: 0.75rem;
}
</style>