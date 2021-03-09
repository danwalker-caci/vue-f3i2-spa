<template>
  <b-container fluid class="contentHeight m-0 p-0">
    <b-row no-gutters class="contentHeight">
      <b-toast id="busy-toast" variant="warning" solid no-auto-hide>
        <template v-slot:toast-title>
          <div class="d-flex flex-grow-1 align-items-baseline">
            <b-img blank blank-color="#ff0000" class="mr-2" width="12" height="12"></b-img>
            <strong class="mr-auto">{{ busyTitle }}</strong>
          </div>
        </template>
        <b-spinner style="width: 7rem; height: 7rem;" variant="success" label="Waiting Spinner"></b-spinner>
      </b-toast>
      <b-modal ref="FilterModal" id="FilterModal" size="sm" no-fade modal-class="animated bounceInLeft">
        <template v-slot:modal-title>Travel Filter</template>
        <div>
          <ul id="ulFields">
            <li v-for="field in fields" :key="field">
              <div v-if="field.FieldName !== 'Version'">
                <ejs-checkbox :label="field.DisplayName" v-model="field.Visible" :checked="field.Visible" @change="showorhide" :value="field.FieldName"></ejs-checkbox>
                <b-button size="sm" class="actionbutton float-right" :class="field.Filter ? null : 'collapsed'" :aria-expanded="field.Filter ? 'true' : 'false'" :aria-controls="getRef('collapse', field.FieldName)" @click="field.Filter = !field.Filter">
                  <font-awesome-icon fas icon="filter" class="icon"></font-awesome-icon>
                </b-button>
                <b-button size="sm" class="actionbutton float-right" :class="field.Sort == 'Down' ? 'sorted' : ''" :id="getRef('sortdown', field.FieldName)" @click="sortdown(field.FieldName, field.DataType)">
                  <font-awesome-icon fas icon="arrow-down" class="icon"></font-awesome-icon>
                </b-button>
                <b-button size="sm" class="actionbutton float-right" :class="field.Sort == 'Up' ? 'sorted' : ''" :id="getRef('sortup', field.FieldName)" @click="sortup(field.FieldName, field.DataType)">
                  <font-awesome-icon fas icon="arrow-up" class="icon"></font-awesome-icon>
                </b-button>
                <b-collapse class="mt-1" :id="getRef('collapse', field.FieldName)" v-model="field.Filter">
                  <b-container fluid>
                    <b-row class="mb-1">
                      <ejs-dropdownlist v-if="field.DataType == 'Text'" v-model="field.Predicate" :dataSource="textpredicate" :fields="ddfields"></ejs-dropdownlist>
                      <ejs-dropdownlist v-if="field.DataType == 'Number'" v-model="field.Predicate" :dataSource="numberpredicate" :fields="ddfields"></ejs-dropdownlist>
                      <ejs-dropdownlist v-if="field.DataType == 'Date'" v-model="field.Predicate" :dataSource="datepredicate" :fields="ddfields"></ejs-dropdownlist>
                    </b-row>
                    <b-row v-if="field.Control == 'DropdownBox'" class="mb-1">
                      <div v-if="field.DataType == 'Choice'" class="full">
                        <ejs-dropdownlist v-model="field.Selected" :dataSource="field.Options" :fields="ddfields"></ejs-dropdownlist>
                      </div>
                    </b-row>
                    <b-row v-if="field.Control != 'DropdownBox'" class="mb-1">
                      <b-form-input class="filterform" v-if="field.DataType == 'Text'" v-model="field.FilterValue"></b-form-input>
                      <b-form-input class="filterform" v-if="field.DataType == 'Number'" v-model="field.FilterValue"></b-form-input>
                      <ejs-datepicker v-if="field.DataType == 'Date'" v-model="field.FilterValue"></ejs-datepicker>
                    </b-row>
                    <b-row v-if="field.Predicate == 'B'" class="mb-1">
                      <ejs-datepicker v-if="field.DataType == 'Date'" v-model="field.FilterValue2"></ejs-datepicker>
                    </b-row>
                    <b-row>
                      <div class="full">
                        <b-button size="sm" variant="danger" :id="getRef('clear', field.FieldName)" class="float-right ml-1" @click="clearfilter">Clear</b-button>
                        <b-button size="sm" variant="success" :id="getRef('filter', field.FieldName)" class="float-right" @click="setfilter">Filter</b-button>
                      </div>
                    </b-row>
                  </b-container>
                </b-collapse>
              </div>
            </li>
            <li class="py30">
              <div class="full py30">
                <b-button size="sm" variant="danger" id="clearfilters" class="float-right ml-1" @click="clearfilters">Clear Filters</b-button>
                <b-button size="sm" variant="success" id="savefilters" class="float-right" @click="savefilters">Save Filters</b-button>
              </div>
            </li>
          </ul>
        </div>
      </b-modal>
      <b-col cols="12" class="m-0 p-0">
        <b-container fluid class="contentHeight m-0 p-0">
          <b-form @submit="onSubmit">
            <b-row no-gutters class="buttonrow">
              <b-button id="ShowFilters" class="btn btn-warning" @click="ToggleFilters">
                Toggle Filters
              </b-button>
              <!-- <b-input-group class="searchgroup">
                <b-form-input type="text" placeholder="Search..." class="form-control form-control-search" v-model="searchinput" v-on:keyup.enter="searchme"></b-form-input>
                <b-input-group-append>
                  <b-button variant="warning" class="form-control-search-button" @click.stop="searchme" title="Search">
                    <font-awesome-icon far icon="search" class="icon"></font-awesome-icon>
                  </b-button>
                </b-input-group-append>
              </b-input-group> -->
            </b-row>
            <b-row no-gutters class="gridrow">
              <ejs-grid
                id="TravelGrid"
                ref="TravelGrid"
                :frozenColumns="2"
                :enablePersistence="false"
                :dataSource="filteredtravel"
                :allowPaging="true"
                :allowReordering="true"
                :allowResizing="true"
                :pageSettings="pageSettings"
                :editSettings="editSettings"
                :toolbar="toolbar"
                :allowExcelExport="true"
                :toolbarClick="toolbarClick"
                :dataBound="dataBound"
                :actionBegin="actionBegin"
                :actionComplete="actionComplete"
                :queryCellInfo="formatCell"
                :excelQueryCellInfo="formatExcelCell"
                rowHeight="20"
                :height="rect.height - 125"
                :width="rect.width - 5"
              >
                <e-columns>
                  <e-column headerText="Actions" textAlign="Left" width="100" :template="ActionsTemplate"></e-column>
                  <e-column field="Status" headerText="Status" width="150"></e-column>
                  <!-- <e-column field="Comments" headerText="Purpose" textAlign="Left" width="350"></e-column> -->
                  <e-column field="Title" headerText="Title" textAlign="Left" width="400"></e-column>
                  <e-column field="WorkPlanNumber" headerText="Workplan Number" textAlign="Left" width="150"></e-column>
                  <e-column field="WorkPlanText" headerText="Workplan Name" textAlign="Left" width="250"></e-column>
                  <e-column field="IndexNumber" headerText="Index Number" textAlign="Left" width="140"></e-column>
                  <e-column field="Created" headerText="Travel Requested" textAlign="Left" width="150" type="date" format="yMd"></e-column>
                  <e-column field="StartTime" headerText="Departure Date" textAlign="Left" width="140" type="date" format="yMd"></e-column>
                  <e-column field="EndTime" headerText="Return Date" textAlign="Left" width="140" type="date" format="yMd"></e-column>
                  <e-column field="TravelersText" headerText="Travelers" textAlign="Left" width="200"></e-column>
                  <e-column field="Company" headerText="Company" textAlign="Left" width="150"></e-column>
                  <e-column field="Sponsor" headerText="Sponsor" textAlign="Left" width="150"></e-column>
                  <e-column field="EstimatedCost" headerText="Est Cost" textAlign="Left" width="100"></e-column>
                  <e-column field="PreApproved" headerText="Pre Approved" textAlign="Left" width="100"></e-column>
                  <e-column field="VisitRequest" headerText="Visit Request" textAlign="Left" width="150"></e-column>
                  <e-column field="Clearance" headerText="Clearance" textAlign="Left" width="100"></e-column>
                  <e-column field="OCONUS" headerText="OCONUS" textAlign="Left" width="100"></e-column>
                  <e-column field="OCONUSLocation" headerText="OCONUS Location" textAlign="Left" width="150"></e-column>
                  <e-column field="OCONUSApprovedBy" headerText="OCONUS Approved By" textAlign="Left" width="180"></e-column>
                  <e-column field="OCONUSApprovedOn" headerText="OCONUS Approved Date" textAlign="Left" width="200" type="date" format="yMd"></e-column>
                  <e-column field="TravelFrom" headerText="Travel From" textAlign="Left" width="150"></e-column>
                  <e-column field="TravelTo" headerText="Travel To" textAlign="Left" width="150"></e-column>
                  <e-column field="POCName" headerText="POC Name" textAlign="Left" width="120"></e-column>
                  <e-column field="POCEmail" headerText="POC Email" textAlign="Left" width="180"></e-column>
                  <e-column field="POCPhone" headerText="POC Phone" textAlign="Left" width="100"></e-column>
                  <e-column field="SecurityAction" headerText="Security Action" textAlign="Left" width="200"></e-column>
                  <e-column field="SecurityActionCompleted" headerText="Security Action Completed" textAlign="Left" width="200" type="date" format="yMd"></e-column>
                  <e-column field="TripReport" headerText="Trip Report" textAlign="Left" width="180" :template="TripReportTemplate"></e-column>
                  <e-column field="Id" headerText="Id" :visible="false" textAlign="Left" width="40" :isPrimaryKey="true"></e-column>
                </e-columns>
              </ejs-grid>
            </b-row>
          </b-form>
        </b-container>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import Vue from 'vue'
