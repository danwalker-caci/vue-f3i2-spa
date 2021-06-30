<template>
  <b-container fluid class="contentHeight m-0 p-0">
    <b-row no-gutters class="contentHeight">
      <b-toast id="form-toast" variant="success" solid no-auto-hide>
        <template v-slot:toast-title>
          <div class="d-flex flex-grow-1 align-items-baseline">
            <b-img blank blank-color="#ff0000" class="mr-2" width="12" height="12"></b-img>
            <strong class="mr-auto">{{ busyTitle }}</strong>
          </div>
        </template>
        <b-spinner style="width: 5rem; height: 5rem;" variant="success" label="Waiting Spinner"></b-spinner>
      </b-toast>
      <b-col cols="12" class="m-0 p-0 contentHeight">
        <b-row no-gutters class="bg-black text-white formheader">
          <b-col cols="1" class="p-0 text-center"> </b-col>
          <b-col cols="10" class="p-0 text-center">
            <h3 class="text-white">Travel Information For: {{ travelmodel.Subject }}</h3>
          </b-col>
          <b-col cols="1" class="p-0 text-right"></b-col>
        </b-row>
        <b-row no-gutters>
          <b-container fluid class="m-0 p-0 contentHeight formbody bg-white" style="overflow-y: auto; overflow-x: auto;">
            <div class="bg-gray-light">
              <h3 class="text-center text-dark">Approval Information</h3>
              <b-row class="pl-3 pr-3">
                <b-col cols="3">
                  <p>
                    <b>Status:</b> <span v-if="travelmodel.Status" class="ml-1 lead">{{ travelmodel.Status }}</span>
                  </p>
                </b-col>
                <b-col cols="3">
                  <p>
                    <b>Approved By:</b> <span v-if="travelmodel.InternalData.ApprovedBy" class="ml-1 lead">{{ travelmodel.InternalData.ApprovedBy }}</span>
                  </p>
                </b-col>
                <b-col cols="3">
                  <p>
                    <b>Approved On:</b> <span v-if="travelmodel.InternalData.ApprovedOn" class="ml-1 lead">{{ travelmodel.InternalData.ApprovedOn }}</span>
                  </p>
                </b-col>
                <b-col cols="3">
                  <p>
                    <b>Government Sponsor:</b> <span v-if="travelmodel.Sponsor" class="ml-1 lead">{{ travelmodel.Sponsor }}</span>
                  </p>
                </b-col>
              </b-row>
            </div>
            <div class="bg-white">
              <h3 class="text-center">Workplan Information</h3>
              <b-row class="pl-3 pr-3">
                <b-col cols="3">
                  <p>
                    <b>Index Number:</b> <span v-if="travelmodel.IndexNumber" class="ml-1 lead">{{ travelmodel.IndexNumber }}</span>
                  </p>
                </b-col>
                <b-col cols="3">
                  <p>
                    <b>Work Plan Number:</b> <span v-if="travelmodel.WorkPlanNumber" class="ml-1 lead">{{ travelmodel.WorkPlanNumber }}</span>
                  </p>
                </b-col>
                <b-col>
                  <p>
                    <b>Work Plan Name:</b> <span v-if="travelmodel.WorkPlanText" class="ml-1 lead">{{ travelmodel.WorkPlanText }}</span>
                  </p>
                </b-col>
              </b-row>
            </div>
            <div class="bg-gray-light">
              <h3 class="text-center text-dark">Trip Information</h3>
              <b-row class="pl-3 pr-3">
                <b-col cols="3">
                  <p>
                    <b>Start Date:</b> <span v-if="travelmodel.StartTime" class="ml-1 lead">{{ travelmodel.StartTime }}</span>
                  </p>
                </b-col>
                <b-col>
                  <p>
                    <b>End Date:</b> <span v-if="travelmodel.EndTime" class="ml-1 lead">{{ travelmodel.EndTime }}</span>
                  </p>
                </b-col>
                <b-col>
                  <p>
                    <b>Traveling From:</b> <span v-if="travelmodel.TravelFrom" class="ml-1 lead">{{ travelmodel.TravelFrom }}</span>
                  </p>
                </b-col>
                <b-col>
                  <p>
                    <b>Traveling To:</b> <span v-if="travelmodel.TravelTo" class="ml-1 lead">{{ travelmodel.TravelTo }}</span>
                  </p>
                </b-col>
                <b-col>
                  <p>
                    <b>Estimated Travel Cost:</b> <span v-if="travelmodel.EstimatedCost" class="ml-1 lead">${{ travelmodel.EstimatedCost }}</span>
                  </p>
                </b-col>
              </b-row>
              <b-row class="pl-3 pr-3">
                <b-col cols="3">
                  <p>
                    <b>Subject:</b> <span v-if="travelmodel.Subject" class="ml-1 lead">{{ travelmodel.Subject }}</span>
                  </p>
                </b-col>
                <b-col cols="9">
                  <p>
                    <b>Purpose:</b> <span v-if="travelmodel.Comments" class="ml-1 lead">{{ travelmodel.Comments }}</span>
                  </p>
                </b-col>
              </b-row>
            </div>
            <div class="bg-white">
              <h3 class="text-center">Traveler Details</h3>
              <div class="pl-3 pr-3" v-for="traveler in travelmodel.Travelers" :key="traveler">
                <b-row>
                  <b-col cols="2">
                    <p>
                      <b>Company:</b> <span v-if="travelmodel.Company" class="ml-1 lead">{{ travelmodel.Company }}</span>
                    </p>
                  </b-col>
                  <b-col>
                    <p>
                      <b>Traveler Last Name:</b> <span class="ml-1 lead">{{ traveler.lastName }}</span>
                    </p>
                  </b-col>
                  <b-col>
                    <p>
                      <b>Traveler First Name:</b> <span class="ml-1 lead">{{ traveler.firstName }}</span>
                    </p>
                  </b-col>
                  <b-col>
                    <p>
                      <b>Traveler Email:</b> <span class="ml-1 lead">{{ traveler.email }}</span>
                    </p>
                  </b-col>
                  <b-col>
                    <p>
                      <b>Traveler Phone:</b> <span class="ml-1 lead">{{ traveler.phone }}</span>
                    </p>
                  </b-col>
                </b-row>
              </div>
            </div>
            <div class="bg-gray-light" v-if="travelmodel.VisitRequest === 'Yes'">
              <h3 class="text-center text-dark">Security Information</h3>
              <b-row class="pl-3 pr-3">
                <b-col cols="4">
                  <p>
                    <b>Government POC Name:</b> <span v-if="travelmodel.POCName" class="ml-1 lead">{{ travelmodel.POCName }}</span>
                  </p>
                </b-col>
                <b-col cols="4">
                  <p>
                    <b>Government POC Email:</b> <span v-if="travelmodel.POCEmail" class="ml-1 lead">{{ travelmodel.POCEmail }}</span>
                  </p>
                </b-col>
                <b-col>
                  <p>
                    <b>Government POC Phone:</b> <span v-if="travelmodel.POCPhone" class="ml-1 lead">{{ travelmodel.POCPhone }}</span>
                  </p>
                </b-col>
              </b-row>
              <b-row class="pl-3 pr-3">
                <b-col cols="4">
                  <p>
                    <b>Visit Request:</b> <span v-if="travelmodel.VisitRequest" class="ml-1 lead">{{ travelmodel.VisitRequest }}</span>
                  </p>
                </b-col>
                <b-col cols="4">
                  <p>
                    <b>Required Clearance:</b> <span v-if="travelmodel.Clearance" class="ml-1 lead">{{ travelmodel.Clearance }}</span>
                  </p>
                </b-col>
              </b-row>
            </div>
            <b-row no-gutters class="formfooter">
              <div class="col-4 p-0 text-left"></div>
              <div class="col-4 p-0 text-center"></div>
              <div class="col-4 p-0 text-right">
                <b-button-group class="mt-2">
                  <b-button variant="primary" v-if="travelmodel.TripReport && travelmodel.TripReport.length > 0" class="mr-2" ref="btnDownload" @click="AFRLCompleteTasks">Download Trip Report</b-button>
                  <b-button variant="success" ref="btnCancel" class="mr-2" @click="onModalHide">OK</b-button>
                </b-button-group>
              </div>
            </b-row>
          </b-container>
        </b-row>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import moment from 'moment'
