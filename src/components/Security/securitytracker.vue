<template>
  <b-container fluid class="contentHeight m-0 p-0">
    <b-row no-gutters class="contentHeight">
      <b-col cols="12" class="m-0 p-0">
        <b-container fluid class="contentHeight m-0 p-0">
          <b-form @submit="onSubmit">
            <b-row no-gutters class="gridrow">
              <b-overlay :show="securityforms.length == 0" :variant="overlayVariant" z-index="3000">
                <ejs-grid
                  id="SecurityGrid"
                  ref="SecurityGrid"
                  :dataSource="securityforms"
                  :allowPaging="true"
                  :allowReordering="true"
                  :allowResizing="true"
                  :pageSettings="pageSettings"
                  :editSettings="editSettings"
                  :filterSettings="filterSettings"
                  :toolbar="toolbar"
                  :allowExcelExport="true"
                  :toolbarClick="toolbarClick"
                  :actionBegin="actionBegin"
                  :actionComplete="actionComplete"
                  :dataBound="dataBound"
                  :detailTemplate="detailTemplate"
                  rowHeight="20"
                  :height="rect.height - 121"
                  :width="rect.width - 1"
                >
                  <e-columns>
                    <e-column field="LastName" headerText="Last Name" minWidth="50" textAlign="Left"></e-column>
                    <e-column field="FirstName" headerText="First Name" minWidth="50" textAlign="Left"></e-column>
                    <e-column field="Company" headerText="Company" minWidth="100" textAlign="Left"></e-column>
                    <e-column field="SCIStatus" headerText="SCI Status" minWidth="50" textAlign="Left"></e-column>
                    <e-column field="SCIFormType" headerText="SCI Form" minWidth="50" textAlign="Left"></e-column>
                    <e-column field="SCIFormSubmitted" headerText="SCI Submitted" minWidth="50" textAlign="Left"></e-column>
                    <e-column field="SCIIndocAssistDate" headerText="SCI Indoc Assist Date" :visible="false" textAlign="Left"></e-column>
                    <e-column field="SCIIndoc" headerText="SCI Indoc Date" :visible="false" textAlign="Left"></e-column>
                    <e-column field="SCIAccessCheckDate" headerText="SCI Access Check Date" :visible="false" textAlign="Left"></e-column>
                    <e-column field="PRDueDate" headerText="PR Due Date" minWidth="40" textAlign="Left"></e-column>
                    <e-column field="CEDate" headerText="CE Date (Deferred Investigation)" minWidth="40" textAlign="Left"></e-column>
                    <e-column field="CACValid" headerText="Is CAC Valid" minWidth="40" textAlign="Left"></e-column>
                    <e-column field="CACStatus" headerText="CAC Status" minWidth="40" textAlign="Left"></e-column>
                    <e-column field="CACRequestDate" headerText="CAC Request Date" minWidth="40" textAlign="Left"></e-column>
                    <e-column field="CACExpirationDate" headerText="CAC Expiration Date" minWidth="40" textAlign="Left"></e-column>
                    <e-column field="CACIssuedBy" headerText="CAC Issued By" :visible="false" textAlign="Left"></e-column>
                    <e-column field="DISSCheck" headerText="DISS Check" :visible="false" textAlign="Left"></e-column>
                    <e-column field="DISSCheckDate" headerText="DISS Check Date" :visible="false" textAlign="Left"></e-column>
                    <e-column field="NIPRAccount" headerText="NIPR Account" :visible="false" textAlign="Left"></e-column>
                    <e-column field="NIPRGovSentDate" headerText="NIPR Gov Sent Date" :visible="false" textAlign="Left"></e-column>
                    <e-column field="NIPRGovCompleteDate" headerText="NIPR Gov Complete Date" :visible="false" textAlign="Left"></e-column>
                    <e-column field="SIPRAccount" headerText="SIPR Account" :visible="false" textAlign="Left"></e-column>
                    <e-column field="SIPRGovSentDate" headerText="SIPR Gov Sent Date" :visible="false" textAlign="Left"></e-column>
                    <e-column field="SIPRGovCompleteDate" headerText="SIPR Gov Complete Date" :visible="false" textAlign="Left"></e-column>
                    <e-column field="DRENAccount" headerText="DREN Account" :visible="false" textAlign="Left"></e-column>
                    <e-column field="DRENGovSentDate" headerText="DREN Gov Sent Date" :visible="false" textAlign="Left"></e-column>
                    <e-column field="DRENGovCompleteDate" headerText="DREN Gov Complete Date" :visible="false" textAlign="Left"></e-column>
                    <e-column field="JWICAccount" headerText="JWIC Account" :visible="false" textAlign="Left"></e-column>
                    <e-column field="JWICGovSentDate" headerText="JWIC Gov Sent Date" :visible="false" textAlign="Left"></e-column>
                    <e-column field="JWICGovCompleteDate" headerText="JWIC Gov Complete Date" :visible="false" textAlign="Left"></e-column>
                    <e-column field="taskId" headerText="Task Id" :visible="false" textAlign="Left"></e-column>
                    <e-column field="SCITransferId" :visible="false"></e-column>
                    <e-column field="uri" :visible="false" textAlign="Left" width="40"></e-column>
                    <e-column field="etag" :visible="false" textAlign="Left" width="40"></e-column>
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
        </b-container>
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
// eslint-disable-next-line no-undef
let url = _spPageContextInfo.webAbsoluteUrl
let vm = null,
  vm2 = null
//let url = _spPageContextInfo.webAbsoluteUrl
import Vue from 'vue'
import User from '@/models/User'
import Personnel from '@/models/Personnel'
import Company from '@/models/Company'
import Security from '@/models/Security'
import Todo from '@/models/Todo'
import { Page, VirtualScroll, DetailRow, Toolbar, ExcelExport, Resize, Search } from '@syncfusion/ej2-vue-grids'

