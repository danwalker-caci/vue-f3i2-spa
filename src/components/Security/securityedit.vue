<template>
  <b-container fluid class="contentHeight p-0 m-0 overflow-auto">
    <b-row no-gutters>
      <b-col cols="12" class="m-0 p-0">
        <b-card>
          <div class="ml-4 mr-4" v-if="loaded">
            <b-form-row>
              <b-col>
                <b-button @click="$router.push({ path: '/security/tracker' })" variant="secondary">Return to Tracker</b-button>
              </b-col>
              <b-col>
                <b-form-group label="Company: " label-for="company">
                  <b-form-input id="company" v-model="Company" value="{{ Company }}" disabled />
                </b-form-group>
              </b-col>
              <b-col>
                <b-form-group label="Name: " label-for="name">
                  <b-form-input id="name" v-model="Name" value="{{ Name }}" disabled />
                </b-form-group>
              </b-col>
              <b-col>
                <b-form-group label="PR Due Date" label-for="PRDueDate">
                  <ejs-datepicker :disable="!isSecurity" id="PRDueDate" v-model="PRDueDate"></ejs-datepicker>
                </b-form-group>
              </b-col>
              <b-col>
                <b-form-group label="CE Date" label-for="CEDate">
                  <ejs-datepicker :disable="!isSecurity" id="CEDate" v-model="CEDate"></ejs-datepicker>
                </b-form-group>
              </b-col>
            </b-form-row>
            <b-form-row>
              <b-col>
                <b-button :disabled="lockSubmit" v-if="isSecurity || isDeveloper" ref="updateOriginalInfo" variant="success" class="btn-sm float-right" @click="updateForm()">Update</b-button>
              </b-col>
            </b-form-row>
          </div>
          <b-tabs pills content-class="mt-0 p-0">
            <b-tab title="NIPR" v-if="NIPR" class="pt-3">
              <b-table-simple small responsive>
                <b-thead head-variant="dark">
                  <b-tr>
                    <b-th>Account</b-th>
                    <b-th>Government Sent Date</b-th>
                    <b-th>Government Review</b-th>
                    <!--<b-th>Submitted Forms</b-th>-->
                  </b-tr>
                </b-thead>
                <b-tbody>
                  <!-- NIPR DATA -->
                  <b-tr>
                    <b-td>NIPR</b-td>
                    <b-td>
                      <span v-if="NIPR.GovSentDate !== ''">{{ NIPR.GovSentDate }}</span>
                      <span v-if="NIPR.GovSentDate == ''">
                        <!-- Should only show if in Security Group -->
                        <b-button v-if="isSecurity" ref="NotifyGov" variant="success" :data-type="'NIPR'" class="btn-sm" @click="NotifyGov($event)">Notify Government</b-button>
                        <span v-if="!isSecurity">Processing</span>
                      </span>
                    </b-td>
                    <b-td>
                      <span v-if="NIPR.GovCompleteDate !== ''">{{ NIPR.GovCompleteDate }}</span>
                      <span v-if="NIPR.GovRejectDate !== ''">{{ NIPR.GovRejectDate }}</span>
                      <span v-if="NIPR.GovCompleteDate == '' && NIPR.GovRejectDate == ''"
                        ><!-- add a check if user is in AFRL -->
                        <!-- REMOVE DEVELOPER OPTION -->
                        <b-button v-if="isAFRL || isDeveloper" ref="CompleteGov" variant="primary" :data-type="'NIPR'" class="btn-sm" @click="CompleteGov($event)">Complete</b-button>
                        <b-button v-if="isAFRL || isDeveloper" ref="RejectGov" variant="danger" :data-type="'NIPR'" class="btn-sm" @click="RejectGov($event)">Rework</b-button>
                        <span v-if="!isAFRL && NIPR.GovSentDate !== ''">Processing</span>
                      </span>
                    </b-td>
                    <!--<b-td><b-button class="btn-sm" @click="viewForms($event)" variant="secondary" :data-type="'NIPR'">View Forms</b-button></b-td>-->
                  </b-tr>
                </b-tbody>
              </b-table-simple>
              <div v-if="NIPR.forms && NIPR.forms.length > 0">
                <div v-for="form in NIPR.forms" :key="form.id">
                  <b-form-row class="p-1">
                    <b-embed type="iframe" :src="form.href" allowfullscreen></b-embed>
                  </b-form-row>
                  <!--<b-form-row v-if="form.status !== 'Approved' && form.status !== 'Rejected'">
                      <b-col cols="10"></b-col>
                      <b-col cols="2" v-if="isSecurity" v-bind:id="form.id">
                        <b-button variant="danger" class="formbutton" @click="rejectForm(form)">Reject</b-button>
                        <b-button variant="success" class="formbutton" @click="approveForm(form)">Approve</b-button>
                      </b-col>
                    </b-form-row>-->
                </div>
              </div>
            </b-tab>
            <b-tab title="SIPR" v-if="SIPR" class="pt-3">
              <b-table-simple small responsive>
                <b-thead head-variant="dark">
                  <b-tr>
                    <b-th>Account</b-th>
                    <b-th>Government Sent Date</b-th>
                    <b-th>Government Review</b-th>
                    <!--<b-th>Submitted Forms</b-th>-->
                  </b-tr>
                </b-thead>
                <b-tbody>
                  <!-- SIPR DATA -->
                  <b-tr>
                    <b-td>SIPR</b-td>
                    <b-td>
                      <span v-if="SIPR.GovSentDate !== ''">{{ SIPR.GovSentDate }}</span>
                      <span v-if="SIPR.GovSentDate == ''">
                        <!-- Should only show if in Security Group -->
                        <b-button v-if="isSecurity" ref="NotifyGov" :data-type="'SIPR'" variant="success" class="btn-sm" @click="NotifyGov($event)">Notify Government</b-button>
                        <span v-if="!isSecurity">Processing</span>
                      </span>
                    </b-td>
                    <b-td>
                      <span v-if="SIPR.GovCompleteDate !== ''">{{ SIPR.GovCompleteDate }}</span>
                      <span v-if="SIPR.GovRejectDate !== ''">{{ SIPR.GovRejectDate }}</span>
                      <span v-if="SIPR.GovCompleteDate == '' && SIPR.GovRejectDate == ''">
                        <!-- add a check if user is in AFRL -->
                        <!-- REMOVE DEVELOPER OPTION -->
                        <b-button v-if="isAFRL || isDeveloper" ref="CompleteGov" variant="primary" :data-type="'SIPR'" class="btn-sm" @click="CompleteGov($event)">Complete</b-button>
                        <b-button v-if="isAFRL || isDeveloper" ref="RejectGov" variant="danger" :data-type="'SIPR'" class="btn-sm" @click="RejectGov($event)">Rework</b-button>
                        <span v-if="!isAFRL && SIPR.GovSentDate !== ''">Processing</span>
                      </span>
                    </b-td>
                    <!--<b-td><b-button class="btn-sm" @click="viewForms($event)" variant="secondary" :data-type="'SIPR'">View Forms</b-button></b-td>-->
                  </b-tr>
                </b-tbody>
              </b-table-simple>
              <div v-if="SIPR.forms && SIPR.forms.length > 0">
                <div v-for="form in SIPR.forms" :key="form.id">
                  <b-form-row class="p-1">
                    <b-embed type="iframe" :src="form.href" allowfullscreen></b-embed>
                  </b-form-row>
                  <!--<b-form-row v-if="form.status !== 'Approved' && form.status !== 'Rejected'">
                    <b-col cols="10"></b-col>
                    <b-col cols="2" v-if="isSecurity" v-bind:id="form.id">
                      <b-button variant="danger" class="formbutton" @click="rejectForm(form)">Reject</b-button>
                      <b-button variant="success" class="formbutton" @click="approveForm(form)">Approve</b-button>
                    </b-col>
                  </b-form-row>-->
                </div>
              </div>
            </b-tab>
            <b-tab title="DREN" v-if="DREN" class="pt-3">
              <b-table-simple small responsive>
                <b-thead head-variant="dark">
                  <b-tr>
                    <b-th>Account</b-th>
                    <b-th>Government Sent Date</b-th>
                    <b-th>Government Review</b-th>
                    <!--<b-th>Submitted Forms</b-th>-->
                  </b-tr>
                </b-thead>
                <b-tbody>
                  <!-- DREN DATA -->
                  <b-tr>
                    <b-td>DREN</b-td>
                    <b-td>
                      <span v-if="DREN.GovSentDate !== ''">{{ DREN.GovSentDate }}</span>
                      <span v-if="DREN.GovSentDate == ''">
                        <!-- Should only show if in Security Group -->
                        <b-button v-if="isSecurity" ref="NotifyGov" variant="success" :data-type="'DREN'" class="btn-sm" @click="NotifyGov($event)">Notify Government</b-button>
                        <span v-if="!isSecurity">Processing</span>
                      </span>
                    </b-td>
                    <b-td>
                      <span v-if="DREN.GovCompleteDate !== ''">{{ DREN.GovCompleteDate }}</span>
                      <span v-if="DREN.GovRejectDate !== ''">{{ DREN.GovRejectDate }}</span>
                      <span v-if="DREN.GovCompleteDate == '' && DREN.GovRejectDate == ''"
                        ><!-- add a check if user is in AFRL -->
                        <!-- REMOVE DEVELOPER OPTION -->
                        <b-button v-if="isAFRL || isDeveloper" ref="CompleteGov" variant="primary" :data-type="'DREN'" class="btn-sm" @click="CompleteGov($event)">Complete</b-button>
                        <b-button v-if="isAFRL || isDeveloper" ref="RejectGov" variant="danger" :data-type="'DREN'" class="btn-sm" @click="RejectGov($event)">Rework</b-button>
                        <span v-if="!isAFRL && DREN.GovSentDate !== ''">Processing</span>
                      </span>
                    </b-td>
                    <!--<b-td><b-button class="btn-sm" @click="viewForms($event)" variant="secondary" :data-link="'DREN'">View Forms</b-button></b-td>-->
                  </b-tr>
                </b-tbody>
              </b-table-simple>
              <div v-if="DREN.forms && DREN.forms.length > 0">
                <div v-for="form in DREN.forms" :key="form.id">
                  <b-form-row class="p-1">
                    <b-embed type="iframe" :src="form.href" allowfullscreen></b-embed>
                  </b-form-row>
                  <!--<b-form-row v-if="form.status !== 'Approved' && form.status !== 'Rejected'">
                    <b-col cols="10"></b-col>
                    <b-col cols="2" v-if="isSecurity" v-bind:id="form.id">
                      <b-button variant="danger" class="formbutton" @click="rejectForm(form)">Reject</b-button>
                      <b-button variant="success" class="formbutton" @click="approveForm(form)">Approve</b-button>
                    </b-col>
                  </b-form-row>-->
                </div>
              </div>
            </b-tab>
            <b-tab title="JWICS" v-if="JWICS" class="pt-3">
              <b-table-simple small responsive>
                <b-thead head-variant="dark">
                  <b-tr>
                    <b-th>Account</b-th>
                    <b-th>Government Sent Date</b-th>
                    <b-th>Government Review</b-th>
                    <!--<b-th>Submitted Forms</b-th>-->
                  </b-tr>
                </b-thead>
                <b-tbody>
                  <!-- JWICS DATA -->
                  <b-tr v-if="JWICS">
                    <b-td>JWICS</b-td>
                    <b-td>
                      <span v-if="JWICS.GovSentDate !== ''">{{ JWICS.GovSentDate }}</span>
                      <span v-if="JWICS.GovSentDate == ''">
                        <!-- Should only show if in Security Group -->
                        <b-button v-if="isSecurity" ref="NotifyGov" variant="success" :data-type="'JWICS'" class="btn-sm" @click="NotifyGov($event)">Notify Government</b-button>
                        <span v-if="!isSecurity">Processing</span>
                      </span>
                    </b-td>
                    <b-td>
                      <span v-if="JWICS.GovCompleteDate !== ''">{{ JWICS.GovCompleteDate }}</span>
                      <span v-if="JWICS.GovRejectDate !== ''">{{ JWICS.GovRejectDate }}</span>
                      <span v-if="JWICS.GovCompleteDate == '' && JWICS.GovRejectDate == ''">
                        <!-- add a check if user is in AFRL -->
                        <!-- REMOVE DEVELOPER OPTION -->
                        <b-button v-if="isAFRL || isDeveloper" ref="CompleteGov" variant="primary" :data-type="'JWICS'" class="btn-sm" @click="CompleteGov($event)">Complete</b-button>
                        <b-button v-if="isAFRL || isDeveloper" ref="RejectGov" variant="danger" :data-type="'JWICS'" class="btn-sm" @click="RejectGov($event)">Rework</b-button>
                        <span v-if="!isAFRL && JWICS.GovSentDate !== ''">Processing</span>
                      </span>
                    </b-td>
                  </b-tr>
                </b-tbody>
              </b-table-simple>
              <div v-if="JWICS.forms && JWICS.forms.length > 0">
                <div v-for="form in JWICS.forms" :key="form.id">
                  <b-form-row class="p-1">
                    <b-embed type="iframe" :src="form.href" allowfullscreen></b-embed>
                  </b-form-row>
                  <!--<b-form-row v-if="form.status !== 'Approved' && form.status !== 'Rejected'">
                    <b-col cols="10"></b-col>
                    <b-col cols="2" v-if="isSecurity" v-bind:id="form.id">
                      <b-button variant="danger" class="formbutton" @click="rejectForm(form)">Reject</b-button>
                      <b-button variant="success" class="formbutton" @click="approveForm(form)">Approve</b-button>
                    </b-col>
                  </b-form-row>-->
                </div>
              </div>
            </b-tab>
            <b-tab title="SCI" class="pt-3">
              <b-table-simple small responsive>
                <b-thead head-variant="dark">
                  <b-tr>
                    <b-th>Date Indoctrination Assist Sent</b-th>
                    <b-th>SCI Access Check Date</b-th>
                    <b-th>SCI Indoctrination Date</b-th>
                    <b-th>SCI Form Submitted</b-th>
                    <b-th>SCI Status</b-th>
                    <b-th>SCI Form Type</b-th>
                    <b-th></b-th>
                  </b-tr>
                </b-thead>
                <b-tbody>
                  <b-tr>
                    <b-td>
                      <ejs-datepicker :disable="!isSecurity" id="formSCIIndocAssistDate" @change="AssistDateChange()" v-model="SCIIndocAssistDate"></ejs-datepicker>
                    </b-td>
                    <b-td>
                      <ejs-datepicker :disable="!isSecurity" id="formAccessCheckDate" v-model="SCIAccessCheckDate"></ejs-datepicker>
                    </b-td>
                    <b-td>
                      <ejs-datepicker :disable="!isSecurity" id="formSCIIndocDate" v-model="SCIIndoc"></ejs-datepicker>
                    </b-td>
                    <b-td>
                      <ejs-datepicker id="sciFormSubmitted" :disable="!isSecurity" v-model="SCIFormSubmitted"></ejs-datepicker>
                    </b-td>
                    <b-td>
                      <ejs-dropdownlist :disable="!isSecurity" v-model="SCIStatus" :dataSource="status" :fields="ddfields"></ejs-dropdownlist>
                    </b-td>
                    <b-td>
                      <ejs-dropdownlist id="sciFormType" :disable="!isSecurity" v-model="SCIFormType" :dataSource="sciFormType" :fields="ddfields"></ejs-dropdownlist>
                    </b-td>
                    <b-td>
                      <!-- Update Button -->
                      <b-button :disabled="lockSubmit" v-if="isSecurity || isDeveloper" ref="updateSCI" variant="success" class="btn-sm" @click="updateForm()">Update</b-button>
                    </b-td>
                  </b-tr>
                </b-tbody>
              </b-table-simple>
              <div v-if="SCI.forms && SCI.forms.length > 0">
                <div v-for="form in SCI.forms" :key="form.id">
                  <b-form-row class="p-1">
                    <b-embed type="iframe" :src="form.href" allowfullscreen></b-embed>
                  </b-form-row>
                  <!--<b-form-row v-if="form.status !== 'Approved' && form.status !== 'Rejected'">
                    <b-col cols="10"></b-col>
                    <b-col cols="2" v-if="isSecurity" v-bind:id="form.id">
                      <b-button variant="danger" class="formbutton" @click="rejectForm(form)">Reject</b-button>
                      <b-button variant="success" class="formbutton" @click="approveForm(form)">Approve</b-button>
                    </b-col>
                  </b-form-row>-->
                </div>
              </div>
            </b-tab>
            <b-tab title="CAC">
              <b-table-simple small responsive class="pt-3">
                <b-thead head-variant="dark">
                  <b-tr>
                    <b-th>CAC Status</b-th>
                    <b-th>CAC Issued By</b-th>
                    <b-th>CAC Request Date</b-th>
                    <b-th>CAC Expiration Date</b-th>
                    <b-th></b-th>
                  </b-tr>
                </b-thead>
                <b-tbody>
                  <b-tr>
                    <b-td>
                      <ejs-dropdownlist :disable="!isSecurity" v-model="CACStatus" :dataSource="cacstatus" :fields="ddfields"></ejs-dropdownlist>
                    </b-td>
                    <b-td>
                      <b-form-input :disable="!isSecurity" type="text" id="formCACIssuedBy" v-model="CACIssuedBy"></b-form-input>
                    </b-td>
                    <b-td>
                      <ejs-datepicker id="cacRequestDate" :disable="!isSecurity" v-model="CACRequestDate"></ejs-datepicker>
                    </b-td>
                    <b-td>
                      <ejs-datepicker :disable="!isSecurity" id="formCACExpirationDate" v-model="CACExpirationDate"></ejs-datepicker>
                    </b-td>
                    <b-td>
                      <!-- Update Button -->
                      <!-- REMOVE DEVELOPER OPTION -->
                      <b-button :disabled="lockSubmit" v-if="isSecurity || isDeveloper" ref="updateCAC" variant="success" class="btn-sm" @click="updateForm()">Update</b-button>
                    </b-td>
                  </b-tr>
                </b-tbody>
              </b-table-simple>
              <div v-if="CAC.forms && CAC.forms.length > 0">
                <div v-for="form in CAC.forms" :key="form.id">
                  <b-form-row class="p-1">
                    <b-embed type="iframe" :src="form.href" allowfullscreen></b-embed>
                  </b-form-row>
                  <!--<b-form-row v-if="form.status !== 'Approved' && form.status !== 'Rejected'">
                    <b-col cols="10"></b-col>
                    <b-col cols="2" v-if="isSecurity" v-bind:id="form.id">
                      <b-button variant="danger" class="formbutton" @click="rejectForm(form)">Reject</b-button>
                      <b-button variant="success" class="formbutton" @click="approveForm(form)">Approve</b-button>
                    </b-col>
                  </b-form-row>-->
                </div>
              </div>
            </b-tab>
            <b-tab title="Historical CAC" v-if="CACTurnedIn && CACExpiredOnDate">
              <b-table-simple small responsive class="pt-3">
                <b-thead head-variant="dark">
                  <b-tr>
                    <b-th>CAC Status</b-th>
                    <b-th>CAC Turned In Location</b-th>
                    <b-th>CAC Turned In Date</b-th>
                  </b-tr>
                </b-thead>
                <b-tbody>
                  <b-tr>
                    <b-td>
                      {{ CACStatus }}
                    </b-td>
                    <b-td>
                      {{ CACTurnedIn }}
                    </b-td>
                    <b-td>
                      {{ CACExpiredOnDate }}
                    </b-td>
                  </b-tr>
                </b-tbody>
              </b-table-simple>
            </b-tab>
            <b-tab title="Upload Forms" v-if="isDeveloper || isAFRL">
              <div class="width-98">
                <b-row no-gutters>
                  <b-col class="mt-2">
                    <p class="h4">
                      <u><strong>Warning: </strong>uploading documents will overwrite previously uploaded documents!</u>
                    </p>
                  </b-col>
                </b-row>
                <b-row no-gutters>
                  <b-col cols="2">
                    <b-form-group label="Form Type: " label-for="formType">
                      <b-form-select id="formType" v-model="selectedSecurityFormType" :options="securityFormTypes"></b-form-select>
                    </b-form-group>
                  </b-col>
                  <b-col cols="2"></b-col>
                  <b-col cols="8">
                    <ejs-uploader id="formFileUpload" name="formFileUpload" :selected="onFileSelect" :multiple="true"></ejs-uploader>
                  </b-col>
                </b-row>
                <b-button :disabled="lockSubmit" v-if="isSecurity || isDeveloper" ref="updateCAC" variant="success" class="float-right btn-sm mt-2" @click="updateForm()">Upload Completed Forms</b-button>
              </div>
            </b-tab>
          </b-tabs>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
