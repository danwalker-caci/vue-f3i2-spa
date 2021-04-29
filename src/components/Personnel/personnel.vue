<!-- eslint-disable -->
<template>
  <b-container fluid class="contentHeight m-0 p-0">
    <b-row no-gutters class="contentHeight">
      <b-modal ref="FilterModal" id="FilterModal" size="sm" no-fade modal-class="animated bounceInLeft">
        <template v-slot:modal-title>Personnel Filter</template>
        <div>
          <ul id="ulFields">
            <li v-for="field in fields" :key="field">
              <div v-if="field.FieldName !== 'Version'">
                <ejs-checkbox :label="field.DisplayName" v-model="field.Visible" :checked="field.Visible" @change="showorhide" :value="field.FieldName"></ejs-checkbox>
                <b-button size="sm" class="actionbutton float-right" :class="field.Filter ? null : 'collapsed'" :aria-expanded="field.Filter ? 'true' : 'false'" :aria-controls="getRef('collapse', field.FieldName)" @click="field.Filter = !field.Filter">
                  <font-awesome-icon fas icon="filter" class="icon"></font-awesome-icon>
                </b-button>
                <b-button size="sm" class="actionbutton float-right" :class="field.Sort == 'desc' ? 'sorted' : ''" :id="getRef('sortdown', field.FieldName)" @click="sortdown(field.FieldName, field.Type)">
                  <font-awesome-icon fas icon="arrow-down" class="icon"></font-awesome-icon>
                </b-button>
                <b-button size="sm" class="actionbutton float-right" :class="field.Sort == 'asc' ? 'sorted' : ''" :id="getRef('sortup', field.FieldName)" @click="sortup(field.FieldName, field.Type)">
                  <font-awesome-icon fas icon="arrow-up" class="icon"></font-awesome-icon>
                </b-button>
                <b-collapse class="mt-1" :id="getRef('collapse', field.FieldName)" v-model="field.Filter">
                  <b-container fluid>
                    <b-row class="mb-1" v-if="field.Type !== 'Dropdown'">
                      <ejs-dropdownlist v-if="field.Type == 'Text'" v-model="field.Predicate" :dataSource="textpredicate" :fields="ddfields"></ejs-dropdownlist>
                      <ejs-dropdownlist v-if="field.Type == 'Date'" v-model="field.Predicate" :dataSource="datepredicate" :fields="ddfields"></ejs-dropdownlist>
                    </b-row>
                    <b-row v-else class="mb-1">
                      <ejs-dropdownlist v-if="field.DropdownSource === 'subet'" v-model="field.Selected" :dataSource="subet" :fields="ddfields"></ejs-dropdownlist>
                      <ejs-dropdownlist v-else-if="field.DropdownSource === 'companies'" v-model="field.Selected" :dataSource="companies" :fields="ddfields"></ejs-dropdownlist>
                      <ejs-dropdownlist v-else-if="field.DropdownSource === 'cacstatus'" v-model="field.Selected" :dataSource="cacstatus" :fields="ddfields"></ejs-dropdownlist>
                      <ejs-dropdownlist v-else-if="field.DropdownSource === 'formstatus'" v-model="field.Selected" :dataSource="formstatus" :fields="ddfields"></ejs-dropdownlist>
                      <ejs-dropdownlist v-else-if="field.DropdownSource === 'formtype'" v-model="field.Selected" :dataSource="formtype" :fields="ddfields"></ejs-dropdownlist>
                    </b-row>
                    <b-row class="mb-1">
                      <b-form-input class="filterform" v-if="field.Type == 'Text'" v-model="field.FilterValue"></b-form-input>
                      <ejs-datepicker v-if="field.Type == 'Date'" v-model="field.FilterValue"></ejs-datepicker>
                    </b-row>
                    <b-row v-if="field.Predicate == 'B'" class="mb-1">
                      <ejs-datepicker v-if="field.Type == 'Date'" v-model="field.FilterValue2"></ejs-datepicker>
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
      <b-modal id="EditModal" ref="EditModal" size="xl" centered>
        <template v-slot:modal-title>Edit Details For {{ rowData.FirstName + ' ' + rowData.LastName }}</template>
        <b-container fluid>
          <p v-if="rowData.WPMReview">Pending Approval</p>
          <p v-if="isSubcontractor">{{ rowData.ModDeniedReason }}</p>
          <table id="EditTable" class="personneltable">
            <tbody>
              <tr class="bg-info text-white">
                <th>Last Name</th>
                <th>First Name</th>
                <th>Middle</th>
                <th>Cadency (SR, JR, etc)</th>
                <th>Location</th>
                <th>Company</th>
              </tr>
              <tr class="text-white">
                <td><input class="e-input" type="text" v-model="rowData.LastName" /><p v-if="showOldData" class="text-info">Original Value: {{ oldData.LastName }}</p></td>
                <td><input class="e-input" type="text" v-model="rowData.FirstName" /><p v-if="showOldData" class="text-info">Original Value: {{ oldData.FirstName }}</p></td>
                <td><input class="e-input" type="text" v-model="rowData.Middle" /><p v-if="showOldData" class="text-info">Original Value: {{ oldData.Middle }}</p></td>
                <td><input class="e-input" type="text" v-model="rowData.Cadency" /><p v-if="showOldData" class="text-info">Original Value: {{ oldData.Cadency }}</p></td>
                <td><input class="e-input" type="text" v-model="rowData.Location" /><p v-if="showOldData" class="text-info">Original Value: {{ oldData.Location }}</p></td>
                <td>
                  <ejs-dropdownlist v-model="rowData.Company" :dataSource="companies"></ejs-dropdownlist>
                  <p v-if="showOldData" class="text-info">Original Value: {{ oldData.Company }}</p>
                  <!-- <input class="e-input" type="text" v-model="rowData.Company" /> -->
                </td>
              </tr>
              <tr class="bg-info text-white">
                <th>Position</th>
                <th colspan="2">Email</th>
                <th>Phone</th>
                <th>SubET</th>
                <th>Active</th>
              </tr>
              <tr class="text-white">
                <td><input class="e-input" type="text" v-model="rowData.Position" /><p v-if="showOldData" class="text-info">Original Value: {{ oldData.Position }}</p></td>
                <td colspan="2"><input class="e-input" type="text" v-model="rowData.Email" /><p v-if="showOldData" class="text-info">Original Value: {{ oldData.Email }}</p></td>
                <td><input class="e-input" type="text" v-model="rowData.Phone" /><p v-if="showOldData" class="text-info">Original Value: {{ oldData.Phone }}</p></td>
                <td><ejs-dropdownlist v-model="rowData.SubET" :dataSource="subet" :fields="ddfields"></ejs-dropdownlist><p v-if="showOldData" class="text-info">Original Value: {{ oldData.SubET }}</p></td>
                <td><b-form-checkbox v-model="rowData.Active" value="Yes" unchecked-value="No" ref="Active" switch></b-form-checkbox></td>
              </tr>
              <tr class="bg-info text-white text-center">
                <td colspan="6"><b>Work Plans</b></td>
              </tr>
              <tr>
                <td colspan="6">
                  <b-table id="WPTable" ref="WPTable" v-model="WPData" :items="Plans" :fields="WPFields" style="table-layout: fixed;">
                    <template v-slot:cell(actions)="data">
                      <button size="sm" class="actionbutton" @click="deleteme(data.index)" title="Delete It">
                        <font-awesome-icon far icon="trash-alt" class="icon" :style="{ color: 'red' }"></font-awesome-icon>
                      </button>
                    </template>
                    <template v-slot:cell(Workplan)="data">
                      <ejs-dropdownlist v-model="WPData[data.index].Workplan" :dataSource="workplans" :fields="ddfields2" :id="getRef('Workplan', data.index)" @change="changewp"></ejs-dropdownlist>
                    </template>
                    <template v-slot:cell(PercentSupport)="data">
                      <ejs-dropdownlist v-model="WPData[data.index].PercentSupport" :dataSource="support" :fields="ddfields"></ejs-dropdownlist>
                    </template>
                  </b-table>
                  <button size="sm" @click="btnAddClick" variant="success">Add Work Plan</button>
                </td>
              </tr>
            </tbody>
          </table>
        </b-container>
        <template v-slot:modal-footer>
          <div id="editModalButtons" v-show="!rowData.WPMReview" class="editModalButtons">
            <b-button variant="danger" size="sm" @click="editClose">Close</b-button>
            <b-button variant="success" size="sm" @click="editOk">OK</b-button>
          </div>
          <div id="EditPersonnelButtons" v-show="!showDenial && rowData.WPMReview && isWPManager" class="editModalButtons">
            <b-button size="sm" @click="showDenial = !showDenial" variant="secondary">Deny</b-button>
            <b-button size="sm" @click="btnApproveClick" variant="primary">Approve</b-button>
          </div>
          <div id="wpmDenial" v-show="showDenial" class="w-100">
            <p class="pr-3">Please enter a denial reason:</p>
            <b-form-textarea id="DeniedReason" v-model="deniedReason" placeholder="Please enter at least 20 characters" rows="3" max-rows="6" :state="deniedReason.length > 20"></b-form-textarea>
            <b-button size="sm" @click="showDenial = !showDenial" variant="danger">Cancel</b-button>
            <b-button size="sm" @click="btnDenyClick" class="m-1 p-1" variant="success">Submit</b-button>
          </div>
        </template>
      </b-modal>
      <b-modal id="NewModal" ref="NewModal" size="xl" centered @ok="newOk">
        <template v-slot:modal-title>Add New User</template>
        <div class="container-fluid">
          <table id="NewTable" class="personneltable">
            <tbody>
              <tr class="bg-warning text-white">
                <th>Last Name</th>
                <th>First Name</th>
                <th>Middle</th>
                <th>Company</th>
              </tr>
              <tr>
                <td>
                  <input class="e-input" type="text" v-model="newData.LastName" />
                </td>
                <td>
                  <input class="e-input" type="text" v-model="newData.FirstName" />
                </td>
                <td>
                  <input class="e-input" type="text" v-model="newData.Middle" />
                </td>
                <td>
                  <ejs-dropdownlist v-model="newData.Company" :dataSource="companies"></ejs-dropdownlist>
                </td>
              </tr>
              <tr class="bg-warning text-white">
                <th colspan="2">Email</th>
                <th colspan="2">Phone</th>
              </tr>
              <tr>
                <td colspan="2">
                  <input class="e-input" type="text" v-model="newData.Email" />
                </td>
                <td colspan="2">
                  <input class="e-input" type="text" v-model="newData.Phone" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
              <b-overlay :show="filteredpersonnel.length == 0" :variant="overlayVariant" z-index="3000">
                <ejs-grid
                  id="PersonnelGrid"
                  ref="PersonnelGrid"
                  :enablePersistence="false"
                  :dataSource="filteredpersonnel"
                  :allowPaging="true"
                  :allowResizing="true"
                  :pageSettings="pageSettings"
                  :editSettings="editSettings"
                  :toolbar="toolbar"
                  :allowExcelExport="true"
                  :toolbarClick="toolbarClick"
                  :dataBound="dataBound"
                  :actionBegin="actionBegin"
                  :actionComplete="actionComplete"
                  :detailTemplate="detailTemplate"
                  rowHeight="20"
                  :height="rect.height - 175"
                  :width="rect.width - 5"
                >
                  <e-columns>
                    <e-column field="LastName" headerText="Last" textAlign="Left" width="100"></e-column>
                    <e-column field="FirstName" headerText="First" width="100"></e-column>
                    <e-column field="Middle" headerText="Middle" textAlign="Left" width="100"></e-column>
                    <e-column field="Cadency" headerText="Cadency" textAlign="Left" width="100"></e-column>
                    <e-column field="Position" headerText="Position" textAlign="Left" width="180"></e-column>
                    <e-column field="Location" headerText="Location" textAlign="Left" width="150"></e-column>
                    <e-column field="Email" headerText="Email" textAlign="Left" width="300"></e-column>
                    <e-column field="Phone" headerText="Phone" textAlign="Left" width="100"></e-column>
                    <e-column field="Company" headerText="Company" textAlign="Left" width="250"></e-column>
                    <e-column field="SubET" headerText="Sub ET" textAlign="Left" width="100"></e-column>
                    <e-column field="Contact" headerText="Contact" :visible="false" textAlign="Left" width="70"></e-column>
                    <e-column field="Active" headerText="Active" :visible="false" textAlign="Left" width="70"></e-column>
                    <e-column field="Id" headerText="Id" :visible="false" textAlign="Left" width="40" :isPrimaryKey="true"></e-column>
                    <e-column field="WPData" headerText="WPData" :visible="false" textAlign="Left" width="40"></e-column>
                    <e-column field="WPMReview" headerText="WPMReview" :visible="false" textAlign="Left" width="40"></e-column>
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
import Personnel from '@/models/Personnel'
import Workplan from '@/models/WorkPlan'
import Company from '@/models/Company'
import Security from '@/models/Security'
import Todo from '@/models/Todo'
import { Page, Edit, Toolbar, Resize, Reorder, VirtualScroll, ExcelExport, DetailRow, Search } from '@syncfusion/ej2-vue-grids'