export default {
  name: 'SecurityForms',
  props: {
    // Switches the form type between Account, CAC and SCI
    formType: {
      type: String
    }
  },
  computed: {
    companies() {
      return Company.getters('DropDown')
    },
    personnel() {
      return Personnel.getters('DropDown')
    },
    userid() {
      return User.getters('CurrentUserId')
    },
    currentuser() {
      return User.getters('CurrentUser')
    },
    isSecurity() {
      return User.getters('isSecurity')
    },
    isAFRL() {
      return User.getters('isAFRL')
    },
    isSubcontractor() {
      return User.getters('isSubcontractor')
    },
    securityforms() {
      return Security.getters('SecurityForms')
    },
    afrlgroup() {
      return Security.getters('AFRLGroup')
    },
    accountgroup() {
      return Security.getters('AccountGroup')
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
      overlayText: 'Getting Data. Please Wait...',
      overlayVariant: 'light',
      company: '',
      pageSettings: { pageSize: 30 },
      editSettings: {
        allowEditing: false,
        allowAdding: false,
        allowDeleting: false,
        mode: 'Dialog'
      },
      filterSettings: { type: 'Menu' },
      //toolbar: ['Edit', 'Print', 'Search', 'ExcelExport'],
      toolbar: ['ExcelExport', 'Search'],
      // Add a template with logic to handle each of the account types with buttons to indicate when they were sent to/completed by the gov
      // template should also check what the formType is and only display those forms
      detailTemplate: function() {
        return {
          template: Vue.component('accountDetailTemplate', {
            template: `
              <div>
                <b-row>
                  <b-col cols="9" class="m-0 p-0">
                    <b-tabs pills vertical content-class="mt-0 p-0">
                      <b-tab title="General" active>
                        <div class="width-98">
                          <b-row>
                            <b-col cols="3" class="p-1" align-v="center">
                              <b-button v-if="isSecurity || isDeveloper || isAFRL" ref="SecurityEdit" @click="editSecurity($event)" :data-link="'/security/edit/' + data.id " variant="secondary" class="btn float-right">Edit Person Security</b-button>
                            </b-col>
                            <!-- PR Due Date and CE Date -->
                            <b-col cols="9">
                              <b-table-simple small responsive>
                                <b-thead head-variant="dark">
                                  <b-tr>
                                    <b-th>PR Due Date</b-th>
                                    <b-th>CE Date (Deferred Investigation)</b-th>
                                    <b-th></b-th>
                                  </b-tr>
                                </b-thead>
                                <b-tbody>
                                  <b-tr>
                                    <b-td>
                                      <ejs-datepicker :disable="!isSecurity" id="formPR" v-model="data.PRDueDate"></ejs-datepicker>
                                    </b-td>
                                    <b-td>
                                      <ejs-datepicker :disable="!isSecurity" id="formCE" v-model="data.CEDate"></ejs-datepicker>
                                    </b-td>
                                    <b-td>
                                      <b-button :disabled="lockSubmit" v-if="isSecurity || isDeveloper" ref="updateOriginalInfo" variant="success" class="btn-sm float-right" @click="updateForm(data)">Update</b-button>
                                    </b-td>
                                  </b-tr>
                                </b-tbody>
                              </b-table-simple>
                            </b-col>
                          </b-row>
                        </div>
                      </b-tab>
                      <b-tab title="Accounts" v-if="data.NIPR || data.SIPR || data.JWICS || data.DREN">
                        <div class="width-98">
                          <b-row>
                            <!-- Account Template -->
                            <b-table-simple small responsive>
                              <b-thead head-variant="dark">
                                <b-tr>
                                  <b-th>Account</b-th>
                                  <b-th>Government Sent Date</b-th>
                                  <b-th>Government Review</b-th>
                                  <b-th>Submitted Forms</b-th>
                                </b-tr>
                              </b-thead>
                              <b-tbody>
                                <!-- NIPR DATA -->
                                <b-tr v-if="data.NIPR && data.NIPR.forms.length > 0">
                                  <b-td>NIPR</b-td>
                                  <b-td>
                                    <span v-if="data.NIPR.GovSentDate !== ''">{{ data.NIPR.GovSentDate }}</span>
                                    <span v-if="data.NIPR.GovSentDate == ''">
                                      <!-- Should only show if in Security Group -->
                                      <b-button v-if="isSecurity" ref="NotifyGov" variant="success" :data-type="'NIPR'" class="btn-sm" @click="NotifyGov(data, $event)">Notify Government</b-button>
                                      <span v-if="!isSecurity">Processing</span>
                                    </span>
                                  </b-td>
                                  <b-td>
                                    <span v-if="data.NIPR.GovCompleteDate !== ''">{{ data.NIPR.GovCompleteDate }}</span>
                                    <span v-if="data.NIPR.GovRejectDate !== ''">{{ data.NIPR.GovRejectDate }}</span>
                                    <span v-if="data.NIPR.GovCompleteDate == '' && data.NIPR.GovRejectDate == ''"><!-- add a check if user is in AFRL -->
                                      <!-- REMOVE DEVELOPER OPTION -->  
                                      <b-button v-if="isAFRL || isDeveloper" ref="CompleteGov" variant="primary" :data-type="'NIPR'" class="btn-sm" @click="CompleteGov(data, $event)">Complete</b-button>
                                      <b-button v-if="isAFRL || isDeveloper" ref="RejectGov" variant="danger" :data-type="'NIPR'" class="btn-sm" @click="RejectGov(data, $event)">Rework</b-button>
                                      <span v-if="!isAFRL && data.NIPR.GovSentDate !== ''">Processing</span>
                                    </span>
                                  </b-td>
                                  <b-td><b-button class="btn-sm" @click="viewForms($event)" variant="secondary" :data-link="'/security/view/' + data.id + '/NIPR'">View Forms</b-button></b-td>
                                </b-tr>
                                <!-- SIPR DATA -->
                                <b-tr v-if="data.SIPR && data.SIPR.forms.length > 0">
                                  <b-td>SIPR</b-td>
                                  <b-td>
                                    <span v-if="data.SIPR.GovSentDate !== ''">{{ data.SIPR.GovSentDate }}</span>
                                    <span v-if="data.SIPR.GovSentDate == ''">
                                      <!-- Should only show if in Security Group -->
                                      <b-button v-if="isSecurity" ref="NotifyGov" :data-type="'SIPR'" variant="success" class="btn-sm" @click="NotifyGov(data, $event)">Notify Government</b-button>
                                      <span v-if="!isSecurity">Processing</span>
                                    </span>
                                  </b-td>
                                  <b-td>
                                    <span v-if="data.SIPR.GovCompleteDate !== ''">{{ data.SIPR.GovCompleteDate }}</span>
                                    <span v-if="data.SIPR.GovRejectDate !== ''">{{ data.SIPR.GovRejectDate }}</span>
                                    <span v-if="data.SIPR.GovCompleteDate == '' && data.SIPR.GovRejectDate == ''"><!-- add a check if user is in AFRL -->
                                      <!-- REMOVE DEVELOPER OPTION -->  
                                      <b-button v-if="isAFRL || isDeveloper" ref="CompleteGov" variant="primary" :data-type="'SIPR'" class="btn-sm" @click="CompleteGov(data, $event)">Complete</b-button>
                                      <b-button v-if="isAFRL || isDeveloper" ref="RejectGov" variant="danger" :data-type="'SIPR'" class="btn-sm" @click="RejectGov(data, $event)">Rework</b-button>
                                      <span v-if="!isAFRL && data.SIPR.GovSentDate !== ''">Processing</span>
                                    </span>
                                  </b-td>
                                  <b-td><b-button class="btn-sm" @click="viewForms($event)" variant="secondary" :data-link="'/security/view/' + data.Id + '/SIPR'">View Forms</b-button></b-td>
                                </b-tr>
                                <!-- DREN DATA -->
                                <b-tr v-if="data.DREN && data.DREN.forms.length > 0">
                                  <b-td>DREN</b-td>
                                  <b-td>
                                    <span v-if="data.DREN.GovSentDate !== ''">{{ data.DREN.GovSentDate }}</span>
                                    <span v-if="data.DREN.GovSentDate == ''">
                                      <!-- Should only show if in Security Group -->
                                      <b-button v-if="isSecurity" ref="NotifyGov" variant="success" :data-type="'DREN'" class="btn-sm" @click="NotifyGov(data, $event)">Notify Government</b-button>
                                      <span v-if="!isSecurity">Processing</span>
                                    </span>
                                  </b-td>
                                  <b-td>
                                    <span v-if="data.DREN.GovCompleteDate !== ''">{{ data.DREN.GovCompleteDate }}</span>
                                    <span v-if="data.DREN.GovRejectDate !== ''">{{ data.DREN.GovRejectDate }}</span>
                                    <span v-if="data.DREN.GovCompleteDate == '' && data.DREN.GovRejectDate == ''"><!-- add a check if user is in AFRL -->
                                      <!-- REMOVE DEVELOPER OPTION -->  
                                      <b-button v-if="isAFRL || isDeveloper" ref="CompleteGov" variant="primary" :data-type="'DREN'" class="btn-sm" @click="CompleteGov(data, $event)">Complete</b-button>
                                      <b-button v-if="isAFRL || isDeveloper" ref="RejectGov" variant="danger" :data-type="'DREN'" class="btn-sm" @click="RejectGov(data, $event)">Rework</b-button>
                                      <span v-if="!isAFRL && data.DREN.GovSentDate !== ''">Processing</span>
                                    </span>
                                  </b-td>
                                  <b-td><b-button class="btn-sm" @click="viewForms($event)" variant="secondary" :data-link="'/security/view/' + data.Id + '/DREN'">View Forms</b-button></b-td>
                                </b-tr>
                                <!-- JWICS DATA -->
                                <b-tr v-if="data.JWICS && data.JWICS.forms.length > 0">
                                  <b-td>JWICS</b-td>
                                  <b-td>
                                    <span v-if="data.JWICS.GovSentDate !== ''">{{ data.JWICS.GovSentDate }}</span>
                                    <span v-if="data.JWICS.GovSentDate == ''">
                                      <!-- Should only show if in Security Group -->
                                      <b-button v-if="isSecurity" ref="NotifyGov" variant="success" :data-type="'JWICS'" class="btn-sm" @click="NotifyGov(data, $event)">Notify Government</b-button>
                                      <span v-if="!isSecurity">Processing</span>
                                    </span>
                                  </b-td>
                                  <b-td>
                                    <span v-if="data.JWICS.GovCompleteDate !== ''">{{ data.JWICS.GovCompleteDate }}</span>
                                    <span v-if="data.JWICS.GovRejectDate !== ''">{{ data.JWICS.GovRejectDate }}</span>
                                    <span v-if="data.JWICS.GovCompleteDate == '' && data.JWICS.GovRejectDate == ''"><!-- add a check if user is in AFRL -->
                                      <!-- REMOVE DEVELOPER OPTION -->  
                                      <b-button v-if="isAFRL || isDeveloper" ref="CompleteGov" variant="primary" :data-type="'JWICS'" class="btn-sm" @click="CompleteGov(data, $event)">Complete</b-button>
                                      <b-button v-if="isAFRL || isDeveloper" ref="RejectGov" variant="danger" :data-type="'JWICS'" class="btn-sm" @click="RejectGov(data, $event)">Rework</b-button>
                                      <span v-if="!isAFRL && data.JWICS.GovSentDate !== ''">Processing</span>
                                    </span>
                                  </b-td>
                                  <b-td><b-button class="btn-sm" @click="viewForms($event)" variant="secondary" :data-link="'/security/view/' + data.Id + '/JWICS'">View Forms</b-button></b-td>
                                </b-tr>
                              </b-tbody>
                            </b-table-simple>
                          </b-row>
                          <b-row v-if="showGovReject">
                            <p class="pr-2 pl-2">Please enter the reason for rework:</p>
                            <b-form-textarea id="GovRejectReason" v-model="GovRejectReason" placeholder="Enter at least 10 characters..." rows="2" max-rows="4" :state="GovRejectReason.length >= 10"></b-form-textarea>
                            <span v-show="showGovRejectError" class="text-danger">Please enter a reason before submitting.</span>
                            <b-button v-if="isAFRL || isDeveloper" ref="SubmitRejectGov" variant="outline-primary" class="btn-sm mt-2" @click="SubmitRejectGov(data)">Submit</b-button>
                          </b-row>
                          <b-row v-if="data.NIPR.GovRejectReason" >
                            <p class="pr-2 pl-2">NIPR Government Rejection Reason: {{ data.NIPR.GovRejectReason }}</p>
                          </b-row>
                          <b-row v-if="data.SIPR.GovRejectReason" >
                            <p class="pr-2 pl-2">SIPR Government Rejection Reason: {{ data.SIPR.GovRejectReason }}</p>
                          </b-row>
                          <b-row v-if="data.DREN.GovRejectReason" >
                            <p class="pr-2 pl-2">DREN Government Rejection Reason: {{ data.DREN.GovRejectReason }}</p>
                          </b-row>
                          <b-row v-if="data.JWICS.GovRejectReason" >
                            <p class="pr-2 pl-2">JWICS Government Rejection Reason: {{ data.JWICS.GovRejectReason }}</p>
                          </b-row>
                        </div>
                      </b-tab>
                      <b-tab title="SCI">
                        <div class="width-98">
                          <b-row>
                            <b-table-simple small responsive>
                              <b-thead head-variant="dark">
                                <b-tr>
                                  <b-th>Date Indoctrination Assist Sent</b-th>
                                  <b-th>SCI Access Check Date</b-th>
                                  <b-th>SCI Indoctrination Date</b-th>
                                  <b-th>SCI Form Submitted</b-th>
                                </b-tr>
                              </b-thead>
                              <b-tbody>
                                <b-tr>
                                  <b-td>
                                    <ejs-datepicker :disable="!isSecurity" id="formSCIIndocAssistDate" @change="AssistDateChange(data)" v-model="data.SCIIndocAssistDate"></ejs-datepicker>
                                  </b-td>
                                  <b-td>
                                    <ejs-datepicker :disable="!isSecurity" id="formAccessCheckDate" @change="AccessDateChange(data)" v-model="data.SCIAccessCheckDate"></ejs-datepicker>
                                  </b-td>
                                  <b-td>
                                    <ejs-datepicker :disable="!isSecurity" id="formSCIIndocDate" @change="IndocDateChange(data)" v-model="data.SCIIndoc"></ejs-datepicker>
                                  </b-td>
                                  <b-td>
                                    <ejs-datepicker id="sciFormSubmitted" :disable="!isSecurity" v-model="data.SCIFormSubmitted"></ejs-datepicker>
                                  </b-td>
                                </b-tr>
                              </b-tbody>
                            </b-table-simple>
                          </b-row>
                          <b-row>
                            <b-table-simple small responsive>
                              <b-thead head-variant="dark">
                                <b-tr>
                                  <b-th>SCI Status</b-th>
                                  <b-th>SCI Form Type</b-th>
                                  <b-th>Submitted Forms</b-th>
                                  <b-th></b-th>
                                </b-tr>
                              </b-thead>
                              <b-tbody>
                                <b-tr>
                                  <b-td>
                                    <ejs-dropdownlist :disable="!isSecurity" v-model="data.SCIStatus" :dataSource="status" @change="statusChange(data)" :fields="ddfields"></ejs-dropdownlist>
                                  </b-td>
                                  <b-td>
                                    <ejs-dropdownlist id="sciFormType" :disable="!isSecurity" v-model="data.SCIFormType" :dataSource="sciFormType" :fields="ddfields"></ejs-dropdownlist>
                                  </b-td>
                                  <b-td>
                                    <b-button class="btn-sm" @click="viewForms($event)" variant="secondary" :data-link="'/security/view/' + data.id + '/SCI'">View Forms</b-button>
                                  </b-td>
                                  <b-td>
                                    <!-- Update Button -->
                                    <b-button :disabled="lockSubmit" v-if="isSecurity || isDeveloper" ref="updateSCI" variant="success" class="btn-sm" @click="updateForm(data)">Update</b-button>
                                  </b-td>
                                </b-tr>
                              </b-tbody>
                            </b-table-simple>
                          </b-row>
                          <b-row v-if="data.SCI && data.SCI.forms.length > 0">
                            <span v-if="data.SCI.GovSentDate !== ''" class="p-2">Government Notified On: {{ data.SCI.GovSentDate }}</span>
                            <span v-if="data.SCI.GovCompleteDate !== ''" class="p-2">Government {{ data.SCI.GovCompleteDate }}</span>
                            <span v-if="data.SCI.GovRejectDate !== ''" class="p-2">Government {{ data.SCI.GovRejectDate }}</span>
                            <span v-if="data.SCI.GovSentDate === ''" class="p-2">
                              <b-button v-if="isSecurity || isDeveloper" ref="NotifyGov" variant="success" :data-type="'SCI'" class="btn-sm" @click="NotifyGov(data, $event)">Notify Government</b-button>
                            </span>
                            <span v-if="data.SCI.GovCompleteDate === ''" class="p-2">
                              <b-button v-if="isAFRL || isDeveloper" ref="CompleteGov" variant="primary" :data-type="'SCI'" class="btn-sm" @click="CompleteGov(data, $event)">Complete</b-button>
                            </span>
                            <span v-if="data.SCI.GovCompleteDate === '' && data.SCI.GovRejectDate === ''" class="p-2">
                              <b-button v-if="isAFRL || isDeveloper" ref="RejectGov" variant="danger" :data-type="'SCI'" class="btn-sm" @click="RejectGov(data, $event)">Rework</b-button>
                            </span>
                          </b-row>
                          <b-row v-if="showGovReject">
                            <p class="pr-2 pl-2">Please enter the reason for rework:</p>
                            <b-form-textarea id="GovRejectReason" v-model="GovRejectReason" placeholder="Enter at least 10 characters..." rows="2" max-rows="4" :state="GovRejectReason.length >= 10"></b-form-textarea>
                            <span v-show="showGovRejectError" class="text-danger">Please enter a reason before submitting.</span>
                            <b-button v-if="isAFRL || isDeveloper" ref="SubmitRejectGov" variant="outline-primary" class="btn-sm mt-2" @click="SubmitRejectGov(data)">Submit</b-button>
                          </b-row>
                          <b-row v-if="data.SCI.GovRejectReason">
                            <p class="pr-2 pl-2">SCI Government Rejection Reason: {{ data.SCI.GovRejectReason }}</p>
                          </b-row>
                        </div>
                      </b-tab>
                      <b-tab title="CAC">
                        <div class="width-98">
                          <b-row>
                            <b-table-simple small responsive>
                              <b-thead head-variant="dark">
                                <b-tr>
                                  <b-th>CAC Status</b-th>
                                  <b-th>CAC Issued By</b-th>
                                  <b-th>CAC Request Date</b-th>
                                  <b-th>CAC Expiration Date</b-th>
                                  <b-th>DISS Check</b-th>
                                  <b-th>Submitted Form</b-th>
                                  <b-th></b-th>
                                </b-tr>
                              </b-thead>
                              <b-tbody>
                                <b-tr>
                                  <b-td>
                                    <ejs-dropdownlist :disable="!isSecurity" v-model="data.CACStatus" :dataSource="cacstatus" @change="statusChange(data)" :fields="ddfields"></ejs-dropdownlist>
                                  </b-td>
                                  <b-td>
                                    <b-form-input :disable="!isSecurity" type="text" id="formCACIssuedBy" v-model="data.CACIssuedBy"></b-form-input>
                                  </b-td>
                                  <b-td>
                                    <ejs-datepicker id="cacRequestDate" :disable="!isSecurity" v-model="data.CACRequestDate"></ejs-datepicker>
                                  </b-td>
                                  <b-td>
                                    <ejs-datepicker :disable="!isSecurity" id="formCACExpirationDate" v-model="data.CACExpirationDate"></ejs-datepicker>
                                  </b-td>
                                  <b-td>
                                    <b-form-checkbox :disable="!isSecurity" id="dissCheck" v-model="data.DISSCheck" value="Yes" unchecked-value="No" @change="dissCheckChange" switch></b-form-checkbox>
                                  </b-td>
                                  <b-td>
                                    <b-button class="btn-sm" @click="viewForms($event)" variant="secondary" :data-link="'/security/view/' + data.id + '/CAC'">View Forms</b-button>
                                  </b-td>
                                  <b-td>
                                    <!-- Update Button -->
                                    <!-- REMOVE DEVELOPER OPTION -->
                                    <b-button :disabled="lockSubmit" v-if="isSecurity || isDeveloper" ref="updateCAC" variant="success" :data-id="data.Id" class="btn-sm" @click="updateForm(data)">Update</b-button>
                                  </b-td>
                                </b-tr>
                              </b-tbody>
                            </b-table-simple>
                          </b-row>
                          <b-row v-if="data.CAC && data.CAC.forms.length > 0">
                            <span v-if="data.CAC.GovSentDate !== ''" class="p-2">Government Notified On: {{ data.CAC.GovSentDate }}</span>
                            <span v-if="data.CAC.GovCompleteDate !== ''" class="p-2">Government {{ data.CAC.GovCompleteDate }}</span>
                            <span v-if="data.CAC.GovRejectDate !== ''" class="p-2">Government {{ data.CAC.GovRejectDate }}</span>
                            <span v-if="data.CAC.GovSentDate === ''" class="p-2">
                              <b-button v-if="isSecurity || isDeveloper" ref="NotifyGov" variant="success" :data-type="'CAC'" class="btn-sm" @click="NotifyGov(data, $event)">Notify Government</b-button>
                            </span>
                            <span v-if="data.CAC.GovCompleteDate === ''" class="p-2">
                              <b-button v-if="isAFRL || isDeveloper" ref="CompleteGov" variant="primary" :data-type="'CAC'" class="btn-sm" @click="CompleteGov(data, $event)">Complete</b-button>
                            </span>
                            <span v-if="data.CAC.GovCompleteDate === '' && data.CAC.GovRejectDate === ''" class="p-2">
                              <b-button v-if="isAFRL || isDeveloper" ref="RejectGov" variant="danger" :data-type="'CAC'" class="btn-sm" @click="RejectGov(data, $event)">Rework</b-button>
                            </span>
                          </b-row>
                          <b-row v-if="showGovReject">
                            <p class="pr-2 pl-2">Please enter the reason for rework:</p>
                            <b-form-textarea id="GovRejectReason" v-model="GovRejectReason" placeholder="Enter at least 10 characters..." rows="2" max-rows="4" :state="GovRejectReason.length >= 10"></b-form-textarea>
                            <span v-show="showGovRejectError" class="text-danger">Please enter a reason before submitting.</span>
                            <b-button v-if="isAFRL || isDeveloper" ref="SubmitRejectGov" variant="outline-primary" class="btn-sm mt-2" @click="SubmitRejectGov(data)">Submit</b-button>
                          </b-row>
                          <b-row v-if="data.CAC.GovRejectReason" >
                            <p class="pr-2 pl-2">CAC Government Rejection Reason: {{ data.CAC.GovRejectReason }}</p>
                          </b-row>
                        </div>
                      </b-tab>
                      <b-tab title="Historical CAC" v-if="data.CACTurnedIn && data.CACExpiredOnDate">
                        <div class="width-98">
                          <b-table-simple small responsive>
                            <b-thead head-variant="dark">
                              <b-tr>
                                <b-th>Historical CAC Data</b-th>
                                <b-th>CAC Status</b-th>
                                <b-th>CAC Turned In Location</b-th>
                                <b-th>CAC Turned In Date</b-th>
                              </b-tr>
                            </b-thead>
                            <b-tbody>
                              <b-tr>
                                <b-td>
                                  Yes
                                </b-td>
                                <b-td>
                                  {{ data.CACStatus }}
                                </b-td>
                                <b-td>
                                  {{ data.CACTurnedIn }}
                                </b-td>
                                <b-td>
                                  {{ data.CACExpiredOnDate }}
                                </b-td>
                              </b-tr>
                            </b-tbody>
                          </b-table-simple>
                        </div>
                      </b-tab>
                      <b-tab title="Upload Forms" v-if="isDeveloper || isAFRL">
                        <div class="width-98">
                          <b-row no-gutters>
                            <b-col class="mt-2">
                              <p class="h4"><u><strong>Warning: </strong>uploading documents will overwrite previously uploaded documents!</u></p>
                            </b-col>
                          </b-row>
                          <b-row no-gutters>
                            <b-col cols="2">
                              <b-form-group>
                                <b-form-group label="Form Type: " label-for="formType">
                                <b-form-select id="formType" :state="validateSecurityFormType" v-model="selectedSecurityFormType" :options="securityFormTypes"></b-form-select>
                                <b-form-invalid-feedback :state="validateSecurityFormType">
                                  Please select a Security Form Type.
                                </b-form-invalid-feedback>
                              </b-form-group>
                            </b-col>
                            <b-col cols="2"></b-col>
                            <b-col cols="8">
                              <ejs-uploader id="formFileUpload" name="formFileUpload" :selected="onFileSelect" :multiple="true"></ejs-uploader>
                            </b-col>
                          </b-row>
                          <b-button :disabled="lockSubmit" v-if="isSecurity || isDeveloper || isAFRL" ref="updateFiles" variant="success" :data-id="data.Id" class="float-right btn-sm mt-2" @click="updateForm(data)">Upload Completed Forms</b-button>
                        </div>
                      </b-tab>
                    </b-tabs>
                  </b-col>
                </b-row>
              </div>`,
            computed: {
              userloaded() {
                return User.getters('Loaded')
              },
              isSecurity() {
                return User.getters('isSecurity')
              },
              isAFRL() {
                return User.getters('isAFRL')
              },
              isSubcontractor() {
                return User.getters('isSubcontractor')
              },
              isDeveloper() {
                return User.getters('isDeveloper')
              },
              afrlgroup() {
                return Security.getters('AFRLGroup')
              },
              accountgroup() {
                return Security.getters('AccountGroup')
              },
              cacgroup() {
                return Security.getters('CACGroup')
              },
              scigroup() {
                return Security.getters('SCIGroup')
              },
              rect() {
                return this.$store.state.support.contentrect
              },
              validateSecurityFormType() {
                return this.selectedSecurityFormType !== null && this.selectedSecurityFormType !== ''
              }
            },
            data: function() {
              return {
                data: {
                  GovernmentDate: '',
                  securityforms: []
                },
                lockSubmit: false,
                showGovRejectError: false,
                GovRejectReason: '',
                GovRejectType: '',
                showGovReject: false,
                ddfields: { text: 'text', value: 'value' },
                library: '',
                libraryUrl: '',
                selectedSecurityFormType: null,
                statusesUpdated: false,
                files: [],
                DISSCheckChanged: false,
                DISSCheckDate: null,
                securityFormTypes: [
                  { value: 'NIPR', text: 'NIPR' },
                  { value: 'SIPR', text: 'SIPR' },
                  { value: 'DREN', text: 'DREN' },
                  { value: 'JWICS', text: 'JWICS' },
                  { value: 'CAC', text: 'CAC' },
                  { value: 'SCI', text: 'SCI' }
                ],
                status: [
                  { text: 'Not Required', value: 'Not Required' },
                  { text: 'Pending Info', value: 'Pending Info' },
                  { text: 'CACI Review', value: 'CACI Review' },
                  { text: 'Submitted', value: 'Submitted' },
                  { text: 'Indoc Assist Sent', value: 'Indoc Assist Sent' },
                  { text: 'Indoc Assist Pending', value: 'Indoc Assist Pending' },
                  { text: 'SSO Processed', value: 'SSO Processed' },
                  { text: 'Debrief Notification Submitted', value: 'Debrief Notification Submitted' },
                  { text: 'Disposition-Transfer', value: 'Disposition-Transfer' },
                  { text: 'Disposition-Debriefed', value: 'Disposition-Debriefed' },
                  { text: 'Transfer Notification Submitted', value: 'Transfer Notification Submitted' },
                  { text: 'Withdrawn', value: 'Withdrawn' }
                ],
                cacstatus: [
                  { text: 'Not Required', value: 'Not Required' },
                  { text: 'Pending Info', value: 'Pending Info' },
                  { text: 'CACI Review', value: 'CACI Review' },
                  { text: 'Requested', value: 'Requested' },
                  { text: 'Issued', value: 'Issued' },
                  { text: 'Return Pending', value: 'Return Pending' },
                  { text: 'Disposition-Returned', value: 'Disposition-Returned' },
                  { text: 'Disposition-Transferred', value: 'Disposition-Transferred' },
                  { text: 'Non-F3I2 CAC', value: 'Non-F3I2 CAC' },
                  { text: 'Transfer Pending', value: 'Transfer Pending' },
                  { text: 'Renewal', value: 'Renewal' }
                ],
                sciFormType: [
                  { text: 'N/A', value: 'N/A' },
                  { text: 'Nomination', value: 'Nomination' },
                  { text: 'Transfer', value: 'Transfer' }
                ]
              }
            },
            methods: {
              AccessDateChange(data) {
                data.SCIStatus = 'SSO Processed'
              },
              AssistDateChange(data) {
                data.SCIStatus = 'Indoc Assist Sent'
              },
              IndocDateChange(data) {
                data.SCIStatus = 'Indoc Assist Pending'
              },

              async dissCheckChange(data) {
                if (data === 'Yes') {
                  vm2.DISSCheckChanged = true
                  vm2.DISSCheckDate = this.$moment().format('MM/DD/YYYY')
                } else {
                  vm2.DISSCheckDate = null
                }
              },
              async NotifyGov(data, e) {
                await Security.dispatch('getDigest')
                let type = e.currentTarget.dataset.type,
                  taskId,
                  taskUserId = [],
                  taskEmail = []
                this.afrlgroup.forEach(user => {
                  taskUserId.push(user.Id)
                  taskEmail.push(user.Email)
                })
                if (type === 'SCI' && data.SCITransferId) {
                  let sciTransfer = await Security.dispatch('getSecuritySCITransfer', { Id: data.SCITransferId })
                  taskId = sciTransfer.TaskId
                  sciTransfer.Form.GovSentDate = this.$moment().format('MM/DD/YYYY')
                  console.log(JSON.stringify(sciTransfer))
                  let persons = ''
                  await this.asyncForEach(sciTransfer.People, async (person, index) => {
                    persons += person.FirstName + ' ' + person.LastName
                    if (sciTransfer.People.length !== index + 1) {
                      persons += ', '
                    }
                  })
                  let payload = {
                    Title: 'Complete or Reject ' + persons + ' ' + type + ' Request',
                    //AssignedToId: 63, // TESTING TASK
                    AssignedToId: taskUserId,
                    Description: 'Complete or reject ' + persons + ' ' + type + ' Request',
                    IsMilestone: false,
                    PercentComplete: 0,
                    TaskType: type + ' Request',
                    TaskLink: '/security/edit/' + data.SCITransferId + '?sciTransfer=true'
                  }
                  let results = await Todo.dispatch('addTodo', payload).catch(error => {
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
                  let emailPayload = {
                    emails: taskEmail,
                    //emails: ['drew.ahrens@caci.com'], // TESTING EMAIL
                    body:
                      '<h3>Please complete or reject the following.</h3> <p>Name: ' +
                      persons +
                      '</p><p>Form: ' +
                      type +
                      ' Request</p><br/><a href="' +
                      url +
                      '/Pages/Home.aspx#/security/edit/' +
                      data.SCITransferId +
                      '?sciTransfer=true">Review ' +
                      persons +
                      '</a><p><b>Please copy and paste the hyperlink into a modern browser such as Google Chrome if it is not your default.</b></p>',
                    subject: '(F3I-2 Portal) ' + type + ' Request'
                  }
                  await Security.dispatch('sendEmail', emailPayload)
                  await this.asyncForEach(sciTransfer.Persons, async (person, index) => {
                    // get each Security form
                    let securityFormInfo = await Security.dispatch('getSecurityFormById', { Id: person.SecurityID })

                    // update the persons security form
                    securityFormInfo.SCI.GovSentDate = this.$moment().format('MM/DD/YYYY')
                    securityFormInfo.SCI.task = results.data.d.Id
                    if (sciTransfer.Persons.length !== index) {
                      vm.updateForm(securityFormInfo)
                    } else {
                      // Last update, complete the task
                      vm.updateForm(securityFormInfo, taskId)
                    }
                  })
                  let transferPayload = {
                    TaskId: results.data.d.Id,
                    Persons: JSON.stringify(sciTransfer.Persons),
                    Form: JSON.stringify(sciTransfer.Form),
                    etag: sciTransfer.etag,
                    uri: sciTransfer.uri
                  }
                  await Security.dispatch('updateSecuritySCITransfer', transferPayload)
                  const notification = {
                    type: 'success',
                    title: 'Succesfully Updated Security Form',
                    message: 'Updated Security form for ' + persons + ' in ' + data.Company,
                    push: true
                  }
                  vm.$store.dispatch('notification/add', notification, { root: true })
                } else {
                  // Add a task for the designated government employee for review
                  let payload = {
                    Title: 'Complete or Reject ' + data.FirstName + ' ' + data.LastName + ' ' + type + ' Request',
                    //AssignedToId: 63, // TESTING TASK
                    AssignedToId: taskUserId,
                    Description: 'Complete or reject ' + data.FirstName + ' ' + data.LastName + ' ' + type + ' Request',
                    IsMilestone: false,
                    PercentComplete: 0,
                    TaskType: type + ' Request',
                    TaskLink: '/security/edit/' + data.Id
                  }
                  let results = await Todo.dispatch('addTodo', payload).catch(error => {
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
                  let emailPayload = {
                    emails: taskEmail,
                    //emails: ['drew.ahrens@caci.com'], // TESTING EMAIL
                    body:
                      '<h3>Please complete or reject the following.</h3> <p>Name: ' +
                      data.FirstName +
                      ' ' +
                      data.LastName +
                      '</p><p>Form: ' +
                      type +
                      ' Request</p><br/><a href="' +
                      url +
                      '/Pages/Home.aspx#/security/edit/' +
                      data.id +
                      '">Review ' +
                      data.FirstName +
                      ' ' +
                      data.LastName +
                      '</a><p><b>Please copy and paste the hyperlink into a modern browser such as Google Chrome if it is not your default.</b></p>',
                    subject: '(F3I-2 Portal) ' + type + ' Request'
                  }
                  await Security.dispatch('sendEmail', emailPayload)
                  // Update the task to the new one for AFRL
                  // get the current item data
                  switch (type) {
                    case 'NIPR':
                      taskId = data.NIPR.task
                      data.NIPR.GovSentDate = this.$moment().format('MM/DD/YYYY')
                      data.NIPR.task = results.data.d.Id
                      break
                    case 'SIPR':
                      taskId = data.SIPR.task
                      data.SIPR.GovSentDate = this.$moment().format('MM/DD/YYYY')
                      data.SIPR.task = results.data.d.Id
                      break
                    case 'DREN':
                      taskId = data.DREN.task
                      data.DREN.GovSentDate = this.$moment().format('MM/DD/YYYY')
                      data.DREN.task = results.data.d.Id
                      break
                    case 'JWICS':
                      taskId = data.JWICS.task // original taskId\
                      data.JWICS.GovSentDate = this.$moment().format('MM/DD/YYYY')
                      data.JWICS.task = results.data.d.Id
                      break
                    case 'SCI':
                      taskId = data.SCI.task
                      data.SCI.GovSentDate = this.$moment().format('MM/DD/YYYY')
                      data.SCI.task = results.data.d.Id
                      break
                    case 'CAC':
                      taskId = data.CAC.task
                      data.CAC.GovSentDate = this.$moment().format('MM/DD/YYYY')
                      data.CAC.task = results.data.d.Id
                      break
                  }
                  this.updateForm(data, taskId)
                }
              },
              async CompleteGov(data, event) {
                await Security.dispatch('getDigest')
                let type = event.currentTarget.dataset.type,
                  taskId,
                  taskUserId = [],
                  taskEmail = [],
                  submitterId = [],
                  submitterEmail = [],
                  group = []
                // get the current item data
                if (type === 'SCI' && data.SCITransferId) {
                  let sciTransfer = await Security.dispatch('getSecuritySCITransfer', { Id: data.SCITransferId })
                  taskId = sciTransfer.TaskId
                  console.log(JSON.stringify(sciTransfer))
                  sciTransfer.Form.GovCompleteDate = 'Completed On: ' + this.$moment().format('MM/DD/YYYY')
                  // First delete the Form from the SCI Transfer Form entry
                  for (var s = 0; s < sciTransfer.Form.forms.length; s++) {
                    if (!submitterId.includes(sciTransfer.Form.forms[s].submitterId)) {
                      submitterId.push(sciTransfer.Form.forms[s].submitterId)
                      submitterEmail.push(sciTransfer.Form.forms[s].submitterEmail)
                    }
                  }
                  this.scigroup.forEach(user => {
                    taskUserId.push(user.Id)
                    taskEmail.push(user.Email)
                  })
                  taskUserId.concat(submitterId)
                  taskEmail.concat(submitterEmail)
                  let persons = ''
                  await this.asyncForEach(sciTransfer.People, async (person, index) => {
                    persons += person.FirstName + ' ' + person.LastName
                    // update each person with the reject reason
                    let securityFormInfo = await Security.dispatch('getSecurityFormById', { Id: person.SecurityID })
                    securityFormInfo.SCI.GovCompleteDate = 'Completed On: ' + this.$moment().format('MM/DD/YYYY')
                    if (sciTransfer.People.length !== index + 1) {
                      persons += ','
                      this.updateForm(securityFormInfo)
                    } else {
                      // Last call - complete the task
                      this.updateForm(securityFormInfo, taskId)
                    }
                  })
                  let payload = {
                    Title: 'AFRL Completed ' + persons + ' ' + type + ' Request',
                    AssignedToId: taskUserId,
                    Description: 'AFRL Completed ' + persons + ' ' + type + ' Request.',
                    IsMilestone: false,
                    PercentComplete: 0,
                    TaskType: 'gov-complete',
                    TaskLink: '/security/tracker'
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
                  })
                  let emailPayload = {
                    emails: taskEmail,
                    body:
                      '<h3>AFRL Completed ' +
                      persons +
                      ' ' +
                      type +
                      ' Request</h3> <p>Names: ' +
                      persons +
                      '</p><p>Form: ' +
                      type +
                      ' Request</p><br/><a href="' +
                      url +
                      '/Pages/Home.aspx#/security/tracker/">Review ' +
                      persons +
                      '</a><p><b>Please copy and paste the hyperlink into a modern browser such as Google Chrome if it is not your default.</b></p>',
                    subject: '(F3I-2 Portal) Government Completed ' + type + ' Request'
                  }
                  await Security.dispatch('sendEmail', emailPayload)
                  let transferPayload = {
                    TaskId: null,
                    Persons: JSON.stringify(sciTransfer.Persons),
                    Form: JSON.stringify(sciTransfer.Form),
                    etag: sciTransfer.etag,
                    uri: sciTransfer.uri
                  }
                  await Security.dispatch('updateSecuritySCITransfer', transferPayload)
                  const notification = {
                    type: 'success',
                    title: 'Succesfully Updated Security Form',
                    message: 'Updated Security form for ' + persons + ' in ' + data.Company,
                    push: true
                  }
                  vm.$store.dispatch('notification/add', notification, { root: true })
                } else {
                  switch (type) {
                    case 'NIPR':
                      taskId = data.NIPR.task
                      data.NIPR.GovCompleteDate = 'Completed On: ' + this.$moment().format('MM/DD/YYYY')
                      for (var nipr = 0; nipr < data.NIPR.forms.length; nipr++) {
                        if (!submitterId.includes(data.NIPR.forms[nipr].submitterId)) {
                          submitterId.push(data.NIPR.forms[nipr].submitterId)
                          submitterEmail.push(data.NIPR.forms[nipr].submitterEmail)
                        }
                        group = this.accountgroup
                        window.open(url + '/_layouts/download.aspx?SourceUrl=' + data.NIPR.forms[nipr].href, '_blank')
                      }
                      break
                    case 'SIPR':
                      taskId = data.SIPR.task
                      data.SIPR.GovCompleteDate = 'Completed On: ' + this.$moment().format('MM/DD/YYYY')
                      for (var sipr = 0; sipr < data.SIPR.forms.length; sipr++) {
                        if (!submitterId.includes(data.SIPR.forms[sipr].submitterId)) {
                          submitterId.push(data.SIPR.forms[sipr].submitterId)
                          submitterEmail.push(data.SIPR.forms[sipr].submitterEmail)
                        }
                        group = this.accountgroup
                        window.open(url + '/_layouts/download.aspx?SourceUrl=' + data.SIPR.forms[sipr].href, '_blank')
                      }
                      break
                    case 'DREN':
                      taskId = data.DREN.task
                      data.DREN.GovCompleteDate = 'Completed On: ' + this.$moment().format('MM/DD/YYYY')
                      for (var dren = 0; dren < data.DREN.forms.length; dren++) {
                        if (!submitterId.includes(data.DREN.forms[dren].submitterId)) {
                          submitterId.push(data.DREN.forms[dren].submitterId)
                          submitterEmail.push(data.DREN.forms[dren].submitterEmail)
                        }
                        group = this.accountgroup
                        window.open(url + '/_layouts/download.aspx?SourceUrl=' + data.DREN.forms[dren].href, '_blank')
                      }
                      break
                    case 'JWICS':
                      taskId = data.JWICS.task // original taskId\
                      data.JWICS.GovCompleteDate = 'Completed On: ' + this.$moment().format('MM/DD/YYYY')
                      for (var jwics = 0; jwics < data.JWICS.forms.length; jwics++) {
                        if (!submitterId.includes(data.JWICS.forms[jwics].submitterId)) {
                          submitterId.push(data.JWICS.forms[jwics].submitterId)
                          submitterEmail.push(data.JWICS.forms[jwics].submitterEmail)
                        }
                        group = this.accountgroup
                        window.open(url + '/_layouts/download.aspx?SourceUrl=' + data.JWICS.forms[jwics].href, '_blank')
                      }
                      break
                    case 'SCI':
                      taskId = data.SCI.task // original taskId\
                      data.SCI.GovCompleteDate = 'Completed On: ' + this.$moment().format('MM/DD/YYYY')
                      for (var sci = 0; sci < data.SCI.forms.length; sci++) {
                        if (!submitterId.includes(data.SCI.forms[sci].submitterId)) {
                          submitterId.push(data.SCI.forms[sci].submitterId)
                          submitterEmail.push(data.SCI.forms[sci].submitterEmail)
                        }
                      }
                      group = this.scigroup
                      break
                    case 'CAC':
                      taskId = data.CAC.task // original taskId\
                      data.CAC.GovCompleteDate = 'Completed On: ' + this.$moment().format('MM/DD/YYYY')
                      for (var cac = 0; cac < data.CAC.forms.length; cac++) {
                        if (!submitterId.includes(data.CAC.forms[cac].submitterId)) {
                          submitterId.push(data.CAC.forms[cac].submitterId)
                          submitterEmail.push(data.CAC.forms[cac].submitterEmail)
                        }
                      }
                      group = this.cacgroup
                      break
                  }
                  await this.updateForm(data, taskId).catch(e => {
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
                    console.log('ERROR: ' + e.message)
                  })
                  group.forEach(user => {
                    taskUserId.push(user.Id)
                    taskEmail.push(user.Email)
                  })
                  taskUserId.concat(submitterId)
                  taskEmail.concat(submitterEmail)
                  let payload = {
                    Title: 'AFRL Completed ' + data.FirstName + ' ' + data.LastName + ' ' + type + ' Request',
                    AssignedToId: taskUserId,
                    Description: 'AFRL Completed ' + data.FirstName + ' ' + data.LastName + ' ' + type + ' Request.',
                    IsMilestone: false,
                    PercentComplete: 0,
                    TaskType: 'gov-complete',
                    TaskLink: '/security/tracker'
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
                  })
                  let emailPayload = {
                    emails: taskEmail,
                    body:
                      '<h3>AFRL Completed ' +
                      data.FirstName +
                      ' ' +
                      data.LastName +
                      ' ' +
                      type +
                      ' Request</h3> <p>Name: ' +
                      data.FirstName +
                      ' ' +
                      data.LastName +
                      '</p><p>Form: ' +
                      type +
                      ' Request</p><br/><a href="' +
                      url +
                      '/Pages/Home.aspx#/security/edit/' +
                      data.Id +
                      '">Review ' +
                      data.FirstName +
                      ' ' +
                      data.LastName +
                      '</a><p><b>Please copy and paste the hyperlink into a modern browser such as Google Chrome if it is not your default.</b></p>',
                    subject: '(F3I-2 Portal) Government Completed ' + type + ' Request'
                  }
                  await Security.dispatch('sendEmail', emailPayload)
                  // Remove the button and display current Date
                }
              },
              async RejectGov(data, event) {
                await Security.dispatch('getDigest')
                vm2.GovRejectType = event.currentTarget.dataset.type
                vm2.showGovReject = true
                // get the current item data
              },
              async SubmitRejectGov(data) {
                if (vm2.GovRejectReason.length <= 10) {
                  vm2.showGovRejectError = true
                } else {
                  let taskId = '',
                    submitterId = [],
                    submitterEmail = [],
                    taskUserId = [],
                    taskEmail = [],
                    group = []
                  if (vm2.GovRejectType === 'SCI' && data.SCITransferId) {
                    let sciTransfer = await Security.dispatch('getSecuritySCITransfer', { Id: data.SCITransferId })
                    taskId = sciTransfer.TaskId
                    console.log(JSON.stringify(sciTransfer))
                    sciTransfer.Form.GovRejectDate = 'Rejected On: ' + this.$moment().format('MM/DD/YYYY')
                    sciTransfer.Form.GovRejectReason = vm2.GovRejectReason
                    // First delete the Form from the SCI Transfer Form entry
                    for (var s = 0; s < sciTransfer.Form.forms.length; s++) {
                      if (!submitterId.includes(sciTransfer.Form.forms[s].submitterId)) {
                        submitterId.push(sciTransfer.Form.forms[s].submitterId)
                        submitterEmail.push(sciTransfer.Form.forms[s].submitterEmail)
                      }
                      this.deleteForm(sciTransfer.Form.forms[s])
                    }
                    sciTransfer.Form.forms = []
                    this.scigroup.forEach(user => {
                      taskUserId.push(user.Id)
                      taskEmail.push(user.Email)
                    })
                    taskUserId.concat(submitterId)
                    taskEmail.concat(submitterEmail)
                    let persons = ''
                    await this.asyncForEach(sciTransfer.People, async (person, index) => {
                      persons += person.FirstName + ' ' + person.LastName
                      // update each person with the reject reason
                      let securityFormInfo = await Security.dispatch('getSecurityFormById', { Id: person.SecurityID })
                      securityFormInfo.SCI.GovRejectDate = 'Rejected On: ' + this.$moment().format('MM/DD/YYYY')
                      securityFormInfo.SCI.GovRejectReason = vm2.GovRejectReason
                      if (sciTransfer.People.length !== index + 1) {
                        persons += ','
                        this.updateForm(securityFormInfo)
                      } else {
                        // Last call - complete the task
                        this.updateForm(securityFormInfo, taskId)
                      }
                    })
                    let payload = {
                      Title: 'Government Reject ' + persons + ' ' + vm2.GovRejectType + ' Request',
                      //AssignedToId: vm.userid, // Hardcode to either Michelle or Monica
                      AssignedToId: taskUserId,
                      Description: 'Reason: ' + vm2.GovRejectReason,
                      IsMilestone: false,
                      PercentComplete: 0,
                      TaskType: 'gov-reject',
                      TaskLink: '/security/tracker'
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
                    })
                    let emailPayload = {
                      // emails: emails // TO DO: push original submitters email into the emails array
                      emails: taskEmail,
                      body: '<h3>Government Rejected Submission</h3> <p>Name: ' + persons + '</p><p>Form: ' + vm2.GovRejectType + ' Request</p><p>Reason: ' + vm2.GovRejectReason + '</p>',
                      subject: '(F3I-2 Portal) Government Rejected ' + vm2.GovRejectType + ' Request'
                    }
                    await Security.dispatch('sendEmail', emailPayload)
                    let transferPayload = {
                      TaskId: null,
                      Persons: JSON.stringify(sciTransfer.Persons),
                      Form: JSON.stringify(sciTransfer.Form),
                      etag: sciTransfer.etag,
                      uri: sciTransfer.uri
                    }
                    await Security.dispatch('updateSecuritySCITransfer', transferPayload)
                    const notification = {
                      type: 'success',
                      title: 'Succesfully Updated Security Form',
                      message: 'Updated Security form for ' + persons + ' in ' + data.Company,
                      push: true
                    }
                    vm.$store.dispatch('notification/add', notification, { root: true })
                  } else {
                    switch (vm2.GovRejectType) {
                      case 'NIPR':
                        group = this.accountgroup
                        taskId = data.NIPR.task
                        data.NIPR.GovRejectDate = 'Rejected On: ' + this.$moment().format('MM/DD/YYYY')
                        data.NIPR.GovRejectReason = vm2.GovRejectReason
                        for (var nipr = 0; nipr < data.NIPR.forms.length; nipr++) {
                          if (!submitterId.includes(data.NIPR.forms[nipr].submitterId)) {
                            submitterId.push(data.NIPR.forms[nipr].submitterId)
                            submitterEmail.push(data.NIPR.forms[nipr].submitterEmail)
                          }
                          this.deleteForm(data.NIPR.forms[nipr])
                        }
                        data.NIPR.forms = []
                        break
                      case 'SIPR':
                        taskId = data.SIPR.task
                        group = this.accountgroup
                        data.SIPR.GovRejectDate = 'Rejected On: ' + this.$moment().format('MM/DD/YYYY')
                        data.SIPR.GovRejectReason = vm2.GovRejectReason
                        for (var sipr = 0; sipr < data.SIPR.forms.length; sipr++) {
                          if (!submitterId.includes(data.SIPR.forms[sipr].submitterId)) {
                            submitterId.push(data.SIPR.forms[sipr].submitterId)
                            submitterEmail.push(data.SIPR.forms[sipr].submitterEmail)
                          }
                          this.deleteForm(data.SIPR.forms[sipr])
                        }
                        data.SIPR.forms = []
                        break
                      case 'DREN':
                        taskId = data.DREN.task
                        group = this.accountgroup
                        data.DREN.GovRejectDate = 'Rejected On: ' + this.$moment().format('MM/DD/YYYY')
                        data.DREN.GovRejectReason = vm2.GovRejectReason
                        for (var dren = 0; dren < data.DREN.forms.length; dren++) {
                          if (!submitterId.includes(data.DREN.forms[dren].submitterId)) {
                            submitterId.push(data.DREN.forms[dren].submitterId)
                            submitterEmail.push(data.DREN.forms[dren].submitterEmail)
                          }
                          this.deleteForm(data.DREN.forms[dren])
                        }
                        data.DREN.forms = []
                        break
                      case 'JWICS':
                        taskId = data.JWICS.task // original taskId\
                        group = this.accountgroup
                        data.JWICS.GovRejectDate = 'Rejected On: ' + this.$moment().format('MM/DD/YYYY')
                        data.JWICS.GovRejectReason = vm2.GovRejectReason
                        for (var jwics = 0; jwics < data.JWICS.forms.length; jwics++) {
                          if (!submitterId.includes(data.JWICS.forms[jwics].submitterId)) {
                            submitterId.push(data.JWICS.forms[jwics].submitterId)
                            submitterEmail.push(data.JWICS.forms[jwics].submitterEmail)
                          }
                          this.deleteForm(data.JWICS.forms[jwics])
                        }
                        data.JWICS.forms = []
                        break
                      case 'SCI':
                        taskId = data.SCI.task // original taskId\
                        group = this.scigroup
                        data.SCI.GovRejectDate = 'Rejected On: ' + this.$moment().format('MM/DD/YYYY')
                        data.SCI.GovRejectReason = vm2.GovRejectReason
                        for (var sci = 0; sci < data.SCI.forms.length; sci++) {
                          if (!submitterId.includes(data.SCI.forms[sci].submitterId)) {
                            submitterId.push(data.SCI.forms[sci].submitterId)
                            submitterEmail.push(data.SCI.forms[sci].submitterEmail)
                          }
                          this.deleteForm(data.SCI.forms[sci])
                        }
                        data.SCI.forms = []
                        break
                      case 'CAC':
                        taskId = data.CAC.task // original taskId\
                        group = this.cacgroup
                        data.CAC.GovRejectDate = 'Rejected On: ' + this.$moment().format('MM/DD/YYYY')
                        data.CAC.GovRejectReason = vm2.GovRejectReason
                        for (var cac = 0; cac < data.CAC.forms.length; cac++) {
                          if (!submitterId.includes(data.CAC.forms[cac].submitterId)) {
                            submitterId.push(data.CAC.forms[cac].submitterId)
                            submitterEmail.push(data.CAC.forms[cac].submitterEmail)
                          }
                          this.deleteForm(data.CAC.forms[cac])
                        }
                        data.CAC.forms = []
                        break
                    }
                    await this.updateForm(data, taskId).catch(error => {
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
                    group.forEach(user => {
                      taskUserId.push(user.Id)
                      taskEmail.push(user.Email)
                    })
                    taskUserId.concat(submitterId)
                    taskEmail.concat(submitterEmail)
                    // Notify Accounts Admin or Security via task list
                    let payload = {
                      Title: 'Government Reject ' + data.FirstName + ' ' + data.LastName + ' ' + vm2.GovRejectType + ' Request',
                      //AssignedToId: vm.userid, // Hardcode to either Michelle or Monica
                      AssignedToId: taskUserId,
                      Description: 'Reason: ' + vm2.GovRejectReason,
                      IsMilestone: false,
                      PercentComplete: 0,
                      TaskType: 'gov-reject',
                      TaskLink: '/security/tracker'
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
                    })
                    let emailPayload = {
                      // emails: emails // TO DO: push original submitters email into the emails array
                      emails: taskEmail,
                      body: '<h3>Government Rejected Submission</h3> <p>Name: ' + data.FirstName + ' ' + data.LastName + '</p><p>Form: ' + vm2.GovRejectType + ' Request</p><p>Reason: ' + vm2.GovRejectReason + '</p>',
                      subject: '(F3I-2 Portal) Government Rejected ' + vm2.GovRejectType + ' Request'
                    }
                    await Security.dispatch('sendEmail', emailPayload).then(() => {
                      // Reset Reject form
                      vm2.showGovRejectError = false
                      vm2.showGovReject = false
                      vm2.GovRejectReason = ''
                      vm2.GovRejectType = ''
                    })
                  }
                }
              },
              async deleteForm(payload) {
                await Security.dispatch('DeleteForm', payload).catch(error => {
                  const notification = {
                    type: 'danger',
                    title: 'Portal Error',
                    message: error,
                    push: true
                  }
                  this.$store.dispatch('notification/add', notification, {
                    root: true
                  })
                  console.log('ERROR: ' + error.message)
                })
              },
              async updateForm(d, tId) {
                if (this.files && this.files.length > 0 && (this.selectedSecurityFormType === null || this.selectedSecurityFormType === '')) {
                  this.lockSubmit = false
                  return true
                }
                this.lockSubmit = true
                if (this.files && this.files.length > 0 && this.selectedSecurityFormType !== null && this.selectedSecurityFormType !== '') {
                  // first delete all files related to the formTypes
                  if (d[this.selectedSecurityFormType] && d[this.selectedSecurityFormType].forms && d[this.selectedSecurityFormType].forms.length > 0) {
                    await this.asyncForEach(d[this.selectedSecurityFormType].forms, async file => {
                      await Security.dispatch('DeleteForm', file).catch(error => {
                        const notification = {
                          type: 'danger',
                          title: 'Portal Error',
                          message: error,
                          push: true
                        }
                        this.$store.dispatch('notification/add', notification, {
                          root: true
                        })
                        console.log('ERROR: ' + error.message)
                      })
                    })
                    // Need to clear out original forms
                    d[this.selectedSecurityFormType].forms = []
                  }
                  // Clear original form
                  switch (this.selectedSecurityFormType) {
                    case 'NIPR':
                      // set the url for the post of file
                      this.library = 'AccountsNIPR'
                      this.libraryUrl = url + '/AccountsNIPR/'
                      break
                    case 'SIPR':
                      this.library = 'AccountsSIPR'
                      this.libraryUrl = url + '/AccountsDREN/'
                      break
                    case 'DREN':
                      this.library = 'AccountsDREN'
                      this.libraryUrl = url + '/AccountsSIPR/'
                      break
                    case 'JWICS':
                      this.library = 'AccountsJWICS'
                      this.libraryUrl = url + '/AccountsJWICS/'
                      break
                    case 'CAC':
                      this.library = 'CACForms'
                      this.libraryUrl = url + '/CACForms/'
                      break
                    case 'SCI':
                      this.library = 'SCIForms'
                      this.libraryUrl = url + '/SCIForms/'
                      break
                  }
                  // loop and upload all attached files

                  await this.asyncForEach(this.files, async file => {
                    let payload = {}
                    payload.library = vm2.library
                    let pdfName = 'Completed-' + d.PersonnelId + '-' + d.FirstName + ' ' + d.LastName + '-' + file.fileSelected
                    let name = pdfName.split('.')[0]
                    payload.file = pdfName
                    payload.name = name
                    payload.buffer = file.fileBuffer
                    let item = await Security.dispatch('uploadForm', payload)
                    //TO DO: Check if item contains the form Id. The update form could then be deleted
                    let itemlink = item.data.d.ListItemAllFields.__deferred.uri
                    let form = await Security.dispatch('getForm', itemlink)
                    let formId = form.data.d.Id // Form unlikely needed. itemLink definetely
                    // Clear out old forms
                    d[this.selectedSecurityFormType].forms.push({
                      account: this.selectedSecurityFormType,
                      id: formId,
                      library: vm2.library,
                      name: pdfName,
                      // task: results.data.d.Id,
                      href: vm2.libraryUrl + pdfName,
                      etag: form.data.d.__metadata.etag,
                      uri: form.data.d.__metadata.uri
                    })
                  })
                }
                if (console) console.log('Status Updated: ' + this.statusesUpdated + ' Task ID: ' + d.taskId)
                if (this.statusesUpdated && d.taskId) {
                  await Todo.dispatch('getDigest')
                  let task = await Todo.dispatch('getTodoById', d.taskId)
                  let taskCompletePayload = {
                    etag: task.__metadata.etag,
                    uri: task.__metadata.uri,
                    id: d.taskId
                  }
                  await Todo.dispatch('completeTodo', taskCompletePayload)
                  d.taskId = null
                }
                if (this.DISSCheckChanged && d.CAC.dissCheckTask && d.CAC.dissCheckTask !== '') {
                  await Todo.dispatch('getDigest')
                  let task = await Todo.dispatch('getTodoById', d.CAC.dissCheckTask)
                  let taskCompletePayload = {
                    etag: task.__metadata.etag,
                    uri: task.__metadata.uri,
                    id: d.taskId
                  }
                  await Todo.dispatch('completeTodo', taskCompletePayload).then(() => {
                    d.CAC.dissCheckTask = ''
                  })
                }
                // Hackiness to make the data immutable...not nice!
                let payload = JSON.parse(JSON.stringify(d))
                if (payload.NIPR) {
                  payload.NIPR = JSON.stringify(payload.NIPR)
                }
                if (payload.SIPR) {
                  payload.SIPR = JSON.stringify(payload.SIPR)
                }
                if (payload.DREN) {
                  payload.DREN = JSON.stringify(payload.DREN)
                }
                if (payload.JWICS) {
                  payload.JWICS = JSON.stringify(payload.JWICS)
                }
                if (payload.SCI) {
                  payload.SCI = JSON.stringify(payload.SCI)
                }
                if (payload.CAC) {
                  payload.CAC = JSON.stringify(payload.CAC)
                }
                payload.Active = true
                payload.CACStatus = d.CACStatus
                payload.CACValid = d.CACValid
                payload.CACRequestDate = d.CACRequestDate ? d.CACRequestDate : null
                payload.CACExpirationDate = d.CACExpirationDate ? d.CACExpirationDate : null
                payload.CACExpiredOnDate = d.CACExpiredOnDate ? d.CACExpiredOnDate : null
                payload.CACTurnedIn = d.CACTurnedIn
                payload.CACIssuedBy = d.CACIssuedBy
                payload.DISSCheck = d.DISSCheck
                payload.DISSCheckDate = vm2.DISSCheckDate ? vm2.DISSCheckDate : null
                payload.PRDueDate = d.PRDueDate ? d.PRDueDate : null
                payload.CEDate = d.CEDate ? d.CEDate : null
                payload.SCIAccessCheckDate = d.SCIAccessCheckDate
                payload.SCIIndoc = d.SCIIndoc ? d.SCIIndoc : null
                payload.SCIIndocAssistDate = d.SCIIndocAssistDate ? d.SCIIndocAssistDate : null
                payload.SCIAccessCheckDate = d.SCIAccessCheckDate ? d.SCIAccessCheckDate : null
                payload.SCIFormType = d.SCIFormType
                payload.SCIFormSubmitted = d.SCIFormSubmitted ? d.SCIFormSubmitted : null
                payload.SCIStatus = d.SCIStatus
                payload.taskId = d.taskId
                await Security.dispatch('updateSecurityForm', payload)
                  .then(function(result) {
                    // grab a fresh etag for the record
                    d.etag = result.headers.etag
                    /*Security.dispatch('getSecurityFormByPersonnelId', d.PersonnelId).then(function(response) {
                    d.etag = response.etag
                  })*/
                    vm2.statusesUpdated = false
                    vm2.selectedSecurityFormType = null
                    let uploadedFiles = document.querySelector('.e-upload-files')
                    if (uploadedFiles) {
                      while (uploadedFiles.firstChild) {
                        uploadedFiles.removeChild(uploadedFiles.firstChild)
                      }
                    }
                    const notification = {
                      type: 'success',
                      title: 'Succesfully Updated Security Form',
                      message: 'Updated Security form for ' + d.FirstName + ' ' + d.LastName + ' in ' + d.Company,
                      push: true
                    }
                    vm.$store.dispatch('notification/add', notification, { root: true })
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
                this.lockSubmit = false
                if (tId) {
                  Todo.dispatch('getTodoById', tId).then(async function(task) {
                    let payload = {
                      etag: task.__metadata.etag,
                      uri: task.__metadata.uri,
                      id: task.Id
                    }
                    Todo.dispatch('completeTodo', payload)
                  })
                }
              },
              async viewForms(event) {
                event.preventDefault()
                let link = event.currentTarget.dataset.link
                this.$router.push({ path: link })
              },
              async editSecurity(event) {
                event.preventDefault()
                let link = event.currentTarget.dataset.link
                this.$router.push({ path: link })
              },
              async statusChange(data) {
                if (console) console.log('STATUS CHANGED: ' + data.SCIStatus + ' ' + data.CACStatus)
                if ((data.SCIStatus === 'Not Required' || data.SCIStatus === 'Pending Info') && (data.CACStatus === 'Not Required' || data.CACStatus === 'Pending Info')) {
                  this.statusesUpdated = true
                }
              },
              async onFileSelect(args) {
                args.filesData.forEach(fileData => {
                  let file = {}
                  file.fileSelected = fileData.name
                  let buffer = vm2.getFileBuffer(fileData.rawFile)
                  buffer.then(function(buff) {
                    file.fileBuffer = buff
                    vm2.files.push(file)
                  })
                })
              },
              async asyncForEach(array, callback) {
                for (let index = 0; index < array.length; index++) {
                  await callback(array[index], index, array)
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
            },
            mounted: async function() {
              vm2 = this
            }
          })
        }
      }
    }
  },
  mounted: async function() {
    this.$nextTick(async () => {
      vm = this
      // First get current user informaiton
      // Setup a timing chaing so that we don't try to get the personnel by Company Dropdown until the state is loaded.
      /*const notification = {
        type: 'info',
        title: 'Getting Data',
        message: 'Getting Security Information. Please wait...',
        push: false
      }
      this.$store.dispatch('notification/add', notification, { root: true })*/
      await Security.dispatch('getDigest')
      if (this.afrlgroup.length === 0 || this.accountgroup === 0 || this.cacgroup === 0 || this.scigroup === 0) await Security.dispatch('getSecurityGroups')
      await Todo.dispatch('getDigest')
      if (this.userloaded) {
        this.getData()
      } else {
        vm.$options.interval = setInterval(vm.getData, 500)
      }
    })
    // get all of the entries from the SecurityForms list - Might need to check if Subcontractor and then only load related the related personnel list
  },
  methods: {
    actionComplete(args) {
      // if (console) { console.log('ACTION COMPLETE: ' + args.requestType) }
      if (args.requestType == 'columnstate') {
        this.$refs['SecurityGrid'].autoFitColumns()
      }
      /*if (args.requestType == 'refresh') {
        let h1 = 0
        let h2 = this.$refs.SecurityGrid.$el.children[7].children[0].clientHeight // cildren[7] matches .e-gridconent
        h1 = Math.floor(h2 / 20)
        this.pageSettings.pageSize = h1
        this.$refs.SecurityGrid.pageSettings = { pageSize: h1 }
      }*/
    },
    onSubmit(event) {
      event.preventDefault() // prevent form submit! VERY IMPORTANT because search function adds input box which will perform a submit.
    },
    dataBound: function() {
      this.$refs.SecurityGrid.autoFitColumns()
    },
    getData: async function() {
      clearInterval(vm.$options.interval)
      if (this.isSubcontractor) {
        Company.dispatch('getCompanies').then(function() {
          // Add notification
          vm.$options.interval = setInterval(vm.waitForPersonnel, 1000)
        })
      } else {
        console.log('Getting Security Forms')
        await Security.dispatch('getSecurityForms')
        this.formatSecurity()
      }
    },
    formatSecurity: async function() {
      this.securityforms.forEach(form => {
        form.CACExpirationDate = this.$moment(form.CACExpirationDate).isValid() ? this.$moment(form.CACExpirationDate).format('MM/DD/YYYY') : ''
        form.CACExpiredOnDate = this.$moment(form.CACExpiredOnDate).isValid() ? this.$moment(form.CACExpiredOnDate).format('MM/DD/YYYY') : ''
        form.CACRequestDate = this.$moment(form.CACRequestDate).isValid() ? this.$moment(form.CACRequestDate).format('MM/DD/YYYY') : ''
        form.SCIIndocAssistDate = this.$moment(form.SCIIndocAssistDate).isValid() ? this.$moment(form.SCIIndocAssistDate).format('MM/DD/YYYY') : ''
        form.SCIAccessCheckDate = this.$moment(form.SCIAccessCheckDate).isValid() ? this.$moment(form.SCIAccessCheckDate).format('MM/DD/YYYY') : ''
        form.SCIFormSubmitted = this.$moment(form.SCIFormSubmitted).isValid() ? this.$moment(form.SCIFormSubmitted).format('MM/DD/YYYY') : ''
        form.SCIIndoc = this.$moment(form.SCIIndoc).isValid() ? this.$moment(form.SCIIndoc).format('MM/DD/YYYY') : ''
        form.PRDueDate = this.$moment(form.PRDueDate).isValid() ? this.$moment(form.PRDueDate).format('MM/DD/YYYY') : ''
        form.CEDate = this.$moment(form.CEDate).isValid() ? this.$moment(form.CEDate).format('MM/DD/YYYY') : ''
      })
    },
    waitForPersonnel: async function() {
      if (this.currentuser) {
        // finally have user - now get the personnel based on their company
        this.company = this.currentuser[0].Company ? this.currentuser[0].Company : this.companies[0]
        let payload = {}
        payload.company = this.company
        await Personnel.dispatch('getPersonnelByCompany', payload).catch(error => {
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
        await Security.dispatch('getSecurityFormsByCompany', payload)
          .then(() => {
            vm.formatSecurity()
          })
          .catch(error => {
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
        clearInterval(vm.$options.interval)
      }
    },
    getPersonnelByCompany: async function() {
      let payload = {
        company: this.form.Company
      }
      await Personnel.dispatch('getPersonnelByCompany', payload).catch(error => {
        // Add user notification and system logging
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
    },
    toolbarClick: function(args) {
      if (args.item.id === 'SecurityGrid_excelexport') {
        this.$refs.SecurityGrid.refresh()
        // 'Grid_excelexport' -> Grid component id + _ + toolbar item name
        // prolly need to loop through the security forms and format the data into strings
        this.$refs.SecurityGrid.getColumns()[1].visible = true
        this.$refs.SecurityGrid.getColumns()[2].visible = true
        this.$refs.SecurityGrid.getColumns()[3].visible = true
        this.$refs.SecurityGrid.getColumns()[4].visible = true
        this.$refs.SecurityGrid.getColumns()[5].visible = true
        this.$refs.SecurityGrid.getColumns()[6].visible = true
        this.$refs.SecurityGrid.getColumns()[7].visible = true
        this.$refs.SecurityGrid.getColumns()[8].visible = true
        this.$refs.SecurityGrid.getColumns()[9].visible = true
        this.$refs.SecurityGrid.getColumns()[10].visible = true
        this.$refs.SecurityGrid.getColumns()[11].visible = true
        this.$refs.SecurityGrid.getColumns()[12].visible = true
        this.$refs.SecurityGrid.getColumns()[13].visible = true
        this.$refs.SecurityGrid.getColumns()[14].visible = true
        this.$refs.SecurityGrid.getColumns()[15].visible = true
        this.$refs.SecurityGrid.getColumns()[16].visible = true
        this.$refs.SecurityGrid.getColumns()[17].visible = true
        this.$refs.SecurityGrid.getColumns()[18].visible = true
        this.$refs.SecurityGrid.getColumns()[19].visible = true
        this.$refs.SecurityGrid.getColumns()[20].visible = true
        this.$refs.SecurityGrid.getColumns()[21].visible = true
        this.$refs.SecurityGrid.getColumns()[22].visible = true
        this.$refs.SecurityGrid.getColumns()[23].visible = true
        this.$refs.SecurityGrid.getColumns()[24].visible = true
        this.$refs.SecurityGrid.getColumns()[25].visible = true
        this.$refs.SecurityGrid.getColumns()[26].visible = true
        this.$refs.SecurityGrid.getColumns()[27].visible = true
        this.$refs.SecurityGrid.getColumns()[28].visible = true
        this.$refs.SecurityGrid.getColumns()[29].visible = true
        this.$refs.SecurityGrid.getColumns()[30].visible = true
        this.$refs.SecurityGrid.getColumns()[31].visible = false
        this.$refs.SecurityGrid.getColumns()[32].visible = false
        this.$refs.SecurityGrid.getColumns()[33].visible = false
        this.$refs.SecurityGrid.getColumns()[34].visible = false
        let data = []
        this.securityforms.forEach(sf => {
          let CurrentData = {
            //Id: sf.Id,
            FirstName: sf.FirstName,
            LastName: sf.LastName,
            Company: sf.Company,
            SCIStatus: sf.SCIStatus,
            SCIFormType: sf.SCIFormType,
            SCIFormSubmitted: this.$moment(sf.SCIFormSubmitted).isValid() ? this.$moment(sf.SCIFormSubmitted).format('MM/DD/YYYY') : '',
            SCIIndocAssistDate: this.$moment(sf.SCIIndocAssistDate).isValid() ? this.$moment(sf.SCIIndocAssistDate).format('MM/DD/YYYY') : '',
            PRDueDate: this.$moment(sf.PRDueDate).isValid() ? this.$moment(sf.PRDueDate).format('MM/DD/YYYY') : '',
            CEDate: this.$moment(sf.CEDate).isValid() ? this.$moment(sf.CEDate).format('MM/DD/YYYY') : '',
            SCIIndoc: this.$moment(sf.SCIIndoc).isValid() ? this.$moment(sf.SCIIndoc).format('MM/DD/YYYY') : '',
            SCIAccessCheckDate: this.$moment(sf.SCIAccessCheckDate).isValid() ? this.$moment(sf.SCIAccessCheckDate).format('MM/DD/YYYY') : '',
            IsCACValid: sf.CACValid,
            CACStatus: sf.CACStatus,
            CACRequestDate: this.$moment(sf.CACRequestDate).isValid() ? this.$moment(sf.CACRequestDate).format('MM/DD/YYYY') : '',
            CACExpirationDate: this.$moment(sf.CACExpirationDate).isValid() ? this.$moment(sf.CACExpirationDate).format('MM/DD/YYYY') : '',
            CACIssuedBy: sf.CACIssuedBy,
            DISSCheck: sf.DISSCheck,
            DISSCheckDate: this.$moment(sf.DISSCheckDate).isValid() ? this.$moment(sf.DISSCheckDate).format('MM/DD/YYYY') : '',
            NIPRAccount: sf.NIPR && sf.NIPR.GovSentDate !== '' && sf.NIPR.GovCompleteDate !== '' ? 'Yes' : '',
            NIPRGovSentDate: sf.NIPR && sf.NIPR.GovSentDate !== '' ? (sf.NIPR.GovSentDate === 'N/A' ? sf.NIPR.GovSentDate : this.$moment(sf.NIPR.GovSentDate).isValid() ? this.$moment(sf.NIPR.GovSentDate).format('MM/DD/YYYY') : '') : '',
            NIPRGovCompleteDate: sf.NIPR && sf.NIPR.GovCompleteDate !== '' ? (sf.NIPR.GovCompleteDate === 'N/A' ? sf.NIPR.GovCompleteDate : this.$moment(sf.NIPR.GovCompleteDate).isValid() ? this.$moment(sf.NIPR.GovCompleteDate).format('MM/DD/YYYY') : '') : '',
            SIPRAccount: sf.SIPR && sf.SIPR.GovSentDate !== '' && sf.SIPR.GovCompleteDate !== '' ? 'Yes' : '',
            SIPRGovSentDate: sf.SIPR && sf.SIPR.GovSentDate !== '' ? (sf.SIPR.GovSentDate === 'N/A' ? sf.SIPR.GovSentDate : this.$moment(sf.SIPR.GovSentDate).isValid() ? this.$moment(sf.SIPR.GovSentDate).format('MM/DD/YYYY') : '') : '',
            SIPRGovCompleteDate: sf.SIPR && sf.SIPR.GovCompleteDate !== '' ? (sf.SIPR.GovCompleteDate === 'N/A' ? sf.SIPR.GovCompleteDate : this.$moment(sf.SIPR.GovCompleteDate).isValid() ? this.$moment(sf.SIPR.GovCompleteDate).format('MM/DD/YYYY') : '') : '',
            DRENAccount: sf.DREN && sf.DREN.GovSentDate !== '' && sf.DREN.GovCompleteDate !== '' ? 'Yes' : '',
            DRENGovSentDate: sf.DREN && sf.DREN.GovSentDate !== '' ? (sf.DREN.GovSentDate === 'N/A' ? sf.DREN.GovSentDate : this.$moment(sf.DREN.GovSentDate).isValid() ? this.$moment(sf.DREN.GovSentDate).format('MM/DD/YYYY') : '') : '',
            DRENGovCompleteDate: sf.DREN && sf.DREN.GovCompleteDate !== '' ? (sf.DREN.GovCompleteDate === 'N/A' ? sf.DREN.GovCompleteDate : this.$moment(sf.DREN.GovCompleteDate).isValid() ? this.$moment(sf.DREN.GovCompleteDate).format('MM/DD/YYYY') : '') : '',
            JWICAccount: sf.JWICS && sf.JWICS.GovSentDate !== '' && sf.JWICS.GovCompleteDate !== '' ? 'Yes' : '',
            JWICGovSentDate: sf.JWICS && sf.JWICS.GovSentDate !== '' ? (sf.JWICS.GovSentDate === 'N/A' ? sf.JWICS.GovSentDate : this.$moment(sf.JWICS.GovSentDate).isValid() ? this.$moment(sf.JWICS.GovSentDate).format('MM/DD/YYYY') : '') : '',
            JWICGovCompleteDate: sf.JWICS && sf.JWICS.GovCompleteDate !== '' ? (sf.JWICS.GovCompleteDate === 'N/A' ? sf.JWICS.GovCompleteDate : this.$moment(sf.JWICS.GovCompleteDate).isValid() ? this.$moment(sf.JWICS.GovCompleteDate).format('MM/DD/YYYY') : '') : ''
          }
          data.push(CurrentData)
        })
        let excelExportProperties = {
          fileName: 'Security.xlsx',
          dataSource: data,
          includeHiddenColumn: false
        }
        this.$refs.SecurityGrid.excelExport(excelExportProperties)
      }
    }
  },
  provide: {
    grid: [Page, DetailRow, VirtualScroll, Toolbar, ExcelExport, Resize, Search]
  }
  /*actionBegin(args) {
    switch (args.requestType) {
      case 'add':
        args.cancel = true
        this.$router.push({ name: 'New Travel', params: { back: 'Travel Tracker' } })
        break
    }
  }*/
}
</script>
<style lang="scss">
.ellipses {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  width: 10rem;
  display: inline-block;
}
</style>
