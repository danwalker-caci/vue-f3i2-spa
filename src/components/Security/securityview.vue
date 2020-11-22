<template>
  <div>
    <!-- Display the information in a form with Approve / Reject buttons -->
    <b-container fluid class="contentHeight p-0" id="MainContainer">
      <!-- on submission, split the personnel first name, last name out of the dropdown. -->
      <div id="form" class="col-12 p-4" v-show="loaded">
        <b-row class="bg-warning text-black formheader">
          <b-col cols="4" class="p-0 text-left"></b-col>
          <b-col cols="4" class="p-0 text-center font-weight-bold">
            <h3>{{ formTitle }}</h3>
          </b-col>
        </b-row>
        <b-card no-body class="p-3">
          <b-row>
            <b-form-group label="Name: ">
              <b-form-input id="name" v-model="name" disabled></b-form-input>
            </b-form-group>
            <b-form-group label="Company: ">
              <b-form-input id="company" v-model="company" disabled></b-form-input>
            </b-form-group>
          </b-row>
          <b-row v-if="SCIType !== null">
            <b-form-group label="SCI Type: ">
              <b-form-input id="SCIType" v-model="SCIType" disabled></b-form-input>
            </b-form-group>
          </b-row>
          <b-row>
            <b-embed type="iframe" :src="formUrl"></b-embed>
          </b-row>
          <b-form-row>
            <b-col cols="10"></b-col>
            <b-col cols="2">
              <b-button variant="danger" class="formbutton" @click="rejectForm">Reject</b-button>
              <b-button variant="success" class="formbutton" @click="approveForm">Approve</b-button>
            </b-col>
          </b-form-row>
        </b-card>
      </div>
    </b-container>
  </div>
</template>
<script>
let vm = null
import Security from '@/models/Security'

export default {
  name: 'ViewSecurityForms',
  props: {
    // Switches the form type between Account, CAC and SCI
    formType: {
      type: String
    },
    id: {
      type: Number
    }
  },
  data: function() {
    return {
      formTitle: 'Review ' + this.type + ' Submission',
      name: '',
      company: '',
      formUrl: '',
      loaded: false,
      userSubmittedId: null,
      SCIType: null
    }
  },
  mounted: async function() {
    vm = this
    console.log(this.id)
    console.log(this.formType)
    if (this.id && this.formType) {
      this.loadForm()
    }
  },
  methods: {
    loadForm: async function() {
      let library = ''
      switch (this.formType.toLowerCase()) {
        case 'nipr':
          // set the url for the post of file
          library = 'AccountsNIPR'
          break
        case 'sipr':
          library = 'AccountsSIPR'
          break
        case 'dren':
          library = 'AccountsDREN'
          break
        case 'jwics':
          library = 'AccountsJWICS'
          break
        case 'cac':
          library = 'CACForms'
          break
        case 'sci':
          library = 'SCIForms'
          break
      }
      let payload = {
        library: library,
        id: this.id
      }
      Security.dispatch('getFormByTypeId', payload).then(function(results) {
        vm.name = results[0].name
        vm.company = results[0].company
        vm.formUrl = results[0].formUrl
        vm.userSubmittedId = results[0].PersonnelID
        vm.SCIType = results[0].SCIType ? results[0].SCIType : null
        console.log(JSON.stringify(results[0]))
        vm.loaded = true
        // Hold anything else that should be used to update the original post
      })
    }
  },
  approveForm: async function() {
    // Need to post an Update to the form library
  },
  rejectForm: async function() {
    // Delete the form from the library
    // re-route back to the tracker/type
    vm.$router.push('/security/tracker/' + vm.type)
  }
}
</script>
<style lang="scss">
.formbutton {
  margin: 0.75rem;
}
</style>
