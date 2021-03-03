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
      legenditems: [
        {
          name: 'ReportLate',
          class: 'travel-ReportLate'
        },
        {
          name: 'ReportDue',
          class: 'travel-ReportDue'
        },
        {
          name: 'Approved',
          class: 'travel-Approved'
        },
        {
          name: 'WPMReview',
          class: 'travel-WPMReview'
        },
        {
          name: 'AFRLReview',
          class: 'travel-AFRLReview'
        },
        {
          name: 'Completed',
          class: 'travel-Completed'
        },
        {
          name: 'TripReportReview',
          class: 'travel-TripReportReview'
        },
        {
          name: 'Postponed',
          class: 'travel-Postponed'
        },
        {
          name: 'Cancelled',
          class: 'travel-Cancelled'
        }
      ]
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
