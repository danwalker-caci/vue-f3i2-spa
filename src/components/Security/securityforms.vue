<template>
  <!-- Add Form where users can download master docs and upload the changed docs. -->
  <b-container fluid class="contentHeight p-0" id="MainContainer">
    <!-- Use the upload travel docs as a template for uploading documents -->
    <!-- If user is SUBC, only load the related personnel to their company. 
         Otherwise, load companies into dropdown and on user selection load all personnel related to that company into a dropdown. -->
    <!-- on submission, split the personnel first name, last name out of the dropdown. -->
    <div id="form" class="col-12">
      <b-row class="bg-warning text-black formheader">
        <b-col cols="4" class="p-0 text-left"></b-col>
        <b-col cols="4" class="p-0 text-center font-weight-bold">
          <h3>{{ formTitle }}</h3>
        </b-col>
        <b-col cols="4" class="p-0 text-right"></b-col>
      </b-row>
      <b-card no-body>
        <b-form>
          <b-form-row>
            <b-col>
              <b-form-group label="Company: " label-for="formCompany" description="Select a Company">
                <!-- Need to load personnel dropdown after making selection of company -->
                <b-form-select v-if="!isSubcontractor" id="formCompany" v-model="form.Company" @change="this.getPersonnelByCompany()" :options="companies" required></b-form-select>
                <b-form-input v-if="isSubcontractor" id="formCompany" v-model="form.Company" value="{{ form.Company }}" disabled></b-form-input>
              </b-form-group>
            </b-col>
            <b-col>
              <!-- account Type should only be loaded for the account form. Build out some nifty logic that will separate this from -->
              <b-form-group label="Type: " label-for="accountType" description="Select a Type">
                <b-form-select id="formType" v-model="form.Type" :options="accountTypes" required></b-form-select>
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
                </ul>
              </div>
            </b-col>
          </b-form-row>
          <b-form-row>
            <b-col>
              <b-form-group>
                <b-col cols="4">Form submission is for another Person: </b-col>
                <b-col cols="8">
                  <b-form-checkbox id="formSetName" v-model="form.setName" value="Yes" unchecked-value="No" switch></b-form-checkbox>
                </b-col>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group v-if="form.setName === 'Yes'" label="Select Person: " label-for="accountPerson" description="Select the Person you are uploading a form for.">
                <b-form-select id="formPerson" v-model="form.PersonnelID" :options="personnel"></b-form-select>
              </b-form-group>
              <b-form-group v-if="form.setName === 'No'">
                <input type="hidden" id="formPerson" :value="userid" />
              </b-form-group>
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
              <b-button type="cancel" variant="danger" class="formbutton" @click="closeForm">Cancel</b-button>
              <b-button type="submit" variant="success" class="formbutton" @click="onFormSubmit">Submit</b-button>
            </b-col>
          </b-form-row>
        </b-form>
      </b-card>
    </div>
  </b-container>
</template>
<script>
let vm = null

import User from '@/models/User'
import Personnel from '@/models/Personnel'
import Workplan from '@/models/WorkPlan'
import Company from '@/models/Company'
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
    userid() {
      return User.getters('CurrentUserId')
    },
    currentuser() {
      return User.getters('CurrentUser')
    }
  },
  data: function() {
    return {
      // eslint-disable-next-line no-undef
      masterDocs: _spPageContextInfo.webAbsoluteUrl + '/_layouts/download.aspx?SourceUrl=' + _spPageContextInfo.webAbsoluteUrl + '/SiteCollectionDocuments',
      AccountsNIPRDocs: '/sites/f3i2/AccountsNIPR/',
      AccountsDRENDocs: '/sites/f3i2/AccountsDREN/',
      AccountsSIPRDocs: '/sites/f3i2/AccountsSIPR/',
      AccountsJWICSDocs: '/sites/f3i2/AccountsJWICS/',
      accountTypes: ['Select...', 'NIPR', 'SIPR', 'JWICS', 'DREN'],
      fileSelected: null,
      form: {
        Company: '',
        Type: null,
        PersonnelID: this.userid,
        setName: 'No'
      },
      formAccount: false,
      formCAC: false,
      formSCI: false,
      formTitle: '',
      personnel: [],
      url: ''
    }
  },
  mounted: async function() {
    vm = this
    // First get current user informaiton
    this.checkType()
    // Setup a timing chaing so that we don't try to get the personnel by Company Dropdown until the state is loaded.
    vm.$options.interval = setInterval(vm.waitForPersonnel, 1500)
  },
  methods: {
    waitForPersonnel: async function() {
      if (this.currentuser) {
        // finally have user - now get the personnel based on their company
        this.form.Company = this.currentuser[0].Company
        clearInterval(vm.$options.interval)
        this.personnel = await Personnel.dispatch('getPersonnelByCompany', this.form.Company)
        console.log('LOADED PERSONNEL: ' + this.personnel.length)
      }
    },
    checkType: function() {
      switch (this.formType) {
        case 'account':
          vm.formAccount = true
          vm.formTitle = 'Upload Account Information'
          vm.form.Type = vm.accountTypes[0]
          // Load the Account form
          // Get all of the Account forms from the master doc library and write them on a new tab with the following url:
          // https://mysite.sharepoint.com/_layouts/download.aspx?SourceUrl=https://mysite.sharepoint.com/documents/myfiie.pdf
          break
        case 'cac':
          vm.formCAC = true
          vm.formTitle = 'Upload CAC Information'
          // Load CAC Form
          // Get all of the CAC forms from the master doc library and write them on a new tab with the following url:
          // https://mysite.sharepoint.com/_layouts/download.aspx?SourceUrl=https://mysite.sharepoint.com/documents/myfiie.pdf
          break
        case 'sci':
          vm.formSCI = true
          vm.formTitle - 'Upload SCI Information'
          // Load SCI Form
          // Get all of the SCI forms from the master doc library and write them on a new tab with the following url:
          // https://mysite.sharepoint.com/_layouts/download.aspx?SourceUrl=https://mysite.sharepoint.com/documents/myfiie.pdf
          break
      }
    },
    closeForm: function() {
      vm.$router.push({ path: '/pages/home' })
    },
    onFormSubmit: function() {
      // Add post to correct document library with required MetaData
      let payload = {}
      payload.Company = this.form.Company
      payload.PersonnelID = this.form.PersonnelID
      switch (this.form.Type) {
        case 'NIPR':
          // set the url for the post of file
          break
      }
      // Add a task to the task list for Security Group
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
    }
  }
}
</script>
<style lang="scss">
.formbutton {
  margin: 0.75rem;
}
</style>
