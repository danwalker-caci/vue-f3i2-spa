<template>
  <b-container fluid class="contentHeight p-0" id="MainContainer">
    <b-toast id="busy-toast" variant="light-blue" solid no-auto-hide>
      <template v-slot:toast-title>
        <div class="d-flex flex-grow-1 align-items-baseline">
          <b-img blank blank-color="#ff0000" class="mr-2" width="12" height="12"></b-img>
          <strong class="mr-auto">{{ busyTitle }}</strong>
        </div>
      </template>
      <b-progress :variant="busyVariant" :value="busyValue" :max="busyMax" show-progress animated></b-progress>
    </b-toast>
    <b-modal title="Persons Missing in Security" id="PerSecResults" ok-only ok-variant="secondary" ok-title="Close">
      <p>These individuals are not aligned between the Security and Personnel Lists. Please manually review to ensure data integrity.</p>
      <b-table-lite id="PersonnelVSecurity" :items="persVSecurityResults" :fields="persVSecurityFields" striped></b-table-lite>
      <p>Here are the duplicates in the Personnel List.</p>
      <b-table-lite id="duplicatePersons" :items="duplicatePersonResults" :fields="duplicatePersonFields" striped></b-table-lite>
      <p>Here are the duplicates in the Security List.</p>
      <b-table-lite id="duplicatePersons" :items="duplicateSecurityResults" :fields="duplicateSecurityFields" striped></b-table-lite>
    </b-modal>
    <b-row class="mb-1">
      <b-col cols="3">
        <b-card border-variant="success" text-variant="dark">
          <template v-slot:header>
            <h3 class="mb-0">
              <span class="ml-0">Subcontractor Actions</span>
              <font-awesome-icon fas icon="user-shield" class="icon text-danger float-right ml-1"></font-awesome-icon>
            </h3>
          </template>
          <b-card-body>
            <b-row class="p-0 m-0">
              <b-button ref="UpdateSubs" variant="success" @click="UpdateSubs">Update Subs</b-button>
            </b-row>
          </b-card-body>
        </b-card>
      </b-col>
      <b-col cols="3">
        <b-card border-variant="success" text-variant="dark">
          <template v-slot:header>
            <h3 class="mb-0">
              <span class="ml-0">MSR Actions</span>
              <font-awesome-icon fas icon="user-shield" class="icon text-danger float-right ml-1"></font-awesome-icon>
            </h3>
          </template>
          <b-card-body>
            <b-row class="p-0 m-0">
              <b-button ref="createMSR" variant="success" @click="createMSRs">Create MSRs</b-button>
              <b-button ref="cloneMSRs" variant="warning" class="ml-1" @click="btnCloneMSRsClick">Clone MSRs</b-button>
            </b-row>
          </b-card-body>
        </b-card>
      </b-col>
      <b-col cols="3">
        <b-card border-variant="success" text-variant="dark">
          <template v-slot:header>
            <h3 class="mb-0">
              <span class="ml-0">Travel Actions</span>
              <font-awesome-icon fas icon="helicopter" class="icon text-danger float-right ml-1"></font-awesome-icon>
            </h3>
          </template>
          <b-card-body>
            <b-row class="p-0 m-0">
              <b-button ref="btn_LateTripReports" variant="success" @click="btn_LateTripReports_Clicked">Calculate Late TRs</b-button>
              <span class="badge badge-xs badge-danger">{{ tripcount }}</span>
            </b-row>
          </b-card-body>
        </b-card>
      </b-col>
      <b-col cols="3">
        <b-card border-variant="success" text-variant="dark">
          <template v-slot:header>
            <h3 class="mb-0">
              <span class="ml-0">Developer Actions</span>
              <font-awesome-icon fas icon="user-shield" class="icon text-danger float-right ml-1"></font-awesome-icon>
            </h3>
          </template>
          <b-card-body>
            <b-row class="p-0 m-1">
              <b-button :disabled="travel.length <= 0" ref="UpdateTravel" variant="success" @click="UpdateTravel">Update Travelers</b-button>
              <b-button ref="InstallSecurity" variant="danger" @click="InstallSecurity" class="ml-1">Install Security</b-button>
              <!-- <b-button ref="btnPlayground" variant="success" @click="btnPlaygroundClick">Playground</b-button> -->
            </b-row>
            <b-row class="p-0 m-1">
              <b-button ref="migrateSecurityInfo" variant="success" @click="migrateSecurityInfo" class="ml-1">Migrate Security Info</b-button>
            </b-row>
            <b-row class="p-0 m-1">
              <b-button ref="UpdatePermissions" variant="success" @click="UpdatePermissions" class="ml-1">Update Permissions</b-button>
            </b-row>
            <b-row class="p-0 m-1">
              <b-button ref="AddUsersToGroups" variant="success" @click="AddUsersToGroups" class="ml-1">Add Users To Groups</b-button>
            </b-row>
            <!-- <b-row class="p-0 m-0">
              <b-form-input id="txtUserId" ref="txtUserId" v-model="UserId" placeholder="User Id"></b-form-input>
              <b-button ref="getUserInfo" variant="success" @click="getUserInfo" class="ml-1">Get User Info By Id</b-button>
            </b-row> -->
          </b-card-body>
        </b-card>
      </b-col>
      <b-col cols="3">
        <b-card border-variant="success" text-variant="dark">
          <template v-slot:header>
            <h3 class="mb-0">
              <span class="ml-0">Personnel Actions</span>
              <font-awesome-icon fas icon="people-arrow" class="icon text-danger float-right ml-1"></font-awesome-icon>
            </h3>
          </template>
          <b-card-body>
            <b-row class="p-0 m-0">
              <b-button ref="checkPersonnelSecurity" :disabled="disablePersonnelSecurityCheck" variant="success" @click="checkPersonnelSecurity">Check Personnel Versus Security</b-button>
            </b-row>
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import Vue from 'vue'
import MSR from '@/models/MSR'
import User from '@/models/User'
import Workplan from '@/models/WorkPlan'
import Personnel from '@/models/Personnel'
import Travel from '@/models/Travel'
import Security from '@/models/Security'
import axios from 'axios'

