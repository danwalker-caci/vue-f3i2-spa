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
        <template v-slot:modal-title>Manning Filter</template>
        <div>
          <ul id="ulFields">
            <li v-for="field in fields" :key="field">
              <div v-if="field.FieldName !== 'Version'">
                <ejs-checkbox :label="field.DisplayName" v-model="field.Visible" :checked="field.Visible" @change="showorhide" :value="field.FieldName"></ejs-checkbox>
                <b-button size="sm" class="actionbutton float-right" :class="field.Filter ? null : 'collapsed'" :aria-expanded="field.Filter ? 'true' : 'false'" :aria-controls="getRef('collapse', field.FieldName)" @click="field.Filter = !field.Filter">
                  <font-awesome-icon fas icon="filter" class="icon"></font-awesome-icon>
                </b-button>
                <b-button size="sm" class="actionbutton float-right" :class="field.Sort == 'desc' ? 'sorted' : ''" :id="getRef('sortdown', field.FieldName)" @click="sortdown(field.FieldName, field.DataType)">
                  <font-awesome-icon fas icon="arrow-down" class="icon"></font-awesome-icon>
                </b-button>
                <b-button size="sm" class="actionbutton float-right" :class="field.Sort == 'asc' ? 'sorted' : ''" :id="getRef('sortup', field.FieldName)" @click="sortup(field.FieldName, field.DataType)">
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
          <!-- <b-row no-gutters class="buttonrow">
            <b-button id="ShowFilters" class="btn btn-warning" @click="ToggleFilters">
              Toggle Filters
            </b-button>
          </b-row> -->
          <b-form @submit="onSubmit">
            <b-row no-gutters class="gridrow">
              <b-overlay :show="filtereddata.length == 0" :variant="overlayVariant" z-index="3000">
                <ejs-grid
                  id="ManningGrid"
                  ref="ManningGrid"
                  :load="load"
                  :enablePersistence="false"
                  :dataSource="filtereddata"
                  :allowPaging="true"
                  :pageSettings="pageSettings"
                  :editSettings="editSettings"
                  :toolbar="toolbar"
                  :allowExcelExport="true"
                  :toolbarClick="toolbarClick"
                  :actionBegin="actionBegin"
                  :actionComplete="actionComplete"
                  rowHeight="20"
                  :height="rect.height - 120"
                  :width="rect.width - 1"
                >
                  <e-columns>
                    <e-column :allowEditing="false" headerText="Actions" textAlign="Left" width="100" :template="ActionsTemplate"></e-column>
                    <e-column field="Title" :visible="false" headerText="Title" textAlign="Left" width="300"></e-column>
                    <e-column field="Number" :visible="false" headerText="Number" width="100"></e-column>
                    <e-column field="MasterEffort" headerText="Master Effort" textAlign="Left" minWidth="50" :edit="MEParams"></e-column>
                    <e-column field="SubEffort" headerText="Sub Effort" minWidth="75" :edit="SEParams"></e-column>
                    <e-column field="EmployeeID" headerText="EmployeeID" minWidth="50"></e-column>
                    <e-column field="Last" :allowEditing="false" headerText="Last" textAlign="Left" width="100"></e-column>
                    <e-column field="First" :allowEditing="false" headerText="First" width="100"></e-column>
                    <e-column field="Middle" :allowEditing="false" headerText="Middle" textAlign="Left" width="100"></e-column>
                    <e-column field="FunctionalManager" headerText="Func. Manager" textAlign="Left" minWidth="75"></e-column>
                    <e-column field="FullBurdenedCost" headerText="Monthly Full Burdened Cost" textAlign="Left" minWidth="150"></e-column>
                    <e-column field="Location" :allowEditing="false" headerText="Location" textAlign="Left" minWidth="50"></e-column>
                    <e-column field="Email" :allowEditing="false" :visible="false" headerText="Email" textAlign="Left" width="200"></e-column>
                    <e-column field="Company" :allowEditing="false" headerText="Company" textAlign="Left" minWidth="100"></e-column>
                    <e-column field="PercentSupport" headerText="Percent Support" textAlign="Left" minWidth="50" :edit="PSParams"></e-column>
                    <e-column field="StartDate" :allowEditing="false" headerText="Start Date" textAlign="Left" minWidth="40" type="date" format="yMd"></e-column>
                    <e-column field="EndDate" :allowEditing="false" headerText="End Date" textAlign="Left" minWidth="40" type="date" format="yMd"></e-column>
                    <e-column field="Id" headerText="Id" :visible="false" textAlign="Left" width="40" :isPrimaryKey="true"></e-column>
                  </e-columns>
                </ejs-grid>
                <template #overlay>
                  <div class="text-center">
                    <p id="busy-label">{{ overlayText }}</p>
                  </div>
                </template>
              </b-overlay>
            </b-row>
          </b-form>
          <!-- <b-row no-gutters class="bg-warning buttonrow">
            <b-col cols="4" class="p-0 text-left"></b-col>
            <b-col cols="4" class="p-0 text-center"></b-col>
            <b-col cols="4" class="p-0 mt-2 text-right">
              <b-button variant="danger" ref="btnCancel" class="mr-1" @click="FormCancel">Cancel</b-button>
              <b-button variant="success" ref="btnSave" class="mr-2" @click="FormSave">Save</b-button>
            </b-col>
          </b-row> -->
        </b-container>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
