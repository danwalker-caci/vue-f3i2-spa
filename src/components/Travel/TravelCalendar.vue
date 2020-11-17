<template>
  <b-container fluid class="contentHeight m-0 p-0">
    <b-toast id="busy-toast" variant="warning" solid no-auto-hide>
      <template v-slot:toast-title>
        <div class="d-flex flex-grow-1 align-items-baseline">
          <b-img blank blank-color="#ff0000" class="mr-2" width="12" height="12"></b-img>
          <strong class="mr-auto">{{ busyTitle }}</strong>
        </div>
      </template>
      <b-spinner style="width: 7rem; height: 7rem;" variant="success" label="Waiting Spinner"></b-spinner>
    </b-toast>
    <b-row no-gutters ref="CalendarRow" class="contentHeight">
      <ejs-schedule
        id="TravelCalendar"
        ref="TravelCalendar"
        cssClass="contentHeight"
        :enablePersistence="false"
        :eventSettings="eventSettings"
        :selectedDate="defaultDate"
        :views="views"
        :currentView="currentView"
        :eventRendered="onEventRendered"
        :eventClick="onEventClick"
        :moreEventsClick="onMoreEventsClick"
        :cellClick="onCellClick"
        :popupOpen="onPopupOpen"
        :select="onSelect"
        :actionBegin="onActionBegin"
        :actionComplete="onActionComplete"
      >
        <e-views>
          <e-view option="Day"></e-view>
          <e-view option="Week"></e-view>
          <e-view option="Month"></e-view>
        </e-views>
      </ejs-schedule>
    </b-row>
  </b-container>
</template>

<script>
import Vue from 'vue'
import { SchedulePlugin, Day, Week, Month } from '@syncfusion/ej2-vue-schedule'
import User from '@/models/User'
import Travel from '@/models/Travel'
import Company from '@/models/Company'

Vue.use(SchedulePlugin)

let vm = null
let data = []