import { Page, Edit, Toolbar, Resize, Reorder, VirtualScroll, ExcelExport, DetailRow, Freeze, Search } from '@syncfusion/ej2-vue-grids'
import User from '@/models/User'
import Travel from '@/models/Travel'

let vm = null
let data = []

export default {
  name: 'Tracker',
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
    userloaded() {
      return User.getters('Loaded')
    },
    currentuser() {
      return User.getters('CurrentUser')
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
    },
    rect() {
      return this.$store.state.support.contentrect
    }
  },
  provide: {
    grid: [Page, Edit, DetailRow, Toolbar, Resize, Reorder, VirtualScroll, ExcelExport, Freeze, Search]
  },
  data: function() {
    return {
      busyTitle: 'Getting Data. Please Wait.',
      searchinput: '',
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
            { text: 'Trip Report Late', value: 'ReportLate' },
            { text: 'Trip Report Due', value: 'ReportDue' },
            { text: 'Trip Report Review', value: 'TripReportReview' },
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
      toolbar: ['Add', 'Print', 'ExcelExport', 'Search'],
      rowData: {},
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
                <a :href="href" target="_blank">{{ tripreport }}</a>
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
              <b-button v-if="isWPManager || isAdmin" class="actionbutton transparent text-white" @click="edit(data)" v-b-tooltip.hover.v-dark title="Edit Travel">
                <font-awesome-icon far icon="edit" class="icon"></font-awesome-icon>
              </b-button>
              <b-button class="actionbutton transparent text-white" @click="report(data)" v-b-tooltip.hover.v-dark title="Add/Edit Trip Report">
                <font-awesome-icon far icon="upload" class="icon"></font-awesome-icon>
              </b-button>
              <b-button v-if="isWPManager || isAdmin || isPM" class="actionbutton transparent text-white" @click="postpone(data)" v-b-tooltip.hover.v-dark title="Postpone Travel">
                <font-awesome-icon far icon="hand-paper" class="icon"></font-awesome-icon>
              </b-button>
              <b-button v-if="isWPManager || isAdmin || isPM" class="actionbutton transparent text-white" @click="cancel(data)" v-b-tooltip.hover.v-dark title="Cancel Travel">
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
                vm.$router.push({ name: 'Edit Travel', params: { back: 'Travel Tracker', TripId: data.Id } })
              },
              report: function(data) {
                vm.$router.push({ name: 'Trip Report', params: { back: 'Travel Tracker', TripId: data.Id, IndexNumber: data.IndexNumber } })
              },
              postpone: async function(data) {
                console.log(`Postpone Data: ${JSON.stringify(data)}`)
                // post the data to the list and then reload the data
                let response = await Travel.dispatch('postponeTravel', data)
                vm.$store.dispatch('support/addActivity', '<div class="bg-secondary">' + response.toString() + '</div>')
                vm.$router.push({ name: 'Travel', params: { mode: 'refreshtracker' } })
              },
              cancel: async function(data) {
                console.log(`Cancel Data: ${JSON.stringify(data)}`)
                // post the data to the list and then reload the data
                let response = await Travel.dispatch('cancelTravel', data)
                vm.$store.dispatch('support/addActivity', '<div class="bg-secondary">' + response.toString() + '</div>')
                vm.$router.push({ name: 'Travel', params: { mode: 'refreshtracker' } })
              }
            }
          })
        }
      }
    }
  },
  mounted: function() {
    vm = this
    try {
      Travel.dispatch('getDigest')
      this.$store.dispatch('support/addActivity', '<div class="bg-info">TravelTracker-MOUNTED</div>')
      this.$options.interval = setInterval(this.waitForUser, 500)
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
  beforeDestroy() {
    this.$store.dispatch('support/setLegendItems', [])
  },
  methods: {
    waitForUser: function() {
      if (this.userloaded) {
        clearInterval(this.$options.interval)
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
          try {
            Travel.dispatch('getTRIPS').then(function() {
              vm.$bvToast.hide('busy-toast')
              vm.$options.interval = setInterval(vm.waitForEvents, 1000)
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
        }
      }
    },
    loadEvents: function() {},
    waitForEvents: function() {
      this.$store.dispatch('support/addActivity', '<div class="bg-info">traveltracker-WAITING FOR EVENTS:  ' + this.mode + '</div>')
      if (this.travel && this.travel.length > 0) {
        this.$bvToast.hide('busy-toast')
        clearInterval(this.$options.interval)
        this.filteredtravel = Vue._.orderBy(this.travel, 'Id', 'desc')
        // load any saved filters
        this.loadfilters()
        this.fields[9]['Options'] = this.companies
        this.$store.dispatch('support/setLegendItems', this.legenditems)
      }
    },
    getRef: function(text, idx) {
      return text + '_' + idx
    },
    onSubmit(event) {
      event.preventDefault() // prevent form submit! VERY IMPORTANT because search function adds input box which will perform a submit.
    },
    toolbarClick: function(args) {
      switch (args.item.id) {
        case 'TravelGrid_excelexport':
          this.$refs['TravelGrid'].excelExport()
          break

        case 'TravelGrid_print':
          this.$refs['TravelGrid'].print()
          break
      }
    },
    ToggleFilters() {
      this.$refs['FilterModal'].toggle('#ShowFilters')
    },
    searchme: function() {
      this.$refs.TravelGrid.search(this.searchinput)
    },
    actionBegin(args) {
      // console.log('ACTIONBEGIN: ' + args.requestType)
      switch (args.requestType) {
        case 'add':
          args.cancel = true
          this.$router.push({ name: 'New Travel', params: { back: 'Travel Tracker' } })
          break
      }
    },
    actionComplete(args) {
      /* if (console) {
        console.log('ACTION COMPLETE: ' + args.requestType)
      } */
      if (args.requestType == 'columnstate') {
        this.$refs['TravelGrid'].autoFitColumns()
      }
      if (args.requestType == 'refresh') {
        let h1 = 0
        let h2 = this.$refs.TravelGrid.$el.children[7].children[0].clientHeight // cildren[7] matches .e-gridconent
        h1 = Math.floor(h2 / 20)
        this.pageSettings.pageSize = h1
        this.$refs.TravelGrid.pageSettings = { pageSize: h1 }
      }
    },
    dataBound: function() {
      this.$refs.TravelGrid.autoFitColumns()
    },
    rowDataBound: function(args) {
      // set class based on status
      let c = String(args.data['Status'])
      c = 'travel-' + c
      args.row.classList.add(c)
    },
    formatCell: function(args) {
      let c = String(args.data['Status'])
      c = 'travel-' + c
      if (args.column.field == 'TripReport') {
        args.cell.classList.add('bg-white', 'text-dark')
      } else {
        args.cell.classList.add(c)
      }
    },
    formatExcelCell: function(args) {
      switch (args.column.field) {
        case 'Created': {
          args.value = this.$moment(args.value).format('MM/DD/YYYY')
          break
        }
        case 'StartTime': {
          args.value = this.$moment(args.value).format('MM/DD/YYYY')
          break
        }
        case 'EndTime': {
          args.value = this.$moment(args.value).format('MM/DD/YYYY')
          break
        }
        case 'OCONUSApprovedOn': {
          args.value = this.$moment(args.value).format('MM/DD/YYYY')
          break
        }
        case 'SecurityActionCompleted': {
          args.value = this.$moment(args.value).format('MM/DD/YYYY')
          break
        }
      }
    },
    hideme: function(modal, action) {
      vm.$bvModal.hide(modal)
      if (action == 'refresh') {
        vm.$router.push({ name: 'Refresh', params: { action: 'travel' } })
      }
    },
    sortup: function(e, t) {
      // ascending
      var p = this.filteredtravel
      if (t == 'Date') {
        p = Vue._.orderBy(
          p,
          function(o) {
            return new this.$moment(o[e]).format('YYYYMMDD')
          },
          'asc'
        )
      } else {
        p = Vue._.orderBy(p, e, 'asc')
      }
      this.filteredtravel = p
      this.$refs.TravelGrid.refresh()
      for (var i = 0; i < this.fields.length; i++) {
        if (this.fields[i].FieldName == e) {
          console.log('SORT UP: ' + e)
          this.fields[i].Sort = 'Up'
        } else {
          this.fields[i].Sort = ''
        }
      }
    },
    sortdown: function(e, t) {
      // descending
      var p = this.filteredtravel
      if (t == 'Date') {
        p = Vue._.orderBy(
          p,
          function(o) {
            return new this.$moment(o[e]).format('YYYYMMDD')
          },
          'desc'
        )
      } else {
        p = Vue._.orderBy(p, e, 'desc')
      }
      this.filteredtravel = p
      this.$refs.TravelGrid.refresh()
      for (var i = 0; i < this.fields.length; i++) {
        if (this.fields[i].FieldName == e) {
          // console.log('SORT DOWN: ' + e)
          this.fields[i].Sort = 'Down'
        } else {
          this.fields[i].Sort = ''
        }
      }
    },
    showorhide: function(e) {
      var checked = e.checked
      var displayname = e.event.target.labels[0].innerText
      var field = this.fields.filter(obj => {
        obj.DisplayName === displayname
      })
      console.log(field)
      field.Visible = checked
      if (checked) {
        this.$refs.TravelGrid.showColumns([displayname])
        this.$refs.TravelGrid.autoFitColumns()
      } else {
        this.$refs.TravelGrid.hideColumns([displayname])
        this.$refs.TravelGrid.autoFitColumns()
      }
    },
    setfilter: function() {
      // always reset to all records then do all filters as they are selected.
      // this is a top down filter
      // loop through all the fields and filter the ones that have a predicate and filtervalue set
      var p = this.travel // set initial filter to all based on the module. travel in this case
      for (var i = 1; i < this.fields.length; i++) {
        if (this.fields[i].Predicate !== 'S') {
          if (this.fields[i].FilterValue !== '' || this.fields[i].Selected !== 'S') {
            // determine what to filter based on predicate
            switch (this.fields[i].Predicate) {
              case 'SW':
                // Starts With
                p = p.filter(search => Vue._.startsWith(search[this.fields[i].FieldName], this.fields[i].FilterValue))
                break

              case 'EW':
                // Ends With
                p = p.filter(search => Vue._.endsWith(search[this.fields[i].FieldName], this.fields[i].FilterValue))
                break

              case 'C':
                // Contains
                p = p.filter(search => Vue._.includes(search[this.fields[i].FieldName], this.fields[i].FilterValue))
                break

              case 'E':
                // Equals
                if (this.fields[i].DataType == 'Choice') {
                  p = p.filter(search => Vue._.isEqual(search[this.fields[i].FieldName], this.fields[i].Selected))
                } else {
                  if (this.fields[i].DataType == 'Number') {
                    p = p.filter(search => search[this.fields[i].FieldName] == this.fields[i].FilterValue)
                  } else {
                    p = p.filter(search => this.$moment(search[this.fields[i].FieldName]).isSame(this.$moment(this.fields[i].FilterValue), 'day'))
                  }
                }
                break

              case 'NE':
                // Not Equals
                p = p.filter(search => Vue._.without(search[this.fields[i].FieldName], this.fields[i].FilterValue))
                break

              case 'GT':
                // Greater Than
                if (this.fields[i].DataType == 'Number') {
                  p = p.filter(search => search[this.fields[i].FieldName] > this.fields[i].FilterValue)
                } else {
                  // date
                  p = p.filter(search => this.$moment(search[this.fields[i].FieldName]).isAfter(this.$moment(this.fields[i].FilterValue)))
                }
                break

              case 'LT':
                // Less Than
                if (this.fields[i].DataType == 'Number') {
                  p = p.filter(search => search[this.fields[i].FieldName] < this.fields[i].FilterValue)
                } else {
                  // date
                  p = p.filter(search => this.$moment(this.fields[i].FilterValue).isAfter(this.$moment(search[this.fields[i].FieldName])))
                }
                break

              case 'B':
                // Between
                p = p.filter(search => this.$moment(search[this.fields[i].FieldName]).isBetween(this.$moment(this.fields[i].FilterValue), this.$moment(this.fields[i].FilterValue2)))
                break
            }
            if (this.sortfield !== '') {
              // if this is a date field we need to do a bit more work to convert and test for sorting
              if (this.fields[i].DataType == 'Date') {
                var f = this.fields[i].FieldName
                p = Vue._.orderBy(
                  p,
                  function(o) {
                    return new this.$moment(o[f]).format('YYYYMMDD')
                  },
                  this.sortdir
                )
              } else {
                p = Vue._.orderBy(p, this.sortfield, this.sortdir)
              }
            } else {
              p = Vue._.orderBy(p, 'Id', 'desc')
            }
          }
        }
      }
      if (this.sortfield == '') {
        p = Vue._.orderBy(p, 'Id', 'desc')
      }
      this.filteredtravel = p
    },
    clearfilter: function(e) {
      var f = String(e.target.id).split('_')[1]
      // console.log('CLEARING FILTER: ' + f)
      for (var i = 1; i < this.fields.length; i++) {
        this.fields[i].Sort = ''
        if (this.fields[i].FieldName == f) {
          this.fields[i].Predicate = 'S'
          this.fields[i].FilterValue = ''
          if (this.fields[i].DataType == 'Date') {
            this.fields[i].FilterValue2 = ''
          }
          if (this.fields[i].DataType == 'Choice') {
            this.fields[i].Predicate = 'E'
            this.fields[i].Selected = 'S'
          }
          if (this.fields[i].DataType == 'Number' && this.fields[i].Control == 'DropdownBox') {
            this.fields[i].Predicate = 'S'
            this.fields[i].FilterValue = 'S'
          }
        }
      }
      this.setfilter()
    },
    clearfilters: function() {
      window.localStorage.removeItem('TravelFilter')
      for (var i = 1; i < this.fields.length; i++) {
        this.fields[i].Sort = ''
        this.fields[i].Predicate = 'S'
        this.fields[i].FilterValue = ''
        this.fields[i].Sort = ''
        if (this.fields[i].DataType == 'Date') {
          this.fields[i].FilterValue2 = ''
        }
        if (this.fields[i].DataType == 'Choice') {
          this.fields[i].Predicate = 'E'
          this.fields[i].Selected = 'S'
        }
        if (this.fields[i].DataType == 'Number' && this.fields[i].Control == 'DropdownBox') {
          this.fields[i].Predicate = 'S'
          this.fields[i].FilterValue = 'S'
        }
      }
      this.filteredtravel = this.travel
      this.setfilter()
    },
    savefilters: function() {
      this.fields[0].Value = this.appversion
      window.localStorage.setItem('TravelFilter', JSON.stringify(this.fields))
    },
    loadfilters: function() {
      let f = String(window.localStorage.getItem('TravelFilter'))
      if (f != 'null') {
        // here we will load the fields from local storage and test the version.
        // if the version matches the current app version then load the fields.
        // if not use the new fields from the file and alert the user that they need to rebuild their filters
        let flds = JSON.parse(f)
        let version = flds[0]['Value']
        // console.log('TEST POINT A: ' + version + ', flds: ' + flds)
        if (version == this.appversion) {
          // ask the user if they want to apply the saved filters or clear them
          this.$bvModal
            .msgBoxConfirm('Load your saved filter?', {
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
            .then(value => {
              if (value == true) {
                this.fields = flds
                // loop to display the selected columns
                for (var i = 1; i < this.fields.length; i++) {
                  // starting at 1 to skip the version 'field'
                  if (this.fields[i].Visible) {
                    this.$refs.TravelGrid.showColumns(this.fields[i].DisplayName)
                    this.$refs.TravelGrid.autoFitColumns()
                  } else {
                    this.$refs.TravelGrid.hideColumns(this.fields[i].DisplayName)
                    this.$refs.TravelGrid.autoFitColumns()
                  }
                  if (this.fields[i].Sort !== '') {
                    this.sortfield = this.fields[i].FieldName
                    this.sortdir = this.fields[i].Sort
                  }
                }
                this.setfilter()
              }
            })
            .catch(err => {
              console.log(err)
            })
        } else {
          // versions don't match so let the user know
          this.$bvModal.msgBoxOk('The fields have changed so you will need to reapply your filters', {
            title: 'Confirmation',
            size: 'md',
            buttonSize: 'md',
            okVariant: 'success',
            headerClass: 'p-2 border-bottom-0',
            footerClass: 'p-2 border-top-0',
            centered: true
          })
        }
      }
    }
  }
}
</script>

<style lang="scss">
.buttonrow {
  height: 50px;
  justify-content: space-between; // parent is flex so this little bit allows us to create a right aligned item
}

.gridrow {
  height: calc(100vh - 200px);
}

.searchgroup {
  width: 400px !important;
  height: 30px;
  margin-right: 25px; // move to left of possible scroll bar
  margin-top: 55px; // move down to place inside grid toolbar [yes, a hack]
  z-index: 1500; // sit on top of grid toolbar [yes, more hackiness]
}

.form-control-search {
  height: 30px !important;
}

.form-control-search-button {
  line-height: 30px !important;
  padding: 0px 10px !important;
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
  height: calc(100vh - 180px);
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
