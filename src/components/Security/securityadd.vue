/*eslint-disable no-undef: "error"*/

<template>
  <!-- Add Form where users can download master docs and upload the changed docs. -->
  <b-container fluid class="contentHeight p-0" id="MainContainer">
    <!-- Use the upload travel docs as a template for uploading documents -->
    <!-- If user is SUBC, only load the related personnel to their company. 
         Otherwise, load companies into dropdown and on user selection load all personnel related to that company into a dropdown. -->
    <!-- on submission, split the personnel first name, last name out of the dropdown. -->
    <div id="form" class="col-12 p-4">
      <b-row class="bg-dark formheader">
        <b-col cols="4" class="p-0 text-left"></b-col>
        <b-col cols="4" class="p-0 text-center font-weight-bold">
          <h3 class="text-white">{{ formTitle }}</h3>
        </b-col>
        <b-col cols="4" class="p-0 text-right"></b-col>
      </b-row>
      <b-card no-body class="p-3">
        <b-alert v-model="formError" variant="danger" dismissible>Please correct the Form</b-alert>
        <p v-show="formAccount" class="font-weight-bolder h4">Please complete and submit the forms for each account you require.</p>
        <p class="font-weight-bolder h4 text-danger">
          <em>Downloaded Forms <u>must</u> be opened by the Adobe Acrobat Reader DC program on your local machine. Please limit the form names to 64 character length.</em>
        </p>
        <div v-show="formAccount">
          <p class="h5">***Only for individuals sitting in AFRL***</p>
          <p class="h5">Please complete the DD2875 Form through Box 12</p>
          <p class="h5">All forms must be signed by a CAC.</p>
        </div>
        <p v-show="formCAC" class="font-italic h5">Please fill in section 1 (do not change pre-filled out information).</p>
        <div v-show="formSCI">
          <p class="h5">For those who require SCI access on this contract, SCI forms <u>must</u> be submitted.</p>
          <ul>
            <li>
              <p class="h5">
                Use a transfer form if an individual is transferring from one AFRL contract to another AFRL contract. If the individual requires access on multiple AFRL contracts, please notate that on the transfer form in the remark section.
              </p>
            </li>
            <li>
              <p class="h5">If an individual(s) is not read in to an AFRL contract(s), a nomination form with a prescreen is required. Individual must have a final TS clearance. Complete cells 1,2,4,6,11,12,13, 14 and 15. The SMO listed in box 11 must be a level 2 or 3. <strong>DO NOT sign these forms.</strong></p>
            </li>
          </ul>
        </div>
        <div v-show="form.Type == 'SCI' && form.SCIType == 'Nomination'">
          <p class="h6">
            Security has been notified that you will be working on the F3I-2 contract and your position requires you to have a TS clearance and be indoctrinated for SCI accesses. In order to process your clearance and access for this effort the customer has requested a completed SCI pre-screening questionnaire. The SCI pre-screening interview is
            used to bring a previous investigation up-to-date when there is no current investigative information available.
          </p>
          <p class="h6">
            Page 1: Fill in Last name, First Name, MI, SSN, DOB and POB only. Grade, AFSC, and Unit are not needed.
          </p>
          <p class="h6">
            Page 2: Sign in SCI nominee box and <strong><em>NOT</em></strong> in the <mark><strong>Recertification at time of Indoctrination</strong></mark> section at this time.
          </p>
          <p class="h6">
            Page 3: Be sure to initial and date along the top. Ensure all questions are answered. For questions with yes answers (with the exception of question 5) please provide a full narrative explanation on the next page. Answer no to question 5 if you attended counseling for marital, family, grief, victim of sexual assault, or PTSD.
          </p>
        </div>
        <b-form-row>
          <b-col cols="6">
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
            <b-form-group v-if="isSecurity && formAccount" label="Historical Data: " label-for="formHistorical">
              <b-form-checkbox v-model="form.Historical" value="Yes" unchecked-value="No" ref="formHistorical" id="formHistorical" switch></b-form-checkbox>
            </b-form-group>
          </b-col>
          <b-col cols="6">
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
            <p v-show="form.Type == 'JWICS'" class="h5">***For all individuals on F3I-2***</p>
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
                <li v-show="form.Type == 'SIPR'">
                  <a :href="this.masterDocs + '/SIPRTraining.pdf'">SIPR Training</a>
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
                  <a :href="this.masterDocs + '/SCIContractTransferForm-BlanktoF3I2.pdf'">SCI Contract Transfer Form</a>
                </li>
                <li v-show="form.Type == 'SCI' && form.SCIType == 'Nomination'">
                  <a :href="this.masterDocs + '/SCI-Nomination-Form.pdf'">SCI Nomination Form</a>
                </li>
                <li v-show="form.Type == 'SCI' && form.SCIType == 'Visit Request'">
                  <a :href="this.masterDocs + '/SSO-Visit-Form.pdf'">SSO Visit Form</a>
                </li>
              </ul>
            </div>
          </b-col>
        </b-form-row>
        <b-form-row>
          <b-col cols="6">
            <b-form-group>
              <b-form-group label="Form submission is for another Person: " label-for="formSetName">
                <b-form-checkbox id="formSetName" v-model="form.setName" value="Yes" unchecked-value="No" @input="loadFilterData" switch></b-form-checkbox>
              </b-form-group>
            </b-form-group>
          </b-col>
          <b-col cols="6">
            <input type="hidden" id="formPerson" v-model="form.PersonnelID" />
            <div v-if="form.setName === 'Yes'">
              <b-form-group label="Select Person: " label-for="formPerson">
                <b-dropdown id="formDropdownPerson" block variant="outline-dark" :text="person ? person : 'Personnel'" v-model="form.PersonSelect">
                  <b-dropdown-form>
                    <b-form-input id="personnelFiltering" v-model="personnelFiltering" placeholder="Name" type="text" @keyup.native="filtering"></b-form-input>
                    <b-button variant="primary" class="mt-1" size="sm" @click="searchFiltering($event)">Search</b-button>
                  </b-dropdown-form>
                  <b-dropdown-divider></b-dropdown-divider>
                  <b-dropdown-item v-for="person in filteredData" :key="person.value" :value="person.value" @click="onPersonnelChange(person.value)">{{ person.text }}</b-dropdown-item>
                </b-dropdown>
                <!--<b-select id="formPerson" v-model="form.PersonSelect" @change="onPersonnelChange" @keyup.native="filtering" :options="filteredData"></b-select>-->
                <b-form-invalid-feedback>
                  Select a Person
                </b-form-invalid-feedback>
              </b-form-group>
            </div>
            <div v-if="form.setName === 'No'">
              <b-form-group label="Your Name: " label-for="formPerson">
                <b-form-input id="formName" v-model="form.Name" disabled />
              </b-form-group>
            </div>
          </b-col>
        </b-form-row>
        <div v-if="formCAC" class="m-1 p-1">
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
          <b-form-row v-if="form.CACEver === 'Yes' && form.CACValid === 'No'">
            <b-form-group label="When was it turned in? " label-for="formCACExpiredOnDate">
              <ejs-datepicker id="formCACExpiredOnDate" v-model="form.CACExpiredOnDate"></ejs-datepicker>
            </b-form-group>
          </b-form-row>
          <b-form-row v-if="form.CACEver === 'Yes' && form.CACValid === 'No'">
            <b-form-group label="Where was it turned in? " label-for="formCACTurnedInLoc">
              <b-form-input id="formCACTurnedInLoc" type="text" v-model="form.CACTurnedIn" placeholder="AF, NAVY, Langley AFB, etc..."></b-form-input>
            </b-form-group>
          </b-form-row>
        </div>
        <b-form-row>
          <b-col>
            <b-form-group>
              <ejs-uploader id="formFileUpload" name="formFileUpload" :selected="onFileSelect" :multiple="true"></ejs-uploader>
            </b-form-group>
          </b-col>
        </b-form-row>
        <b-form-row>
          <b-col cols="10"></b-col>
          <b-col cols="2">
            <b-button variant="danger" class="formbutton" @click="closeForm">Cancel</b-button>
            <b-button :disabled="lockSubmit" variant="success" class="formbutton" @click="onFormSubmit">Submit</b-button>
          </b-col>
        </b-form-row>
      </b-card>
    </div>
  </b-container>
