<template>
  <div class="formdiv">
    <b-container class="p-0">
      <b-row no-gutters class="bg-warning text-black formheader">
        <b-col cols="4" class="p-0 text-center"></b-col>
        <b-col cols="4" class="p-0 text-center">Upload Trip Report</b-col>
        <b-col cols="4" class="p-0 text-right"></b-col>
      </b-row>
      <b-row no-gutters class="bg-white formbody">
        <table class="mt-1">
          <tbody>
            <tr class="text-center bg-warning text-white">
              <th>Upload Trip Report [This replaces any existing trip report]</th>
            </tr>
            <tr>
              <td><ejs-uploader id="fileupload" name="UploadFiles" :selected="onFileSelect" :multiple="false"></ejs-uploader></td>
            </tr>
            <tr>
              <td>
                <div class="col p-0 text-right">
                  <b-button-group class="mt-2">
                    <b-button variant="danger" ref="btnCancel" class="mr-2" @click="onModalHide">Cancel</b-button>
                    <b-button variant="success" ref="btnOk" class="ml-2" @click="onModalSave">Submit</b-button>
                  </b-button-group>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </b-row>
    </b-container>
  </div>
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
    }
  },
  mounted: function() {
    vm = this
    let payload = {}
    payload.id = vm.TripId
    try {
      Todo.dispatch('getDigest')
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
  },
  data: function() {
    return {
      fileSelected: null,
      fileBuffer: null,
      fileName: null,
      travelmodel: {
        id: 0,
        Status: '',
        TripReport: '',
        IndexNumber: '',
        WPNumber: '',
        CreatedByEmail: '',
        etag: '',
        uri: ''
      },
      ManagerID: null
    }
  },
  methods: {
    async waitForTrip() {
      // Waits for the travel item to load
      if (this.triploaded) {
        clearInterval(this.$options.interval)
        this.travelmodel.id = this.selectedtrip.id
        this.travelmodel.Status = this.selectedtrip.Status
        this.travelmodel.TripReport = this.selectedtrip.TripReport
        this.travelmodel.IndexNumber = this.selectedtrip.IndexNumber
        this.travelmodel.WPNumber = this.selectedtrip.WorkPlanNumber
        this.travelmodel.CreatedByEmail = this.selectedtrip.CreatedByEmail
        this.travelmodel.etag = this.selectedtrip.etag
        this.travelmodel.uri = this.selectedtrip.uri
        if (this.travelmodel.WPNumber !== '') {
          let manager = await Workplan.dispatch('getManagerByWPNumber', this.travelmodel.WPNumber)
          this.ManagerID = manager[0]['Manager']['ID']
        }
      }
    },
    onModalHide: function() {
      this.$router.push({ name: 'Travel Tracker' })
    },
    async onModalSave() {
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
            name: vm.fileName,
            Status: 'TripReportReview',
            TripReport: library + vm.fileSelected,
            etag: vm.travelmodel.etag,
            uri: vm.travelmodel.uri
          })
          Travel.dispatch('editTripReport', event).then(function() {
            // Reload tracker
            vm.$store.dispatch('support/addActivity', '<div class="bg-success">TripReport-EDITRIPREPORT COMPLETED.</div>')
            // Create task for WP Manager to approve reject trip report
            let taskdata = {
              Type: 'Travel Data',
              TravelID: vm.TripId,
              IndexNumber: vm.travelmodel.IndexNumber,
              CreatedByEmail: vm.travelmodel.CreatedByEmail
            }
            payload = {
              Title: 'Approve/Reject Trip Report',
              AssignedToId: vm.ManagerID,
              Description: 'Approve or Reject Trip Report',
              IsMilestone: false,
              PercentComplete: 0,
              TaskType: 'Trip Report Review',
              TaskLink: library + vm.fileSelected,
              TaskData: taskdata
            }
            Todo.dispatch('addTodo', payload).then(function() {
              vm.$router.push({ name: 'Travel Tracker' })
            })
          })
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

<style lang="scss" scoped>
.formheader {
  height: 50px !important;
  color: white;
  vertical-align: middle;
  line-height: 50px !important;
}
</style>
