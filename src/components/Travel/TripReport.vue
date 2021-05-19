<!--
TripReport 
Actions Supported
1 Upload Trip Report: Action can be performed by Subcontractor/Travel Submiiter or WPM/Delegate
  [A] If action is performed by sub/submitter just expose submit button. Submitting should create a task for WPM/Delegates with link to this page for specific trip report based on trip and report. This link is for "Approve/Reject Trip Report" and will be exposed in the WPM/Delegates My Tasks section. 
  [B] If action is performed by WPM/Delegate expose email recipient list and submit button. Email recipient list is where the selection of government users who will receive the aprroval are selected. The submit will set the status of the trip to Completed and sends emails to the selected recipients. No tasks are created.
2 Approve/Reject Trip Report
  [A] Action should be exposed as a task for WPM/Delegate and also as a travel tracker action or part of the trip report action from the tracker. 
  [B] The page will load the existing trip report which could also be overridden by uploading a new one. The page shhould expose the Approve/Reject option and if Approve is selected the Email Recipient selector should be exposed.
      [1] if Approve is selected, the submission will change the trip to Completed and send emails to the selected recipients. 
      [2] if Reject is selected, the rejection comments should be exposed and filled out. The submission should create an email and a task for the submitter to correct the issues with the trip report and changes the status back to TripReportDue or TripReportLate. 

-->
<template>
  <b-container fluid class="contentHeight m-0 p-0">
    <b-row no-gutters class="contentHeight">
      <b-col cols="12" class="m-0 p-0">
        <b-container fluid class="contentHeight m-0 p-0">
          <b-row no-gutters class="bg-white contentHeight">
            <b-col id="FrameColumn" cols="9" class="reportframe"></b-col>
            <b-col v-if="isWPManager" cols="3">
              <b-row class="m-2 p-0">
                <span class="mx-auto text-center" style="width: 95%;">
                  Upload Trip Report [Replaces existing trip report]
                </span>
              </b-row>
              <b-row class="m-2 p-0"><ejs-uploader id="fileuploadwpm" name="UploadFilesWPM" :selected="onFileSelect" :multiple="false"></ejs-uploader></b-row>
              <b-row class="m-2 p-0">
                <span class="mx-auto" style="width: 200px;">
                  Approve Trip Report
                </span>
              </b-row>
              <b-row class="m-2 p-0">
                <b-form-radio-group v-model="travelmodel.TripReportApproval" name="approve-radios">
                  <b-form-radio value="Yes">Yes</b-form-radio>
                  <b-form-radio value="No">No</b-form-radio>
                </b-form-radio-group>
              </b-row>
              <b-row v-if="travelmodel.TripReportApproval == 'No'" class="m-2 p-0">
                <b-form-textarea rows="8" class="mx-auto" style="width: 95%;" v-model="travelmodel.TripReportRejectedComments" placeholder="Rejection Comments"></b-form-textarea>
              </b-row>
              <b-row v-if="travelmodel.TripReportApproval == 'Yes'" class="m-2 p-0">
                <span class="mx-auto" style="width: 200px;">
                  Select Email Recipients
                </span>
              </b-row>
              <b-row v-if="travelmodel.TripReportApproval == 'Yes'" class="m-2 p-0">
                <b-form-checkbox-group v-model="travelmodel.Notifications" stacked :options="govTrvlApprovers" name="selectedapprover-radios"></b-form-checkbox-group>
              </b-row>
              <b-row class="m-2 p-0">
                <b-button-group class="mx-auto" style="width: 200px;">
                  <b-button variant="danger" ref="btnCancel" class="mr-2" @click="onCancel">Cancel</b-button>
                  <b-button variant="success" ref="btnOk" class="ml-2" @click="onWPMSubmit">Submit</b-button>
                </b-button-group>
              </b-row>
            </b-col>
            <b-col v-else cols="3">
              <b-row class="m-2 p-0">
                <span class="mx-auto text-center" style="width: 95%;">
                  Upload Trip Report [Replaces existing trip report]
                </span>
              </b-row>
              <b-row class="m-2 p-0"><ejs-uploader id="fileupload" name="UploadFiles" :selected="onFileSelect" :multiple="false"></ejs-uploader></b-row>
              <b-row class="m-2 p-0">
                <b-button-group class="mx-auto" style="width: 200px;">
                  <b-button variant="danger" ref="btnCancel" class="mr-2" @click="onCancel">Cancel</b-button>
                  <b-button variant="success" ref="btnOk" class="ml-2" @click="onSubmit">Submit</b-button>
                </b-button-group>
              </b-row>
            </b-col>
          </b-row>
        </b-container>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import Travel from '@/models/Travel'
