<template>
  <b-container fluid class="contentHeight m-0 p-0">
    <b-row no-gutters class="contentHeight">
      <!-- <b-toast id="busy-toast" variant="warning" solid no-auto-hide>
        <template v-slot:toast-title>
          <div class="d-flex flex-grow-1 align-items-baseline">
            <b-img blank blank-color="#ff0000" class="mr-2" width="12" height="12"></b-img>
            <strong class="mr-auto">{{ busyTitle }}</strong>
          </div>
        </template>
        <b-spinner style="width: 7rem; height: 7rem;" variant="success" label="Waiting Spinner"></b-spinner>
      </b-toast> -->
      <b-modal ref="FilterModal" id="FilterModal" size="sm" no-fade modal-class="animated bounceInLeft">
        <template v-slot:modal-title>Workplan Filter</template>
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
                        <ejs-dropdownlist v-if="field.DropdownSource === 'status'" v-model="field.Selected" :dataSource="status" :fields="ddfields"></ejs-dropdownlist>
                        <!--<ejs-dropdownlist v-model="field.Selected" :dataSource="field.Options" :fields="ddfields"></ejs-dropdownlist>-->
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
      <b-modal id="EditModal" ref="EditModal" size="xl" centered @ok="editOk">
        <template v-slot:modal-title>Edit Work Plan</template>
        <b-container fluid>
          <table id="EditTable" class="workplantable">
            <tbody>
              <tr class="bg-warning text-white">
                <th>Title</th>
                <th>Number</th>
                <th>Revision</th>
                <th>POP Start</th>
                <th>POP End</th>
                <th>Status</th>
                <th>Manager</th>
                <th>Date Approved</th>
              </tr>
              <tr>
                <td class="px300"><input class="e-input" type="text" v-model="rowData.Title" /></td>
                <td><input class="e-input" type="text" v-model="rowData.Number" /></td>
                <td><input class="e-input" type="text" v-model="rowData.Revision" /></td>
                <td><ejs-datepicker v-model="rowData.POPStart"></ejs-datepicker></td>
                <td><ejs-datepicker v-model="rowData.POPEnd"></ejs-datepicker></td>
                <td><ejs-dropdownlist id="ddStatusEdit" v-model="rowData.Status" :dataSource="status" :fields="ddfields"></ejs-dropdownlist></td>
                <td><ejs-dropdownlist id="ddManagerEdit" v-model="rowData.ManagerId" :dataSource="managers" :fields="ddfields" @change="EditManagerSelected"></ejs-dropdownlist></td>
                <td><ejs-datepicker v-model="rowData.DateApproved"></ejs-datepicker></td>
              </tr>
            </tbody>
          </table>
        </b-container>
      </b-modal>
      <b-modal id="NewModal" ref="NewModal" size="xl" centered @ok="newOk">
        <template v-slot:modal-title>Add New Work Plan</template>
        <b-container fluid>
          <table id="NewTable" class="workplantable">
            <tbody>
              <tr class="bg-warning text-white">
                <th>Title</th>
                <th>Number</th>
                <th>Revision</th>
                <th>POP Start</th>
                <th>POP End</th>
                <th>Status</th>
                <th>Manager</th>
                <th>Date Approved</th>
              </tr>
              <tr>
                <td class="px300"><input class="e-input" type="text" v-model="newData.Title" /></td>
                <td><input class="e-input" type="text" v-model="newData.Number" /></td>
                <td><input class="e-input" type="text" v-model="newData.Revision" /></td>
                <td><ejs-datepicker v-model="newData.POPStart"></ejs-datepicker></td>
                <td><ejs-datepicker v-model="newData.POPEnd"></ejs-datepicker></td>
                <td><ejs-dropdownlist id="ddStatusNew" v-model="newData.Status" :dataSource="status" :fields="ddfields"></ejs-dropdownlist></td>
                <td><ejs-dropdownlist id="ddManagerNew" v-model="newData.Manager" :dataSource="managers" :fields="ddfields" @change="NewManagerSelected"></ejs-dropdownlist></td>
                <td><ejs-datepicker v-model="rowData.DateApproved"></ejs-datepicker></td>
              </tr>
            </tbody>
          </table>
        </b-container>
      </b-modal>
      <b-col cols="12" class="m-0 p-0">
        <b-container fluid class="contentHeight m-0 p-0">
          <b-form @submit="onSubmit">
            <b-row no-gutters class="buttonrow">
              <b-button id="ShowFilters" class="btn btn-warning" @click="ToggleFilters">
                Toggle Filters
              </b-button>
            </b-row>
            <b-row no-gutters class="gridrow">
              <b-overlay :show="filtereddata.length == 0" :variant="overlayVariant" z-index="3000">
                <ejs-grid
                  id="WorkplanGrid"
                  ref="WorkplanGrid"
                  :dataSource="filtereddata"
                  :allowPaging="true"
                  :allowReordering="true"
                  :allowResizing="true"
                  :pageSettings="pageSettings"
                  :editSettings="editSettings"
                  :filterSettings="filterSettings"
                  :toolbar="toolbar"
                  :allowExcelExport="true"
                  :toolbarClick="toolbarClick"
                  :dataBound="dataBound"
                  :actionBegin="actionBegin"
                  :actionComplete="actionComplete"
                  rowHeight="20"
                  :height="rect.height - 175"
                  :width="rect.width - 5"
                >
                  <e-columns>
                    <e-column headerText="Actions" textAlign="Left" width="100" :template="ActionsTemplate"></e-column>
                    <e-column field="Title" headerText="Title" textAlign="Left" width="200"></e-column>
                    <e-column field="Status" headerText="Status" width="125"></e-column>
                    <e-column field="Number" headerText="Number" width="100"></e-column>
                    <e-column field="Revision" headerText="Revision" textAlign="Left" width="100"></e-column>
                    <e-column field="POPStart" headerText="POP Start" textAlign="Left" width="150"></e-column>
                    <e-column field="POPEnd" headerText="POP End" textAlign="Left" width="150"></e-column>
                    <e-column field="Manager" headerText="Manager" textAlign="Left" width="200"></e-column>
                    <e-column field="DateApproved" headerText="Date Approved" textAlign="Left" width="150"></e-column>
                    <e-column field="Id" headerText="Id" :visible="false" textAlign="Left" width="40" :isPrimaryKey="true"></e-column>
                    <e-column field="ManagerEmail" :visible="false" textAlign="Left" width="40"></e-column>
                    <e-column field="uri" :visible="false" textAlign="Left" width="40"></e-column>
                    <e-column field="etag" :visible="false" textAlign="Left" width="40"></e-column>
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
        </b-container>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import Vue from 'vue'