/* eslint-disable */
import Vue from 'vue'
import Company from '@/models/Company'
import User from '@/models/User'
// import Workplan from '@/models/WorkPlan'
import Manning from '@/models/Manning'
import { DropDownList } from '@syncfusion/ej2-vue-dropdowns'
import { Page, Toolbar, Edit, VirtualScroll, ExcelExport, DetailRow, Resize, Search } from '@syncfusion/ej2-vue-grids'

let me = null
let meObj = null
let se = null
let seObj = null
let ps = null
let psObj = null
let vm = null

export default {
  name: 'manning',
  computed: {
    manning() {
      return Manning.getters('allManning')
    },
    loaded() {
      return Manning.getters('Loaded')
    },
    percentsupport() {
      return Manning.getters('PercentSupport')
    },
    mastereffort() {
      return Manning.getters('MasterEffort')
    },
    subeffort() {
      return Manning.getters('SubEffort')
    },
    ddfields() {
      return Manning.getters('DDFields')
    },
    appversion() {
      return User.getters('AppVersion')
    },
    user() {
      return User.getters('CurrentUser')
    },
    userid() {
      return User.getters('CurrentUserId')
    },
    companies() {
      return Company.getters('DropDown')
    },
    rect() {
      return this.$store.state.support.contentrect
    }
  },
  data: function() {
    return {
      busyTitle: 'Getting Data. Please Wait.',
      overlayText: 'Getting Data. Please Wait...',
      overlayVariant: 'light',
      sortfield: '',
      sortdir: '',
      data: [],
      WorkplanData: [],
      filtereddata: [],
      manager: null,
      fields: [
        {
          FieldName: 'Version',
          Value: null
        },
        {
          FieldName: 'Title',
          Visible: true,
          DisplayName: 'Title',
          Filter: false,
          Control: '',
          DataType: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'Number',
          Visible: true,
          DisplayName: 'Number',
          Filter: false,
          Control: '',
          DataType: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'Last',
          Visible: true,
          DisplayName: 'Last',
          Filter: false,
          Control: '',
          DataType: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'First',
          Visible: true,
          DisplayName: 'First',
          Filter: false,
          Control: '',
          DataType: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'Middle',
          Visible: true,
          DisplayName: 'Middle',
          Filter: false,
          Control: '',
          DataType: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'Location',
          Visible: true,
          DisplayName: 'Location',
          Filter: false,
          Control: '',
          DataType: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'Email',
          Visible: true,
          DisplayName: 'Email',
          Filter: false,
          Control: '',
          DataType: 'Text',
          Predicate: 'S',
          FilterValue: '',
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
          FieldName: 'PercentSupport',
          Visible: true,
          DisplayName: 'Percent Support',
          Filter: false,
          Control: 'DropdownBox',
          DataType: 'Choice',
          Selected: 'S',
          Predicate: 'E',
          FilterValue: '',
          Sort: '',
          Options: []
        }
      ],
      textpredicate: [
        { text: 'Select...', value: 'S' },
        { text: 'Starts With', value: 'SW' },
        { text: 'Ends With', value: 'EW' },
        { text: 'Contains', value: 'C' },
        { text: 'Equal', value: 'E' },
        { text: 'Not Equal', value: 'NE' }
      ],
      numberpredicate: [
        { text: 'Select...', value: 'S' },
        { text: 'Greater Than', value: 'GT' },
        { text: 'Less Than', value: 'LT' },
        { text: 'Equal', value: 'E' }
      ],
      pageSettings: { pageSize: 30 },
      editSettings: { allowEditing: true, allowAdding: true, allowDeleting: true, newRowPosition: 'Bottom', mode: 'Normal' },
      // toolbar: ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Print', 'Search', 'ExcelExport'],
      toolbar: ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'ExcelExport', 'Search'],
      ActionsTemplate: function() {
        return {
          template: Vue.component('actionsTemplate', {
            template: `
            <div>
              <b-button v-if="isPCA || isAdmin" variant="success" class="actionbutton" @click="add(data)" title="Add From this User">
                <font-awesome-icon far icon="plus-circle" class="icon"></font-awesome-icon>
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
              isPCA() {
                return User.getters('isPCA')
              },
              isAFRL() {
                return User.getters('isAFRL')
              }
            },
            methods: {
              add: function(data) {
                // vm.$router.push({ name: 'Edit Travel', params: { back: 'Travel Tracker', TripId: data.Id } })
                console.log(data)
                let itemprops = {
                  __metadata: { type: 'SP.Data.ManningListItem' },
                  Title: '',
                  Number: '',
                  Last: data.Last != '' ? data.Last : '',
                  First: data.First != '' ? data.First : '',
                  Middle: data.Middle != '' ? data.Middle : '',
                  MasterEffort: '',
                  SubEffort: '',
                  Location: data.Location != '' ? data.Location : '',
                  Email: data.Email != '' ? data.Email : '',
                  PercentSupport: '',
                  Company: data.Company != '' ? data.Company : '',
                  FunctionalManager: data.FunctionalManager != '' ? data.FunctionalManager : '',
                  StartDate: data.StartDate != '' ? data.StartDate : null,
                  EndDate: data.EndDate != '' ? data.EndDate : null,
                  FullBurdenedCost: data.FullBurdenedCost != '' ? data.FullBurdenedCost : null,
                }
                let payload = {}
                payload.itemprops = itemprops
                Manning.dispatch('addManningItem', payload).then(function(){
                  // refresh.
                  vm.$router.push({ name: 'Refresh', params: { action: 'manning' } })
                })
              },
              report: function(data) {
                console.log(data)
              },
              postpone: async function(data) {
                console.log(data)
              },
              cancel: async function(data) {
                console.log(data)
              }
            }
          })
        }
      },
      MEParams: {
        create: function() {
          me = document.createElement('input')
          return me
        },
        read: () => {
          return meObj.value
        },
        destroy: () => {
          meObj.destroy()
        },
        write: (args) => {
          meObj = new DropDownList({
            dataSource: this.mastereffort,
            fields: this.ddfields,
            value: args.rowData[args.column.field]
          })
          meObj.appendTo(me)
        }
      },
      SEParams: {
        create: function() {
          se = document.createElement('input')
          return se
        },
        read: () => {
          return seObj.value
        },
        destroy: () => {
          seObj.destroy()
        },
        write: (args) => {
          seObj = new DropDownList({
            dataSource: this.subeffort,
            fields: this.ddfields,
            value: args.rowData[args.column.field]
          })
          seObj.appendTo(se)
        }
      },
      PSParams: {
        create: function() {
          ps = document.createElement('input')
          return ps
        },
        read: () => {
          return psObj.value
        },
        destroy: () => {
          psObj.destroy()
        },
        write: (args) => {
          psObj = new DropDownList({
            dataSource: this.percentsupport,
            fields: this.ddfields,
            value: args.rowData[args.column.field]
          })
          psObj.appendTo(ps)
        }
      }
    }
  },
  mounted: function() {
    vm = this
    /* flds = this.ddfields
    me = this.mastereffort */
    this.$bvToast.show('busy-toast')
    Manning.dispatch('getDigest')
    Company.dispatch('getCompanies').then(function() {
      Manning.dispatch('getManning').then(function() {
        vm.$options.interval = setInterval(vm.waitForManning, 1000)
      })
    })
  },
  methods: {
    waitForManning: function() {
      if (this.manning && this.manning.length > 0) {
        clearInterval(this.$options.interval)
        this.data = this.manning
        let p = Vue._.orderBy(this.manning, 'Last', 'asc')
        this.filtereddata = p
        // this.fields[8]['Options'] = this.companies
        this.$bvToast.hide('busy-toast')
        // load any saved filters
        // this.loadfilters()
      }
    },
    getRef: function(text, idx) {
      return text + '_' + idx
    },
    toolbarClick: function(args) {
      switch (args.item.id) {
        case 'ManningGrid_excelexport':
          this.$refs['ManningGrid'].excelExport()
          break

        case 'ManningGrid_print':
          this.$refs['ManningGrid'].print()
          break
      }
    },
    async load() {
      this.$refs["ManningGrid"].ej2Instances.element.addEventListener('mousedown', function(e) {
        var instance = this.ej2_instances[0]
        if (e.target.classList.contains("e-rowcell")) {
        if (instance.isEdit)
            instance.endEdit()
            let index = parseInt(e.target.getAttribute("Index"))
            instance.selectRow(index)
            instance.startEdit()
        }
      })
    },
    actionBegin(args) {
      console.log('ACTION BEGIN: ' + args.requestType)
      switch (args.requestType) {
        case 'add':
          args.cancel = true
          break

        case 'save':
          // build payload to pass to update function
          let itemprops = {
            __metadata: { type: 'SP.Data.ManningListItem' },
            Title: args.data.Title,
            Number: args.data.Number,
            MasterEffort: args.data.MasterEffort,
            SubEffort: args.data.SubEffort,
            PercentSupport: args.data.PercentSupport,
            FullBurdenedCost: args.data.FullBurdenedCost
          }
          let payload = {}
          payload.uri = args.data.uri
          payload.itemprops = itemprops
          Manning.dispatch('editManningItem', payload).then(function(){
            // The grid will be updated with the values already so no need to do anything here.
          })
      }
    },
    actionComplete(args) {
      console.log('ACTION COMPLETE: ' + args.requestType)
      switch (args.requestType) {
        case 'columnstate' :
          this.$refs['ManningGrid'].autoFitColumns()
          break
        case 'refresh' : 
          let h1 = 0
          let h2 = this.$refs.ManningGrid.$el.children[7].children[0].clientHeight // children[7] matches .e-gridconent
          console.log('CLIENTHEIGHT: ' + h2)
          h1 = Math.floor(h2 / 20)
          this.pageSettings.pageSize = h1
          this.$refs.ManningGrid.pageSettings = { pageSize: h1 }
          break
        case 'beginEdit' :
          console.log(args)
          // build payload to pass to update function
          let itemprops = {
            __metadata: { type: 'SP.Data.ManningListItem' },
            Title: args.rowData.Title,
            Number: args.rowData.Number,
            MasterEffort: args.rowData.MasterEffort,
            SubEffort: args.rowData.SubEffort,
            PercentSupport: args.rowData.PercentSupport,
            FullBurdenedCost: args.rowData.FullBurdenedCost
          }
          let payload = {}
          payload.uri = args.rowData.uri
          payload.itemprops = itemprops
          Manning.dispatch('editManningItem', payload).then(function(){
            // The grid will be updated with the values already so no need to do anything here.
            // Would we need to update the uri/etag?
          })
          break
      }
      /*if (args.requestType == 'columnstate') {
        this.$refs['ManningGrid'].autoFitColumns()
      }
      if (args.requestType == 'refresh') {
        let h1 = 0
        let h2 = this.$refs.ManningGrid.$el.children[7].children[0].clientHeight // children[7] matches .e-gridconent
        console.log('CLIENTHEIGHT: ' + h2)
        h1 = Math.floor(h2 / 20)
        this.pageSettings.pageSize = h1
        this.$refs.ManningGrid.pageSettings = { pageSize: h1 }
      }
      if (args.requestType == 'beginEdit') {

      }*/
    },
    onSubmit(event) {
      event.preventDefault() // prevent form submit! VERY IMPORTANT because search function adds input box which will perform a submit.
    },
    dataBound: function() {
      this.$refs.ManningGrid.autoFitColumns()
    },
    /* -------------------------------------------------------------------------------------------------- FILTER Functions --------------------------------------------------------------------- */
    ToggleFilters() {
      this.$refs['FilterModal'].toggle('#ShowFilters')
    },
    sortup: function(e, t) {
      // ascending
      var p = this.filtereddata
      if (t == 'Date') {
        p = Vue._.orderBy(
          p,
          function(o) {
            return new vm.$moment(o[e]).format('YYYYMMDD')
          },
          'asc'
        )
      } else {
        p = Vue._.orderBy(p, e, 'asc')
      }
      this.filtereddata = p
      this.$refs.ManningGrid.refresh()
      for (var i = 0; i < this.fields.length; i++) {
        if (this.fields[i].FieldName == e) {
          console.log('SORT UP: ' + e)
          this.fields[i].Sort = 'asc'
        } else {
          this.fields[i].Sort = ''
        }
      }
    },
    sortdown: function(e, t) {
      // descending
      var p = this.filtereddata
      if (t == 'Date') {
        p = Vue._.orderBy(
          p,
          function(o) {
            return new vm.$moment(o[e]).format('YYYYMMDD')
          },
          'desc'
        )
      } else {
        p = Vue._.orderBy(p, e, 'desc')
      }
      this.filtereddata = p
      this.$refs.ManningGrid.refresh()
      for (var i = 0; i < this.fields.length; i++) {
        if (this.fields[i].FieldName == e) {
          // console.log('SORT DOWN: ' + e)
          this.fields[i].Sort = 'desc'
        } else {
          this.fields[i].Sort = ''
        }
      }
    },
    showorhide: function(e) {
      // console.log('SHOW OR HIDE: ' + e)
      var checked = e.checked
      // var fieldname = e.event.target.value
      var displayname = e.event.target.labels[0].innerText
      if (checked) {
        this.$refs.ManningGrid.showColumns([displayname])
        this.$refs.ManningGrid.autoFitColumns()
      } else {
        this.$refs.ManningGrid.hideColumns([displayname])
        this.$refs.ManningGrid.autoFitColumns()
      }
    },
    setfilter: function() {
      // always reset to all records then do all filters as they are selected.
      // this is a top down filter
      // loop through all the fields and filter the ones that have a predicate and filtervalue set
      var p = this.WorkplanData // set initial filter to all based on the module.
      for (var i = 1; i < vm.fields.length; i++) {
        if (vm.fields[i].Predicate !== 'S') {
          if (vm.fields[i].FilterValue !== '' || vm.fields[i].Selected !== 'S') {
            // determine what to filter based on predicate
            switch (vm.fields[i].Predicate) {
              case 'SW':
                // Starts With
                p = p.filter(search => Vue._.startsWith(search[vm.fields[i].FieldName], vm.fields[i].FilterValue))
                break

              case 'EW':
                // Ends With
                p = p.filter(search => Vue._.endsWith(search[vm.fields[i].FieldName], vm.fields[i].FilterValue))
                break

              case 'C':
                // Contains
                p = p.filter(search => Vue._.includes(search[vm.fields[i].FieldName], vm.fields[i].FilterValue))
                break

              case 'E':
                // Equals
                if (vm.fields[i].DataType == 'Choice') {
                  p = p.filter(search => Vue._.isEqual(search[vm.fields[i].FieldName], vm.fields[i].Selected))
                } else {
                  if (vm.fields[i].DataType == 'Number') {
                    p = p.filter(search => search[vm.fields[i].FieldName] == vm.fields[i].FilterValue)
                  } else {
                    p = p.filter(search => Vue._.isEqual(search[vm.fields[i].FieldName], vm.fields[i].FilterValue))
                  }
                }
                break

              case 'NE':
                // Not Equals
                p = p.filter(search => Vue._.without(search[vm.fields[i].FieldName], vm.fields[i].FilterValue))
                break

              case 'GT':
                // Greater Than
                if (vm.fields[i].DataType == 'Number') {
                  p = p.filter(search => search[vm.fields[i].FieldName] > vm.fields[i].FilterValue)
                } else {
                  // date
                  p = p.filter(search => moment(search[vm.fields[i].FieldName]).isAfter(moment(vm.fields[i].FilterValue)))
                }
                break

              case 'LT':
                // Less Than
                if (vm.fields[i].DataType == 'Number') {
                  p = p.filter(search => search[vm.fields[i].FieldName] < vm.fields[i].FilterValue)
                } else {
                  // date
                  p = p.filter(search => moment(vm.fields[i].FilterValue).isAfter(moment(search[vm.fields[i].FieldName])))
                }
                break

              case 'B':
                // Between
                p = p.filter(search => moment(search[vm.fields[i].FieldName]).isBetween(moment(vm.fields[i].FilterValue), moment(vm.fields[i].FilterValue2)))
                break
            }
          }
        }
                if (this.sortfield !== '' && this.sortfield === this.fields[i].FieldName) {
          // if this is a date field we need to do a bit more work to convert and test for sorting
          if (this.fields[i].DataType == 'Date') {
            var f = this.fields[i].FieldName
            p = Vue._.orderBy(
              p,
              function(o) {
                return new vm.$moment(o[f]).format('YYYYMMDD')
              },
              this.sortdir
            )
          } else {
            p = Vue._.orderBy(p, this.sortfield, this.sortdir)
          }
        }
      }
      if (this.sortfield === '') {
        p = Vue._.orderBy(p, 'Id', 'desc')
      }
      this.filtereddata = p
      this.$refs.ManningGrid.refresh()
    },
    clearfilter: function(e) {
      var f = String(e.target.id).split('_')[1]
      // console.log('CLEARING FILTER: ' + f)
      for (var i = 1; i < vm.fields.length; i++) {
        if (vm.fields[i].FieldName == f) {
          vm.fields[i].Predicate = 'S'
          vm.fields[i].FilterValue = ''
          if (vm.fields[i].DataType == 'Date') {
            vm.fields[i].FilterValue2 = ''
          }
          if (vm.fields[i].DataType == 'Choice') {
            vm.fields[i].Predicate = 'E'
            vm.fields[i].Selected = 'S'
          }
          if (vm.fields[i].DataType == 'Number' && vm.fields[i].Control == 'DropdownBox') {
            vm.fields[i].Predicate = 'S'
            vm.fields[i].FilterValue = 'S'
          }
        }
      }
      vm.setfilter()
    },
    clearfilters: function() {
      window.localStorage.removeItem('manning')
      for (var i = 1; i < vm.fields.length; i++) {
        vm.fields[i].Predicate = 'S'
        vm.fields[i].FilterValue = ''
        vm.fields[i].Sort = ''
        if (vm.fields[i].DataType == 'Date') {
          vm.fields[i].FilterValue2 = ''
        }
        if (vm.fields[i].DataType == 'Choice') {
          vm.fields[i].Predicate = 'E'
          vm.fields[i].Selected = 'S'
        }
        if (vm.fields[i].DataType == 'Number' && vm.fields[i].Control == 'DropdownBox') {
          vm.fields[i].Predicate = 'S'
          vm.fields[i].FilterValue = 'S'
        }
      }
      vm.filtereddata = vm.features
      vm.setfilter()
    },
    savefilters: function() {
      this.fields[0].Value = this.appversion
      window.localStorage.setItem('manning', JSON.stringify(this.fields))
    },
    loadfilters: function() {
      let f = String(window.localStorage.getItem('manning'))
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
                vm.filtereddata = []
                setTimeout(() => {
                  vm.fields = flds
                  // loop to display the selected columns
                  for (var i = 1; i < vm.fields.length; i++) {
                    // starting at 1 to skip the version 'field'
                    if (vm.fields[i].Visible) {
                      vm.$refs.ManningGrid.showColumns(vm.fields[i].DisplayName)
                      vm.$refs.ManningGrid.autoFitColumns()
                    } else {
                      vm.$refs.ManningGrid.hideColumns(vm.fields[i].DisplayName)
                      vm.$refs.ManningGrid.autoFitColumns()
                    }
                    if (vm.fields[i].Sort !== '') {
                      vm.sortfield = vm.fields[i].FieldName
                      vm.sortdir = vm.fields[i].Sort
                    }
                  }
                  vm.setfilter()
                }, 250)
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
  },
  provide: {
    grid: [Page, Edit, DetailRow, Toolbar, VirtualScroll, ExcelExport, Search, Resize]
  }
}
</script>

<style lang="scss">
.buttonrow {
  height: 50px;
}
.gridrow {
  height: calc(100vh - 200px);
}

.sorted {
  color: #04ee04 !important;
}

h3 {
  color: white;
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