import User from '@/models/User'
import Travel from '@/models/Travel'
import Todo from '@/models/Todo'

let url, SPCI
if (window._spPageContextInfo) {
  SPCI = window._spPageContextInfo
  url = SPCI.webAbsoluteUrl
}
let vm = null

export default {
  name: 'ViewTravel',
  props: {
    mode: {
      type: String,
      default: 'default'
    },
    TripId: {
      type: Number
    }
  },
  computed: {
    triploaded() {
      return Travel.getters('triploaded')
    },
    selectedtrip() {
      return Travel.getters('selectedtrip')
    },
    currentuser() {
      return User.getters('CurrentUser')
    },
    userid() {
      return User.getters('CurrentUserId')
    },
    appversion() {
      return User.getters('AppVersion')
    },
    isAFRL() {
      return User.getters('isAFRL')
    },
    isDeveloper() {
      return User.getters('isDeveloper')
    },
    isPM() {
      return User.getters('isPM')
    },
    isWPManager() {
      return User.getters('isWPManager')
    },
    isSecurity() {
      return User.getters('isSecurity')
    },
    isSubcontractor() {
      return User.getters('isSubcontractor')
    },
    isTravelApprover() {
      return User.getters('isTravelApprover')
    }
  },
  mounted: function() {
    console.log('EditTravel Mounted')
    this.$nextTick(function() {
      this.company = this.currentuser[0].Company
      vm = this
      try {
        let payload = {}
        if (this.$route) {
          let idx = this.$route.query.id
          console.log('idx: ' + idx)
          if (idx === undefined || idx === null) {
            console.log('TEST B')
            payload.id = vm.TripId
          } else {
            console.log('TEST A')
            payload.id = idx
          }
          console.log('PAYLOAD ID: ' + payload.id)
        } else {
          payload.id = vm.TripId
        }
        Travel.dispatch('getTripById', payload).then(function() {
          vm.$options.interval = setInterval(vm.waitForTrip, 1000)
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
    })
  },
  data: function() {
    return {
      busyTitle: 'Getting Trip Data. Please Wait.',
      isDenied: false,
      actionselected: false,
      company: null,
      searchinput: '',
      newindex: null,
      editing: false,
      EndBeforeStart: null,
      BadEndDate: null,
      pdata: [],
      IndexNumbers: [],
      UniqueIndexes: 0,
      TravelCount: 0,
      ShowIndexPicker: false,
      tabIndex: 0,
      tabInvalid: false,
      InvalidMessage: 'Not all fields are filled out correctly.',
      headerBgVariant: 'dark',
      showApprovalHelp: false,
      isAuthor: false,
      travelmodel: {
        id: 0,
        Status: '',
        WorkPlan: '',
        WorkPlanText: '',
        WorkPlanNumber: '',
        OriginalWorkPlanNumber: '',
        OCONUS: '',
        OCONUSLocation: '',
        OCONUSRequest: '',
        OCONUSApprovedBy: '',
        OCONUSApprovedOn: '',
        PreApproved: '',
        RequestApproval: '',
        Approval: '',
        WorkPlanData: '',
        Company: '',
        Subject: '',
        StartTime: 'Enter A Valid Date',
        EndTime: 'Enter A Valid Date',
        TravelFrom: '',
        TravelTo: '',
        Travelers: [],
        TripReport: '',
        Sponsor: '',
        POCName: '',
        POCEmail: '',
        POCPhone: '',
        Comments: '',
        Clearance: '',
        InternalData: {
          Status: '',
          PreApproved: '',
          OCONUSTravel: '',
          OCONUSLocation: '',
          Rejected: '',
          RejectedComments: '',
          DeniedForAdmin: '',
          RequiredCorrections: '',
          ApprovalRequested: '',
          ApproverSelected: [],
          Approval: '',
          ApprovedBy: '',
          ApprovedOn: '',
          DeniedBy: '',
          DeniedOn: '',
          DenialComments: '',
          ATPRequested: '',
          ATP: '',
          ATPGrantedBy: '',
          ATPGrantedOn: '',
          ATPDeniedBy: '',
          ATPDeniedOn: '',
          ATPDenialComments: '',
          ManagerEmail: '',
          date: moment().format('MM/DD/YYYY')
        },
        VisitRequest: '',
        SecurityAction: '',
        SecurityActionCompleted: '',
        EstimatedCost: '',
        IndexNumber: '',
        CreatedBy: '',
        CreatedByEmail: '',
        etag: '',
        uri: ''
      },
      travelerData: [],
      ManagerEmail: null,
      formValid: false
    }
  },
  methods: {
    /* ---------------------------------------------------------------------------------------------------------------- Base Events -------------------------------------------------------------------------------- */
    setPersonnel() {
      if (this.personnel.length > 0) {
        clearInterval(this.$options.interval)
        this.pdata = this.personnel
      }
    },
    waitForTrip: function() {
      // Waits for the travel item to load
      if (this.triploaded) {
        clearInterval(this.$options.interval)
        let giraffe = JSON.parse(this.selectedtrip.Travelers)
        this.travelmodel.id = this.selectedtrip.id
        this.travelmodel.Status = this.selectedtrip.Status
        this.travelmodel.WorkPlan = this.selectedtrip.WorkPlan
        this.travelmodel.WorkPlanNumber = this.selectedtrip.WorkPlanNumber
        this.travelmodel.OriginalWorkPlanNumber = this.selectedtrip.OriginalWorkPlanNumber
        this.travelmodel.WorkPlanText = this.selectedtrip.WorkPlanText
        this.travelmodel.OCONUS = this.selectedtrip.OCONUS
        this.travelmodel.OCONUSLocation = this.selectedtrip.OCONUSLocation == 'Select...' ? '' : this.selectedtrip.OCONUSLocation
        this.travelmodel.OCONUSApprovedBy = this.selectedtrip.OCONUSApprovedBy
        this.travelmodel.OCONUSApprovedOn = moment(this.selectedtrip.OCONUSApprovedOn).format('YYYY-MM-DD')
        this.travelmodel.OCONUSApprovedEmail = this.selectedtrip.OCONUSApprovedEmail
        this.travelmodel.PreApproved = this.selectedtrip.InternalData.PreApproved
        this.travelmodel.Company = this.selectedtrip.Company
        this.travelmodel.Subject = this.selectedtrip.Subject
        this.travelmodel.StartTime = moment(this.selectedtrip.StartTime).format('YYYY-MM-DD')
        this.travelmodel.EndTime = moment(this.selectedtrip.EndTime).format('YYYY-MM-DD')
        this.travelmodel.TravelFrom = this.selectedtrip.TravelFrom
        this.travelmodel.TravelTo = this.selectedtrip.TravelTo
        this.travelmodel.TripReport = this.selectedtrip.TripReportLink
        this.travelmodel.Sponsor = this.selectedtrip.Sponsor
        this.travelmodel.POCName = this.selectedtrip.POCName
        this.travelmodel.POCEmail = this.selectedtrip.POCEmail
        this.travelmodel.POCPhone = this.selectedtrip.POCPhone
        this.travelmodel.Comments = this.selectedtrip.Comments
        this.travelmodel.InternalData = this.selectedtrip.InternalData !== '' ? JSON.parse(this.selectedtrip.InternalData) : ''
        this.travelmodel.Clearance = this.selectedtrip.Clearance
        this.travelmodel.VisitRequest = this.selectedtrip.VisitRequest
        this.travelmodel.SecurityAction = this.selectedtrip.SecurityAction
        this.travelmodel.SecurityActionCompleted = moment(this.selectedtrip.SecurityActionCompleted).format('YYYY-MM-DD')
        this.travelmodel.EstimatedCost = this.selectedtrip.EstimatedCost
        this.travelmodel.IndexNumber = this.selectedtrip.IndexNumber
        this.travelmodel.Travelers = giraffe.length > 0 ? giraffe : []
        this.travelmodel.CreatedBy = this.selectedtrip.CreatedBy
        this.travelmodel.CreatedByEmail = this.selectedtrip.CreatedByEmail
        this.$bvToast.hide('form-toast')
      }
    },
    getRef(text, idx) {
      return text + '_' + idx
    },
    /* ---------------------------------------------------------------------------------------------------------------- Form Events ---------------------------------------------------------------------------------- */
    onModalHide: function() {
      let back = String(this.$router.currentRoute.params.back) === 'undefined' ? 'monkey' : String(this.$router.currentRoute.params.back)
      console.log('BACK: ' + back + ', ' + typeof back)
      if (back === 'monkey') {
        this.$router.push({ name: 'Travel Tracker' }) // default
      } else {
        this.$router.push({ name: back })
      }
    },
    AFRLCompleteTasks: function() {
      window.open(url + '/_layouts/download.aspx?SourceUrl=' + this.travelmodel.TripReport, '_blank')
      let deletepayload = {
        url: SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Tasks')/items?$select=*&$filter=(substringof('TrvlID:" + vm.travelmodel.id + "',TaskInfo) and TaskType eq 'Review Trip Report')"
      }
      Todo.dispatch('completeTodosByQuery', deletepayload)
    }
  }
}
</script>

<style lang="scss" scoped>
.helpHide {
  margin: 1rem;
}

.summarytable {
  font-size: 0.8rem !important;
  width: 100%;
}

.formdiv {
  height: 450px;
}

.form-control-travel {
  padding: 2px !important;
  font-size: 0.75rem !important;
  height: 20px !important;
}

.form-control-travel-textarea {
  width: 100%;
}

.form-control-travel-date.is-invalid,
.form-control-travel-date.is-valid,
.was-validated .form-control-travel-date:invalid,
.was-validated .form-control-travel-date:valid {
  background-position: right calc(1.5rem) center !important;
}

.formheader,
.formmessage,
.formfooter {
  height: 50px !important;
  color: white;
  vertical-align: middle;
}

.formheader {
  line-height: 50px !important;
}

.formbody {
  min-height: 360px;
}
</style>
