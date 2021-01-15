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
        <b-alert v-model="formError" variant="danger" dismissible>Please correct the Form</b-alert>
        <p class="font-weight-bolder">Please complete and submit the forms for each account you require.</p>
        <p class="font-weight-bolder text-danger">
          <u>Downloaded Forms <u>must</u> be opened by Acrobat Reader DC.</u>
        </p>
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
                <b-form-select id="formType" v-model="form.Type" :options="accountOptions" :state="ValidateMe('Type')" required></b-form-select>
                <b-form-invalid-feedback>
                  Select an Account Type.
                </b-form-invalid-feedback>
              </div>
              <div v-if="formCAC || formSCI">
                <b-form-input id="formType" v-model="form.Type" class="hidden" disabled></b-form-input>
              </div>
              <div v-if="formSCI">
                <b-form-select id="SCIType" v-model="form.SCIType" :options="sciOptions" :state="ValidateMe('SCIType')" required></b-form-select>
                <b-form-invalid-feedback>
                  Select an SCI Option.
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
                  <a :href="this.masterDocs + '/af4394.pdf'">AF4394</a>
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
                  <a :href="this.masterDocs + '/af4394.pdf'">AF4394</a>
                </li>
                <li v-show="form.Type == 'JWICS' || form.Type == 'NIPR'">
                  <a href="https://public.cyber.mil/training/cyber-awareness-challenge/" target="_blank">Cyber Awareness Challenge</a>
                </li>
                <li v-show="form.Type == 'CAC'">
                  <a :href="this.masterDocs + '/TASS-Form.pdf'">TASS Form</a>
                </li>
                <li v-show="form.Type == 'SCI' && form.SCIType == 'Nomination'">
                  <a :href="this.masterDocs + '/AF-PSI-Form.pdf'">AF PSI Form</a>
                </li>
                <li v-show="form.Type == 'SCI' && form.SCIType == 'Transfer'">
                  <a :href="this.masterDocs + '/SCI-Contract-Transfer-Form-(F3I-to-F3I-2).pdf'">SCI Contract Transfer Form (F3I to F3I 2)</a>
                </li>
                <li v-show="form.Type == 'SCI' && form.SCIType == 'Nomination'">
                  <a :href="this.masterDocs + '/SCI-Nomination-Form.pdf'">SCI Nomination Form (F3I to F3I 2)</a>
                </li>
                <li v-show="form.Type == 'SCI' && form.SCIType == 'Visit Request'">
                  <a :href="this.masterDocs + '/SSO-Visit-Form.pdf'">SSO Visit Form</a>
                </li>
              </ul>
            </div>
          </b-col>
        </b-form-row>
        <b-form-row v-if="formSCI">
          <b-col cols="6">
            <b-form-group label="Scheduled Indoctrination Date: " label-for="formSCIIndocDate">
              <ejs-datepicker id="formSCIIndocDate" v-model="form.SCIIndocDate"></ejs-datepicker>
            </b-form-group>
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
                <b-form-select id="formPerson" v-model="form.PersonnelID" @change="onPersonnelChange" :options="personnel"> </b-form-select>
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
        <b-form-row v-if="formCAC">
          <!-- list a series of questions for the user to fill out -->
          <b-form-group label="Do you currently have a CAC? " label-for="formCACValid">
            <b-form-select id="formCACValid" v-model="form.CACValid" :options="cacvalid"> </b-form-select>
          </b-form-group>
        </b-form-row>
        <b-form-row v-if="form.CACValid === 'Yes'">
          <b-form-group label="Who was the CAC Issued By? " label-for="formCACIssuedBy">
            <b-form-input id="formCACIssuedBy" type="text" v-model="form.CACIssuedBy" placeholder="AF, NAVY, Langley AFB, etc..."></b-form-input>
          </b-form-group>
        </b-form-row>
        <b-form-row v-if="form.CACValid === 'Yes'">
          <b-form-group label="When does it expire? " label-for="formCACExpirationDate">
            <ejs-datepicker id="formCACExpirationDate" v-model="form.CACExpirationDate"></ejs-datepicker>
          </b-form-group>
        </b-form-row>
        <b-form-row v-if="form.CACValid === 'No'">
          <b-form-group label="Have you ever had a CAC? " label-for="formCACExpirationDate">
            <b-form-select id="formCACValid" v-model="form.CACEver" :options="cacever"> </b-form-select>
          </b-form-group>
        </b-form-row>
        <b-form-row v-if="form.CACEver === 'Yes'">
          <b-form-group label="When was it turned in? " label-for="formCACTurnedIn">
            <ejs-datepicker id="formCACTurnedIn" v-model="form.CACExpirationDate"></ejs-datepicker>
          </b-form-group>
        </b-form-row>
        <b-form-row v-if="form.CACEver === 'Yes'">
          <b-form-group label="Where was it turned in? " label-for="formCACTurnedInLoc">
            <b-form-input id="formCACTurnedInLoc" type="text" v-model="form.CACIssuedBy" placeholder="AF, NAVY, Langley AFB, etc..."></b-form-input>
          </b-form-group>
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
import Todo from '@/models/Todo'

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
      accountOptions: ['Select...', 'NIPR', 'SIPR', 'JWICS', 'DREN'],
      currentPersonnelID: '',
      form: {
        CACValid: '',
        CACIssuedBy: '',
        CACExpirationDate: '',
        CACStatus: '',
        Company: '',
        Type: null,
        PersonnelID: null,
        setName: 'No',
        Name: null,
        GovSentDate: null,
        etag: '',
        uri: '',
        SCIType: '',
        SCIIndocDate: '',
        SCIStatus: ''
      },
      formAccount: false,
      formCAC: false,
      fileBuffer: null,
      formError: false,
      formSCI: false,
      fileSelected: null,
      formTitle: '',
      taskUserId: null,
      sciOptions: ['Nomination', 'Transfer', 'Visit Request'],
      url: '',
      cacvalid: [
        { text: 'No', value: 'No' },
        { text: 'Yes', value: 'Yes' }
      ],
      cacever: [
        { text: 'No', value: 'No' },
        { text: 'Yes', value: 'Yes' }
      ]
    }
  },
  mounted: async function() {
    vm = this
    // First get current user informaiton
    try {
      await Security.dispatch('getDigest')
      this.checkType()
      this.getUserIDs()
      // Setup a timing chaing so that we don't try to get the personnel by Company Dropdown until the state is loaded.
      Company.dispatch('getCompanies').then(function() {
        vm.$options.interval = setInterval(vm.waitForPersonnel, 1000)
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
  methods: {
    getUserIDs: async function() {
      this.$store.dispatch('support/getAccountUser')
      this.$store.dispatch('support/getAFRLUser')
      this.$store.dispatch('support/getCACSCIUser')
    },
    waitForPersonnel: async function() {
      if (this.currentuser) {
        // finally have user - now get the personnel based on their company
        this.form.Company = this.currentuser[0].Company ? this.currentuser[0].Company : this.companies[0]
        let payload = {}
        payload.company = this.form.Company
        Personnel.dispatch('getPersonnelByCompany', payload).then(function() {
          // Company loaded into state
          Personnel.dispatch('getPersonnelByUserAccount', vm.userid).then(function(result) {
            vm.form.PersonnelID = result ? result[0].Id : 'S'
            vm.currentPersonnelID = result ? result[0].Id : ''
            vm.form.Name = result ? result[0].FirstName + ' ' + result[0].LastName : ''
            // Pulled from personnel list
            if (vm.formSCI && result && result[0].SCIFormStatus) {
              vm.form.SCIStatus = result[0].SCIFormStatus
              vm.form.CACStatus = result[0].CACStatus
            }
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
    onPersonnelChange: function() {
      this.personnel.forEach(person => {
        if (person.value === vm.form.PersonnelID) {
          vm.form.Name = person.text
          vm.form.PersonnelID = person.value
        }
      })
    },
    checkType: function() {
      switch (this.formType) {
        case 'account':
          this.formCAC = false
          this.formSCI = false
          this.formAccount = true
          this.formTitle = 'Upload Account Forms'
          this.form.Type = this.accountOptions[0]
          // Set the correct document library to post to
          // Load the Account form
          break
        case 'cac':
          this.formAccount = false
          this.formSCI = false
          this.formCAC = true
          this.formTitle = 'Upload CAC Forms'
          this.form.Type = 'CAC'
          // Set the correct document library to post to
          // Load CAC Form
          break
        case 'sci':
          this.formAccount = false
          this.formCAC = false
          this.formSCI = true
          this.formTitle = 'Upload SCI Forms'
          this.form.Type = 'SCI'
          // Set the correct document library to post to
          // Load SCI Form
          // Run a function to get the original SCI information from the personnel module.
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
      if (this.formType === 'account' && this.form.Type === 'Select...') {
        this.formError = true
      }
      if (!this.fileSelected) {
        this.formError = true
      }
      if (!this.formError) {
        // Add post to correct document library with required MetaData
        let library = '',
          libraryUrl = ''
        let payload = {}
        switch (this.form.Type) {
          case 'NIPR':
            // set the url for the post of file
            library = 'AccountsNIPR'
            libraryUrl = this.AccountsNIPRForms
            this.taskUserId = vm.$store.state.support.AccountUserId
            break
          case 'SIPR':
            library = 'AccountsSIPR'
            libraryUrl = this.AccountsSIPRForms
            this.taskUserId = vm.$store.state.support.AccountUserId
            break
          case 'DREN':
            library = 'AccountsDREN'
            libraryUrl = this.AccountsDRENForms
            this.taskUserId = vm.$store.state.support.AccountUserId
            break
          case 'JWICS':
            library = 'AccountsJWICS'
            libraryUrl = this.AccountsJWICSForms
            this.taskUserId = vm.$store.state.support.AccountUserId
            break
          case 'CAC':
            library = 'CACForms'
            libraryUrl = this.CACForms
            this.taskUserId = vm.$store.state.support.CACSCIUserId
            break
          case 'SCI':
            library = 'SCIForms'
            libraryUrl = this.SCIForms
            this.taskUserId = vm.$store.state.support.CACSCIUserId
            break
        }
        payload.library = library
        //let digest = response.data.d.GetContextWebInformation.FormDigestValue
        let pdfName = this.form.PersonnelID + '-' + this.form.Name + '-' + this.fileSelected
        let name = pdfName.split('.')[0]
        this.fileName = name
        payload.file = this.fileSelected
        payload.name = name
        payload.buffer = this.fileBuffer
        let item = await Security.dispatch('uploadForm', payload)
        let itemlink = item.data.d.ListItemAllFields.__deferred.uri
        let form = await Security.dispatch('getForm', itemlink)
        payload = {
          Title: 'Approve ' + name,
          //AssignedToId: vm.userid, // Hardcoding the Security Group
          AssignedToId: this.taskUserId,
          Description: 'Approve or reject ' + name,
          IsMilestone: false,
          PercentComplete: 0,
          TaskType: vm.form.Type + ' Request',
          TaskLink: '/security/view/' + this.form.Type + '/' + form.data.d.Id
        }
        let results = await Todo.dispatch('addTodo', payload)
        let formId = form.data.d.Id
        payload = form.data.d.__metadata
        payload.file = this.fileSelected
        payload.name = pdfName
        // spayload.IndexNumber = this.IndexNumber
        payload.Company = this.form.Company
        payload.PersonnelID = this.form.PersonnelID
        payload.PersonName = this.form.Name
        payload.TaskID = results.data.d.Id
        if (vm.form.Type === 'SCI') {
          payload.SCIType = this.form.SCIType
        }
        await Security.dispatch('updateForm', payload).then(async function() {
          // First check to see if there is an entry for the PersonnelID in the Security Form List
          let payload = {
            Title: vm.form.PersonnelID + '-' + vm.form.Name,
            PersonnelID: vm.form.PersonnelID,
            PersonName: vm.form.Name,
            Company: vm.form.Company,
            Accounts: '',
            SCI: '',
            CAC: ''
          }
          let types = [],
            scis = [],
            cacs = []
          if (vm.formAccount) {
            types.push({
              account: vm.form.Type,
              id: formId,
              library: library,
              GovSentDate: '',
              GovCompleteDate: '',
              name: pdfName,
              task: results.data.d.Id,
              href: libraryUrl + pdfName,
              etag: form.data.d.__metadata.etag,
              uri: form.data.d.__metadata.uri
            })
          }
          if (vm.formSCI) {
            scis.push({
              id: formId,
              library: library,
              name: pdfName,
              task: results.data.d.Id,
              href: libraryUrl + pdfName,
              etag: form.data.d.__metadata.etag,
              uri: form.data.d.__metadata.uri
            })
            payload.SCIIndoc = vm.form.SCIIndocDate
            payload.SCIStatus = 'CACI Review'
            //
          }
          if (vm.formCAC) {
            cacs.push({
              id: formId,
              library: library,
              name: pdfName,
              task: results.data.d.Id,
              href: libraryUrl + pdfName,
              etag: form.data.d.__metadata.etag,
              uri: form.data.d.__metadata.uri
            })
            payload.CACValid = vm.form.CACValid
            payload.CACIssuedBy = vm.form.CACIssuedBy
            payload.CACExpirationDate = vm.form.CACExpirationDate
            payload.CACStatus = vm.form.CACStatus
          }
          let securityForm = await Security.dispatch('getSecurityFormByPersonnelId', payload)
          if (securityForm && securityForm.length == 0) {
            payload.Accounts = JSON.stringify(types)
            payload.SCI = JSON.stringify(scis)
            payload.CAC = JSON.stringify(cacs)
            await Security.dispatch('addSecurityForm', payload)
          } else {
            if (securityForm.Account && securityForm.Account.length > 0) {
              securityForm.Accounts.forEach(type => {
                types.push(type)
              })
            }
            // Don't overwrite SCI
            if (securityForm.SCI && securityForm.SCI.length > 0) {
              securityForm.SCI.forEach(sci => {
                scis.push(sci)
              })
            }
            // Don't overwrite CAC
            if (securityForm.CAC && securityForm.CAC.length > 0) {
              securityForm.SCI.forEach(cac => {
                cacs.push(cac)
              })
            }
            if (types.length > 0) {
              payload.Accounts = JSON.stringify(types)
            }
            if (scis.length > 0) {
              payload.SCI = JSON.stringify(scis)
            }
            if (cacs.length > 0) {
              payload.CAC = JSON.stringify(cacs)
            }
            payload.etag = securityForm.etag
            payload.uri = securityForm.uri
            await Security.dispatch('updateSecurityForm', payload)
          }
          // Run conditional on the results of the security form to either add or update security form
          // await Security.dispatch('')
          // Post to the SecurityForms list with the PersonName, PersonnelID, Company and the Types array [{ SIPR: /SIPR/:id, GovSentDate: '', GovCompleteDate: '' }]
          const notification = {
              type: 'success',
              title: 'Succesfully Uploaded Form',
              message: 'Uploaded form ' + vm.form.Type + ' for ' + vm.form.Name,
              push: true
            }
            vm.$store.dispatch('notification/add', notification, { root: true })

            vm.$store.dispatch('support/addActivity', '<div class="bg-success">' + vm.formType + ' Form Uploaded.</div>')
            let event = []
            event.push({
              name: vm.fileName,
              Status: 'SecurityReview',
              Form: library + vm.fileSelected,
              etag: vm.form.etag,
              uri: vm.form.uri
            })
            // Clear form after submission

            if (vm.formType === 'account') {
              vm.form.Type = vm.accountOptions[0]
            }
            document.querySelector('.e-upload-files').removeChild(document.querySelector('.e-upload-file-list'))
            vm.fileSelected = null
            vm.fileBuffer = null
          })
        }
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
    ValidateMe: function(input) {
      let ret = false
      switch (input) {
        case 'Company':
          if (this.form.Company !== '') {
            ret = true
          }
          break
        case 'Person':
          if (this.form.PersonnelID !== '') {
            ret = true
          }
          break
        case 'Type':
          if (this.form.Type !== 'Select...') {
            ret = true
          }
          break
        case 'SCIType':
          if (this.form.SCIType !== '') {
            ret = true
          }
          break
      }
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