</template>
<script>
let vm = null
let timeout = null
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
      masterDocs: url + '/_layouts/download.aspx?SourceUrl=' + url + '/SiteCollectionDocuments',
      AccountsNIPRForms: url + '/AccountsNIPR/',
      AccountsDRENForms: url + '/AccountsDREN/',
      AccountsSIPRForms: url + '/AccountsSIPR/',
      AccountsJWICSForms: url + '/AccountsJWICS/',
      CACForms: url + '/CACForms/',
      SCIForms: url + '/SCIForms/',
      accountOptions: ['Select...', 'NIPR', 'SIPR', 'JWICS', 'DREN'],
      currentPersonnelID: '',
      currentFirstName: '',
      currentLastName: '',
      form: {
        CACValid: '',
        CACIssuedBy: '',
        CACExpirationDate: '',
        CACStatus: '',
        CACTurnedIn: '',
        CACExpiredOnDate: '',
        Company: '',
        Type: null,
        PersonnelID: null,
        PersonSelect: null,
        setName: 'No',
        Name: null,
        GovSentDate: null,
        Historical: '',
        etag: '',
        uri: '',
        SCIType: '',
        SCIIndocDate: '',
        SCIStatus: ''
      },
      formAccount: false,
      formCAC: false,
      /** fileBuffer and fileSelected to be converged into an array of objects **/
      files: [],
      fileBuffer: null,
      fileSelected: null,
      formError: false,
      formSCI: false,
      formTitle: '',
      library: '',
      libraryUrl: '',
      lockSubmit: false,
      taskId: null,
      taskUserId: [],
      taskEmail: [],
      securityForm: null,
      filteredData: null,
      sciOptions: ['Nomination', 'Transfer', 'Visit Request'],
      url: '',
      person: '',
      personnelFiltering: '',
      cacvalid: [
        { text: 'No', value: 'No' },
        { text: 'Yes', value: 'Yes' }
      ],
      cacever: [
        { text: 'No', value: 'No' },
        { text: 'Yes', value: 'Yes' }
      ],
      securityGroups: ['Account Security', 'AFRL Security', 'CAC Security', 'SCI Security'],
      ddfields: { text: 'text', value: 'value' }
    }
  },
  mounted: async function() {
    vm = this
    this.$nextTick(async () => {
      // First get current user informaiton
      await Security.dispatch('getDigest')
      if (this.afrlgroup.length === 0 || this.accountgroup === 0 || this.cacgroup === 0 || this.scigroup === 0) await Security.dispatch('getSecurityGroups')
      await vm.checkType()
      // Setup a timing chaing so that we don't try to get the personnel by Company Dropdown until the state is loaded.
      await Company.dispatch('getCompanies')
        .then(function() {
          vm.$options.interval = setInterval(vm.waitForPersonnel, 750)
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
    })
  },
  methods: {
    filtering: e => {
      e.preventDefault()
      clearTimeout(timeout)
      // https://stackoverflow.com/questions/44312924/filter-array-of-objects-whose-any-properties-contains-a-value
      timeout = setTimeout(() => {
        vm.filteredData = vm.personnel.filter(data =>
          JSON.stringify(data)
            .toLowerCase()
            .includes(e.target.value.toLowerCase())
        )
      }, 25)
    },
    searchFiltering: e => {
      e.preventDefault()
      // https://stackoverflow.com/questions/44312924/filter-array-of-objects-whose-any-properties-contains-a-value
      vm.filteredData = vm.personnel.filter(data =>
        JSON.stringify(data)
          .toLowerCase()
          .includes(vm.personnelFiltering.toLowerCase())
      )
    },
    loadFilterData: async () => {
      vm.filteredData = vm.personnel
    },
    waitForPersonnel: async function() {
      if (this.currentuser) {
        // finally have user - now get the personnel based on their company
        this.form.Company = this.currentuser[0].Company ? this.currentuser[0].Company : this.companies[0]
        let payload = {}
        payload.company = this.form.Company
        await Personnel.dispatch('getPersonnelByCompany', payload)
        // Company loaded into state
        let result = await Personnel.dispatch('getPersonnelByUserAccount', this.userid)
        this.form.PersonnelID = result ? result[0].Id : 'S'
        this.currentPersonnelID = result ? result[0].Id : ''
        this.form.Name = result ? result[0].FirstName + ' ' + result[0].LastName : ''
        this.currentFirstName = result ? result[0].FirstName : ''
        this.currentLastName = result ? result[0].LastName : ''
        this.form.FirstName = result ? result[0].FirstName : ''
        this.form.LastName = result ? result[0].LastName : ''
        // Pulled from personnel list
        if (this.formSCI && result && result[0].SCIFormStatus) {
          this.form.SCIStatus = result[0].SCIFormStatus
          this.form.CACStatus = result[0].CACStatus
        }
        this.filteredData = this.personnel
        this.checkSecurityForms()
        clearInterval(this.$options.interval)
      }
    },
    getPersonnelByCompany: async function() {
      let payload = {
        company: this.form.Company
      }
      await Personnel.dispatch('getPersonnelByCompany', payload)
      if (this.form.setName === 'Yes') {
        this.form.PersonnelID = 'S'
      }
      this.filteredData = this.personnel
    },
    onPersonnelChange: function(value) {
      console.log('Personnel Change')
      console.log(value)
      this.personnel.forEach(person => {
        if (person.value === value) {
          vm.form.Name = person.text
          vm.form.FirstName = person.text.substr(0, person.text.indexOf(' '))
          vm.form.LastName = person.text.substr(person.text.indexOf(' '), person.text.length)
          vm.form.PersonnelID = value
          vm.person = vm.form.FirstName + ' ' + vm.form.LastName
          vm.checkSecurityForms()
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
    checkSecurityForms: async function() {
      let payload = {
        Title: this.form.PersonnelID + '-' + this.form.Name,
        PersonnelID: this.form.PersonnelID,
        FirstName: this.form.FirstName,
        LastName: this.form.LastName,
        Company: this.form.Company
      }
      let securityForm = await Security.dispatch('getSecurityFormByPersonnelId', payload)
      if (securityForm && securityForm.length == 0) {
        // generate an entry for Person
        this.securityForm = await Security.dispatch('addSecurityForm', payload)
      } else if (securityForm) {
        this.securityForm = securityForm
      }
    },
    closeForm: function() {
      vm.$router.push({ path: '/security/tracker' })
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
      if (this.files.length <= 0) {
        this.formError = true
      }
      if (!this.formError) {
        // Add post to correct document library with required MetaData
        this.lockSubmit = true
        let payload = {}
        let group = []
        let dissResults = ''
        switch (this.form.Type) {
          case 'NIPR':
            // set the url for the post of file
            this.library = 'AccountsNIPR'
            this.libraryUrl = this.AccountsNIPRForms
            group = this.accountgroup
            break
          case 'SIPR':
            this.library = 'AccountsSIPR'
            this.libraryUrl = this.AccountsSIPRForms
            group = this.accountgroup
            break
          case 'DREN':
            this.library = 'AccountsDREN'
            this.libraryUrl = this.AccountsDRENForms
            group = this.accountgroup
            break
          case 'JWICS':
            this.library = 'AccountsJWICS'
            this.libraryUrl = this.AccountsJWICSForms
            group = this.accountgroup
            break
          case 'CAC':
            this.library = 'CACForms'
            this.libraryUrl = this.CACForms
            group = this.cacgroup
            break
          case 'SCI':
            this.library = 'SCIForms'
            this.libraryUrl = this.SCIForms
            group = this.scigroup
            break
        }
        group.forEach(user => {
          this.taskUserId.push(user.Id)
          this.taskEmail.push(user.Email)
        })
        payload.library = this.library
        payload.Company = vm.form.Company
        payload.PersonnelID = vm.form.PersonnelID
        //let digest = response.data.d.GetContextWebInformation.FormDigestValue
        // Run through a loop for the files
        let niprs = [],
          siprs = [],
          drens = [],
          jwics = [],
          scis = [],
          cacs = []

        // Push original forms into an array to prevent being overwritten
        if (this.securityForm.NIPR && this.securityForm.NIPR.forms.length > 0) {
          this.securityForm.NIPR.forms.forEach(nipr => {
            niprs.push(nipr)
          })
        }
        if (this.securityForm.JWICS && this.securityForm.JWICS.forms.length > 0) {
          this.securityForm.JWICS.forms.forEach(jwic => {
            jwics.push(jwic)
          })
        }
        if (this.securityForm.DREN && this.securityForm.DREN.forms.length > 0) {
          this.securityForm.DREN.forms.forEach(dren => {
            drens.push(dren)
          })
        }
        if (this.securityForm.SIPR && this.securityForm.SIPR.forms.length > 0) {
          this.securityForm.SIPR.forms.forEach(sipr => {
            siprs.push(sipr)
          })
        }
        // Don't overwrite SCI
        if (this.securityForm.SCI && this.securityForm.SCI.forms.length > 0) {
          this.securityForm.SCI.forms.forEach(sci => {
            scis.push(sci)
          })
        }
        // Don't overwrite CAC
        if (this.securityForm.CAC && this.securityForm.CAC.forms.length > 0) {
          this.securityForm.CAC.forms.forEach(cac => {
            cacs.push(cac)
          })
        }
        await this.asyncForEach(this.files, async file => {
          payload.library = vm.library
          payload.Company = vm.form.Company
          payload.PersonnelID = vm.form.PersonnelID
          let pdfName = vm.form.PersonnelID + '-' + vm.form.Name + '-' + file.fileSelected
          let name = pdfName.split('.')[0]
          payload.file = pdfName
          payload.name = name
          payload.buffer = file.fileBuffer
          if (console) console.log('PAYLOAD TO UPLOAD FORM: ' + JSON.stringify(payload))
          let item = await Security.dispatch('uploadForm', payload)
          //TO DO: Check if item contains the form Id. The update form could then be deleted
          let itemlink = item.data.d.ListItemAllFields.__deferred.uri
          let form = await Security.dispatch('getForm', itemlink)
          let formId = form.data.d.Id // Form unlikely needed. itemLink definetely
          switch (this.form.Type) {
            case 'NIPR':
              // set the url for the post of file
              niprs.push({
                account: vm.form.Type,
                id: formId,
                library: vm.library,
                name: pdfName,
                // task: results.data.d.Id,
                href: vm.libraryUrl + pdfName,
                etag: form.data.d.__metadata.etag,
                uri: form.data.d.__metadata.uri,
                submitterId: vm.currentuser[0].id,
                submitterEmail: vm.currentuser[0].Email,
                rejectReason: ''
              })
              break
            case 'SIPR':
              siprs.push({
                account: vm.form.Type,
                id: formId,
                library: vm.library,
                name: pdfName,
                // task: results.data.d.Id,
                href: vm.libraryUrl + pdfName,
                etag: form.data.d.__metadata.etag,
                uri: form.data.d.__metadata.uri,
                submitterId: vm.currentuser[0].id,
                submitterEmail: vm.currentuser[0].Email,
                rejectReason: ''
              })
              break
            case 'DREN':
              drens.push({
                account: vm.form.Type,
                id: formId,
                library: vm.library,
                name: pdfName,
                // task: results.data.d.Id,
                href: vm.libraryUrl + pdfName,
                etag: form.data.d.__metadata.etag,
                uri: form.data.d.__metadata.uri,
                submitterId: vm.currentuser[0].id,
                submitterEmail: vm.currentuser[0].Email,
                rejectReason: ''
              })
              break
            case 'JWICS':
              jwics.push({
                account: vm.form.Type,
                id: formId,
                library: vm.library,
                name: pdfName,
                // task: results.data.d.Id,
                href: vm.libraryUrl + pdfName,
                etag: form.data.d.__metadata.etag,
                uri: form.data.d.__metadata.uri,
                submitterId: vm.currentuser[0].id,
                submitterEmail: vm.currentuser[0].Email,
                rejectReason: ''
              })
              break
            case 'CAC':
              cacs.push({
                id: formId,
                library: vm.library,
                name: pdfName,
                // task: results.data.d.Id,
                href: vm.libraryUrl + pdfName,
                etag: form.data.d.__metadata.etag,
                uri: form.data.d.__metadata.uri,
                submitterId: vm.currentuser[0].id,
                submitterEmail: vm.currentuser[0].Email,
                rejectReason: ''
              })
              payload.CACValid = vm.form.CACValid
              payload.CACIssuedBy = vm.form.CACIssuedBy
              payload.CACExpirationDate = vm.form.CACExpirationDate !== '' ? vm.form.CACExpirationDate : null
              payload.DISSCheck = vm.securityForm.DISSCheck
              if (vm.form.CACValid === 'Yes') {
                payload.CACStatus = 'Non-F3I2 CAC'
              } else {
                payload.CACStatus = 'Pending Info'
              }
              payload.CACExpiredOnDate = vm.form.CACExpiredOnDate !== '' ? vm.form.CACExpiredOnDate : null
              payload.CACTurnedIn = vm.form.CACTurnedIn !== '' ? vm.form.CACTurnedIn : ''
              break
            case 'SCI':
              scis.push({
                id: formId,
                library: vm.library,
                name: pdfName,
                // task: results.data.d.Id,
                href: vm.libraryUrl + pdfName,
                etag: form.data.d.__metadata.etag,
                uri: form.data.d.__metadata.uri,
                submitterId: vm.currentuser[0].id,
                submitterEmail: vm.currentuser[0].Email,
                rejectReason: ''
              })
              payload.SCIIndoc = vm.form.SCIIndocDate !== '' ? vm.form.SCIIndocDate : null
              payload.SCIStatus = 'CACI Review'
              break
          }
        })
        let results = {
          data: {
            d: {
              Id: ''
            }
          }
        }
        if (this.form.Historical !== 'Yes') {
          // Notification must be reworked to point to the id of SecurityForms and then the account type.
          let taskPayload = {
            Title: 'Approve ' + vm.form.Type + ' Submission for ' + vm.form.Name,
            //AssignedToId: 63, // TESTING TASK
            AssignedToId: this.taskUserId,
            Description: 'Approve or reject ' + vm.form.Type + ' request for ' + vm.form.Name,
            IsMilestone: false,
            PercentComplete: 0,
            TaskType: vm.form.Type + ' Request',
            TaskLink: '/security/view/' + this.securityForm.Id + '/' + this.form.Type
          }
          results = await Todo.dispatch('addTodo', taskPayload).catch(error => {
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
          let emailPayload = {
            emails: this.taskEmail,
            //emails: ['drew.ahrens@caci.com'], // TESTING EMAIL
            body:
              '<h3>Please approve or reject the following.</h3><p>Name: ' +
              vm.form.Name +
              '</p><p>Form: ' +
              vm.form.Type +
              ' Request</p><br/><a href="' +
              url +
              '/Pages/Home.aspx#/security/edit/' +
              vm.securityForm.Id +
              '">Review ' +
              vm.form.Name +
              '</a><p><b>Please copy and paste the hyperlink into a modern browser such as Google Chrome if it is not your default.</b></p>',
            subject: '(F3I-2 Portal) Approve ' + vm.form.Type + ' Submission for ' + vm.form.Name
          }
          await Security.dispatch('sendEmail', emailPayload)
        }
        if (this.form.Type === 'CAC' && this.securityForm.DISSCheck === 'No') {
          // Send a notification to the CAC folks to perform the DISS Check
          let taskPayload = {
            Title: 'Perform DISS Check for ' + vm.form.Name,
            //AssignedToId: vm.userid, // Hardcoding the Security Group
            AssignedToId: this.taskUserId,
            Description: 'Perform DISS Check for ' + vm.form.Name,
            IsMilestone: false,
            PercentComplete: 0,
            TaskType: vm.form.Type + ' Request',
            TaskLink: '/security/edit/' + this.securityForm.Id + '?disscheck=true'
          }
          dissResults = await Todo.dispatch('addTodo', taskPayload).catch(error => {
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
          let emailPayload = {
            //emails: [this.taskEmail],
            emails: this.taskEmail,
            body:
              '<h3>Please perform a DISS check for the following.</h3> <p>Name: ' +
              this.form.Name +
              '</p><br/><a href="' +
              url +
              '/Pages/Home.aspx#/security/edit/' +
              this.securityForm.Id +
              '?disscheck=true">Review ' +
              this.form.Name +
              '</a><p><b>Please copy and paste the hyperlink into a modern browser such as Google Chrome if it is not your default.</b></p>',
            subject: '(F3I-2 Portal) DISS Check Request'
          }
          await Security.dispatch('sendEmail', emailPayload)
        }
        if (niprs.length > 0) {
          payload.NIPR = JSON.stringify({
            GovCompleteDate: vm.form.Historical === 'Yes' ? 'N/A' : '',
            GovSentDate: vm.form.Historical === 'Yes' ? 'N/A' : '',
            GovRejectDate: '',
            task: vm.form.Type === 'NIPR' ? results.data.d.Id : vm.securityForm.NIPR.task ? vm.securityForm.NIPR.task : '',
            forms: niprs
          })
        }
        if (siprs.length > 0) {
          payload.SIPR = JSON.stringify({
            GovCompleteDate: vm.form.Historical === 'Yes' ? 'N/A' : '',
            GovSentDate: vm.form.Historical === 'Yes' ? 'N/A' : '',
            GovRejectDate: '',
            task: vm.form.Type === 'SIPR' ? results.data.d.Id : vm.securityForm.SIPR.task ? vm.securityForm.SIPR.task : '',
            forms: siprs
          })
        }
        if (drens.length > 0) {
          payload.DREN = JSON.stringify({
            GovCompleteDate: vm.form.Historical === 'Yes' ? 'N/A' : '',
            GovSentDate: vm.form.Historical === 'Yes' ? 'N/A' : '',
            GovRejectDate: '',
            task: vm.form.Type === 'DREN' ? results.data.d.Id : vm.securityForm.DREN.task ? vm.securityForm.DREN.task : '',
            forms: drens
          })
        }
        if (jwics.length > 0) {
          payload.JWICS = JSON.stringify({
            GovCompleteDate: vm.form.Historical === 'Yes' ? 'N/A' : '',
            GovSentDate: vm.form.Historical === 'Yes' ? 'N/A' : '',
            GovRejectDate: '',
            task: vm.form.Type === 'JWICS' ? results.data.d.Id : vm.securityForm.JWICS.task ? vm.securityForm.JWICS.task : '',
            forms: jwics
          })
        }
        if (scis.length > 0) {
          payload.SCI = JSON.stringify({
            GovCompleteDate: vm.form.Historical === 'Yes' ? 'N/A' : '',
            GovSentDate: vm.form.Historical === 'Yes' ? 'N/A' : '',
            GovRejectDate: '',
            task: vm.form.Type === 'SCI' ? results.data.d.Id : vm.securityForm.SCI.task ? vm.securityForm.SCI.task : '',
            forms: scis
          })
        }
        if (cacs.length > 0) {
          payload.CAC = JSON.stringify({
            GovCompleteDate: vm.form.Historical === 'Yes' ? 'N/A' : '',
            GovSentDate: vm.form.Historical === 'Yes' ? 'N/A' : '',
            GovRejectDate: '',
            task: vm.form.Type === 'CAC' ? results.data.d.Id : vm.securityForm.CAC.task ? vm.securityForm.CAC.task : '',
            dissCheckTask: dissResults.data ? dissResults.data.d.Id : '',
            forms: cacs
          })
        }
        payload.DISSCheck = this.securityForm.DISSCheck ? this.securityForm.DISSCheck : false
        payload.Active = true
        payload.taskId = this.taskId
        payload.etag = this.securityForm.etag
        payload.uri = this.securityForm.uri
        await Security.dispatch('updateSecurityForm', payload)
          .then(results => {
            const notification = {
              type: 'success',
              title: 'Succesfully Uploaded Form',
              message: 'Uploaded form ' + vm.form.Type + ' for ' + vm.form.Name,
              push: true
            }
            vm.$store.dispatch('notification/add', notification, { root: true })
            vm.$store.dispatch('support/addActivity', '<div class="bg-success">' + vm.formType + ' Form Uploaded.</div>')
            vm.form.etag = parseInt(results.headers.etag)
            if (vm.formType === 'account') {
              vm.form.Type = vm.accountOptions[0]
            }
            // Clear form after submission
            if (vm.formType === 'cac') {
              vm.form.CACValid = ''
              vm.form.CACExpirationDate = ''
              vm.form.CACIssuedBy = ''
              vm.form.CACStatus = ''
            }
            if (vm.formType === 'sci') {
              vm.form.SCIIndocDate = ''
              vm.form.SCIType = ''
              vm.form.SCIStatus = ''
            }
            vm.form.Historical = 'No'
            vm.form.Company = vm.currentuser[0].Company ? vm.currentuser[0].Company : vm.companies[0]
            vm.form.setName = 'No'
            vm.form.FirstName = vm.currentFirstName
            vm.form.LastName = vm.currentLastName
            vm.form.Name = vm.currentFirstName + ' ' + vm.currentLastName
            vm.form.PersonnelID = vm.currentPersonnelID
            vm.person = ''
            vm.personnelFiltering = ''
            vm.files = []
            vm.fileSelected = null
            vm.fileBuffer = null
            vm.lockSubmit = false
            // need CAC and SCI clear here as well
            let uploadedFiles = document.querySelector('.e-upload-files')
            while (uploadedFiles.firstChild) {
              uploadedFiles.removeChild(uploadedFiles.firstChild)
            }
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
        // Run conditional on the results of the security form to either add or update security form
        // await Security.dispatch('')
        // Post to the SecurityForms list with the FirstName, LastName, PersonnelID, Company and the Types array [{ SIPR: /SIPR/:id, GovSentDate: '', GovCompleteDate: '' }]
      }
    },
    onFileSelect: async function(args) {
      args.filesData.forEach(fileData => {
        let file = {}
        file.fileSelected = fileData.name
        // Need to perform a check here to see what the file will be named, if the corresponding type already has it and then set a flag to overwrite or modify based on user interaction
        let pdfName = vm.form.PersonnelID + '-' + vm.form.Name + '-' + file.fileSelected
        if (console) console.log('FORMS: ' + JSON.stringify(vm.securityForm[vm.form.Type]))
        if (console) console.log('NEW FORM NAME: ' + pdfName)
        if (
          vm.securityForm[vm.form.Type].forms &&
          vm.securityForm[vm.form.Type].forms.filter(function(e) {
            return e.name === pdfName
          }).length > 0
        ) {
          vm.$bvModal
            .msgBoxConfirm('A form with the same name has already been uploaded. Would you like to overwrite it on submission? This action cannot be reversed.', {
              title: 'Please Confirm',
              size: 'sm',
              buttonSize: 'sm',
              okVariant: 'danger',
              okTitle: 'YES',
              cancelTitle: 'NO',
              footerClass: 'p-2',
              hideHeaderClose: false,
              centered: true
            })
            .then(async value => {
              // If they want to delete the original form then run the delete sequence, otherwise increment the number of times the name was added
              if (value == true) {
                // delete the original form from the library, remove it from the securityForm[vm.form.Type] array
                let currentForms = vm.securityForm[vm.form.Type].forms
                for (var n = 0; n < currentForms.length; n++) {
                  if (currentForms[n].name === pdfName) {
                    // pop the sucker off
                    if (console) console.log('DELETING OLD FORM')
                    await Security.dispatch('DeleteForm', { library: currentForms[n].library, name: currentForms[n].name })
                    vm.securityForm[vm.form.Type].forms.splice(n, 1)
                    vm.getFileBuffer(fileData.rawFile).then(function(buff) {
                      file.fileBuffer = buff
                      vm.files.push(file)
                    })
                  }
                }
                /*let matchedFile = vm.securityForm[vm.form.Type].forms.find(function(e) {
                  return (e.name = pdfName)
                })*/
              } else {
                // Add a Unix timestamp to the name and then add it the vm files
                if (console) console.log('NOT GOING TO REPLACE: ' + Date.now().toString())
                if (pdfName.length < 115) {
                  let currentDate = Date.now().toString()
                  file.fileSelected = pdfName.split('.')[0] + '-' + currentDate + '.' + pdfName.split('.')[1]
                } else {
                  let formLength = vm.securityForm[vm.form.Type].forms.length + 1
                  file.fileSelected = pdfName.split('.')[0] + '-' + formLength + '.' + pdfName.split('.')[1]
                }
                vm.getFileBuffer(fileData.rawFile).then(function(buff) {
                  file.fileBuffer = buff
                  vm.files.push(file)
                })
              }
            })
        } else {
          if (console) console.log('UPLOADING AS-IS')
          vm.getFileBuffer(fileData.rawFile).then(function(buff) {
            file.fileBuffer = buff
            vm.files.push(file)
          })
        }
      })
    },
    asyncForEach: async function(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
      }
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