import User from '@/models/User'
import Workplan from '@/models/WorkPlan'
import Personnel from '@/models/Personnel'
import { Page, Edit, Toolbar, Resize, Reorder, VirtualScroll, ExcelExport, DetailRow, Freeze, Search } from '@syncfusion/ej2-vue-grids'

let vm = null

export default {
  name: 'workplan',
  props: {
    mode: {
      type: String,
      default: 'default'
    }
  },
  computed: {
    workplans() {
      return Workplan.getters('allWorkplans')
    },
    loaded() {
      return Workplan.getters('Loaded')
    },
    managers() {
      return Workplan.getters('Managers')
    },
    personnel() {
      return Personnel.getters('allPersonnel')
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
    isSubcontractor() {
      return User.getters('isSubcontractor')
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
          Sort: ''
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
          FieldName: 'Revision',
          Visible: true,
          DisplayName: 'Revision',
          Filter: false,
          Control: '',
          DataType: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'POPStart',
          Visible: true,
          DisplayName: 'POP Start',
          Filter: false,
          Control: '',
          DataType: 'Date',
          Predicate: 'S',
          FilterValue: '',
          FilterValue2: '',
          Sort: ''
        },
        {
          FieldName: 'POPEnd',
          Visible: true,
          DisplayName: 'POPEnd',
          Filter: false,
          Control: '',
          DataType: 'Date',
          Predicate: 'S',
          FilterValue: '',
          FilterValue2: '',
          Sort: ''
        },
        {
          FieldName: 'Manager',
          Visible: true,
          DisplayName: 'Manager',
          Filter: false,
          Control: '',
          DataType: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'DateApproved',
          Visible: true,
          DisplayName: 'Date Approved',
          Filter: false,
          Control: '',
          DataType: 'Date',
          Predicate: 'S',
          FilterValue: '',
          FilterValue2: '',
          Sort: ''
        }
      ],
      ddfields: { text: 'text', value: 'value', index: 'index' },
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
        allowEditing: this.isSubcontractor ? false : true,
        allowAdding: this.isSubcontractor ? false : true,
        allowDeleting: false,
        mode: 'Dialog'
      },
      filterSettings: { type: 'Menu' },
      status: [
        //In Progress, Submitted, Approved, PM Review
        { text: 'Select...', value: 'S' },
        { text: 'In Progress', value: 'In Progress' },
        { text: 'Submitted', value: 'Submitted' },
        { text: 'Approved', value: 'Approved' },
        { text: 'PM Review', value: 'PM Review' }
      ],
      toolbar: this.isSubcontractor ? ['Search'] : ['Add', 'Edit', 'Print', 'Search', 'ExcelExport'],
      rowData: {},
      newData: {
        Title: '',
        Number: '',
        Revision: '',
        POPStart: '',
        POPEnd: '',
        Manager: '',
        DateApproved: ''
      },
      ActionsTemplate: function() {
        return {
          template: Vue.component('columnTemplate', {
            template: `
            <div>
              <b-button v-if="isWPManager" class="actionbutton" variant="danger" @click="archiveme(data)" v-b-tooltip.hover.v-dark title="Archive">
                <font-awesome-icon far icon="times-circle" class="icon"></font-awesome-icon>
              </b-button>
              <b-button :href="href" class="actionbutton ml-1" variant="success" v-b-tooltip.hover.v-dark title="Email Workplan Manager">
                <font-awesome-icon far icon="envelope" class="icon"></font-awesome-icon>
              </b-button>
            </div>`,
            data: function() {
              return {
                data: {}
              }
            },
            computed: {
              href: function() {
                return 'mailto:' + this.data.ManagerEmail
              },
              isWPManager() {
                return User.getters('isWPManager')
              }
            },
            methods: {
              archiveme: function(data) {
                this.$bvModal
                  .msgBoxConfirm('Archive This Work Plan?', {
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
                      console.log('ARCHIVE ID: ' + data.Id)
                      let payload = {}
                      payload.etag = data.etag
                      payload.uri = data.uri
                      payload.id = data.Id
                      Workplan.dispatch('archive', payload).then(function() {
                        Workplan.dispatch('getWorkplans').then(function() {
                          vm.$options.interval = setInterval(vm.waitForPlans, 1000)
                        })
                      })
                    }
                  })
                  .catch(err => {
                    console.log(err)
                  })
              }
            }
          })
        }
      }
    }
  },
  mounted: function() {
    vm = this
    this.$bvToast.show('busy-toast')
    try {
      Workplan.dispatch('getDigest')
      Workplan.dispatch('getManagers').then(function() {
        Workplan.dispatch('getWorkplans').then(function() {
          vm.$options.interval = setInterval(vm.waitForPlans, 1000)
        })
      })
    } catch (e) {
      // include a notification to the user of an error and log that error for developers
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
  methods: {
    waitForPlans: function() {
      if (this.workplans && this.workplans.length > 0) {
        clearInterval(this.$options.interval)
        this.data = this.workplans
        this.filtereddata = this.workplans
        // document.getElementById('PageTitle').innerHTML = ' -  Active Work Plans'
        this.$bvToast.hide('busy-toast')
        // load any saved filters
        this.loadfilters()
      } else {
        this.waitForPlans()
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
        case 'WorkplanGrid_excelexport':
          this.$refs['WorkplanGrid'].excelExport()
          break

        case 'WorkplanGrid_print':
          this.$refs['WorkplanGrid'].print()
          break
      }
    },
    actionBegin(args) {
      switch (args.requestType) {
        case 'beginEdit':
          if (!this.isSubcontractor) {
            this.editRow(args.rowData)
          }
          args.cancel = true
          break

        case 'add':
          args.cancel = true
          if (!this.isSubcontractor) {
            this.$bvModal.show('NewModal')
          }
          break
      }
    },
    actionComplete(args) {
      // console.log('ACTION COMPLETE: ' + args.requestType)
      if (args.requestType == 'columnstate') {
        this.$refs['WorkplanGrid'].autoFitColumns()
      }
      if (args.requestType == 'refresh') {
        let h1 = 0
        let h2 = this.$refs.WorkplanGrid.$el.children[7].children[0].clientHeight // children[7] matches .e-gridconent
        console.log('CLIENTHEIGHT: ' + h2)
        h1 = Math.floor(h2 / 20)
        this.pageSettings.pageSize = h1
        this.$refs.WorkplanGrid.pageSettings = { pageSize: h1 }
      }
    },
    dataBound: function() {
      this.$refs.WorkplanGrid.autoFitColumns()
    },
    EditManagerSelected: function() {
      this.manager = document.getElementById('ddManagerEdit').ej2_instances[0].text
      this.rowData.Manager = this.manager
    },
    NewManagerSelected: function() {
      this.manager = document.getElementById('ddManagerNew').ej2_instances[0].text
      this.newData.ManagerId = document.getElementById('ddManagerNew').ej2_instances[0].value
    },
    editRow: function(data) {
      this.rowData = data
      this.$bvModal.show('EditModal')
    },
    editOk: function(bvEvent) {
      bvEvent.preventDefault()
      try {
        Workplan.dispatch('editWorkplan', this.rowData).then(function(response) {
          let j = response.data.d
          vm.rowData.etag = j['__metadata']['etag']
          if (vm.manager === undefined || vm.manager === null) {
            let currentManager = vm.managers.filter(obj => {
              return obj.value === vm.rowData.ManagerId
            })
            vm.rowData.Manager = currentManager[0].text
          } else {
            vm.rowData.Manager = vm.manager
          }
          //vm.rowData.Manager = vm.manager
          vm.$refs.WorkplanGrid.setRowData(vm.rowData.Id, vm.rowData)
          vm.$bvModal.hide('EditModal')
          vm.$refs.WorkplanGrid.refresh()
        })
      } catch (e) {
        // include a notification to the user of an error and log that error for developers
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
    newOk: function() {
      Workplan.dispatch('addWorkplan', this.newData).then(function() {
        vm.$bvModal.hide('NewModal')
        Workplan.dispatch('getWorkplans').then(function() {
          vm.$options.interval = setInterval(vm.waitForPlans, 1000)
        })
      })
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
      this.$refs.WorkplanGrid.refresh()
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
      this.$refs.WorkplanGrid.refresh()
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
        this.$refs.WorkplanGrid.showColumns([displayname])
        this.$refs.WorkplanGrid.autoFitColumns()
      } else {
        this.$refs.WorkplanGrid.hideColumns([displayname])
        this.$refs.WorkplanGrid.autoFitColumns()
      }
    },
    setfilter: function() {
      // always reset to all records then do all filters as they are selected.
      // this is a top down filter
      // loop through all the fields and filter the ones that have a predicate and filtervalue set
      var p = this.data // set initial filter to all based on the module.
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
      this.$refs.WorkplanGrid.refresh()
    },
    clearfilter: function(e) {
      var f = String(e.target.id).split('_')[1]
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
      window.localStorage.removeItem('workplan')
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
      window.localStorage.setItem('workplan', JSON.stringify(this.fields))
    },
    loadfilters: function() {
      let f = String(window.localStorage.getItem('workplan'))
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
                vm.fields = flds
                // loop to display the selected columns
                for (var i = 1; i < vm.fields.length; i++) {
                  // starting at 1 to skip the version 'field'
                  if (vm.fields[i].Visible) {
                    vm.$refs.WorkplanGrid.showColumns(vm.fields[i].DisplayName)
                    vm.$refs.WorkplanGrid.autoFitColumns()
                  } else {
                    vm.$refs.WorkplanGrid.hideColumns(vm.fields[i].DisplayName)
                    vm.$refs.WorkplanGrid.autoFitColumns()
                  }
                  if (vm.fields[i].Sort !== '') {
                    vm.sortfield = vm.fields[i].FieldName
                    vm.sortdir = vm.fields[i].Sort
                  }
                }
                vm.setfilter()
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
    grid: [Page, Edit, DetailRow, Toolbar, Resize, Reorder, VirtualScroll, ExcelExport, Freeze, Search]
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

.detailtable td {
  font-size: 13px;
  padding: 4px;
  max-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

#EditTable {
  font-size: 0.75rem !important;
}

#NewTable {
  font-size: 0.75rem !important;
}

.table td,
.table th {
  padding: 0.15rem !important;
}

input.e-input {
  height: 20px !important;
}

.e-input-group.e-control-wrapper .e-input-group-icon,
.e-input-group .e-input-group-icon {
  min-height: 20px !important;
}

.modal-body {
  padding: 0.5rem !important;
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
