<template>
  <!-- Add Form where users can download master docs and upload the changed docs. -->
  <div>
    <!-- Use the upload travel docs as a template for uploading documents -->
    <!-- If user is SUBC, only load the related personnel to their company. 
         Otherwise, load companies into dropdown and on user selection load all personnel related to that company into a dropdown. -->
    <!-- on submission, split the personnel first name, last name out of the dropdown. -->
    <b-modal v-model="formAccount" ref="TripReport" centered hide-footer no-fade modal-class="animated bounceInLeft" @submit="onModalSave" @close="onModalHide">
      <template v-slot:modal-title>Upload Account Forms</template>
      <b-form>
        <b-form-group label="Company: " label-for="accountCompany" description="Select a Company">
          <!-- Need to load personnel dropdown after making selection of company -->
          <b-form-select v-if="!isSubcontractor" id="accountCompany" v-model="account.Company" @change="this.getPersonnelByCompany(account.Company)" :options="companies" required></b-form-select>
          <b-form-input v-if="isSubcontractor" id="accountCompany" v-model="account.Company" value="{{ account.Company }}" disabled></b-form-input>
        </b-form-group>
        <b-form-group label="Form Type: " label-for="accountType" description="Select an Account Type">
          <b-form-select id="accountType" v-model="account.Type" :options="accountTypes" required></b-form-select>
        </b-form-group>
        <div id="masterDocs" v-show="this.account.Type !== 'Select...'">
          <h3>Download Form Templates</h3>
          <ul>
            <li v-show="account.Type == 'NIPR'"><a href="{{ this.AccountMasterDocs + '/DD2875-NIPRNet.pdf' }}">DD2875</a></li>
            <li v-show="account.Type == 'NIPR'"><a href="{{ this.AccountMasterDocs + '/af4394-NIPR.pdf' }}">AF4394</a></li>
            <li v-show="account.Type == 'SIPR'"><a href="{{ this.AccountMasterDocs + '/DD2875-SIPRNet.pdf' }}">DD2875</a></li>
            <li v-show="account.Type == 'SIPR'"><a href="{{ this.AccountMasterDocs + '/SIPREssentialsSign.pdf' }}">SIPR Essentials</a></li>
            <li v-show="account.Type == 'DREN'"><a href="{{ this.AccountMasterDocs + '/DD2875-DREN.pdf' }}">DD2875</a></li>
            <li v-show="account.Type == 'JWICS'"><a href="{{ this.AccountMasterDocs + '/DD2875-JWICS.pdf' }}">DD2875</a></li>
            <li v-show="account.Type == 'JWICS'"><a href="{{ this.AccountMasterDocs + '/af4394-JWICS.pdf' }}">AF4394</a></li>
          </ul>
        </div>
        <b-col cols="4">Form submission is for another Person: </b-col>
        <b-col cols="8">
          <b-form-checkbox id="accountSetName" v-model="setName" value="Yes" unchecked-value="No" switch></b-form-checkbox>
        </b-col>
        <b-form-group v-if="setName === 'Yes'" label="Select Person: " label-for="accountPerson" description="Select the Person you are uploading a form for.">
          <b-form-select id="accountPerson" v-model="account.PersonnelID" :options="personnel"></b-form-select>
        </b-form-group>
        <b-form-group v-if="setName === 'No'">
          <b-form-input type="hidden" id="accountPerson" v-model="account.PersonnelID" value="{{ account.PersonnelID }}"></b-form-input>
        </b-form-group>
        <b-form-group label="Upload Account Form: " label-for="accountForm" description="Upload an Account Form">
          <ejs-uploader id="accountFileUpload" name="AccountFileUpload" :selected="onFileSelect" :multiple="false"></ejs-uploader>
        </b-form-group>
      </b-form>
    </b-modal>
  </div>
</template>
<script>
let SPCI = null,
  vm = null
if (window._spPageContextInfo) {
  SPCI = window._spPageContextInfo
}

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
      default: 'Account'
    }
  },
  computed: {
    workplans() {
      return Workplan.getters('DropDown')
    },
    companies() {
      return Company.getters('DropDown')
    },
    currentuser() {
      return User.getters('CurrentUser')
    },
    userid() {
      return User.getters('CurrentUserId')
    }
  },
  data: function() {
    return {
      AccountMasterDocs: this.url + '/_layouts/download.aspx?SourceUrl=' + this.url + '/SiteCollectionDocuments/',
      AccountsNIPRDocs: '/sites/f3i2/AccountsNIPR/',
      AccountsDRENDocs: '/sites/f3i2/AccountsDREN/',
      AccountsSIPRDocs: '/sites/f3i2/AccountsSIPR/',
      AccountsJWICSDocs: '/sites/f3i2/AccountsJWICS/',
      accountTypes: ['Select...', 'NIPR', 'SIPR', 'JWICS', 'DREN'],
      account: {
        Company: this.currentuser.Company,
        Type: '',
        PersonnelID: this.userid,
        setName: 'No'
      },
      formAccount: false,
      formCAC: false,
      formSCI: false,
      personnel: null,
      url: SPCI.webServerRelativeUrl
    }
  },
  mounted: function() {
    vm = this
    // load the appropriate Form
    this.checkType(this.formType)
    // get the personnel by Company
    this.getPersonnelByCompany(this.currentuser.Company)
  },
  methods: {
    checkType: function(type) {
      switch (type) {
        case 'account':
          vm.formAccount = true
          // Load the Account form
          // Get all of the Account forms from the master doc library and write them on a new tab with the following url:
          // https://mysite.sharepoint.com/_layouts/download.aspx?SourceUrl=https://mysite.sharepoint.com/documents/myfiie.pdf
          break
        case 'cac':
          vm.formCAC = true
          // Load CAC Form
          // Get all of the CAC forms from the master doc library and write them on a new tab with the following url:
          // https://mysite.sharepoint.com/_layouts/download.aspx?SourceUrl=https://mysite.sharepoint.com/documents/myfiie.pdf
          break
        case 'sci':
          vm.formSCI = true
          // Load SCI Form
          // Get all of the SCI forms from the master doc library and write them on a new tab with the following url:
          // https://mysite.sharepoint.com/_layouts/download.aspx?SourceUrl=https://mysite.sharepoint.com/documents/myfiie.pdf
          break
      }
    },
    getPersonnelByCompany: function(company) {
      Personnel.dispatch('getPersonnelByCompanyDropdown', company).then(function(results) {
        vm.personnel = results
      })
    }
  }
}
</script>
<style lang="scss"></style>
