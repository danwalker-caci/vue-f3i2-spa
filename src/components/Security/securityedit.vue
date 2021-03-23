<template>
  <b-container>
    <b-row>
      <b-col cols="12" class="m-0 p-0">
        <b-card no-body class="p-0">
          <div class="p-1">
            <b-form-row>
              <b-col>
                <b-button @click="$router.push({ path: '/security/tracker' })" variant="secondary">Return to Tracker</b-button>
              </b-col>
              <b-col>
                <b-form-group label="Company: " label-for="company">
                  <b-form-input id="company" v-model="company" value="{{ company }}" disabled />
                </b-form-group>
              </b-col>
              <b-col>
                <b-form-group label="Name: " label-for="name">
                  <b-form-input id="name" v-model="name" value="{{ FirstName }} {{ LastName }}" disabled />
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
              <b-col>
                <b-button v-if="isSecurity || isDeveloper" ref="updateOriginalInfo" variant="success" class="btn-sm float-right" @click="updateForm()">Update</b-button>
              </b-col>
            </b-form-row>
          </div>
          <b-tabs pills content-class="mt-0 p-0">
            <!--<b-tab title="General" active>
              <div class="width-98">
                <b-table-simple small responsive>
                  <b-thead head-variant="dark">
                    <b-tr>
                      <b-th>PR Due Date</b-th>
                      <b-th>CE Date</b-th>
                      <b-th></b-th>
                    </b-tr>
                  </b-thead>
                  <b-tbody>
                    <b-tr>
                      <b-td>
                        <ejs-datepicker :disable="!isSecurity" id="formPR" v-model="PRDueDate"></ejs-datepicker>
                      </b-td>
                      <b-td>
                        <ejs-datepicker :disable="!isSecurity" id="formCE" v-model="CEDate"></ejs-datepicker>
                      </b-td>
                      <b-td>
                        <b-button v-if="isSecurity || isDeveloper" ref="updateOriginalInfo" variant="success" class="btn-sm float-right" @click="updateForm()">Update</b-button>
                      </b-td>
                    </b-tr>
                  </b-tbody>
                </b-table-simple>
              </div>
            </b-tab>-->
            <b-tab title="NIPR" v-if="NIPR && NIPR.forms.length > 0">
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
                <div v-if="NIPR.forms.length > 0">
                  <div v-for="form in NIPR.forms" :key="form.id">
                    <b-form-row class="p-1">
                      <b-embed type="iframe" :src="form.href" allowfullscreen></b-embed>
                    </b-form-row>
                    <b-form-row v-if="form.status !== 'Approved' && form.status !== 'Rejected'">
                      <b-col cols="10"></b-col>
                      <b-col cols="2" v-if="isSecurity" v-bind:id="form.id">
                        <b-button variant="danger" class="formbutton" @click="rejectForm(form)">Reject</b-button>
                        <b-button variant="success" class="formbutton" @click="approveForm(form)">Approve</b-button>
                      </b-col>
                    </b-form-row>
                  </div>
                </div>
              </b-table-simple>
            </b-tab>
            <b-tab title="SIPR" v-if="SIPR && SIPR.forms.length > 0">
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
              <div v-if="SIPR.forms.length > 0">
                <div v-for="form in SIPR.forms" :key="form.id">
                  <b-form-row class="p-1">
                    <b-embed type="iframe" :src="form.href" allowfullscreen></b-embed>
                  </b-form-row>
                  <b-form-row v-if="form.status !== 'Approved' && form.status !== 'Rejected'">
                    <b-col cols="10"></b-col>
                    <!--<b-col cols="2" v-if="isSecurity" v-bind:id="form.id">
                      <b-button variant="danger" class="formbutton" @click="rejectForm(form)">Reject</b-button>
                      <b-button variant="success" class="formbutton" @click="approveForm(form)">Approve</b-button>
                    </b-col>-->
                  </b-form-row>
                </div>
              </div>
            </b-tab>
            <b-tab title="DREN" v-if="DREN && DREN.forms.length > 0">
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
              <div v-if="DREN.forms.length > 0">
                <div v-for="form in DREN.forms" :key="form.id">
                  <b-form-row class="p-1">
                    <b-embed type="iframe" :src="form.href" allowfullscreen></b-embed>
                  </b-form-row>
                  <b-form-row v-if="form.status !== 'Approved' && form.status !== 'Rejected'">
                    <b-col cols="10"></b-col>
                    <!--<b-col cols="2" v-if="isSecurity" v-bind:id="form.id">
                      <b-button variant="danger" class="formbutton" @click="rejectForm(form)">Reject</b-button>
                      <b-button variant="success" class="formbutton" @click="approveForm(form)">Approve</b-button>
                    </b-col>-->
                  </b-form-row>
                </div>
              </div>
            </b-tab>
            <b-tab title="JWICS" v-if="JWICS && JWICS.forms.length > 0">
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
                  <b-tr v-if="JWICS && JWICS.forms.length > 0">
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
                    <b-td><b-button class="btn-sm" @click="viewForms($event)" variant="secondary" :data-link="'JWICS'">View Forms</b-button></b-td>
                  </b-tr>
                </b-tbody>
              </b-table-simple>
              <div v-if="JWICS.forms.length > 0">
                <div v-for="form in JWICS.forms" :key="form.id">
                  <b-form-row class="p-1">
                    <b-embed type="iframe" :src="form.href" allowfullscreen></b-embed>
                  </b-form-row>
                  <b-form-row v-if="form.status !== 'Approved' && form.status !== 'Rejected'">
                    <b-col cols="10"></b-col>
                    <!--<b-col cols="2" v-if="isSecurity" v-bind:id="form.id">
                      <b-button variant="danger" class="formbutton" @click="rejectForm(form)">Reject</b-button>
                      <b-button variant="success" class="formbutton" @click="approveForm(form)">Approve</b-button>
                    </b-col>-->
                  </b-form-row>
                </div>
              </div>
            </b-tab>
            <b-tab title="SCI">
              <b-table-simple small responsive>
                <b-thead head-variant="dark">
                  <b-tr>
                    <b-th>Date Indoctrination Assist Sent</b-th>
                    <b-th>SCI Access Check Date</b-th>
                    <b-th>SCI Indoctrination Date</b-th>
                    <b-th>SCI Form Submitted</b-th>
                    <b-th>SCI Status</b-th>
                    <b-th>SCI Form Type</b-th>
                    <b-th>Submitted Forms</b-th>
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
                      <ejs-dropdownlist id="sciFormType" :disable="!isSecurity" v-model="SCIFormType" :dataSource="formtype" :fields="ddfields"></ejs-dropdownlist>
                    </b-td>
                    <b-td>
                      <b-button class="btn-sm" @click="viewForms($event)" variant="secondary" :data-type="'SCI'">View Forms</b-button>
                    </b-td>
                    <b-td>
                      <!-- Update Button -->
                      <b-button v-if="isSecurity || isDeveloper" ref="updateSCI" variant="success" class="btn-sm" @click="updateForm()">Update</b-button>
                    </b-td>
                  </b-tr>
                </b-tbody>
              </b-table-simple>
              <div v-if="SCI.forms.length > 0">
                <div v-for="form in SCI.forms" :key="form.id">
                  <b-form-row class="p-1">
                    <b-embed type="iframe" :src="form.href" allowfullscreen></b-embed>
                  </b-form-row>
                  <b-form-row v-if="form.status !== 'Approved' && form.status !== 'Rejected'">
                    <b-col cols="10"></b-col>
                    <!--<b-col cols="2" v-if="isSecurity" v-bind:id="form.id">
                      <b-button variant="danger" class="formbutton" @click="rejectForm(form)">Reject</b-button>
                      <b-button variant="success" class="formbutton" @click="approveForm(form)">Approve</b-button>
                    </b-col>-->
                  </b-form-row>
                </div>
              </div>
            </b-tab>
            <b-tab title="CAC">
              <b-table-simple small responsive>
                <b-thead head-variant="dark">
                  <b-tr>
                    <b-th>CAC Status</b-th>
                    <b-th>CAC Issued By</b-th>
                    <b-th>CAC Request Date</b-th>
                    <b-th>CAC Expiration Date</b-th>
                    <b-th>Submitted Form</b-th>
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
                      <b-button class="btn-sm" @click="viewForms($event)" variant="secondary" :data-link="'CAC'">View Forms</b-button>
                    </b-td>
                    <b-td>
                      <!-- Update Button -->
                      <!-- REMOVE DEVELOPER OPTION -->
                      <b-button v-if="isSecurity || isDeveloper" ref="updateCAC" variant="success" :data-id="Id" class="btn-sm" @click="updateForm()">Update</b-button>
                    </b-td>
                  </b-tr>
                </b-tbody>
              </b-table-simple>
              <div v-if="CAC.forms.length > 0">
                <div v-for="form in CAC.forms" :key="form.id">
                  <b-form-row class="p-1">
                    <b-embed type="iframe" :src="form.href" allowfullscreen></b-embed>
                  </b-form-row>
                  <b-form-row v-if="form.status !== 'Approved' && form.status !== 'Rejected'">
                    <b-col cols="10"></b-col>
                    <!--<b-col cols="2" v-if="isSecurity" v-bind:id="form.id">
                      <b-button variant="danger" class="formbutton" @click="rejectForm(form)">Reject</b-button>
                      <b-button variant="success" class="formbutton" @click="approveForm(form)">Approve</b-button>
                    </b-col>-->
                  </b-form-row>
                </div>
              </div>
            </b-tab>
            <b-tab title="Historical CAC" v-if="CACTurnedIn && CACExpiredOnDate">
              <b-table-simple small responsive>
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
      PersonnelID: '',
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
      formtype: [
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
    getUserIDs: async function() {
      this.AccountId = await this.$store.dispatch('support/getAccountUser')
      this.AFRLId = await this.$store.dispatch('support/getAFRLUser')
      this.SecurityId = await this.$store.dispatch('support/getCACSCIUser')
      // console.log(this.$store.state.support.AFRLUserID)
      // console.log(this.$store.state.support.AccountUserID)
      // console.log(this.$store.state.support.CACSCIUserID)
    },
    getForms: async function() {
      // Run query to load the form
      let payload = {
        Id: this.id
      }
      let result = Security.dispatch('getSecurityByPersonnelId', payload).catch(e => {
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
      this.FirstName = result.FirstName
      this.LastName = result.LastName
      this.Company = result.Company
      this.PersonnelID = this.id
      this.CEDate = result.CEDate
      this.SCI = JSON.parse(result.SCI)
      this.SCIStatus = result.SCIStatus
      this.SCIIndoc = this.$moment(result.SCIIndoc).isValid() ? this.$moment(result.SCIIndoc).format('MM/DD/YYYY') : ''
      this.SCIIndocAssistDate = this.$moment(result.SCIIndocAssistDate).isValid() ? this.$moment(result.SCIIndocAssistDate).format('MM/DD/YYYY') : ''
      this.SCIAccessCheckDate = this.$moment(result.SCIAccessCheckDate).isValid() ? this.$moment(result.SCIAccessCheckDate).format('MM/DD/YYYY') : ''
      this.SCIFormType = result.SCIFormType
      this.SCIFormSubmitted = this.$moment(result.SCIFormSubmitted).isValid() ? this.$moment(result.SCIFormSubmitted).format('MM/DD/YYYY') : ''
      this.CAC = JSON.parse(result.CAC)
      this.CACStatus = result.CACStatus
      this.CACRequestDate = this.$moment(result.CACRequestDate).isValid() ? this.$moment(result.CACRequestDate).format('MM/DD/YYYY') : ''
      this.CACExpirationDate = this.$moment(result.CACExpirationDate).isValid() ? this.$moment(result.CACExpirationDate).format('MM/DD/YYYY') : ''
      this.CACIssuedBy = result.CACIssuedBy
      this.CACValid = result.CACValid
      this.CACExpiredOnDate = this.$moment(result.CACExpiredOnDate).isValid() ? this.$moment(result.CACExpiredOnDate).format('MM/DD/YYYY') : ''
      this.CACTurnedIn = result.CACTurnedIn
      this.NIPR = JSON.parse(result.NIPR)
      this.SIPR = JSON.parse(result.SIPR)
      this.DREN = JSON.parse(result.DREN)
      this.JWICS = JSON.parse(result.JWICS)
      await Security.dispatch('getDigest')
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
          for (var nipr = 0; nipr <= this.NIPR.forms.length; nipr++) {
            this.deleteForm(this.NIPR.forms[nipr])
          }
          this.NIPR.forms = []
          break
        case 'SIPR':
          taskId = this.SIPR.task
          this.SIPR.GovCompleteDate = 'Rejected On: ' + this.$moment().format('MM/DD/YYYY')
          for (var sipr = 0; sipr <= this.SIPR.forms.length; sipr++) {
            this.deleteForm(this.SIPR.forms[sipr])
          }
          this.SIPR.forms = []
          break
        case 'DREN':
          taskId = this.DREN.task
          this.DREN.GovCompleteDate = 'Rejected On: ' + this.$moment().format('MM/DD/YYYY')
          for (var dren = 0; dren <= this.DREN.forms.length; dren++) {
            this.deleteForm(this.DREN.forms[dren])
          }
          this.DREN.forms = []
          break
        case 'JWICS':
          taskId = this.JWICS.task // original taskId\
          this.JWICS.GovCompleteDate = 'Rejected On: ' + this.$moment().format('MM/DD/YYYY')
          for (var jwics = 0; jwics <= this.JWICS.forms.length; jwics++) {
            this.deleteForm(this.JWICS.forms[jwics])
          }
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
      await Security.dispatch('updateSecurityForm', payload)
        .then(function(result) {
          // grab a fresh etag for the record
          this.etag = result.headers.etag
          /*Security.dispatch('getSecurityFormByPersonnelId', d.PersonnelId).then(function(response) {
          d.etag = response.etag
        })*/
          const notification = {
            type: 'success',
            title: 'Succesfully Updated Security Form',
            message: 'Updated Security form for ' + this.FirstName + ' ' + this.LastName + ' in ' + this.Company,
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
    }
  }
}
</script>
<style lang="scss"></style>