let vm = null
// eslint-disable-next-line no-undef
let url = _spPageContextInfo.webAbsoluteUrl

export default {
  name: 'personnel',
  props: {
    mode: {
      type: String,
      default: 'default'
    },
    id: {
      type: Number
    }
  },
  /* errorCaptured(err, vm, info) {
    const notification = {
      type: 'danger',
      title: 'Error in personnel.vue ' + err,
      message: info,
      push: true
    }
    this.$store.dispatch('notification/add', notification, { root: true })
  }, */
  computed: {
    personnel() {
      return Personnel.getters('allPersonnel')
    },
    loaded() {
      return Personnel.getters('Loaded')
    },
    workplans() {
      return Workplan.getters('DropDown')
    },
    managers() {
      return Workplan.getters('Managers')
    },
    appversion() {
      return User.getters('AppVersion')
    },
    isWPManager() {
      return User.getters('isWPManager')
    },
    isDeveloper() {
      return User.getters('isDeveloper')
    },
    isSubcontractor() {
      return User.getters('isSubcontractor')
    },
    companies() {
      return Company.getters('DropDown')
    },
    currentuser() {
      return User.getters('CurrentUser')
    },
    userloaded() {
      return User.getters('Loaded')
    },
    cacgroup() {
      return Security.getters('CACGroup')
    },
    scigroup() {
      return Security.getters('SCIGroup')
    },
    rect() {
      return this.$store.state.support.contentrect
    }
  },
  data: function() {
    return {
      waterMark: 'Select a date',
      overlayText: 'Getting Data. Please Wait...',
      overlayVariant: 'light',
      company: null,
      showDenial: false,
      showOldData: false,
      deniedReason: '',
      sortfield: '',
      sortdir: '',
      filteredpersonnel: [],
      PersonnelId: 0,
      data: [],
      wpmEmail: [],
      wpmTasks: [],
      filters: {},
      height: '100%',
      fields: [
        {
          FieldName: 'Version',
          Value: null
        },
        {
          FieldName: 'LastName',
          Visible: true,
          DisplayName: 'Last',
          Filter: false,
          Type: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'FirstName',
          Visible: true,
          DisplayName: 'First',
          Filter: false,
          Type: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'Middle',
          Visible: true,
          DisplayName: 'Middle',
          Filter: false,
          Type: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'Cadency',
          Visible: true,
          DisplayName: 'Cadency',
          Filter: false,
          Type: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'Position',
          Visible: true,
          DisplayName: 'Position',
          Filter: false,
          Type: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'Location',
          Visible: true,
          DisplayName: 'Location',
          Filter: false,
          Type: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'Email',
          Visible: true,
          DisplayName: 'Email',
          Filter: false,
          Type: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'Phone',
          Visible: true,
          DisplayName: 'Phone',
          Filter: false,
          Type: 'Text',
          Predicate: 'S',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'Company',
          Visible: true,
          DisplayName: 'Company',
          Filter: false,
          Type: 'Dropdown',
          DropdownSource: 'companies',
          Selected: 'S',
          Predicate: 'E',
          FilterValue: '',
          Sort: ''
        },
        {
          FieldName: 'SubET',
          Visible: true,
          DisplayName: 'Sub ET',
          Filter: false,
          Type: 'Dropdown',
          DropdownSource: 'subet',
          Selected: 'S',
          Predicate: 'E',
          FilterValue: '',
          Sort: ''
        }
      ],
      ddfields: { text: 'text', value: 'value' },
      ddfields2: { text: 'text', value: 'value', data: 'data' },
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
      yesno: [
        { text: 'Yes', value: 'Yes' },
        { text: 'No', value: 'No' }
      ],
      subet: [
        { text: 'Select...', value: 'S' },
        { text: 'N/A', value: 'N/A' },
        { text: 'Existing', value: 'Existing' },
        { text: 'Required', value: 'Required' },
        { text: 'Terminated', value: 'Terminated' }
      ],
      cacstatus: [
        { text: 'Select...', value: 'S' },
        { text: 'Not Required', value: 'Not Required' },
        { text: 'Pending Info', value: 'Pending Info' },
        { text: 'CACI Review', value: 'CACI Review' },
        { text: 'Requested', value: 'Requested' },
        { text: 'Renewal', value: 'Renewal' },
        { text: 'Issued', value: 'Issued' },
        { text: 'Issuance Cancelled', value: 'Issuance Cancelled' },
        { text: 'Return Pending', value: 'Return Pending' },
        { text: 'Disposition-Returned', value: 'Disposition-Returned' },
        { text: 'Disposition-Transferred', value: 'Disposition-Transferred' },
        { text: 'Non-F3I2 CAC', value: 'Non-F3I2 CAC' }
      ],
      formstatus: [
        { text: 'Select...', value: 'S' },
        { text: 'Not Required', value: 'Not Required' },
        { text: 'Pending Info', value: 'Pending Info' },
        { text: 'CACI Review', value: 'CACI Review' },
        { text: 'Submitted', value: 'Submitted' },
        { text: 'Indoc Assist Sent', value: 'Indoc Assist Sent' },
        { text: 'SSO Processed', value: 'SSO Processed' },
        { text: 'Debrief Notification Submitted', value: 'Debrief Notification Submitted' },
        { text: 'Disposition-Transfer', value: 'Disposition-Transfer' },
        { text: 'Disposition-Debriefed', value: 'Disposition-Debriefed' }
      ],
      formtype: [
        { text: 'Select...', value: 'S' },
        { text: 'N/A', value: 'N/A' },
        { text: 'Nomination', value: 'Nomination' },
        { text: 'Transfer', value: 'Transfer' }
      ],
      support: [
        { text: '100%', value: 1 },
        { text: '75%', value: 0.75 },
        { text: '50%', value: 0.5 },
        { text: '25%', value: 0.25 },
        { text: '0%', value: 0 }
      ],
      WPFields: [
        { key: 'actions', label: 'Action', thClass: 'bg-warning text-white text-center px40' },
        { key: 'Workplan', label: 'Workplan', thClass: 'bg-warning text-white text-center px300' },
        { key: 'PercentSupport', label: 'Percent Support', thClass: 'bg-warning text-white text-center px200' }
      ],
      pageSettings: { pageSize: 30 },
      editSettings: { allowEditing: true, allowAdding: true, allowDeleting: false, mode: 'Dialog' },
      sortSettings: { columns: [{ field: 'LastName', direction: 'Ascending' }] },
      filterSettings: { type: 'Menu' },
      toolbar: ['Add', 'Edit', 'Print', 'Search', 'ExcelExport'],
      WPData: [
        {
          Workplan: '',
          WorkplanNumber: '',
          WorkplanTitle: '',
          PersonnelId: '0',
          PercentSupport: 100
        }
      ],
      Plans: [
        {
          Workplan: '',
          WorkplanNumber: '',
          WorkplanTitle: '',
          PersonnelId: '0',
          PercentSupport: 100
        }
      ],
      rowData: {},
      oldData: {},
      newData: {
        LastName: '',
        FirstName: '',
        Middle: '',
        Company: '',
        Email: ''
      },
      detailTemplate: function() {
        return {
          template: Vue.component('detailTemplate', {
            template: `
              <b-table-simple class="detailtable">
                <b-thead>
                  <b-tr>
                    <b-td>Work Plan</b-td>
                    <b-td>Percent Support</b-td>
                  </b-tr>
                </b-thead>
                <b-tbody>
                  <b-tr v-for="wp in pwps" :key="wp">
                    <b-td>{{wp.WorkplanNumber}} {{wp.WorkplanTitle}}</b-td>
                    <b-td>{{wp.PercentSupport * 100}}</b-td>
                  </b-tr>
                </b-tbody>
              </b-table-simple>`,
            data: function() {
              return {
                data: {}
              }
            },
            methods: {},
            computed: {
              pwps() {
                return JSON.parse(this.data.WPData)
              }
            }
          })
        }
      }
    }
  },
  mounted: async function() {
    vm = this
    this.$nextTick(async () => {
      if (this.companies.length === 0) {
        await Company.dispatch('getCompanies')
      }
      this.$store.dispatch('support/addActivity', '<div class="bg-info">personnel-MOUNTED</div>')
      this.company = this.currentuser[0].Company
      Personnel.dispatch('getDigest')
      Security.dispatch('getDigest')
      Security.dispatch('getSecurityGroups')
      Workplan.dispatch('getWorkplans')
        .then(function() {
          if (vm.isSubcontractor && vm.company) {
            let payload = {}
            payload.company = vm.company
            Personnel.dispatch('getPersonnelByCompany', payload)
              .then(function() {
                vm.$options.interval = setInterval(vm.waitForPeople, 1000)
              })
              .catch(e => {
                // vm.handleError(e)
                console.log('getPersonnelByCompany ERROR: ' + e)
              })
          } else {
            Personnel.dispatch('getPersonnel')
              .then(function() {
                vm.$options.interval = setInterval(vm.waitForPeople, 1000)
              })
              .catch(e => {
                // vm.handleError(e)
                console.log('getPersonnel ERROR: ' + e)
              })
          }
        })
        .catch(e => {
          // Add user notification and system logging
          // vm.handleError(e)
          console.log('getWorkplans ERROR: ' + e)
        })
      if (vm.mode === 'edit') {
        // Don't show all of the records until after the form is submitted
        vm.PersonnelId = this.id ? this.id : null
        await Workplan.dispatch('getWorkplans').catch(e => {
          vm.handleError(e)
        })

        if (vm.id) {
          let person = await Personnel.dispatch('getPersonnelAllValuesById', vm.id).catch(e => {
            vm.handleError(e)
          })
          this.rowData = person[0]
          if (person[0].WPMReview) {
            console.log('MODIFICATION: ' + JSON.stringify(person[0].Modification))
            this.oldData = person[0].Modification
            this.showOldData = true
          }
          if (person[0].WPData && person[0].WPData.length > 0) {
            this.Plans = JSON.parse(person[0].WPData)
          }
          this.$bvModal.show('EditModal')
        }
      }
      if (this.isSubcontractor) {
        console.log(`WPDATA: ${JSON.stringify(this.currentuser[0].WPData)}`)
        if (this.currentuser[0] && this.currentuser[0].WPData.length > 0) {
          let WPData = JSON.parse(this.currentuser[0].WPData)
          //WPData.forEach(async wp => {
          for (var i = 0; i < WPData.length; i++) {
            let manager = await Workplan.dispatch('getManagerByWPNumber', WPData[i].WorkplanNumber)
            if (manager.length > 0) {
              this.wpmEmail.push(manager[0]['Manager']['EMail'])
              this.wpmTasks.push(manager[0]['Manager']['ID'])
            }
          }
        }
      }
    })
  },
  methods: {
    addSecurity: async function(personnelId, modalType, data) {
      await Security.dispatch('getDigest')
      let payload = {
        PersonnelID: personnelId,
        FirstName: data.FirstName,
        LastName: data.LastName,
        Company: data.Company,
        Title: personnelId + '-' + data.FirstName + ' ' + data.LastName
      }
      //First add the Security entry
      let security = await Security.dispatch('addSecurityForm', payload)
      // then get the task users and emails sorted
      let securityTaskUsers = []
      let securityTaskEmail = []
      // Combining both SCI and CAC groups
      vm.cacgroup.forEach(user => {
        if (user && !securityTaskUsers.includes(user.Id)) {
          securityTaskUsers.push(user.Id)
          securityTaskEmail.push(user.Email)
        }
      })
      vm.scigroup.forEach(user => {
        if (user && !securityTaskUsers.includes(user.Id)) {
          securityTaskUsers.push(user.Id)
          securityTaskEmail.push(user.Email)
        }
      })
      // Add the task
      let taskPayload = {
        Title: 'New Personnel added: ' + data.FirstName + ' ' + data.LastName,
        //AssignedToId: vm.userid, // Hardcoding the Security Group
        AssignedToId: 63, // Need to get everyone in the Security Group
        Description: 'New Personnel added ' + data.FirstName + ' ' + data.LastName,
        IsMilestone: false,
        PercentComplete: 0,
        TaskType: 'PersonnelAdded',
        TaskLink: '/security/edit/' + security.data.d.Id
      }
      let results = await Todo.dispatch('addTodo', taskPayload).catch(error => {
        const notification = {
          type: 'danger',
          title: 'Portal Error',
          message: error.message,
          push: true
        }
        this.$store.dispatch('notification/add', notification, {
          root: true
        })
        console.log('ERROR: ' + error.message)
      })
      // Update the previously added security form with the task id to be completed when a status changes.
      let securityPayload = {
        Id: security.data.d.Id,
        etag: security.data.d.__metadata.etag,
        uri: security.data.d.__metadata.uri,
        taskId: results.data.d.Id
      }
      await Security.dispatch('updateSecurityForm', securityPayload)
      let emailPayload = {
        body:
          '<p></p>New Personnel Added: ' +
          data.FirstName +
          ' ' +
          data.LastName +
          '.</p><p>Please Review in the portal at <a href="' +
          url +
          '/security/edit/' +
          security.data.d.Id +
          '">Edit ' +
          data.FirstName +
          ' ' +
          data.LastName +
          '</a></p><p><b>Please copy and paste the link into a modern browser such as Google Chrome if it is not your default.</b></p>',
        subject: '(F3I-2 Portal) New Personnel Added',
        emails: ['drew.ahrens@caci.com']
      }
      await Personnel.dispatch('sendEmail', emailPayload)
      vm.hideme(modalType, 'refresh')
    },
    handleError: function(e) {
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
    },
    waitForPeople: function() {
      if (this.personnel && this.personnel.length > 0) {
        clearInterval(this.$options.interval)
        this.filteredpersonnel = this.personnel // set initial filter to all
        // load any saved filters
        this.loadfilters()
        switch (this.mode) {
          case 'onboarding':
            // document.getElementById('PageTitle').innerHTML = ' -  Onboarding'
            this.$bvModal.show('NewModal')
            break
          case 'default':
            // document.getElementById('PageTitle').innerHTML = ' -  Reports'
            break
        }
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
        case 'PersonnelGrid_excelexport':
          this.$refs['PersonnelGrid'].excelExport()
          break

        case 'PersonnelGrid_print':
          this.$refs['PersonnelGrid'].print()
          break
      }
    },
    ToggleFilters() {
      this.$refs['FilterModal'].toggle('#ShowFilters')
    },
    onModalHide: function() {
      console.log('MODAL HIDE: ' + this.mode)
      vm.$router.push({ name: 'Refresh', params: { action: 'personnel' } })
    },
    actionBegin(args) {
      switch (args.requestType) {
        case 'beginEdit':
          // args.rowData contains the data for the row. Place this data in our edit form and we can change it and then update the row and also SharePoint
          args.cancel = true
          this.PersonnelId = args.rowData.Id
          this.editRow(args.rowData)
          break
        case 'add':
          args.cancel = true
          this.$bvModal.show('NewModal')
          break
      }
    },
    actionComplete(args) {
      if (args.requestType == 'columnstate') {
        this.$refs['PersonnelGrid'].autoFitColumns()
      }
      if (args.requestType == 'refresh') {
        let h1 = 0
        let h2 = this.$refs.PersonnelGrid.$el.children[7].children[0].clientHeight
        h1 = Math.floor(h2 / 20)
        this.pageSettings.pageSize = h1
        this.$refs.PersonnelGrid.pageSettings = { pageSize: h1 }
      }
    },
    dataBound: function() {
      this.$refs.PersonnelGrid.autoFitColumns()
    },
    editRow: function(data) {
      if (data.WPData && data.WPData.length > 0) {
        this.Plans = JSON.parse(data.WPData)
      }
      this.$bvModal.show('EditModal')
      this.rowData = data
      this.oldData = JSON.parse(JSON.stringify(this.rowData)) // immutable data hack...
    },
    editOk: async function() {
      await Personnel.dispatch('getDigest')
      if (this.Plans.length > 0) {
        this.rowData.WPData = JSON.stringify(this.Plans)
      }
      if (this.isSubcontractor) {
        let data = this.rowData
        data.Active = this.rowData.Active === 'No' ? false : true
        data.Modification = null
        let od = this.oldData
        od.submitterId = this.currentuser[0].id
        od.submitterEmail = this.currentuser[0].Email
        data.Modification = od
        data.WPMReview = true
        await Personnel.dispatch('editPerson', data).catch(e => {
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
        })
        // add task to manager
        /*let payload = {
          Title: 'Review Personnel Submission ' + this.rowData.FirstName + ' ' + this.rowData.LastName,
          //AssignedToId: vm.userid, // Hardcode to Juan
          AssignedToId: managerTasks,
          Description: 'Review Personnel Submission ' + this.rowData.FirstName + ' ' + this.rowData.LastName,
          IsMilestone: false,
          PercentComplete: 0,
          TaskType: 'Personnel-Review',
          TaskLink: '/personnel/home/reports/edit/' + this.rowData.Id
        }
        await Todo.dispatch('addTodo', payload).catch(error => {
          const notification = {
            type: 'danger',
            title: 'Portal Error',
            message: error.message,
            push: true
          }
          this.$store.dispatch('notification/add', notification, {
            root: true
          })
          console.log('ERROR: ' + error.message)
        })*/

        let emailBody = '<p>Personnel has been submitted that requires review.</p><p></p>'
        emailBody += '<p>User Edited: </p>'
        emailBody += '<p>Personnel: ' + this.rowData.FirstName + ' ' + this.rowData.LastName + '</p>'
        emailBody += '<p>Company: ' + this.rowData.Company + '</p>'
        emailBody += '<p>Email: ' + this.rowData.Email + '</p>'
        emailBody += '<p>Phone: ' + this.rowData.Phone + '</p>'
        emailBody += '<p>Please click the link below for more details.</p><p></p>'
        // Change before Test - Production
        emailBody += '<p><a href="' + url + '/Pages/' + process.env.APP_PAGE + '#/personnel/home/reports/edit/' + this.rowData.Id + '">Personnel</a></p>'
        let emailData = {
          subject: '(F3I-2 Portal) Subcontractor Edited Personnel',
          body: emailBody,
          emails: this.wpmEmail
        }
        await Personnel.dispatch('sendEmail', emailData).then(function() {
          const notification = {
            type: 'info',
            title: 'Information',
            message: 'A Workplan Manager will review your submission.',
            push: true
          }
          vm.$store.dispatch('notification/add', notification, { root: true })
          vm.hideme('EditModal', 'refresh')
        })
      } else {
        let payload = this.rowData
        payload.Active = this.rowData.Active === 'No' ? false : true
        Personnel.dispatch('editPerson', payload).catch(e => {
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
        })
        // Add integration with Security to update the following field in that list: FirstName, LastName, Company, Active
        let securityPayload = {
          PersonnelID: this.rowData.id,
          FirstName: this.rowData.FirstName,
          LastName: this.rowData.LastName,
          Company: this.rowData.Company,
          Active: this.rowData.Active === 'No' ? false : true
        }
        let securityInfo = await Security.dispatch('getSecurityFormByPersonnelId', securityPayload)
        securityPayload.etag = securityInfo.etag
        securityPayload.uri = securityInfo.uri
        await Security.dispatch('updateSecurityForm', securityPayload)
        vm.hideme('EditModal', 'refresh')
      }
    },
    editClose: function() {
      vm.hideme('EditModal', 'refresh')
    },
    newOk: async function() {
      await Personnel.dispatch('getDigest')
      await Security.dispatch('getDigest')
      await Todo.dispatch('getDigest')
      /** ADDING PERSON AS SUBK USER **/
      if (this.isSubcontractor) {
        // Add a todo
        /*let payload = {
          Title: 'New Personnel Submitted: ' + this.newData.FirstName + ' ' + this.newData.LastName,
          AssignedToId: this.wpmTasks,
          Description: 'New Personnel Submitted: ' + this.newData.FirstName + ' ' + this.newData.LastName,
          IsMilestone: false,
          PercentComplete: 0,
          TaskType: 'Review Personnel',
          TaskLink: '/personnel/home/reports/edit/' + results.Id
        }
        let todo = await Todo.dispatch('addTodo', payload).catch(error => {
          const notification = {
            type: 'danger',
            title: 'Portal Error',
            message: error.message,
            push: true
          }
          this.$store.dispatch('notification/add', notification, {
            root: true
          })
          console.log('ERROR: ' + error.message)
        })
        console.log(todo)*/
        // Add the data normally but set the flag WPMReview to true.
        let data = {
          LastName: this.newData.LastName,
          FirstName: this.newData.FirstName,
          Middle: this.newData.Middle,
          Company: this.newData.Company,
          Email: this.newData.Email,
          Phone: this.newData.Phone,
          WPMReview: true,
          Modification: {
            newSubmission: true,
            submitterId: this.currentuser[0].id,
            submitterEmail: this.currentuser[0].Email
            /*WPMTask: {
              Id: todo.data.d.Id,
              etag: todo.data.d.__metadata.etag,
              uri: todo.data.d.__metadata.uri
            }*/
          } // Adding a flag to detect later when the WPM reviews the information
        }
        let results = await Personnel.dispatch('addSub', data).catch(e => {
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
        })
        let emailBody = '<p>Personnel has been submitted that requires review.</p><p></p>'
        emailBody += '<p>New User Submitted: </p>'
        emailBody += '<p>Personnel: ' + this.newData.FirstName + ' ' + this.newData.LastName + '</p>'
        emailBody += '<p>Company: ' + this.newData.Company + '</p>'
        emailBody += '<p>Email: ' + this.newData.Email + '</p>'
        emailBody += '<p>Phone: ' + this.newData.Phone + '</p>'
        emailBody += '<p>Please click the link below for more details.</p><p></p>'
        // Change before Test - Production
        console.log(process.env.APP_PAGE)
        emailBody += '<p><a href="' + url + '/Pages/' + process.env.APP_PAGE + '#/personnel/home/reports/edit/' + results.Id + '">Personnel</a></p>'
        let emailData = {
          subject: '(F3I-2 Portal) Subcontractor Added Personnel',
          body: emailBody,
          emails: this.wpmEmail
        }
        await Personnel.dispatch('sendEmail', emailData)
        this.hideme('NewModal', 'refresh')
        const notification = {
          type: 'info',
          title: 'Information',
          message: 'A Workplan Manager will review your submission.',
          push: true
        }
        this.$store.dispatch('notification/add', notification, { root: true })
      } else {
        /** ADDING PERSON AS NON SUBK USER **/
        try {
          Personnel.dispatch('addPerson', this.newData).then(async function(results) {
            vm.addSecurity(results.data.d.Id, 'NewModal', vm.newData)
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
    },
    btnAddClick: function() {
      this.Plans.push({
        Workplan: '',
        WorkplanNumber: '',
        WorkplanTitle: '',
        PersonnelId: '',
        PercentSupport: ''
      })
    },
    btnApproveClick: async function() {
      // Remove previous Modification Data
      let payload = this.rowData
      payload.ModDeniedReason = null
      payload.Modification = null
      payload.WPMReview = false
      payload.Active = this.rowData.Active === 'No' ? false : true
      Personnel.dispatch('editPerson', this.rowData)
        .then(async function() {
          if (vm.oldData.newSubmission) {
            console.log('ADDING SECURITY INFORMATION')
            vm.addSecurity(vm.rowData.Id, 'EditModal', vm.rowData)
          } else {
            await Security.dispatch('getDigest')
            console.log('EDITING SECURITY INFORMATION')
            let securityPayload = {
              PersonnelID: payload.Id,
              FirstName: payload.FirstName,
              LastName: payload.LastName,
              Company: payload.Company,
              Active: payload.Active
            }
            let securityInfo = await Security.dispatch('getSecurityFormByPersonnelId', securityPayload)
            securityPayload.etag = securityInfo.etag
            securityPayload.uri = securityInfo.uri
            await Security.dispatch('updateSecurityForm', securityPayload).then(() => {
              // Send notification of approved user to Security group
              vm.hideme('EditModal', 'refresh')
            })
          }
        })
        .catch(e => {
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
        })
      /*let taskCompletePayload = {
        etag: this.oldData.WPMTask.etag,
        uri: this.oldData.WPMTask.uri,
        id: this.oldData.WPMTask.Id
      }
      await Todo.dispatch('completeTodo', taskCompletePayload)
      let payload = {
        Title: 'Personnel Submission for ' + this.rowData.FirstName + ' ' + this.rowData.LastName + ' Approved',
        //AssignedToId: vm.userid, // Hardcode to Juan
        AssignedToId: this.oldData.submitterId,
        Description: 'Personnel Submission for ' + this.rowData.FirstName + ' ' + this.rowData.LastName + ' Approved',
        IsMilestone: false,
        PercentComplete: 0,
        TaskType: 'Personnel-Approved',
        TaskLink: '/personnel/home/reports/default'
      }
      await Todo.dispatch('addTodo', payload).catch(error => {
        const notification = {
          type: 'danger',
          title: 'Portal Error',
          message: error.message,
          push: true
        }
        this.$store.dispatch('notification/add', notification, {
          root: true
        })
        console.log('ERROR: ' + error.message)
      })*/

      let emailBody = '<p>Personnel submission has been Approved.</p><p></p>'
      emailBody += '<p>Personnel: ' + this.rowData.FirstName + ' ' + this.rowData.LastName + '</p>'
      emailBody += '<p>Company: ' + this.rowData.Company + '</p>'
      emailBody += '<p>Email: ' + this.rowData.Email + '</p>'
      emailBody += '<p>Phone: ' + this.rowData.Phone + '</p>'
      emailBody += '<p>Please click the link (or copy and paste into a modern browser) below for more details.</p><p></p>'
      // Change before Test - Production
      emailBody += '<p><a href="' + url + '/Pages/' + process.env.APP_PAGE + '#/personnel/home/reports/edit/' + this.rowData.Id + '">Personnel</a></p>'
      let emailData = {
        subject: '(F3I-2 Portal) Personnel Approved',
        body: emailBody,
        emails: [this.oldData.submitterEmail]
      }
      await Personnel.dispatch('sendEmail', emailData)
    },
    btnDenyClick: async function() {
      // Revert any changes that may have occured.
      if (!this.oldData.newSubmission) {
        let denyData = this.oldData
        denyData.Modification = null
        denyData.ModDeniedReason = this.deniedReason
        denyData.WMPReview = false
        denyData.Active = this.rowData.Active === 'No' ? false : true
        denyData.etag = this.rowData.etag
        denyData.uri = this.rowData.uri
        console.log('DENIAL DATA: ' + JSON.stringify(this.oldData))
        await Personnel.dispatch('editPerson', denyData).catch(e => {
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
        })
      } else {
        // otherwise delete the sucker
        await Personnel.dispatch('deletePersonnelById', { id: this.rowData.Id })
      }
      /*let taskCompletePayload = {
        etag: this.oldData.WPMTask.etag,
        uri: this.oldData.WPMTask.uri,
        id: this.oldData.WPMTask.Id
      }
      await Todo.dispatch('completeTodo', taskCompletePayload)
      // Send a notification to the original submitter*/
      /*let payload = {
        Title: 'Personnel Submission for ' + this.rowData.FirstName + ' ' + this.rowData.LastName + ' Rejected',
        //AssignedToId: vm.userid, // Hardcode to Juan
        AssignedToId: this.oldData.submitterId,
        Description: 'Personnel Submission for ' + this.rowData.FirstName + ' ' + this.rowData.LastName + ' Rejected. Rejection Reason: ' + this.deniedReason,
        IsMilestone: false,
        PercentComplete: 0,
        TaskType: 'Personnel-Rejected',
        TaskLink: this.oldData.newSubmission ? '' : '/personnel/home/reports/edit/' + this.rowData.Id
      }
      await Todo.dispatch('addTodo', payload).catch(error => {
        const notification = {
          type: 'danger',
          title: 'Portal Error',
          message: error.message,
          push: true
        }
        this.$store.dispatch('notification/add', notification, {
          root: true
        })
        console.log('ERROR: ' + error.message)
      })*/
      console.log('OLD DATA: ' + JSON.stringify(this.oldData))
      let emailBody = '<p>Personnel Submission has been Rejected.</p><p></p>'
      emailBody += '<p>Personnel: ' + this.rowData.FirstName + ' ' + this.rowData.LastName + '</p>'
      emailBody += '<p>Denial Reason: ' + this.deniedReason + '</p>'
      if (!this.rowData.newSubmission) {
        emailBody += '<p>Please click the link (or copy and paste into a modern browser) below for more details.</p><p></p>'
        // Change before Test - Production
        emailBody += '<p><a href="' + url + '/Pages/' + process.env.APP_PAGE + '#/personnel/home/reports/edit/' + this.rowData.Id + '">Personnel</a></p>'
      }
      let emailData = {
        subject: '(F3I-2 Portal) Personnel Rejected',
        body: emailBody,
        emails: [this.oldData.submitterEmail]
      }
      await Personnel.dispatch('sendEmail', emailData).then(function() {
        vm.deniedReason = ''
        vm.showDenial = false
        vm.hideme('EditModal', 'refresh')
      })
    },
    changewp: function(e) {
      var id = String(e.element.id)
      var index = id.split('_')[1]
      var tval = e.itemData.data
      tval = tval.split(', ')
      this.WPData[index].WorkplanNumber = tval[0]
      this.WPData[index].WorkplanTitle = tval[1]
      this.WPData[index].PersonnelId = this.PersonnelId
    },
    deleteme: function(index) {
      this.WPData.splice(index, 1)
      this.Plans.splice(index, 1)
    },
    hideme: function(modal, action) {
      vm.$bvModal.hide(modal)
      if (action == 'refresh') {
        vm.$router.push({ name: 'Refresh', params: { action: 'personnel' } })
      }
    },
    sortup: function(e, t) {
      // ascending
      var p = this.filteredpersonnel
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
      this.filteredpersonnel = p
      this.$refs.PersonnelGrid.refresh()
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
      var p = this.filteredpersonnel
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
      this.filteredpersonnel = p
      this.$refs.PersonnelGrid.refresh()
      for (var i = 0; i < this.fields.length; i++) {
        if (this.fields[i].FieldName == e) {
          console.log('SORT DOWN: ' + e)
          this.fields[i].Sort = 'desc'
        } else {
          this.fields[i].Sort = ''
        }
      }
    },
    showorhide: function(e) {
      var checked = e.checked
      // var fieldname = e.event.target.value
      var displayname = e.event.target.labels[0].innerText
      if (checked) {
        for (let i = 1; i < vm.fields.length; i++) {
          if (vm.fields[i].DisplayName == displayname) {
            vm.fields[i].Visible = true
          }
        }
        this.$refs.PersonnelGrid.showColumns([displayname])
        this.$refs.PersonnelGrid.autoFitColumns()
      } else {
        for (let i = 1; i < vm.fields.length; i++) {
          if (vm.fields[i].DisplayName == displayname) {
            vm.fields[i].Visible = false
          }
        }
        this.$refs.PersonnelGrid.hideColumns([displayname])
        this.$refs.PersonnelGrid.autoFitColumns()
      }
    },
    setfilter: function() {
      // always reset to all records then do all filters as they are selected.
      // this is a top down filter
      // loop through all the fields and filter the ones that have a predicate and filtervalue set
      var p = this.personnel // set initial filter to all
      for (var i = 1; i < this.fields.length; i++) {
        if (this.fields[i].Sort !== '') {
          this.sortfield = this.fields[i].FieldName
        }
        if (this.fields[i].Predicate !== 'S') {
          if (this.fields[i].FilterValue !== '' || this.fields[i].Selected !== 'S') {
            // determine what to filter based on predicate
            switch (this.fields[i].Predicate) {
              case 'SW':
                // Starts With
                p = p.filter(person => Vue._.startsWith(person[vm.fields[i].FieldName], vm.fields[i].FilterValue))
                break

              case 'EW':
                // Ends With
                p = p.filter(person => Vue._.endsWith(person[vm.fields[i].FieldName], vm.fields[i].FilterValue))
                break

              case 'C':
                // Contains
                p = p.filter(person => Vue._.includes(person[vm.fields[i].FieldName], vm.fields[i].FilterValue))
                break

              case 'E':
                // Equals
                if (this.fields[i].Type == 'Dropdown') {
                  console.log('SETTING FILTER: ' + this.fields[i].FieldName + ', TO: ' + this.fields[i].Selected)
                  p = p.filter(person => Vue._.isEqual(person[vm.fields[i].FieldName], vm.fields[i].Selected))
                } else {
                  p = p.filter(person => Vue._.isEqual(person[vm.fields[i].FieldName], vm.fields[i].FilterValue))
                }
                break

              case 'NE':
                // Not Equals
                p = p.filter(person => Vue._.without(person[vm.fields[i].FieldName], vm.fields[i].FilterValue))
                break

              case 'GT':
                // Greater Than
                p = p.filter(person => moment(person[vm.fields[i].FieldName]).isAfter(moment(vm.fields[i].FilterValue)))
                break

              case 'LT':
                // Less Than
                p = p.filter(person => moment(vm.fields[i].FilterValue).isAfter(moment(person[vm.fields[i].FieldName])))
                break

              case 'B':
                // Between
                p = p.filter(person => moment(person[vm.fields[i].FieldName]).isBetween(moment(vm.fields[i].FilterValue), moment(vm.fields[i].FilterValue2)))
                break
            }
          }
        }
        if (this.fields[i].Visible) {
          this.$refs.PersonnelGrid.showColumns(this.fields[i].DisplayName)
          this.$refs.PersonnelGrid.autoFitColumns()
        } else {
          this.$refs.PersonnelGrid.hideColumns(this.fields[i].DisplayName)
          this.$refs.PersonnelGrid.autoFitColumns()
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
      this.filteredpersonnel = p
      this.$refs.PersonnelGrid.refresh()
    },
    clearfilter: function(e) {
      var f = String(e.target.id).split('_')[1]
      console.log('CLEARING FILTER: ' + f)
      for (var i = 1; i < vm.fields.length; i++) {
        if (vm.fields[i].FieldName == f) {
          vm.fields[i].Predicate = 'S'
          vm.fields[i].FilterValue = ''
          // vm.fields[i].Sort = ''
          if (vm.fields[i].Type == 'Date') {
            vm.fields[i].FilterValue2 = ''
          }
          if (vm.fields[i].Type == 'Dropdown') {
            vm.fields[i].Selected = 'S'
          }
        }
      }
      vm.setfilter()
    },
    clearfilters: function() {
      window.localStorage.removeItem('personnel')
      for (var i = 1; i < vm.fields.length; i++) {
        vm.fields[i].Predicate = 'S'
        vm.fields[i].FilterValue = ''
        vm.fields[i].Sort = ''
        if (vm.fields[i].Type == 'Date') {
          vm.fields[i].FilterValue2 = ''
        }
        if (vm.fields[i].Type == 'Dropdown') {
          vm.fields[i].Selected = 'S'
        }
      }
      vm.filteredpersonnel = vm.personnel
    },
    savefilters: function() {
      this.fields[0].Value = this.appversion
      window.localStorage.setItem('personnel', JSON.stringify(vm.fields))
    },
    loadfilters: function() {
      let f = String(window.localStorage.getItem('personnel'))
      if (f != 'null') {
        // here we will load the fields from local storage and test the version.
        // if the version matches the current app version then load the fields.
        // if not use the new fields from the file and alert the user that they need to rebuild their filters
        let flds = JSON.parse(f)
        let version = flds[0]['Value']
        if (version == this.appversion) {
          // ask the user if they want to apply the saved filters
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
                vm.filteredpersonnel = []
                setTimeout(() => {
                  vm.fields = flds
                  // loop to display the selected columns
                  for (var i = 1; i < vm.fields.length; i++) {
                    if (vm.fields[i].Visible) {
                      vm.$refs.PersonnelGrid.showColumns(vm.fields[i].DisplayName)
                      vm.$refs.PersonnelGrid.autoFitColumns()
                    } else {
                      vm.$refs.PersonnelGrid.hideColumns(vm.fields[i].DisplayName)
                      vm.$refs.PersonnelGrid.autoFitColumns()
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
              const notification = {
                type: 'danger',
                title: 'Error in personnel.vue loading filters',
                message: err,
                push: true
              }
              this.$store.dispatch('notification/add', notification, { root: true })
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
    grid: [Page, Edit, DetailRow, Toolbar, Resize, Reorder, VirtualScroll, ExcelExport, Search]
  },
  watch: {
    // eslint-disable-next-line no-unused-vars
    $route(to, from) {
      this.mode = to.params.mode
      switch (this.mode) {
        case 'onboarding':
          // document.getElementById('PageTitle').innerHTML = ' -  Onboarding'
          this.$bvModal.show('NewModal')
          break
        case 'default':
          try {
            Personnel.dispatch('getPersonnel').then(function() {
              vm.$options.interval = setInterval(vm.waitForPeople, 1000)
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
          break
      }
    }
  }
}
</script>

<style lang="scss">
.buttonrow {
  height: 50px;
  justify-content: space-between; // parent is flex so this little bit allows us to create a right aligned item if needed
}

.gridrow {
  height: calc(100vh - 200px);
}

.sorted {
  color: #04ee04 !important;
}

.editModalButtons > button {
  margin-right: 0.5rem !important;
}

.editModalButtons > textarea {
  margin-right: 0.5rem !important;
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