export default {
  name: 'Calendar',
  errorCaptured(err, vm, info) {
    const notification = {
      type: 'danger',
      title: 'Error in traveltracker.vue ' + err,
      message: info,
      push: false
    }
    this.$store.dispatch('notification/add', notification, { root: true })
  },
  computed: {
    travelloaded() {
      return Travel.getters('loaded')
    },
    travel() {
      return Travel.getters('allTravel')
    },
    appversion() {
      return User.getters('AppVersion')
    },
    currentuser() {
      return User.getters('CurrentUser')
    },
    companies() {
      return Company.getters('DropDown')
    },
    offset() {
      let o = this.$moment().utcOffset()
      o = o * -1
      return o
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
    isTravelApprover() {
      return User.getters('isTravelApprover')
    },
    isSubcontractor() {
      return User.getters('isSubcontractor')
    },
    profiledata() {
      return User.query().first()
    }
  },
  provide: {
    schedule: [Day, Week, Month]
  },
  data: function() {
    return {
      busyTitle: 'Getting Data. Please Wait.',
      moreevents: false,
      company: null,
      routeCount: 0,
      sortfield: '',
      sortdir: '',
      filteredtravel: [],
      TripId: 0,
      EditTravel: false,
      NewTravel: false,
      TripReport: false,
      IndexNumber: null,
      data: [],
      selectedDate: null,
      SelectedStart: null,
      SelectedEnd: null,
      defaultDate: new Date(),
      currentView: 'Month',
      views: ['Day', 'Week', 'Month'],
      eventSettings: {
        dataSource: data
      },
      height: '100%',
      fields: [
        {
          FieldName: 'Version',
          Value: null
        },
        {
          FieldName: 'Status',
          Visible: true,
          DisplayName: 'Status',
          Filter: false,
          Control: 'DropdownBox',
          DataType: 'Choice',
          DropdownSource: 'status',
          Selected: 'S',
          Predicate: 'E',
          FilterValue: '',
          Sort: '',
          Options: [
            { text: 'Select...', value: 'S' },
            { text: 'WPMReview', value: 'WPMReview' },
            { text: 'Approved', value: 'Approved' },
            { text: 'Rejected', value: 'Rejected' },
            { text: 'AFRLReview', value: 'AFRLReview' },
            { text: 'ATPRequested', value: 'ATPRequested' },
            { text: 'ATPApproved', value: 'ATPApproved' },
            { text: 'Completed', value: 'Completed' }
          ]
        },
        {
          FieldName: 'Comments',
          Visible: true,
          DisplayName: 'Purpose',
          Filter: false,
          Control: '',
          DataType: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'WorkPlanNumber',
          Visible: true,
          DisplayName: 'Workplan Number',
          Filter: false,
          Control: '',
          DataType: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'WorkPlanText',
          Visible: true,
          DisplayName: 'Workplan Name',
          Filter: false,
          Control: '',
          DataType: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'IndexNumber',
          Visible: true,
          DisplayName: 'Index Number',
          Filter: false,
          Control: '',
          DataType: 'Number',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'Created',
          Visible: true,
          DisplayName: 'Travel Requested',
          Filter: false,
          Control: '',
          DataType: 'Date',
          Predicate: 'S',
          FilterValue: '',
          FilterValue2: '',
          Sort: ''
        },
        {
          FieldName: 'StartDate',
          Visible: true,
          DisplayName: 'Departure Date',
          Filter: false,
          Control: '',
          DataType: 'Date',
          Predicate: 'S',
          FilterValue: '',
          FilterValue2: '',
          Sort: ''
        },
        {
          FieldName: 'EndDate',
          Visible: true,
          DisplayName: 'Return Date',
          Filter: false,
          Control: '',
          DataType: 'Date',
          Predicate: 'S',
          FilterValue: '',
          FilterValue2: '',
          Sort: ''
        },
        {
          FieldName: 'Company',
          Visible: true,
          DisplayName: 'Company',
          Filter: false,
          Control: 'DropdownBox',
          DataType: 'Choice',
          DropdownSource: 'companies',
          Selected: 'S',
          Predicate: 'E',
          FilterValue: '',
          Sort: '',
          Options: []
        },
        {
          FieldName: 'Sponsor',
          Visible: true,
          DisplayName: 'Sponsor',
          Filter: false,
          Control: '',
          DataType: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'EstimatedCost',
          Visible: true,
          DisplayName: 'Est Cost',
          Filter: false,
          Control: '',
          DataType: 'Number',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'PreApproved',
          Visible: true,
          DisplayName: 'Pre Approved',
          Filter: false,
          Control: 'DropdownBox',
          DataType: 'Choice',
          Selected: 'S',
          Predicate: 'E',
          FilterValue: '',
          Sort: '',
          Options: [
            { text: 'Select...', value: 'S' },
            { text: 'Yes', value: 'Yes' },
            { text: 'No', value: 'No' }
          ]
        },
        {
          FieldName: 'VisitRequest',
          Visible: true,
          DisplayName: 'Visit Request',
          Filter: false,
          Control: 'DropdownBox',
          DataType: 'Choice',
          DropdownSource: 'yesno',
          Selected: 'S',
          Predicate: 'E',
          FilterValue: '',
          Sort: '',
          Options: [
            { text: 'Select...', value: 'S' },
            { text: 'Yes', value: 'Yes' },
            { text: 'No', value: 'No' }
          ]
        },
        {
          FieldName: 'Clearance',
          Visible: true,
          DisplayName: 'Clearance',
          Filter: false,
          Control: 'DropdownBox',
          DataType: 'Choice',
          DropdownSource: 'clearance',
          Selected: 'S',
          Predicate: 'E',
          FilterValue: '',
          Sort: '',
          Options: [
            { text: 'Select...', value: 'S' },
            { text: 'None', value: 'None' },
            { text: 'S', value: 'S' },
            { text: 'TS', value: 'TS' },
            { text: 'TS/SCI', value: 'TS/SCI' }
          ]
        },
        {
          FieldName: 'OCONUS',
          Visible: true,
          DisplayName: 'OCONUS',
          Filter: false,
          Control: 'DropdownBox',
          DataType: 'Choice',
          DropdownSource: 'yesno',
          Selected: 'S',
          Predicate: 'E',
          FilterValue: '',
          Sort: '',
          Options: [
            { text: 'Select...', value: 'S' },
            { text: 'Yes', value: 'Yes' },
            { text: 'No', value: 'No' }
          ]
        },
        {
          FieldName: 'OCONUSLocation',
          Visible: true,
          DisplayName: 'OCONUS Location',
          Filter: false,
          Control: 'DropdownBox',
          DataType: 'Choice',
          DropdownSource: 'olocations',
          Selected: 'S',
          Predicate: 'E',
          FilterValue: '',
          Sort: '',
          Options: [
            { text: 'Select...', value: 'S' },
            { text: 'Germany', value: 'Germany' },
            { text: 'Korea', value: 'Korea' },
            { text: 'Other', value: 'Other' }
          ]
        },
        {
          FieldName: 'OCONUSApprovedBy',
          Visible: true,
          DisplayName: 'OCONUS Approved By',
          Filter: false,
          Control: '',
          DataType: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'OCONUSApprovedOn',
          Visible: true,
          DisplayName: 'OCONUS Approved Date',
          Filter: false,
          Control: '',
          DataType: 'Date',
          Predicate: 'S',
          FilterValue: '',
          FilterValue2: '',
          Sort: ''
        },
        {
          FieldName: 'TravelFrom',
          Visible: true,
          DisplayName: 'Travel From',
          Filter: false,
          Control: '',
          DataType: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'TravelTo',
          Visible: true,
          DisplayName: 'Travel To',
          Filter: false,
          Control: '',
          DataType: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'POCName',
          Visible: true,
          DisplayName: 'POC Name',
          Filter: false,
          Control: '',
          DataType: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'POCEmail',
          Visible: true,
          DisplayName: 'POC Email',
          Filter: false,
          Control: '',
          DataType: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'POC Phone',
          Visible: true,
          DisplayName: 'POC Phone',
          Filter: false,
          Control: '',
          DataType: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'SecurityAction',
          Visible: true,
          DisplayName: 'Security Action',
          Filter: false,
          Control: 'DropdownBox',
          DataType: 'Choice',
          DropdownSource: 'actions',
          Selected: 'S',
          Predicate: 'E',
          FilterValue: '',
          Sort: '',
          Options: [
            { text: 'Select...', value: 'S' },
            { text: 'Collateral VR Sent', value: 'Collateral VR Sent' },
            { text: 'SCI VR Sent', value: 'SCI VR Sent' },
            { text: 'Verified VR Processed in JPAS', value: 'Verified VR Processed in JPAS' },
            { text: 'Contacted Sub FSO', value: 'Contacted Sub FSO' }
          ]
        },
        {
          FieldName: 'SecurityActionCompleted',
          Visible: true,
          DisplayName: 'Security Action Completed',
          Filter: false,
          Control: '',
          DataType: 'Date',
          Predicate: 'S',
          FilterValue: '',
          FilterValue2: '',
          Sort: ''
        }
      ],
      ddfields: { text: 'text', value: 'value' },
      textpredicate: [
        { text: 'Select...', value: 'S' },
        { text: 'Starts With', value: 'SW' },
        { text: 'Ends With', value: 'EW' },
        { text: 'Contains', value: 'C' },
        { text: 'Equal', value: 'E' },
        { text: 'Not Equal', value: 'NE' }
      ],
      datepredicate: [
        { text: 'Select...', value: 'S' },
        { text: 'Greater Than', value: 'GT' },
        { text: 'Less Than', value: 'LT' },
        { text: 'Equal', value: 'E' },
        { text: 'Between', value: 'B' }
      ],
      numberpredicate: [
        { text: 'Select...', value: 'S' },
        { text: 'Greater Than', value: 'GT' },
        { text: 'Less Than', value: 'LT' },
        { text: 'Equal', value: 'E' }
      ],
      pageSettings: { pageSize: 30 },
      editSettings: {
        allowEditing: this.isWPManager || this.isAdmin ? true : false,
        allowAdding: true,
        allowDeleting: false,
        mode: 'Dialog'
      },
      toolbar: ['Add', 'Print', 'Search', 'ExcelExport'],
      rowData: {},
      legenditems: [
        {
          id: 0,
          type: 'alert',
          name: 'ReportLate',
          variant: 'red'
        },
        {
          id: 1,
          type: 'alert',
          name: 'ReportDue',
          variant: 'yellow',
          classes: 'text-dark'
        },
        {
          id: 2,
          type: 'alert',
          name: 'Approved',
          variant: 'orange',
          classes: 'text-dark'
        },
        {
          id: 3,
          type: 'alert',
          name: 'WPMReview',
          variant: 'blue'
        },
        {
          id: 4,
          type: 'alert',
          name: 'AFRLReview',
          variant: 'cyan'
        },
        {
          id: 5,
          type: 'alert',
          name: 'Completed',
          variant: 'green'
        }
      ],
      TravelersTemplate: function() {
        return {
          template: Vue.component('columnTemplate', {
            template: `
              <div v-for="(traveler, index) in travelers" :key="traveler">
                <span><span v-if="index > 0">, </span>{{traveler.firstName}} {{traveler.lastName}}</span>
              </div>
            `,
            data: function() {
              return {
                data: {}
              }
            },
            computed: {
              travelers() {
                return JSON.parse(this.data.Travelers)
              }
            }
          })
        }
      },
      TripReportTemplate: function() {
        return {
          template: Vue.component('columnTemplate', {
            template: `
              <div>
                <a :href="href" target="_blank">{{ tripreport }}</span>
              </div>
            `,
            data: function() {
              return {
                data: {}
              }
            },
            computed: {
              tripreport() {
                return this.data.TripReport
              },
              href() {
                return this.data.TripReportLink
              }
            }
          })
        }
      },
      ActionsTemplate: function() {
        return {
          template: Vue.component('actionsTemplate', {
            template: `
            <div>
              <b-button v-if="isWPManager || isAdmin" variant="success" class="actionbutton" @click="edit(data)" title="Edit Travel">
                <font-awesome-icon far icon="edit" class="icon"></font-awesome-icon>
              </b-button>
              <b-button variant="success" class="actionbutton" @click="report(data)" title="Add/Edit Trip Report">
                <font-awesome-icon far icon="upload" class="icon"></font-awesome-icon>
              </b-button>
              <b-button v-if="isWPManager || isAdmin || isPM" variant="warning" class="actionbutton" @click="postpone(data)" title="Postpone Travel">
                <font-awesome-icon far icon="hand-paper" class="icon"></font-awesome-icon>
              </b-button>
              <b-button v-if="isWPManager || isAdmin || isPM" variant="danger" class="actionbutton" @click="cancel(data)" title="Cancel Travel">
                <font-awesome-icon far icon="plane-slash" class="icon"></font-awesome-icon>
              </b-button>
            </div>`,
            data: function() {
              return {
                data: {}
              }
            },
            computed: {
              isPM() {
                return User.getters('isPM')
              },
              isAdmin() {
                return User.getters('isAdmin')
              },
              isWPManager() {
                return User.getters('isWPManager')
              },
              isSubcontractor() {
                return User.getters('isSubcontractor')
              },
              isAFRL() {
                return User.getters('isAFRL')
              }
            },
            methods: {
              edit: function(data) {
                // TODO: close any modal that may be open. Most likely should never have one open at this point. Then set travelid to selected travel and open edit form
                vm.EditTravel = false
                vm.TripId = data.Id
                vm.EditTravel = true
              },
              report: function(data) {
                vm.IndexNumber = data.IndexNumber
                vm.TripReport = false
                vm.TripId = data.Id
                vm.TripReport = true
              },
              postpone: async function(data) {
                console.log(`Postpone Data: ${JSON.stringify(data)}`)
                // post the data to the list and then reload the data
                let response = await Travel.dispatch('postponeTravel', data)
                vm.$store.dispatch('support/addActivity', '<div class="bg-secondary">' + response.toString() + '</div>')
                let path = '/travel/home/refresh' + vm.mode
                vm.$router.push({ path: path })
              },
              cancel: async function(data) {
                console.log(`Cancel Data: ${JSON.stringify(data)}`)
                // post the data to the list and then reload the data
                let response = await Travel.dispatch('cancelTravel', data)
                vm.$store.dispatch('support/addActivity', '<div class="bg-secondary">' + response.toString() + '</div>')
                let path = '/travel/home/refresh' + vm.mode
                vm.$router.push({ path: path })
              }
            }
          })
        }
      }
    }
  },
  mounted: function() {
    vm = this
    this.$store.dispatch('support/addActivity', '<div class="bg-info">Travel Calendar Mounted</div>')
    this.company = this.currentuser[0].Company
    if (console) {
      console.log('COMPANY: ' + this.company)
    }
    this.$bvToast.show('busy-toast')
    // Check if user is subcontractor first.
    if (this.isSubcontractor == true) {
      if (this.company !== null) {
        let payload = {}
        payload.company = this.company
        Travel.dispatch('getTripsByCompany', payload).then(function() {
          vm.$bvToast.hide('busy-toast')
          vm.$options.interval = setInterval(vm.waitForEvents, 1000)
        })
      } else {
        // TODO: LET THE USER KNOW?
      }
    } else {
      Travel.dispatch('getTRIPS').then(function() {
        vm.$bvToast.hide('busy-toast')
        vm.$options.interval = setInterval(vm.waitForEvents, 1000)
      })
    }
  },
  beforeDestroy() {
    this.$store.dispatch('support/setLegendItems', [])
  },
  methods: {
    waitForEvents: function() {
      this.$store.dispatch('support/addActivity', '<div class="bg-info">Travel Calendar WAITING FOR EVENTS</div>')
      if (this.travel && this.travel.length > 0) {
        this.$bvToast.hide('busy-toast')
        clearInterval(this.$options.interval)
        let oldevents = this.$refs.TravelCalendar.getEvents()
        this.$refs.TravelCalendar.deleteEvent(oldevents)
        this.$refs.TravelCalendar.addEvent(this.travel)
      }
      this.$store.dispatch('support/setLegendItems', this.legenditems)
    },
    getRef: function(text, idx) {
      return text + '_' + idx
    },
    onPopupOpen: function(args) {
      if (console) {
        console.log('Popup Open')
      }
      try {
        let element = String(args.data.element.className)
        if (element.indexOf('more') <= 0) {
          args.cancel = true
        }
      } catch (e) {
        if (console) {
          console.log(e)
        }
        args.cancel = true
      }
    },
    onCellClick: function(args) {
      /* if (console) {
        console.log('Cell Clicked: ' + args.requestType)
      } */
      args.cancel = true
      if (this.moreevents) {
        // do nothing here
        this.moreevents = false
      } else {
        if (this.NewTravel == false) {
          let s = args.startTime
          let e = args.endTime
          s = this.$moment(s).format() // 'YYYY-MM-DD[T]HH:MM:[00Z]'
          s = this.$moment(s)
            .utc()
            .format()
          s = this.$moment(s)
            .add(this.offset, 'm')
            .format()
          s = this.$moment(s).format('YYYY-MM-DD')
          e = this.$moment(e).format()
          e = this.$moment(e)
            .utc()
            .format()
          e = this.$moment(e)
            .subtract(this.offset, 'm')
            .format()
          e = this.$moment(e).format('YYYY-MM-DD')
          this.$router.push({ name: 'New Travel', params: { back: 'Travel Calendar', start: s, end: e } })
        }
      }
    },
    onSelect: function(args) {
      args.cancel = true
      if (console) {
        console.log('ONSELECT: ' + args.requestType)
      }
      if (args.requestType === 'cellSelect') {
        let s = args.data.StartTime
        let e = args.data.EndTime
        s = this.$moment(s).format() // 'YYYY-MM-DD[T]HH:MM:[00Z]'
        s = this.$moment(s)
          .utc()
          .format()
        s = this.$moment(s)
          .add(this.offset, 'm')
          .format()
        s = this.$moment(s).format('YYYY-MM-DD')
        e = this.$moment(e).format()
        e = this.$moment(e)
          .utc()
          .format()
        e = this.$moment(e)
          .subtract(this.offset, 'm')
          .format()
        e = this.$moment(e).format('YYYY-MM-DD')
        this.NewTravel = true
        this.SelectedStart = s
        this.SelectedEnd = e
        this.$router.push({ name: 'New Travel', params: { back: 'Travel Calendar', start: s, end: e } })
      }
      if (args.requestType === 'eventSelect') {
        this.EditTravel = false
        this.TripId = args.event.id
        if (this.moreevents) {
          this.moreevents = false
        } else {
          if (this.isWPManager || this.isDeveloper) {
            this.EditTravel = true
          }
        }
      }
    },
    onEventRendered: function(args) {
      let c = args.data.Status
      switch (c) {
        case 'Approved': {
          args.element.classList.add('bg-orange', 'text-dark')
          break
        }

        case 'WPMReview': {
          args.element.classList.add('bg-blue')
          break
        }

        case 'AFRLReview': {
          args.element.classList.add('bg-cyan')
          break
        }

        case 'ReportDue': {
          args.element.classList.add('bg-yellow', 'text-dark')
          break
        }

        case 'ReportLate': {
          args.element.classList.add('bg-red')
          break
        }

        case 'Completed': {
          args.element.classList.add('bg-green')
          break
        }
      }
    },
    onEventClick(args) {
      args.cancel = true
      if (this.moreevents) {
        this.moreevents = false
      } else {
        if (this.isWPManager || this.isDeveloper) {
          this.$router.push({ name: 'Edit Travel', params: { back: 'Travel Calendar', TripId: args.event.id } })
        }
      }
    },
    onMoreEventsClick: function() {
      this.moreevents = true
    }
  }
}
</script>

<style lang="scss">
.modal-body {
  padding: 0.5rem !important;
}

.sorted {
  color: #04ee04 !important;
}

.full {
  width: 100%;
}

#FilterModal .modal-dialog {
  margin: 1.75rem 0 auto !important;
}