import User from '@/models/User'
import Workplan from '@/models/WorkPlan'
import Todo from '@/models/Todo'

let SPCI = null
if (window._spPageContextInfo) {
  SPCI = window._spPageContextInfo
}

let library = SPCI.webAbsoluteUrl + '/TripReports/'

let vm = null

export default {
  name: 'TripReport',
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
    isDeveloper() {
      return User.getters('isDeveloper')
    },
    isWPManager() {
      return User.getters('isWPManager')
    },
    delegates() {
      return this.$store.state.database.travel.delegates
    },
    govTrvlApprovers() {
      return this.$store.state.database.travel.govapprovers
    }
  },
  mounted: function() {
    vm = this
    this.$nextTick(function() {
      let payload = {}
      // payload.id = vm.TripId
      if (this.$route) {
        let idx = ''
        idx = this.$route.query.id
        console.log('idx: ' + idx)
        let a = Number(idx)
        if (isNaN(a)) {
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
      this.today = this.$moment().format('YYYY-MM-DD')
      try {
        Todo.dispatch('getDigest')
        Travel.dispatch('getDigest')
        Travel.dispatch('getDelegates')
        Travel.dispatch('getGetGovTrvlApprovers')
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
      fileSelected: null,
      fileBuffer: null,
      fileName: null,
      travelmodel: {
        id: 0,
        Status: '',
        Company: '',
        TripReport: '',
        TripReportLink: '',
        TripReportApproval: '',
        TripReportRejectedComments: '',
        StartTime: '',
        EndTime: '',
        IndexNumber: '',
        WPNumber: '',
        CreatedBy: '',
        CreatedByEmail: '',
        etag: '',
        uri: ''
      },
      ManagerID: null,
      ManagerEmail: null,
      today: null
    }
  },
  methods: {
    async waitForTrip() {
      // Waits for the travel item to load
      if (this.triploaded) {
        clearInterval(this.$options.interval)
        this.travelmodel.id = this.selectedtrip.id
        this.travelmodel.Status = this.selectedtrip.Status
        this.travelmodel.Company = this.selectedtrip.Company
        this.travelmodel.TripReport = this.selectedtrip.TripReport
        this.travelmodel.TripReportLink = this.selectedtrip.TripReportLink
        this.travelmodel.StartTime = this.$moment(this.selectedtrip.StartTime).format('YYYY-MM-DD')
        this.travelmodel.EndTime = this.$moment(this.selectedtrip.EndTime).format('YYYY-MM-DD')
        this.travelmodel.IndexNumber = this.selectedtrip.IndexNumber
        this.travelmodel.WPNumber = this.selectedtrip.WorkPlanNumber
        this.travelmodel.CreatedBy = this.selectedtrip.CreatedBy
        this.travelmodel.CreatedByEmail = this.selectedtrip.CreatedByEmail
        this.travelmodel.etag = this.selectedtrip.etag
        this.travelmodel.uri = this.selectedtrip.uri
        if (this.travelmodel.WPNumber !== '') {
          let manager = await Workplan.dispatch('getManagerByWPNumber', this.travelmodel.WPNumber)
          this.ManagerID = manager[0]['Manager']['ID']
          this.ManagerEmail = manager[0]['Manager']['EMail']
        }
        if (this.isWPManager && this.travelmodel.TripReportLink !== '') {
          // create iframe and set iframe source to trip report
          let iframe = document.createElement('iframe')
          iframe.style.width = '100%'
          iframe.style.height = '100%'
          iframe.id = 'TripReportFrame'
          iframe.src = this.travelmodel.TripReportLink + '?isDlg=1'
          document.getElementById('FrameColumn').appendChild(iframe)
        }
      }
    },
    onCancel: function() {
      this.$router.push({ name: 'Travel Tracker' })
    },
    async onWPMSubmit() {
      // is the WPM submitting or approving an existing report
      if (this.fileSelected != null) {
        // WPM Role is submitting a TripReport so submit report and set status to Completed
        let response = await Travel.dispatch('getDigest')
        let digest = response.data.d.GetContextWebInformation.FormDigestValue
        console.log('WPMSubmit DIGEST: ' + digest)
        let name = this.fileSelected.split('.')[0]
        this.fileName = name
        let payload = {}
        payload.file = this.fileSelected
        payload.name = name
        payload.id = this.TripId
        payload.buffer = this.fileBuffer
        payload.digest = digest
        let item = await Travel.dispatch('uploadTripReport', payload)
        let itemlink = item.data.d.ListItemAllFields.__deferred.uri
        console.log('WPMSubmit itemlink: ' + itemlink)
        let report = await Travel.dispatch('getReportItem', itemlink)
        payload = report.data.d.__metadata
        console.log('WPMSubmit report payload: ' + payload)
        payload.file = this.fileSelected
        payload.name = name
        payload.IndexNumber = this.travelmodel.IndexNumber
        Travel.dispatch('updateReportItem', payload).then(function() {
          // Refresh trip with trip report data
          console.log('WPMSubmit ReportItemUpdated')
          // vm.$store.dispatch('support/addActivity', '<div class="bg-success">TripReport-UPDATEREPORTITEM COMPLETED.</div>')
          let event = []
          event.push({
            Action: 'Submit',
            name: vm.fileName,
            Status: 'Completed',
            TripReport: library + vm.fileSelected,
            etag: vm.travelmodel.etag,
            uri: vm.travelmodel.uri
          })
          let notificationemails = []
          let notificationselected = vm.travelmodel.Notifications
          for (let i = 0; i < notificationselected.length; i++) {
            let a = notificationselected[i].split(',')
            notificationemails.push(a[1])
          }
          let payload = {}
          payload.id = vm.travelmodel.id
          payload.email = notificationemails
          payload.title = 'Trip Report Approved'
          payload.workplan = vm.travelmodel.IndexNumber
          payload.company = vm.travelmodel.Company
          payload.start = vm.travelmodel.StartTime
          payload.end = vm.travelmodel.EndTime
          payload.link = library + vm.fileSelected
          payload.linktext = 'View Trip Report'
          Travel.dispatch('TripReportEmail', payload)
          Travel.dispatch('editTripReport', event).then(function() {
            vm.$router.push({ name: 'Travel Tracker' })
          })
        })
      } else {
        // perform actions based on approval or denial. Task should be cleared in either case. Update trip status.
        // trip status will be either ReportDue or ReportLate
        // is the report approved or rejected
        if (this.travelmodel.TripReportApproval == 'No') {
          // rejected so update status and send notification email and task to submitter
          let status = 'ReportDue'
          let end = this.$moment(this.travelmodel.EndTime)
          let today = this.$moment()
          let diff = today.diff(end, 'days')
          console.log('DIFF: ' + diff)
          if (diff > 7) {
            status = 'ReportLate'
          }
          let event = []
          event.push({
            Action: 'Deny',
            Status: status,
            etag: vm.travelmodel.etag,
            uri: vm.travelmodel.uri
          })
          let payload = {}
          payload.id = vm.travelmodel.id
          payload.action = 'Deny'
          payload.email = [vm.travelmodel.CreatedByEmail]
          payload.title = 'Trip Report Denied'
          payload.indexnumber = vm.travelmodel.IndexNumber
          payload.company = vm.travelmodel.Company
          payload.start = vm.travelmodel.StartTime
          payload.end = vm.travelmodel.EndTime
          payload.comments = vm.travelmodel.TripReportRejectedComments
          payload.linktext = 'Edit Trip Report'
          Travel.dispatch('TripReportEmail', payload)
          let taskpayload = {
            Title: 'Trip Report Rejected By WPM',
            AssignedToId: [vm.travelmodel.CreatedBy],
            Description: vm.travelmodel.TripReportRejectedComments,
            IsMilestone: false,
            PercentComplete: 0,
            TaskType: status,
            TaskLink: '/travel/page/report?id=' + vm.travelmodel.id,
            TaskInfo: 'Type:Travel, TrvlID:' + vm.travelmodel.id + ', IN:' + vm.travelmodel.IndexNumber
          }
          let deletepayload = {
            url: SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Tasks')/items?$select=*&$filter=substringof('TrvlID:" + vm.travelmodel.id + "',TaskInfo)"
          }
          Todo.dispatch('completeTodosByQuery', deletepayload).then(function() {
            Todo.dispatch('addTodo', taskpayload).then(function() {
              Travel.dispatch('editTripReport', event).then(function() {
                vm.$router.push({ name: 'Travel Tracker' })
              })
            })
          })
        } else {
          // approved so update status to completed.
          let event = []
          event.push({
            Action: 'Approval',
            Status: 'Completed',
            etag: vm.travelmodel.etag,
            uri: vm.travelmodel.uri
          })
          let notificationemails = []
          let notificationselected = vm.travelmodel.Notifications
          for (let i = 0; i < notificationselected.length; i++) {
            let a = notificationselected[i].split(',')
            notificationemails.push(a[1])
          }
          let payload = {}
          payload.id = vm.travelmodel.id
          payload.action = 'Notify'
          payload.email = notificationemails
          payload.title = 'Trip Report Approved'
          payload.indexnumber = vm.travelmodel.IndexNumber
          payload.company = vm.travelmodel.Company
          payload.start = vm.travelmodel.StartTime
          payload.end = vm.travelmodel.EndTime
          payload.link = vm.travelmodel.TripReportLink
          payload.linktext = 'View Trip Report'
          Travel.dispatch('TripReportEmail', payload)
          let deletepayload = {
            url: SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Tasks')/items?$select=*&$filter=substringof('TrvlID:" + vm.travelmodel.id + "',TaskInfo)"
          }
          Todo.dispatch('completeTodosByQuery', deletepayload).then(function() {
            Travel.dispatch('editTripReport', event).then(function() {
              vm.$router.push({ name: 'Travel Tracker' })
            })
          })
        }
      }
    },
    async onSubmit() {
      // perform upload and refresh the page
      try {
        let response = await Travel.dispatch('getDigest')
        let digest = response.data.d.GetContextWebInformation.FormDigestValue
        let name = this.fileSelected.split('.')[0]
        this.fileName = name
        let payload = {}
        payload.file = this.fileSelected
        payload.name = name
        payload.id = this.TripId
        payload.buffer = this.fileBuffer
        payload.digest = digest
        let item = await Travel.dispatch('uploadTripReport', payload)
        let itemlink = item.data.d.ListItemAllFields.__deferred.uri
        let report = await Travel.dispatch('getReportItem', itemlink)
        payload = report.data.d.__metadata
        payload.file = this.fileSelected
        payload.name = name
        payload.IndexNumber = this.travelmodel.IndexNumber
        Travel.dispatch('updateReportItem', payload).then(function() {
          // Refresh trip with trip report data
          vm.$store.dispatch('support/addActivity', '<div class="bg-success">TripReport-UPDATEREPORTITEM COMPLETED.</div>')
          let event = []
          event.push({
            Action: 'Submit',
            name: vm.fileName,
            Status: 'TripReportReview',
            TripReport: library + vm.fileSelected,
            etag: vm.travelmodel.etag,
            uri: vm.travelmodel.uri
          })
          Travel.dispatch('editTripReport', event).then(function() {
            vm.$store.dispatch('support/addActivity', '<div class="bg-success">TripReport-EDITRIPREPORT COMPLETED.</div>')
            // Create task for WP Manager to approve reject trip report
            let taskdata = {
              Type: 'Travel Data',
              TravelID: vm.TripId,
              IndexNumber: vm.travelmodel.IndexNumber,
              CreatedByEmail: vm.travelmodel.CreatedByEmail
            }
            // TODO: Loop through the delegates to see if this WPM has delegates that need to have the email and tasks
            let emailto = []
            let taskid = []
            emailto.push(vm.ManagerEmail)
            taskid.push(vm.ManagerID)
            if (vm.delegates.length > 0) {
              for (let i = 0; i < vm.delegates.length; i++) {
                if (vm.delegates[i]['EMail'] == vm.ManagerEmail) {
                  // add the delegates to the email and task array
                  let j = vm.delegates[i]['Delegates']
                  for (let k = 0; k < j.length; k++) {
                    emailto.push(j[k]['EMail'])
                    taskid.push(j[k]['Id'])
                  }
                }
              }
            }
            console.log('EMAILS: ' + emailto.toString())
            let payload = {}
            payload.id = vm.travelmodel.id
            payload.action = 'Approve'
            payload.email = emailto
            payload.title = 'Approve/Reject Trip Report'
            payload.indexnumber = vm.travelmodel.IndexNumber
            payload.company = vm.travelmodel.Company
            payload.start = vm.travelmodel.StartTime
            payload.end = vm.travelmodel.EndTime
            payload.linktext = 'Approve/Reject Trip Report'
            Travel.dispatch('TripReportEmail', payload)
            let taskpayload = {
              Title: 'Approve/Reject Trip Report',
              AssignedToId: taskid,
              Description: 'Approve or Reject Trip Report',
              IsMilestone: false,
              PercentComplete: 0,
              TaskType: 'Trip Report Review',
              TaskLink: '/travel/page/report?id=' + vm.travelmodel.id,
              TaskInfo: 'Type:TripReportData, TrvlID:' + vm.travelmodel.id + ', IN:' + vm.travelmodel.IndexNumber,
              TaskData: taskdata
            }
            let deletepayload = {
              url: SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Tasks')/items?$select=*&$filter=substringof('TrvlID:" + vm.travelmodel.id + "',TaskInfo)"
            }
            Todo.dispatch('completeTodosByQuery', deletepayload).then(function() {
              Todo.dispatch('addTodo', taskpayload).then(function() {
                vm.$router.push({ name: 'Travel Tracker' })
              })
            })
          })
        })
      } catch (e) {
        // Add user notification and system logging
        const notification = {
          type: 'danger',
          title: 'Error',
          message: e,
          push: true
        }
        this.$store.dispatch('notification/add', notification, {
          root: true
        })
        console.log('ERROR: ' + e)
      }
    },
    async onFileSelect(args) {
      vm.fileSelected = args.filesData[0].name
      let buffer = vm.getFileBuffer(args.filesData[0].rawFile)
      buffer.then(function(buff) {
        vm.fileBuffer = buff
        // create frame with buffered file assuming it is a PDF and display
        document.getElementById('FrameColumn').innerHTML = ''
        if (String(vm.fileSelected).indexOf('.pdf') > 0) {
          let blob = new Blob([buff], { type: 'application/pdf' })
          let link = window.URL.createObjectURL(blob)
          let iframe = document.createElement('iframe')
          iframe.style.width = '100%'
          iframe.style.height = '100%'
          iframe.id = 'TripReportFrame'
          iframe.src = link
          document.getElementById('FrameColumn').appendChild(iframe)
        }
        if (String(vm.fileSelected).indexOf('.docx') > 0) {
          let blob = new Blob([buff], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
          let link = window.URL.createObjectURL(blob)
          let iframe = document.createElement('iframe')
          iframe.style.width = '100%'
          iframe.style.height = '100%'
          iframe.id = 'TripReportFrame'
          iframe.src = link
          document.getElementById('FrameColumn').appendChild(iframe)
        }
      })
      if (this.isWPManager) {
        // autoset approval to yes
        vm.travelmodel.TripReportApproval = 'Yes'
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
    }
  }
}
</script>

<style lang="scss" scoped>
.reportframe {
  background-color: #aaaaaa;
  border-right: 2px solid black;
}
</style>