let vm = null
let SPCI = null
if (window._spPageContextInfo) {
  SPCI = window._spPageContextInfo
}
let baseurl = SPCI.webAbsoluteUrl

export default {
  name: 'admin',
  props: {
    mode: {
      type: String,
      default: 'home'
    }
  },
  errorCaptured(err, vm, info) {
    const notification = {
      type: 'danger',
      title: 'Error in Admin Home ' + err,
      message: info,
      push: true
    }
    this.$store.dispatch('notification/add', notification, { root: true })
  },
  computed: {
    userloaded() {
      return User.getters('Loaded')
    },
    loaded() {
      return MSR.getters('Loaded')
    },
    workplansloaded() {
      return Workplan.getters('Loaded')
    },
    personnelloaded() {
      return Personnel.getters('Loaded')
    },
    user() {
      return User.getters('CurrentUser')
    },
    userid() {
      return User.getters('CurrentUserId')
    },
    allmsrs() {
      return MSR.getters('allMSRs')
    },
    allpersonnel() {
      return Personnel.getters('allPersonnel')
    },
    allworkplans() {
      return Workplan.getters('allWorkplans')
    },
    allsecurity() {
      return Security.getters('SecurityForms')
    },
    travel() {
      return Travel.getters('allTravel')
    },
    testtrips() {
      return Travel.getters('testtrips')
    },
    testtripsloaded() {
      return Travel.getters('testtripsloaded')
    },
    appversion() {
      return User.getters('AppVersion')
    },
    isDeveloper() {
      return User.getters('isDeveloper')
    },
    isPCA() {
      return User.getters('isPCA')
    },
    isAdmin() {
      return User.getters('isSubcontractor')
    }
  },
  data: function() {
    return {
      UserId: null,
      pageSettings: { pageSize: 30 },
      formheight: 0,
      WorkplanNumber: '',
      viewTitle: 'MSR View for WP ',
      busyTitle: 'Getting Data. Please Wait.',
      busyMax: 100,
      busyValue: 0,
      busyVariant: 'success',
      Company: '',
      Email: '',
      Month: '',
      Year: 2020,
      msrs: [],
      workplans: [],
      temp: [],
      count: 0,
      total: 0,
      selecteddata: null,
      ManagerEmail: '',
      cloneMSR: false,
      disablePersonnelSecurityCheck: false,
      showOkPersSecurityAlert: false,
      duplicatePersonResults: [],
      duplicatePersonFields: [{ key: 'FirstName' }, { key: 'LastName' }, { key: 'Company' }],
      duplicateSecurityResults: [],
      duplicateSecurityFields: [{ key: 'FirstName' }, { key: 'LastName' }, { key: 'Company' }],
      persVSecurityResults: [],
      persVSecurityFields: [{ key: 'id' }, { key: 'FirstName' }, { key: 'LastName' }, { key: 'Company' }],
      dataMap: [],
      tripcount: 0
    }
  },
  mounted: function() {
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function() {
      console.log('sp.js is loaded')
    })
    vm = this
    Security.dispatch('getDigest')
    User.dispatch('getDigest')
    MSR.dispatch('getDigest')
    Travel.dispatch('getDigest')
    // Travel.dispatch('getTRIPS')
    const notification = {
      type: 'info',
      title: 'Getting MSRs',
      message: 'Please Wait...',
      push: false
    }
    this.$store.dispatch('notification/add', notification, { root: true })
    Workplan.dispatch('getWorkplans').then(function() {
      MSR.dispatch('getMSRs').then(function() {
        vm.$options.interval = setInterval(vm.waitForMSRs, 1000)
      })
    })
  },
  beforeDestroy() {
    this.$store.dispatch('support/setLegendItems', [])
  },
  methods: {
    async getUserInfo() {
      let payload = {}
      payload.id = Number(this.UserId)
      let response = await User.dispatch('getUserById', payload)
      payload.login = response.data.d.LoginName
      response = await User.dispatch('getUserProfileFor', payload)
      console.log('User Profile Results: ' + response)
    },
    async AddUsersToGroups() {
      let url = "https://infoplus.caci.com/sites/f3i2/_api/web/lists/getbytitle('Companies')/items?$select=*"
      let response = await axios.get(url, {
        headers: {
          accept: 'application/json;odata=verbose'
        }
      })
      console.log('RESPONSE: ' + response)
      let j = response.data.d.results
      for (let i = 0; i < j.length; i++) {
        let company = j[i]['Title']
        url = "https://infoplus.caci.com/sites/f3i2/_api/web/sitegroups/getbyname('" + company + "')/id"
        let response = await axios.get(url, {
          headers: {
            accept: 'application/json;odata=verbose'
          }
        })
        let groupid = response.data.d.Id
        url = "https://infoplus.caci.com/sites/f3i2/_api/web/lists/getbytitle('Personnel')/items?$select=Company,UserAccount/Title,UserAccount/Id&$expand=UserAccount&$filter=(Company eq '" + company + "')"
        response = await axios.get(url, {
          headers: {
            accept: 'application/json;odata=verbose'
          }
        })
        let k = response.data.d.results
        for (let l = 0; l < k.length; l++) {
          let userId = k[l]['UserAccount']['Id']
          let userTitle = String(k[l]['UserAccount']['Title'])
          if (userTitle != 'undefined') {
            // console.log('COMPANY: ' + company + ', User: ' + userId + ', ' + userTitle + ', ' + userTitle.length)
            url = 'https://infoplus.caci.com/sites/f3i2/_api/Web/GetUserById(' + userId + ')'
            let response = await axios.get(url, {
              headers: {
                accept: 'application/json;odata=verbose'
              }
            })
            let m = response.data.d
            let login = m.LoginName
            console.log('LOGIN NAME: ' + login)
            // add user to group
            response = await axios.request({
              url: SPCI.webServerRelativeUrl + '/_api/contextinfo',
              method: 'post',
              headers: { Accept: 'application/json; odata=verbose' }
            })
            let digest = response.data.d.GetContextWebInformation.FormDigestValue
            url = 'https://infoplus.caci.com/sites/f3i2/_api/web/sitegroups(' + groupid + ')/users'
            let headers = {
              'Content-Type': 'application/json;odata=verbose',
              Accept: 'application/json;odata=verbose',
              'X-RequestDigest': digest,
              'X-HTTP-Method': 'POST'
            }
            let config = {
              headers: headers
            }
            let body = {
              __metadata: { type: 'SP.User' },
              LoginName: login
            }
            try {
              response = await axios.post(url, body, config)
            } catch (error) {
              console.log('Error Adding User to Group: ' + login + ', ' + groupid)
            }
            console.log(response)
          }
        }
      }
    },
    async UpdatePermissions() {
      let url = "https://infoplus.caci.com/sites/f3i2/_api/web/lists/getbytitle('Workplans')/items?$select=*"
      let response = await axios.get(url, {
        headers: {
          accept: 'application/json;odata=verbose'
        }
      })
      console.log('RESPONSE: ' + response)
      let j = response.data.d.results
      for (let i = 0; i < j.length; i++) {
        let id = j[i]['Id']
        let subs = j[i]['Subs']
        if (subs && subs.length > 3) {
          let k = subs.split(', ')
          for (let l = 0; l < k.length; l++) {
            // get company group id
            let url = "https://infoplus.caci.com/sites/f3i2/_api/web/sitegroups/getbyname('" + k[l] + "')/id"
            let response = await axios.get(url, {
              headers: {
                accept: 'application/json;odata=verbose'
              }
            })
            let groupid = response.data.d.Id
            // break inheritance
            response = await axios.request({
              url: SPCI.webServerRelativeUrl + '/_api/contextinfo',
              method: 'post',
              headers: { Accept: 'application/json; odata=verbose' }
            })
            let digest = response.data.d.GetContextWebInformation.FormDigestValue
            url = "https://infoplus.caci.com/sites/f3i2/_api/web/lists/getByTitle('WorkPlans')/items("
            url += id
            url += ')/breakroleinheritance(copyRoleAssignments=true, clearSubscopes=true)'
            response = await axios.request({
              url: url,
              method: 'post',
              headers: {
                Accept: 'application/json; odata=verbose',
                'Content-Type': 'application/json;odata=verbose',
                'X-RequestDigest': digest
              }
            })
            // console.log('ID: ' + groupid + ', SUB: ' + k[l] + ', RESPONSE: ' + response)
            url = "https://infoplus.caci.com/sites/f3i2/_api/web/lists/getByTitle('WorkPlans')/items("
            url += id
            url += ')/roleassignments/addroleassignment(principalid=' + groupid + ',roleDefId=1073741826)'
            response = await axios.request({
              url: url,
              method: 'post',
              headers: {
                Accept: 'application/json; odata=verbose',
                'Content-Type': 'application/json;odata=verbose',
                'X-RequestDigest': digest
              }
            })
            console.log('ID: ' + groupid + ', SUB: ' + k[l] + ', RESPONSE: ' + response)
          }
        }
      }
    },
    InstallSecurity() {
      var ctx = SP.ClientContext.get_current() // SP is SharePoint library and is expected to be loaded. SP object added to globals in package.json
      var uca
      uca = ctx.get_web().get_userCustomActions()
      ctx.load(uca)
      let url = 'portalsecurity.js'
      let sequence = 1010
      var action = uca.add()
      action.set_location('ScriptLink')
      action.set_title(url)
      action.set_scriptSrc('~site/SiteAssets/html/static/js/' + url)
      action.set_sequence(sequence)
      action.update()
      ctx.load(action)
      ctx.executeQueryAsync(
        function() {
          console.log('Install Succeeded.')
        },
        function(sender, args) {
          console.log('Install Failed: ' + args.get_message())
        }
      )
    },
    async checkPersonnelSecurity() {
      this.disablePersonnelSecurityCheck = true
      this.persVSecurityResults = []
      await Personnel.dispatch('getDigest')
      await Security.dispatch('getDigest')
      await Personnel.dispatch('getPersonnel')
      await Security.dispatch('getSecurityForms')
      if (this.allpersonnel.length !== this.allsecurity.length) {
        // Loop through and find based on PersonnelID
        this.allpersonnel.forEach(person => {
          var result = vm.allsecurity.find(security => {
            return security.PersonnelId === person.Id
          })
          var duplicateSecurity = []
          if (result === undefined) {
            vm.persVSecurityResults.push({ id: person.id, FirstName: person.FirstName, LastName: person.LastName, Company: person.Company })
          } else {
            duplicateSecurity.push({ id: person.id, FirstName: person.FirstName, LastName: person.LastName, Company: person.Company })
          }
          var duplicatePersons = []
          var duplicatePerson = vm.allpersonnel.find(person2 => {
            return person.LastName === person2.LastName && person.Company === person2.Company
          })
          if (duplicatePerson !== undefined) {
            duplicatePersons.push({ id: person.id, FirstName: person.FirstName, LastName: person.LastName, Company: person.Company })
          }
          if (duplicatePersons.length > 1) {
            vm.duplicatePersonResults.push({ FirstName: person.FirstName, LastName: person.LastName, Company: person.Company })
          }
          if (duplicateSecurity.length > 1) {
            vm.duplicateSecurityResults.push({ FirstName: person.FirstName, LastName: person.LastName, Company: person.Company })
          }
        })
        console.log('Results from checking Personnel against Security: ' + JSON.stringify(this.persVSecurityResults))
        if (this.persVSecurityResults.length > 0) {
          this.persVSecurityResults.reverse()
          this.$bvModal.show('PerSecResults')
        }
      } else {
        // This is fine.
        this.showOkPersSecurityAlert = true
      }
      this.disablePersonnelSecurityCheck = false
    },
    async btn_LateTripReports_Clicked() {
      // calculate late trip reports
      Travel.dispatch('getDigest').then(function() {
        Travel.dispatch('getTripsForLateReport').then(function() {
          vm.$options.interval = setInterval(vm.waitForTestTrips, 1000)
        })
      })
    },
    waitForTestTrips: function() {
      if (this.testtripsloaded) {
        clearInterval(this.$options.interval)
        if (this.testtrips.length > 0) {
          this.tripcount = this.testtrips.length
          for (let i = 0; i < this.testtrips.length; i++) {
            console.log('STATUS: ' + this.testtrips[i].Status)
            if (this.testtrips[i].Status == 'Cancelled' || this.testtrips[i].Status == 'Postponed') {
              // do nothing
              console.log('POSTPONED OR CANCELLED')
            } else {
              if (this.testtrips[i].TripReport == 'NULL') {
                // is it due or late?
                if (this.$moment(this.testtrips[i].EndTime).isBefore(this.$moment().subtract(7, 'days'))) {
                  // late. Update Status and then check for needed emails
                  let payload = {}
                  payload.uri = this.testtrips[i].uri
                  payload.etag = this.testtrips[i].etag
                  payload.status = 'ReportLate'
                  Travel.dispatch('updateTravelStatus', payload)
                  this.sendTREmails(this.testtrips[i])
                } else {
                  // due
                  let payload = {}
                  payload.uri = this.testtrips[i].uri
                  payload.etag = this.testtrips[i].etag
                  payload.status = 'ReportDue'
                  Travel.dispatch('updateTravelStatus', payload)
                }
              }
            }
          }
        }
      }
    },
    fileMenuBeforeOpen: function() {
      var spreadsheet = this.$refs.ss_Test
      // Because the file menu items are created dynamically, you need to perform the hide or show and enable/disable operations
      // under filemenu before open event.
      // Hiding the `Save As` and `Open` item.
      spreadsheet.hideFileMenuItems(['Save As', 'Open'])
      // Set disable state to `New` item. You can perform any file menu items customization by specifying the item id,
      // if it has more than one same item text. Set the last argument `isUniqueId` as true for using the item id.
      spreadsheet.enableFileMenuItems([`${spreadsheet.ej2Instances.element.id}_New`], false, true)
    },
    async sendTREmails(item) {
      // calculate the need to send an email based on the lateness of the report
      // let AllEmails = ['mogaard@caci.com', 'sheila.jackson@caci.com']
      let AllEmails = ['alexie.hazen@caci.com']
      let end = this.$moment(item.EndTime)
      let today = this.$moment()
      let diff = today.diff(end, 'days')
      console.log('DIFF: ' + diff)
      let wp = item.WorkPlanNumber
      let manager = await Workplan.dispatch('getManagerByWPNumber', wp)
      if (manager[0]) {
        let email = manager[0]['Manager']['EMail']
        console.log('MGR EMAIL: ' + email)
        switch (true) {
          case diff == 7:
            AllEmails = [email]
            break

          case diff > 7:
            AllEmails.push(email)
            break
        }
      } else {
        // could not get manager email
      }
      // send email
      let payload = {}
      let body = ''
      body += '<p>Hello ' + manager[0]['Manager']['Title'] + ',</p><p></p>'
      body += '<p>A Trip Report for ' + item.IndexNumber + ' has not been uploaded and is now late.</p><p></p>'
      body += '<p>Please click the link below for more details.</p><p></p>'
      body += '<p><a href="' + baseurl + '/Pages/Home.aspx#/travel/page/tracker?IndexNumber=' + item.IndexNumber + '">Travel Tracker</a></p>'
      // body += '<p><a href="' + baseurl + '/Pages/DevA.aspx#/travel/page/tracker?IndexNumber=' + item.IndexNumber + '">Travel Tracker</a></p>'
      payload.To = AllEmails
      payload.Subject = 'Late TripReport'
      payload.Body = body
      /* User.dispatch('SendEmail', payload).then(function() {
        console.log('SendEmail Called')
      }) */
    },
    waitForMSRs: function() {
      if (this.loaded && this.workplansloaded) {
        clearInterval(this.$options.interval)
        // loop workplans to see what ones to create MSRs from
        for (let i = 0; i < this.allworkplans.length; i++) {
          if (this.$moment(this.allworkplans[i].POPEnd).isAfter(this.$moment())) {
            this.temp.push(this.allworkplans[i])
          }
        }
        if (console) {
          console.log('WAIT FOR MSR COMPLETE')
        }
        console.log(this.cloneMSR)
        if (this.cloneMSR) {
          this.cloneMSRs()
        }
      }
    },
    btnCloneMSRsClick: function() {
      this.cloneMSR = true
      this.UpdateSubs()
    },
    btnCreateMSRsClick: function() {
      this.busyTitle = 'Creating MSRs'
      this.busyMax = this.temp.length
      this.busyValue = 0
      this.$bvToast.show('busy-toast')
      this.createMSRs()
    },
    async createMSRs() {
      // TODO: Let the user know we are doing something
      this.busyTitle = 'Creating MSRs'
      this.busyMax = this.temp.length
      this.busyValue = 0
      this.$bvToast.show('busy-toast')
      if (this.temp.length > 0) {
        // still have workplans so keep going
        let item = this.temp.pop()
        this.busyValue = this.busyMax - this.temp.length
        // create the item
        await MSR.dispatch('createMSR', item)
        // will wait for the item
        // console.log('CREATE MSR RESPONSE: ' + response)
        // call the function again to keep going until all msrs are created.
        this.createMSRs()
      } else {
        // Done creating items so go get them for the grid
        // TODO: Let the user know we are done. Do we just refresh the page here or just show them the new MSR's?
        this.$bvToast.hide('busy-toast')
        MSR.dispatch('getMSRs').then(function() {
          vm.$options.interval = setInterval(vm.waitForMSRs, 1000)
        })
      }
    },
    async asyncForEach(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
      }
    },
    async cloneMSRs() {
      // First create new MSRS and add to the data Map
      let currentMSRs = await MSR.dispatch('getMSRs')
      await vm.asyncForEach(currentMSRs, async item => {
        console.log(item.WorkplanNumber)
        let workplan = await Workplan.dispatch('getPOPByWPNumber', item.WorkplanNumber)
        // validate that MSR needs to be created by checking the Workplan PO month
        if (new Date(workplan[0].POPEnd).valueOf() > Date.now()) {
          let data = { originalId: item }
          var newMSR = {
            Number: item.WorkplanNumber,
            Title: item.WorkplanTitle,
            Funding: item.Funding,
            Staffing: item.Staffing,
            CostReport: item.CostReport,
            TravelAccomplished: item.TravelAccomplished,
            TravelPlanned: item.TravelPlanned,
            Deliverables: item.Deliverables
          }
          await MSR.dispatch('createMSR', newMSR).then(results => {
            // will wait for the item
            data.newId = results.data.d
            vm.dataMap.push(data)
          })
        }
      })
      await this.cloneSubLists()
    },
    async cloneSubLists() {
      // Then loop through the data map adding each of the relaed content
      if (vm.dataMap.length > 0) {
        vm.busyTitle = 'Cloning MSRs'
        vm.busyMax = vm.dataMap.length
        vm.busyValue = 0
        vm.$bvToast.show('busy-toast')
        var n = vm.dataMap.length
        await vm.asyncForEach(vm.dataMap, async data => {
          vm.busyValue = vm.busyMax - n
          console.log(`Processing ${n}: ${data}`)
          await vm.duplicateAccomplishment(data)
          await vm.duplicateAssumption(data)
          await vm.duplicateDeliverables(data)
          await vm.duplicateOpportunities(data)
          await vm.duplicatePlans(data)
          await vm.duplicateRisks(data)
          n--
        })
        this.cloneMSR = false
        this.$bvToast.hide('busy-toast')
        // Done creating items so go get them for the grid
        MSR.dispatch('getMSRs').then(function() {
          vm.$options.interval = setInterval(vm.waitForMSRs, 1000)
        })
      }
    },
    UpdateSubs: async function() {
      // loop through the workplans and then loop through the personnel list like in the manning page to get all unique subs for each workplan.
      // let users know this is happening
      this.temp = []
      this.busyTitle = 'Geting Workplan and Personnel Data'
      this.busyMax = 100
      this.$bvToast.show('busy-toast')
      Workplan.dispatch('getDigest')
      await Workplan.dispatch('getWorkplans')
      this.busyValue = 50
      await Personnel.dispatch('getPersonnel')
      this.busyMax = this.allworkplans.length
      this.busyTitle = 'Creating Data For Subs'
      for (let a = 0; a < this.allworkplans.length; a++) {
        this.busyValue = a
        let subs = '' // String(this.allworkplans[a]['Subs']) // will contain the current list of subs on this workplan
        // if (subs == 'null') { subs = '' }
        let wpn = this.allworkplans[a]['Number']
        // loop through the personnel list and get the company name and workplan for each user.
        // test the workplan and then test that the company is in the sub list and if not add it
        for (let b = 0; b < this.allpersonnel.length; b++) {
          let company = String(this.allpersonnel[b]['Company'])
          company = company.trim()
          // we do not need CACI employees as they are not subs for the MSR so we can skip them
          if (company != 'CACI') {
            // console.log('COMPANY: ' + company)
            let wpdata = this.allpersonnel[b]['WPData']
            if (wpdata != null || wpdata.length > 5) {
              try {
                wpdata = JSON.parse(wpdata)
                // need to loop wpdata to see if this user supports this workplan
                for (let c = 0; c < wpdata.length; c++) {
                  let ps = Number(wpdata[c]['PercentSupport'])
                  // console.log('PERCENT SUPPORT: ' + wpdata.PercentSupport)
                  if (ps > 0) {
                    if (wpdata[c]['WorkplanNumber'] == wpn) {
                      if (!Vue._.includes(subs, company)) {
                        if (subs.length > 0) {
                          subs = subs + ', ' + company
                        } else {
                          subs = company
                        }
                      }
                    }
                  }
                }
              } catch (err) {
                // console.log(err)
              }
            } else {
              // console.log('NO WORKPLAN DATA FOR: ' + this.allpersonnel[b]['LastName'])
            }
          }
        }
        // subs should now have all subs that support the workplan so then go update the data in SharePoint
        if (console) {
          console.log('SUBS LENGTH: ' + subs.length)
        }
        if (subs.length > 0) {
          this.temp.push({
            Number: wpn,
            etag: this.allworkplans[a]['etag'],
            uri: this.allworkplans[a]['uri'],
            id: this.allworkplans[a]['Id'],
            Subs: subs
          })
        }
      }
      // We now have worplan numbers with their respective subs so go update the workplans with that data
      this.busyValue = 0
      this.busyMax = this.temp.length
      this.busyTitle = 'Updating Workplan Sub Data'
      await this.UpdateWorkplans()
    },
    async UpdateWorkplans() {
      if (this.temp.length > 0) {
        // still have workplans so keep going
        let item = this.temp.pop()
        this.busyValue += 1
        // create the item
        await Workplan.dispatch('saveWorkplanSubs', item)
        // will wait for the item
        // call the function again to keep going until all msrs are created.
        this.UpdateWorkplans()
      } else {
        // Done creating items
        this.$bvToast.hide('busy-toast')
        Workplan.dispatch('getWorkplans').then(function() {
          // reload workplans
          MSR.dispatch('getMSRs').then(function() {
            vm.$options.interval = setInterval(vm.waitForMSRs, 1000)
          })
        })
      }
    },
    async UpdateTravel() {
      // have to create the 'TravelersText' for all travel with travelers
      const notification = {
        type: 'danger',
        title: 'Getting Travel',
        message: 'Please Wait...',
        push: false
      }
      this.$store.dispatch('notification/add', notification, { root: true })
      this.$store.dispatch('support/addActivity', '<div class="bg-danger text-white">Admin UpdateTravel completed. ' + this.travel.length + '</div>')
      for (let i = 0; i < this.travel.length; i++) {
        let e = []
        e.push(this.travel[i])
        Travel.dispatch('editTraveler', e)
      }
    },
    async migrateSecurityInfo() {
      // First grab all of the information from the personnel
      if (this.personnelloaded && this.allpersonnel.length > 0) {
        this.asyncForEach(this.allpersonnel, async person => {
          // get the relevant fields and then addSecurityForm
          // Relevant fields:
          // CACExpirationDate, CACRequestDate, CACStatus, SCIFormStatus, SCIFormSubmitted, SCIFormType
          let currentSecurity = await Security.dispatch('getSecurityFormByPersonnelId', { PersonnelID: person.id })
          let oldSecurityUrl = SPCI.webServerRelativeUrl + "/_api/Web/Lists/getbytitle('SecurityForms')/items?$filter=(PersonnelID eq " + person.id + ')'
          let oldsecurity = await axios({
            method: 'GET',
            url: oldSecurityUrl,
            headers: {
              Accept: 'application/json;odata=verbose'
            }
          })
          if (oldsecurity.data.d.results[0]) {
            this.updateSecurityForm({
              Id: currentSecurity.id,
              Active: person.Active,
              Title: person.Id + '-' + person.FirstName + ' ' + person.LastName,
              PersonnelID: person.Id,
              FirstName: person.FirstName,
              LastName: person.LastName,
              Company: person.Company,
              PRDueDate: oldsecurity.data.d.results[0].SCIPR ? oldsecurity.data.d.results[0].SCIPR : null,
              CEDate: oldsecurity.data.d.results[0].SCICE ? oldsecurity.data.d.results[0].SCICE : null,
              SCIStatus: oldsecurity.data.d.results[0].SCIStatus,
              SCIFormType: oldsecurity.data.d.results[0].SCIFormType, // Add field in
              SCIFormSubmitted: oldsecurity.data.d.results[0].SCIFormSubmitted ? oldsecurity.data.d.results[0].SCIFormSubmitted : null, // Add field in
              CACExpirationDate: oldsecurity.data.d.results[0].CACExpirationDate ? oldsecurity.data.d.results[0].CACExpirationDate : null,
              CACRequestDate: oldsecurity.data.d.results[0].CACRequestDate ? oldsecurity.data.d.results[0].CACRequestDate : null,
              CACStatus: oldsecurity.data.d.results[0].CACStatus,
              CACValid: oldsecurity.data.d.results[0].CACStatus === 'Issued' || oldsecurity.data.d.results[0].CACStatus === 'Non-F3I2 CAC' ? 'Yes' : 'No',
              etag: currentSecurity.etag,
              uri: currentSecurity.uri
            })
          }
        })
      } else {
        console.log('PERSONNEL NOT LOADED...')
        Personnel.dispatch('getPersonnel').then(() => {
          vm.migrateSecurityInfo()
        })
      }
    },
    async updateSecurityForm(data) {
      Security.dispatch('updateSecurityForm', data)
        .then(results => {
          console.log('Migrate Security: ' + results)
        })
        .catch(e => {
          console.log('ERROR: ' + e)
        })
    }
  }
}
</script>

<style lang="scss">
.msr-dialog {
  max-width: 1600px !important;
}
.msr-content {
  min-height: calc(100vh - 3.5rem);
}
.msr-body {
  padding: 0 1rem !important;
  overflow-y: scroll;
}
.flexcontainer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}
.controls {
  height: 50px;
  flex: 0 0 auto;
  border: 1px solid green;
}
.list {
  flex: 1;
  border: 1px solid red;
}
</style>