#ShowFilters {
  height: 40px;
}

.tableHeight {
  height: calc(100vh - 130px);
}

#ulFields {
  list-style-type: none;
  background-color: white;
  color: black !important;
  width: 100%;
  margin-bottom: 10px;
  font-size: 16px !important;
  padding: 10px;
}

#ulFields li {
  list-style-type: none;
  margin-bottom: 5px !important;
}

.filterform {
  height: 22px !important;
  border: 1px solid black !important;
  border-radius: 4px !important;
  font-size: 1rem;
}

.e-time {
  display: none !important;
}

.e-label {
  font-size: 16px !important;
}

.detailtable td {
  font-size: 13px;
  padding: 4px;
  width: 800px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

#EditTable {
  font-size: 0.75rem !important;
}

.table td,
.table th {
  padding: 0.15rem !important;
}

.e-pager {
  height: 60px;
}

.e-toolbar {
  min-height: 39px; /* There is a 1px top border so height will be 40px. Used in calculating #data rows */
}

input.e-input {
  height: 20px !important;
}

.e-input-group.e-control-wrapper .e-input-group-icon,
.e-input-group .e-input-group-icon {
  min-height: 20px !important;
}

.e-icon-grightarrow,
.e-icon-gdownarrow {
  color: black !important;
}
</style>