let vm = null
// eslint-disable-next-line no-undef
let url = _spPageContextInfo.webAbsoluteUrl
// eslint-disable-next-line no-unused-vars
import moment from 'moment'
import Security from '@/models/Security'
import Todo from '@/models/Todo'
import User from '@/models/User'

export default {
  name: 'Edit Security',
  props: {
    id: {
      type: Number
    }
  },
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
    rect() {
      return this.$store.state.support.contentrect
    }
  },
  data: function() {
    return {
      Id: '',
      Active: '',
      PersonnelId: '',
      Name: '',
      FirstName: '',
      LastName: '',
      Company: '',
      SCI: {},
      SCIStatus: '',
      SCIIndoc: '',
      SCIIndocAssistDate: '',
      SCIAccessCheckDate: '',
      SCIFormType: '',
      SCIFormSubmitted: '',
      CAC: {},
      CACStatus: '',
      CACRequestDate: '',
      CACExpirationDate: '',
      CACIssuedBy: '',
      CACValid: '',
      CACExpiredOnDate: '',
      NIPR: {},
      SIPR: {},
      DREN: {},
      JWICS: {},
      etag: '',
      uri: '',
      files: [],
      loaded: false,
      library: '',
      libraryUrl: '',
      lockSubmit: false,
      selectedSecurityFormType: '',
      securityFormTypes: [
        { value: 'NIPR', text: 'NIPR' },
        { value: 'SIPR', text: 'SIPR' },
        { value: 'DREN', text: 'DREN' },
        { value: 'JWICS', text: 'JWICS' },
        { value: 'CAC', text: 'CAC' },
        { value: 'SCI', text: 'SCI' }
      ],
      AccountId: '',
      AFRLId: '',
      SecurityId: '',
      ddfields: { text: 'text', value: 'value' },
      status: [
        { text: 'Not Required', value: 'Not Required' },
        { text: 'Pending Info', value: 'Pending Info' },
        { text: 'CACI Review', value: 'CACI Review' },
        { text: 'Submitted', value: 'Submitted' },
        { text: 'Indoc Assist Sent', value: 'Indoc Assist Sent' },
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
  mounted: async function() {
    vm = this
    await Security.dispatch('getDigest')
    await this.getUserIDs()
    await this.getForms()
  },
  methods: {
    async getUserIDs() {
      this.AccountId = await this.$store.dispatch('support/getAccountUser')
      this.AFRLId = await this.$store.dispatch('support/getAFRLUser')
      this.SecurityId = await this.$store.dispatch('support/getCACSCIUser')
      // console.log(this.$store.state.support.AFRLUserID)
      // console.log(this.$store.state.support.AccountUserID)
      // console.log(this.$store.state.support.CACSCIUserID)
    },
    async getForms() {
      // Run query to load the form
      console.log(this.id)
      let payload = {
        Id: this.id
      }
      let result = await Security.dispatch('getSecurityFormById', payload).catch(e => {
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
      this.etag = result.etag
      this.uri = result.uri
      this.Id = result.Id
      this.Active = result.Active ? 'Yes' : 'No'
      this.FirstName = result.FirstName
      this.LastName = result.LastName
      this.Name = result.FirstName + ' ' + result.LastName
      this.Company = result.Company
      this.PersonnelId = result.PersonnelId
      this.CEDate = result.CEDate
      this.SCI = result.SCI
      this.SCIStatus = result.SCIStatus
      this.SCIIndoc = this.$moment(result.SCIIndoc).isValid() ? this.$moment(result.SCIIndoc).format('MM/DD/YYYY') : ''
      this.SCIIndocAssistDate = this.$moment(result.SCIIndocAssistDate).isValid() ? this.$moment(result.SCIIndocAssistDate).format('MM/DD/YYYY') : ''
      this.SCIAccessCheckDate = this.$moment(result.SCIAccessCheckDate).isValid() ? this.$moment(result.SCIAccessCheckDate).format('MM/DD/YYYY') : ''
      this.SCIFormType = result.SCIFormType
      this.SCIFormSubmitted = this.$moment(result.SCIFormSubmitted).isValid() ? this.$moment(result.SCIFormSubmitted).format('MM/DD/YYYY') : ''
      this.CAC = result.CAC
      this.CACStatus = result.CACStatus
      this.CACRequestDate = this.$moment(result.CACRequestDate).isValid() ? this.$moment(result.CACRequestDate).format('MM/DD/YYYY') : ''
      this.CACExpirationDate = this.$moment(result.CACExpirationDate).isValid() ? this.$moment(result.CACExpirationDate).format('MM/DD/YYYY') : ''
      this.CACIssuedBy = result.CACIssuedBy
      this.CACValid = result.CACValid
      this.CACExpiredOnDate = this.$moment(result.CACExpiredOnDate).isValid() ? this.$moment(result.CACExpiredOnDate).format('MM/DD/YYYY') : ''
      this.CACTurnedIn = result.CACTurnedIn
      this.NIPR = result.NIPR
      this.SIPR = result.SIPR
      this.DREN = result.DREN
      this.JWICS = result.JWICS
      await Security.dispatch('getDigest')
      this.loaded = true
    },
    AssistDateChange() {
      this.SCIStatus = 'SSO Processed'
    },
    async NotifyGov(e) {
      await Security.dispatch('getDigest')
      let type = e.currentTarget.dataset.type,
        taskId,
        taskUserId = vm.$store.state.support.AFRLUserId
      // Add a task for the designated government employee for review
      let payload = {
        Title: 'Complete or Reject ' + this.FirstName + ' ' + this.LastName + ' ' + type + ' Request',
        //AssignedToId: vm.userid, // Hardcode to Juan
        AssignedToId: taskUserId,
        Description: 'Complete or reject ' + this.FirstName + ' ' + this.LastName + ' ' + type + ' Request',
        IsMilestone: false,
        PercentComplete: 0,
        TaskType: type + ' Request',
        TaskLink: '/security/tracker'
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
        emails: ['alexie.hazen@caci.com'],
        body: '<h3>Please complete or reject the following.</h3> <p>Name: ' + this.FirstName + ' ' + this.LastName + '</p><p>Form: ' + type + ' Request</p><br/><a href="' + url + '/Pages/Home.aspx#/security/edit/' + this.Id + '">Edit ' + this.FirstName + ' ' + this.LastName + '</a>',
        subject: type + ' Request'
      }
      await Security.dispatch('sendEmail', emailPayload)
      // Update the task to the new one for AFRL
      // get the current item data
      switch (type) {
        case 'NIPR':
          taskId = this.NIPR.task
          this.NIPR.GovSentDate = this.$moment().format('MM/DD/YYYY')
          this.NIPR.task = results.data.d.Id
          break
        case 'SIPR':
          taskId = this.SIPR.task
          this.SIPR.GovSentDate = this.$moment().format('MM/DD/YYYY')
          this.SIPR.task = results.data.d.Id
          break
        case 'DREN':
          taskId = this.DREN.task
          this.DREN.GovSentDate = this.$moment().format('MM/DD/YYYY')
          this.DREN.task = results.data.d.Id
          break
        case 'JWICS':
          taskId = this.JWICS.task // original taskId\
          this.JWICS.GovSentDate = this.$moment().format('MM/DD/YYYY')
          this.JWICS.task = results.data.d.Id
          break
      }
      this.updateForm(taskId)
    },
    async CompleteGov(event) {
      await Security.dispatch('getDigest')
      let type = event.currentTarget.dataset.type,
        taskId,
        taskUserId = vm.$store.state.support.AccountUserId
      // get the current item data
      switch (type) {
        case 'NIPR':
          taskId = this.NIPR.task
          this.NIPR.GovCompleteDate = 'Completed On: ' + this.$moment().format('MM/DD/YYYY')
          for (var nipr = 0; nipr <= this.NIPR.forms.length; nipr++) {
            window.open(url + '/_layouts/download.aspx?SourceUrl=' + this.NIPR.forms[nipr].href, '_blank')
          }
          break
        case 'SIPR':
          taskId = this.SIPR.task
          this.SIPR.GovCompleteDate = 'Completed On: ' + this.$moment().format('MM/DD/YYYY')
          for (var sipr = 0; sipr <= this.SIPR.forms.length; sipr++) {
            window.open(url + '/_layouts/download.aspx?SourceUrl=' + this.SIPR.forms[sipr].href, '_blank')
          }
          break
        case 'DREN':
          taskId = this.DREN.task
          this.DREN.GovCompleteDate = 'Completed On: ' + this.$moment().format('MM/DD/YYYY')
          for (var dren = 0; dren <= this.DREN.forms.length; dren++) {
            window.open(url + '/_layouts/download.aspx?SourceUrl=' + this.DREN.forms[dren].href, '_blank')
          }
          break
        case 'JWICS':
          taskId = this.JWICS.task // original taskId\
          this.JWICS.GovCompleteDate = 'Completed On: ' + this.$moment().format('MM/DD/YYYY')
          for (var jwics = 0; jwics <= this.JWICS.forms.length; jwics++) {
            window.open(url + '/_layouts/download.aspx?SourceUrl=' + this.JWICS.forms[jwics].href, '_blank')
          }
          break
      }
      await this.updateForm(taskId).catch(e => {
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
      let payload = {
        Title: 'AFRL Completed ' + this.FirstName + ' ' + this.LastName + ' ' + type + ' Request',
        AssignedToId: taskUserId,
        Description: 'AFRL Completed ' + this.FirstName + ' ' + this.LastName + ' ' + type + ' Request. Please notify the original submitter.',
        IsMilestone: false,
        PercentComplete: 0,
        TaskType: type + ' Request',
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
      // Remove the button and display current Date
    },
    async RejectGov(event) {
      await Security.dispatch('getDigest')
      let type = event.currentTarget.dataset.type,
        taskId
      // get the current item data
      switch (type) {
        case 'NIPR':
          taskId = this.NIPR.task
          this.NIPR.GovCompleteDate = 'Rejected On: ' + this.$moment().format('MM/DD/YYYY')
          await this.asyncForEach(this.NIPR.forms, nipr => {
            this.deleteForm(nipr)
          })
          this.NIPR.forms = []
          break
        case 'SIPR':
          taskId = this.SIPR.task
          this.SIPR.GovCompleteDate = 'Rejected On: ' + this.$moment().format('MM/DD/YYYY')
          await this.asyncForEach(this.SIPR.forms, sipr => {
            this.deleteForm(sipr)
          })
          this.SIPR.forms = []
          break
        case 'DREN':
          taskId = this.DREN.task
          this.DREN.GovCompleteDate = 'Rejected On: ' + this.$moment().format('MM/DD/YYYY')
          await this.asyncForEach(this.DREN.forms, dren => {
            this.deleteForm(dren)
          })
          this.DREN.forms = []
          break
        case 'JWICS':
          taskId = this.JWICS.task // original taskId\
          this.JWICS.GovCompleteDate = 'Rejected On: ' + this.$moment().format('MM/DD/YYYY')
          await this.asyncForEach(this.JWICS.forms, jwics => {
            this.deleteForm(jwics)
          })
          this.JWICS.forms = []
          break
      }
      await this.updateForm(taskId).catch(error => {
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
      let taskUserId = null
      if (type == 'NIPR' || type == 'SIPR' || type == 'DREN' || type == 'JWICS') {
        taskUserId = vm.$store.state.support.AccountUserId
      } else {
        taskUserId = vm.$store.state.support.CACSCIUserId
      }
      // Notify Accounts Admin or Security via task list
      let payload = {
        Title: 'AFRL Reject ' + this.FirstName + ' ' + this.LastName + ' ' + type + ' Request',
        //AssignedToId: vm.userid, // Hardcode to either Michelle or Monica
        AssignedToId: taskUserId,
        Description: 'AFRL reject ' + this.FirstName + ' ' + this.LastName + ' ' + type + ' Request. Please notify the original submitter.',
        IsMilestone: false,
        PercentComplete: 0,
        TaskType: type + ' Request',
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
    async updateForm(tId) {
      await Security.dispatch('getDigest')
      this.lockSubmit = true
      if (this.files && this.files.length > 0 && this.selectedSecurityFormType !== null) {
        // first delete all files related to the formTypes
        if (this[this.selectedSecurityFormType] && this[this.selectedSecurityFormType].forms && this[this.selectedSecurityFormType].forms.length > 0) {
          await this.asyncForEach(this[this.selectedSecurityFormType].forms, async file => {
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
        }
        // Clear original form
        this[this.selectedSecurityFormType].forms = []
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
          payload.library = vm.library
          let pdfName = 'Completed-' + vm.PersonnelId + '-' + vm.FirstName + ' ' + vm.LastName + '-' + file.fileSelected
          let name = pdfName.split('.')[0]
          file.fileName = name
          payload.file = file.fileSelected
          payload.name = name
          payload.buffer = file.fileBuffer
          let item = await Security.dispatch('uploadForm', payload)
          //TO DO: Check if item contains the form Id. The update form could then be deleted
          let itemlink = item.data.d.ListItemAllFields.__deferred.uri
          let form = await Security.dispatch('getForm', itemlink)
          let formId = form.data.d.Id // Form unlikely needed. itemLink definetely
          payload = form.data.d.__metadata
          //payload.file = file.fileSelected
          payload.name = pdfName
          payload.SecurityFormId = this.id
          await Security.dispatch('updateForm', payload).catch(e => {
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
          // First check to see if there is an entry for the PersonnelID in the Security Form List
          this[this.selectedSecurityFormType].forms.push({
            account: this.selectedSecurityFormType,
            id: formId,
            library: vm.library,
            name: pdfName,
            // task: results.data.d.Id,
            href: vm.libraryUrl + pdfName,
            etag: form.data.d.__metadata.etag,
            uri: form.data.d.__metadata.uri
          })
          // then upload files to replace the formType

          // Replace the files in original form type
          //d[this.formTypes].files =
          // finally, clear d.files to zero and remove from file uploader
        })
      }
      let payload = {}
      if (this.NIPR) {
        payload.NIPR = JSON.stringify(this.NIPR)
      }
      if (this.SIPR) {
        payload.SIPR = JSON.stringify(this.SIPR)
      }
      if (this.DREN) {
        payload.DREN = JSON.stringify(this.DREN)
      }
      if (this.JWICS) {
        payload.JWICS = JSON.stringify(this.JWICS)
      }
      if (this.SCI) {
        payload.SCI = JSON.stringify(this.SCI)
      }
      if (this.CAC) {
        payload.CAC = JSON.stringify(this.CAC)
      }
      payload.CACValid = this.CACValid
      payload.CACRequestDate = this.CACRequestDate ? this.CACRequestDate : null
      payload.CACExpirationDate = this.CACExpirationDate ? this.CACExpirationDate : null
      payload.CACExpiredOnDate = this.CACExpiredOnDate ? this.CACExpiredOnDate : null
      payload.CACTurnedIn = this.CACTurnedIn
      payload.CACIssuedBy = this.CACIssuedBy
      payload.PRDueDate = this.PRDueDate ? this.PRDueDate : null
      payload.CEDate = this.CEDate ? this.CEDate : null
      payload.SCIAccessCheckDate = this.SCIAccessCheckDate
      payload.SCIIndoc = this.SCIIndoc ? this.SCIIndoc : null
      payload.SCIIndocAssistDate = this.SCIIndocAssistDate ? this.SCIIndocAssistDate : null
      payload.SCIAccessCheckDate = this.SCIAccessCheckDate ? this.SCIAccessCheckDate : null
      payload.SCIFormType = this.SCIFormType
      payload.SCIFormSubmitted = this.SCIFormSubmitted ? this.SCIFormSubmitted : null
      payload.SCIStatus = this.SCIStatus
      payload.Active = this.Active
      payload.etag = this.etag
      payload.uri = this.uri
      let result = await Security.dispatch('updateSecurityForm', payload).catch(e => {
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
      // grab a fresh etag for the record
      vm.etag = result.headers.etag
      vm.selectedSecurityFormType = null
      let uploadedFiles = document.querySelector('.e-upload-files')
      if (uploadedFiles) {
        while (uploadedFiles.firstChild) {
          uploadedFiles.removeChild(uploadedFiles.firstChild)
        }
      }
      const notification = {
        type: 'success',
        title: 'Succesfully Updated Security Form',
        message: 'Updated Security form for ' + this.FirstName + ' ' + this.LastName + ' in ' + this.Company,
        push: true
      }
      vm.$store.dispatch('notification/add', notification, { root: true })

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
      let link = '/security/view/' + this.id + '/' + event.currentTarget.dataset.type
      this.$router.push({ path: link })
    },
    async onFileSelect(args) {
      args.filesData.forEach(fileData => {
        let file = {}
        file.fileSelected = fileData.name
        let buffer = vm.getFileBuffer(fileData.rawFile)
        buffer.then(function(buff) {
          file.fileBuffer = buff
          vm.files.push(file)
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
  }
}
</script>
<style lang="scss"></style>
