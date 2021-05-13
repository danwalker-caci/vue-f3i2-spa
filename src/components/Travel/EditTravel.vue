<template>
  <b-container fluid class="contentHeight m-0 p-0">
    <b-row no-gutters class="contentHeight">
      <b-toast id="form-toast" variant="success" solid no-auto-hide>
        <template v-slot:toast-title>
          <div class="d-flex flex-grow-1 align-items-baseline">
            <b-img blank blank-color="#ff0000" class="mr-2" width="12" height="12"></b-img>
            <strong class="mr-auto">{{ busyTitle }}</strong>
          </div>
        </template>
        <b-spinner style="width: 5rem; height: 5rem;" variant="success" label="Waiting Spinner"></b-spinner>
      </b-toast>
      <b-modal id="EditTravelUser" ref="EditTravelUser" size="xl" centered hide-footer :header-bg-variant="headerBgVariant">
        <template v-slot:modal-title>Add Traveler [Double Click To Add The User]</template>
        <b-container fluid class="p-0">
          <b-row class="m-0">
            <b-col cols="12" class="p-0">
              <b-input-group>
                <b-form-input type="text" placeholder="Search..." class="form-control" v-model="searchinput" v-on:keyup.enter="searchme"></b-form-input>
                <b-input-group-append>
                  <b-button variant="warning" @click.stop="searchme" title="Search">
                    <font-awesome-icon far icon="search" class="icon"></font-awesome-icon>
                  </b-button>
                </b-input-group-append>
              </b-input-group>
            </b-col>
          </b-row>
          <div class="row m-0">
            <div class="col-12 p-0" style="min-height: 500px;">
              <ejs-grid
                id="TravelPersonnelGrid"
                ref="TravelPersonnelGrid"
                :dataSource="pdata"
                :allowPaging="true"
                :allowSorting="true"
                :allowFiltering="true"
                :allowResizing="true"
                :pageSettings="pageSettings"
                :editSettings="editSettings"
                :filterSettings="filterSettings"
                :sortSettings="sortSettings"
                :actionBegin="PersonnelActionBegin"
                rowHeight="20"
                width="100%"
              >
                <e-columns>
                  <e-column field="LastName" headerText="Last" textAlign="Left" width="120"></e-column>
                  <e-column field="FirstName" headerText="First" width="100"></e-column>
                  <e-column field="Position" headerText="Position" textAlign="Left" width="180"></e-column>
                  <e-column field="Email" headerText="Email" textAlign="Left" width="300"></e-column>
                  <e-column field="Phone" headerText="Phone" textAlign="Left" width="100"></e-column>
                  <e-column field="Company" headerText="Company" textAlign="Left" width="250"></e-column>
                  <e-column field="Id" headerText="Id" :visible="false" textAlign="Left" width="40" :isPrimaryKey="true"></e-column>
                </e-columns>
              </ejs-grid>
            </div>
          </div>
        </b-container>
      </b-modal>
      <b-sidebar v-model="ShowIndexPicker" id="IndexPicker" ref="IndexPicker" title="Select Travel Index #" bg-variant="dark" text-variant="light" right>
        <div class="px-3 py-2">
          <b-form-radio-group v-model="travelmodel.IndexNumber" :options="IndexNumbers" name="IndexRadios" stacked @change="IndexNumberChanged"></b-form-radio-group>
        </div>
      </b-sidebar>
      <b-col cols="12" class="m-0 p-0">
        <b-container fluid class="contentHeight m-0 p-0">
          <b-row no-gutters class="bg-black text-white formheader">
            <b-col cols="4" class="p-0 text-center">
              <b-alert v-if="tabInvalid" variant="danger" show class="p-0">{{ InvalidMessage }}</b-alert>
            </b-col>
            <b-col cols="4" class="p-0 text-center">
              <h3 class="text-white">Edit Travel For: {{ travelmodel.Subject }}</h3>
            </b-col>
            <b-col cols="4" class="p-0 text-right"></b-col>
          </b-row>
          <b-row no-gutters class="bg-white formbody">
            <div class="col-12 p-0">
              <b-card no-body>
                <b-tabs ref="dashboardtabs" class="tabArea" card v-model="tabIndex" @activate-tab="onTabSelected">
                  <b-tab class="mtab" active>
                    <template slot="title"
                      ><font-awesome-icon fas icon="cog" class="icon"></font-awesome-icon>
                      Travel Information
                    </template>
                    <b-form>
                      <div class="row">
                        <div class="col-6">OCONUS</div>
                        <div v-if="travelmodel.OCONUS == 'Yes'" class="col-6">OCONUS Location</div>
                        <div v-else class="col-6"></div>
                      </div>
                      <div class="row">
                        <div class="col-6">
                          <!-- <b-form-checkbox v-model="travelmodel.InternalData.OCONUSTravel" value="Yes" unchecked-value="No" switch @change="onOCONUSSelected"></b-form-checkbox> -->
                          <b-form-radio-group v-model="travelmodel.OCONUS" name="oconus-radios" :options="yesno" :state="ValidateMe('OCONUS')" @change="onOCONUSSelected">
                            <b-form-invalid-feedback :state="ValidateMe('OCONUS')">
                              Must Select OCONUS Yes or No
                            </b-form-invalid-feedback>
                          </b-form-radio-group>
                        </div>
                        <div v-if="travelmodel.OCONUS == 'Yes'" class="col-6">
                          <!-- <b-form-select class="form-control-sm form-control-travel" v-model="travelmodel.OCONUSLocation" :options="locations" :state="ValidateMe('OL')" ref="OCONUSLocation"></b-form-select> -->
                          <b-form-radio-group v-model="travelmodel.OCONUSLocation" :options="locations" name="location-radios" :state="ValidateMe('LOCATION')">
                            <b-form-invalid-feedback :state="ValidateMe('LOCATION')">
                              Must Select OCONUS Location
                            </b-form-invalid-feedback>
                          </b-form-radio-group>
                        </div>
                        <div v-else class="col-6"></div>
                      </div>
                      <div class="row">
                        <div class="col-12">Subject</div>
                      </div>
                      <div class="row">
                        <div class="col-12"><b-form-input class="form-control-sm form-control-travel" v-model="travelmodel.Subject" :state="ValidateMe('Subject')" ref="Subject"></b-form-input></div>
                        <b-form-invalid-feedback>
                          Enter a subject for this travel request
                        </b-form-invalid-feedback>
                      </div>
                      <div class="row">
                        <div class="col-4">Company</div>
                        <div class="col-4">WorkPlan</div>
                        <div class="col-4" v-if="isWPManager">Index #</div>
                        <div class="col-4" v-else></div>
                      </div>
                      <div class="row">
                        <div v-if="isSubcontractor" class="col-4">
                          <b-form-input class="form-control-sm form-control-travel" disabled v-model="travelmodel.Company" :state="ValidateMe('Company')" ref="Company"></b-form-input>
                        </div>
                        <div v-else class="col-4">
                          <b-form-select class="form-control-sm form-control-travel" v-model="travelmodel.Company" :options="companies" :state="ValidateMe('Company')" ref="Company" @change="onCompanySelected"></b-form-select>
                          <b-form-invalid-feedback>
                            Please Select A Company
                          </b-form-invalid-feedback>
                        </div>
                        <div class="col-4">
                          <b-form-select class="form-control-sm form-control-travel" v-model="travelmodel.WorkPlanNumber" :options="workplans" :state="ValidateMe('WorkPlan')" ref="WorkPlan" @change="onWorkplanSelected"></b-form-select>
                          <b-form-invalid-feedback>
                            Please Select A WorkPlan
                          </b-form-invalid-feedback>
                        </div>
                        <div class="col-4" v-if="isWPManager">
                          <b-input-group>
                            <b-form-input disabled class="form-control-sm form-control-travel" v-model="travelmodel.IndexNumber" :state="ValidateMe('IndexNumber')" ref="IndexNumber"></b-form-input>
                            <b-input-group-append v-if="travelmodel.WorkPlanNumber != ''">
                              <b-button v-b-tooltip.hover.v-dark title="use next available index number" class="form-control-sm form-control-travel" variant="outline-success" @click="AutoIndex">Auto</b-button>
                              <b-button v-b-tooltip.hover.v-dark title="select an existing index number" class="form-control-sm form-control-travel" variant="info" @click="SelectIndex">Select Existing</b-button>
                            </b-input-group-append>
                          </b-input-group>
                        </div>
                        <div class="col-4" v-else></div>
                      </div>
                      <div class="row">
                        <div class="col-6">Start Date</div>
                        <div class="col-6">End Date</div>
                      </div>
                      <div class="row">
                        <div class="col-6">
                          <b-form-input class="form-control-sm form-control-travel form-control-travel-date" v-model="travelmodel.StartTime" ref="start" type="date" title="Start" :state="ValidateMe('start')"></b-form-input>
                          <b-form-invalid-feedback>
                            Enter a valid date (mm/dd/yyyy)
                          </b-form-invalid-feedback>
                        </div>
                        <div class="col-6">
                          <b-form-input class="form-control-sm form-control-travel form-control-travel-date" v-model="travelmodel.EndTime" ref="end" type="date" title="End" :state="ValidateMe('end')"></b-form-input>
                          <b-form-invalid-feedback v-if="BadEndDate === true">
                            Enter a valid date (mm/dd/yyyy)
                          </b-form-invalid-feedback>
                          <b-form-invalid-feedback v-if="EndBeforeStart === true">
                            End Date cannot be before Start Date
                          </b-form-invalid-feedback>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-6">Traveling From</div>
                        <div class="col-6">Traveling To</div>
                      </div>
                      <div class="row">
                        <div class="col-6">
                          <b-form-input class="form-control-sm form-control-travel" v-model="travelmodel.TravelFrom" :state="ValidateMe('TravelFrom')" ref="TravelFrom"></b-form-input>
                          <b-form-invalid-feedback>
                            Enter City, State or Country
                          </b-form-invalid-feedback>
                        </div>
                        <div class="col-6">
                          <b-form-input class="form-control-sm form-control-travel" v-model="travelmodel.TravelTo" :state="ValidateMe('TravelTo')" ref="TravelTo"></b-form-input>
                          <b-form-invalid-feedback>
                            Enter City, State or Country
                          </b-form-invalid-feedback>
                        </div>
                      </div>
                    </b-form>
                  </b-tab>
                  <b-tab class="mtab">
                    <template slot="title"
                      ><font-awesome-icon fas icon="user" class="icon"></font-awesome-icon>
                      Traveler Details
                    </template>
                    <b-form>
                      <b-table id="TravelersTable" ref="TravelersTable" responsive v-model="travelerData" :striped="striped" :bordered="bordered" :small="small" :hover="hover" :items="travelmodel.Travelers" :fields="fields" style="table-layout: fixed;">
                        <template v-slot:cell(actions)="data">
                          <b-button size="sm" class="actionbutton" @click="deleteme(data.index)" title="Delete Traveler">
                            <font-awesome-icon far icon="trash" class="icon" :style="{ color: 'red' }"></font-awesome-icon>
                          </b-button>
                        </template>
                        <template v-slot:cell(firstName)="data">
                          <b-form-input class="form-control-sm form-control-travel" v-model="travelerData[data.index].firstName" v-bind:id="getRef('trvlfirstName', data.index)" title="First Name"></b-form-input>
                        </template>
                        <template v-slot:cell(lastName)="data">
                          <b-form-input class="form-control-sm form-control-travel" v-model="travelerData[data.index].lastName" v-bind:id="getRef('trvllastName', data.index)" title="Last Name"></b-form-input>
                        </template>
                        <template v-slot:cell(email)="data">
                          <b-form-input class="form-control-sm form-control-travel" v-model="travelerData[data.index].email" v-bind:id="getRef('trvlemail', data.index)" title="Email"></b-form-input>
                        </template>
                        <template v-slot:cell(phone)="data">
                          <b-form-input class="form-control-sm form-control-travel" v-model="travelerData[data.index].phone" v-bind:id="getRef('trvlphone', data.index)" title="Phone"></b-form-input>
                        </template>
                      </b-table>
                    </b-form>
                    <div class="row">
                      <div cols="12">
                        <b-button size="sm" @click="btnAddTraveler" variant="success">Add Traveler</b-button>
                      </div>
                    </div>
                  </b-tab>
                  <b-tab class="mtab">
                    <template slot="title"
                      ><font-awesome-icon fas icon="info-circle" class="icon"></font-awesome-icon>
                      Additional Info
                    </template>
                    <b-form>
                      <div class="row">
                        <div class="col">Gov Sponsor</div>
                        <div class="col">Estimated Cost</div>
                      </div>
                      <div class="row">
                        <div class="col">
                          <b-form-input class="form-control-sm form-control-travel" v-model="travelmodel.Sponsor" ref="Sponsor" :state="ValidateMe('Sponsor')"></b-form-input>
                          <b-form-invalid-feedback>
                            Enter a valid Sponsor.
                          </b-form-invalid-feedback>
                        </div>
                        <div class="col">
                          <b-form-input class="form-control-sm form-control-travel" v-model="travelmodel.EstimatedCost" ref="EstimatedCost" :state="ValidateMe('EstimatedCost')"></b-form-input>
                          <b-form-invalid-feedback>
                            Numbers only
                          </b-form-invalid-feedback>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-12">Purpose</div>
                      </div>
                      <div class="row">
                        <div class="col-12">
                          <b-form-textarea
                            class="form-control-sm form-control-travel-textarea"
                            v-model="travelmodel.Comments"
                            placeholder="Please enter 1-2 sentences to describe what is to be accomplished by taking this trip and why it is beneficial to the government.  Spell out all acronyms."
                            rows="3"
                            max-rows="6"
                            ref="Comments"
                            :state="ValidateMe('Comments')"
                          ></b-form-textarea>
                          <b-form-invalid-feedback>
                            Not properly filled out.
                          </b-form-invalid-feedback>
                        </div>
                      </div>
                    </b-form>
                  </b-tab>
                  <b-tab class="mtab">
                    <template slot="title"
                      ><font-awesome-icon fas icon="user-shield" class="icon"></font-awesome-icon>
                      Security Info
                    </template>
                    <b-form>
                      <div class="row">
                        <div class="col">Visit Request</div>
                        <div class="col" v-if="travelmodel.VisitRequest === 'Yes'">Clearance</div>
                        <div class="col" v-if="isSecurity">Security Action</div>
                        <div class="col" v-if="isSecurity">Security Action Completed</div>
                      </div>
                      <div class="row">
                        <div class="col">
                          <b-form-checkbox v-model="travelmodel.VisitRequest" value="Yes" unchecked-value="No" ref="VisitRequest" switch>Required</b-form-checkbox>
                        </div>
                        <div class="col" v-if="travelmodel.VisitRequest === 'Yes'">
                          <div v-if="!isSubcontractor">
                            <b-form-select class="form-control-sm form-control-travel float-left" v-model="travelmodel.Clearance" :options="levels" ref="Clearance" :state="ValidateMe('Clearance')"></b-form-select>
                          </div>
                          <div v-if="isSubcontractor">
                            <b-form-select class="form-control-sm form-control-travel float-left" v-model="travelmodel.Clearance" :options="subcontractorLevels" ref="Clearance" :state="ValidateMe('Clearance')"></b-form-select>
                          </div>
                          <b-form-invalid-feedback>
                            Please select a valid option
                          </b-form-invalid-feedback>
                        </div>
                        <div class="col" v-if="isSecurity">
                          <b-form-select class="form-control-sm form-control-travel float-left" v-model="travelmodel.SecurityAction" :options="actions" ref="SecurityAction"></b-form-select>
                        </div>
                        <div class="col" v-if="isSecurity">
                          <b-form-input class="form-control-sm form-control-travel form-control-travel-date" v-model="travelmodel.SecurityActionCompleted" ref="SecurityActionCompleted" type="date" title="SecurityActionCompleted"></b-form-input>
                        </div>
                      </div>
                      <div v-if="travelmodel.VisitRequest === 'Yes'" class="row">
                        <div class="col">Government POC Name</div>
                        <div class="col">Government POC Email</div>
                        <div class="col">Government POC Phone</div>
                      </div>
                      <div v-if="travelmodel.VisitRequest === 'Yes'" class="row">
                        <div class="col">
                          <b-form-input class="form-control-sm form-control-travel" v-model="travelmodel.POCName" ref="POCName" :state="ValidateMe('POCName')"></b-form-input>
                          <b-form-invalid-feedback>
                            Enter a Name
                          </b-form-invalid-feedback>
                        </div>
                        <div class="col">
                          <b-form-input class="form-control-sm form-control-travel" v-model="travelmodel.POCEmail" ref="POCEmail" :state="ValidateMe('POCEmail')"></b-form-input>
                          <b-form-invalid-feedback>
                            Invalid email address
                          </b-form-invalid-feedback>
                        </div>
                        <div class="col">
                          <b-form-input class="form-control-sm form-control-travel" v-model="travelmodel.POCPhone" ref="POCPhone" :state="ValidateMe('POCPhone')"></b-form-input>
                          <b-form-invalid-feedback>
                            (###)-###-#### Format
                          </b-form-invalid-feedback>
                        </div>
                      </div>
                    </b-form>
                  </b-tab>
                  <b-tab class="mtab">
                    <template slot="title"
                      ><font-awesome-icon fas icon="traffic-light" class="icon"></font-awesome-icon>
                      Summary
                    </template>
                    <table id="SummaryTable" class="summarytable">
                      <tbody>
                        <tr class="bg-warning text-white">
                          <td colspan="4">Subject</td>
                          <td>Travel Index</td>
                        </tr>
                        <tr>
                          <td colspan="4">{{ travelmodel.Subject }}</td>
                          <td>{{ travelmodel.IndexNumber }}</td>
                        </tr>
                        <tr class="bg-warning text-white">
                          <td colspan="2">Company</td>
                          <td colspan="3">WorkPlan</td>
                        </tr>
                        <tr>
                          <td colspan="2">{{ travelmodel.Company }}</td>
                          <td colspan="3">{{ travelmodel.WorkPlanText }}</td>
                        </tr>
                        <tr class="bg-warning text-white">
                          <td>Start Date</td>
                          <td>End Date</td>
                          <td>Traveling From</td>
                          <td>Traveling To</td>
                          <td>Estimated Cost</td>
                        </tr>
                        <tr>
                          <td>{{ travelmodel.StartTime }}</td>
                          <td>{{ travelmodel.EndTime }}</td>
                          <td>{{ travelmodel.TravelFrom }}</td>
                          <td>{{ travelmodel.TravelTo }}</td>
                          <td>${{ travelmodel.EstimatedCost }}</td>
                        </tr>
                        <tr class="bg-warning text-white">
                          <td>Gov Sponsor</td>
                          <td>Gov POC Name</td>
                          <td colspan="2">Gov POC Email</td>
                          <td>Gov POC Phone</td>
                        </tr>
                        <tr>
                          <td>{{ travelmodel.Sponsor }}</td>
                          <td>{{ travelmodel.POCName }}</td>
                          <td colspan="2">{{ travelmodel.POCEmail }}</td>
                          <td>{{ travelmodel.POCPhone }}</td>
                        </tr>
                        <tr class="bg-warning text-white">
                          <td colspan="3">Purpose</td>
                          <td>Visit Request</td>
                          <td>Required Clearance</td>
                        </tr>
                        <tr>
                          <td colspan="3">{{ travelmodel.Comments }}</td>
                          <td>{{ travelmodel.VisitRequest }}</td>
                          <td>{{ travelmodel.Clearance }}</td>
                        </tr>
                        <tr>
                          <td colspan="5">
                            <table class="summarytable">
                              <thead>
                                <tr class="bg-warning text-white">
                                  <td colspan="4">Travelers</td>
                                </tr>
                              </thead>
                              <tbody>
                                <tr class="bg-warning text-white">
                                  <th>First Name</th>
                                  <th>Last Name</th>
                                  <th>Email</th>
                                  <th>Phone</th>
                                </tr>
                                <tr v-for="traveler in travelmodel.Travelers" :key="traveler">
                                  <td>{{ traveler.firstName }}</td>
                                  <td>{{ traveler.lastName }}</td>
                                  <td>{{ traveler.email }}</td>
                                  <td>{{ traveler.phone }}</td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </b-tab>
                  <b-tab :disabled="!isTravelApprover" class="mtab">
                    <template slot="title">
                      <font-awesome-icon fas icon="thumbs-up" class="icon"></font-awesome-icon>
                      Approvals
                    </template>
                    <b-form>
                      <b-card no-body>
                        <b-tabs class="tabArea" card>
                          <b-tab v-if="travelmodel.Status == 'Denied'" class="mtab" active>
                            <template slot="title">
                              <font-awesome-icon fas icon="times-circle" class="icon"></font-awesome-icon>
                              Denied
                            </template>
                            <b-row v-if="travelmodel.InternalData.Status == 'Denied'" class="mb-1">
                              <b-col cols="4">Denied Reason</b-col>
                              <b-col cols="8">
                                <b-form-textarea class="form-control-sm form-control-travel" readonly v-model="travelmodel.InternalData.DenialComments"></b-form-textarea>
                              </b-col>
                            </b-row>
                            <b-row v-if="travelmodel.InternalData.Status == 'Denied'" class="mb-1">
                              <b-col v-if="isWPManager" cols="4">Denied For Admin Reasons</b-col>
                              <b-col v-if="isWPManager" cols="8">
                                <b-form-radio-group v-model="travelmodel.InternalData.DeniedForAdmin" name="DeniedForAdmin-radios">
                                  <b-form-radio value="Yes">Yes</b-form-radio>
                                  <b-form-radio value="No">No</b-form-radio>
                                </b-form-radio-group>
                              </b-col>
                            </b-row>
                            <b-row v-if="travelmodel.InternalData.DeniedForAdmin == 'Yes'" class="mb-1">
                              <b-col cols="4">Required Corrections</b-col>
                              <b-col cols="8">
                                <b-form-textarea rows="6" v-model="travelmodel.InternalData.RequiredCorrections"></b-form-textarea>
                              </b-col>
                            </b-row>
                          </b-tab>
                          <b-tab v-if="travelmodel.Status != 'Denied'" class="mtab" active>
                            <template slot="title">
                              <font-awesome-icon fas icon="cog" class="icon"></font-awesome-icon>
                              CACI Approvals
                              <font-awesome-icon id="travelApproversHelp" fas icon="question-circle" class="icon" @click="showApprovalHelp = !showApprovalHelp"></font-awesome-icon>
                              <b-tooltip target="travelApproversHelp" triggers="hover">
                                Show helpful video on Travel Approvals.
                              </b-tooltip>
                            </template>
                            <b-row v-show="showApprovalHelp" class="mb-1">
                              <video width="100%" controls>
                                <source src="/sites/f3i2/TrainingVideos/Travel%20Approval.mp4" type="video/mp4" />
                                Your Browser does not support this video.
                              </video>
                              <b-button size="sm" class="helpHide" @click="showApprovalHelp = !showApprovalHelp" variant="primary">Hide</b-button>
                            </b-row>
                            <b-row v-if="travelmodel.InternalData.OCONUSTravel !== 'Yes'" class="mb-1">
                              <b-col cols="4">PreApproved</b-col>
                              <b-col cols="8">
                                <b-form-radio-group v-model="travelmodel.InternalData.PreApproved" name="preapproved-radios">
                                  <b-form-radio value="Yes">Yes</b-form-radio>
                                  <b-form-radio value="No">No</b-form-radio>
                                </b-form-radio-group>
                              </b-col>
                            </b-row>
                            <b-row class="mb-1">
                              <b-col v-if="isWPManager" cols="4">Request Travel Approval</b-col>
                              <b-col v-if="isWPManager" cols="8">
                                <b-form-radio-group v-model="travelmodel.InternalData.ApprovalRequested" name="approvalrequest-radios">
                                  <b-form-radio value="Yes">Yes</b-form-radio>
                                  <b-form-radio value="No">No</b-form-radio>
                                </b-form-radio-group>
                              </b-col>
                            </b-row>
                            <b-row class="mb-1">
                              <b-col cols="4">Reject</b-col>
                              <b-col cols="8">
                                <b-form-radio-group v-model="travelmodel.InternalData.Rejected" name="reject-radios">
                                  <b-form-radio value="Yes">Yes</b-form-radio>
                                  <b-form-radio value="No">No</b-form-radio>
                                </b-form-radio-group>
                              </b-col>
                            </b-row>
                            <b-row v-if="travelmodel.InternalData.Rejected == 'Yes'" class="mb-1">
                              <b-col cols="4">Reject Reason</b-col>
                              <b-col cols="8">
                                <b-form-textarea class="form-control-sm form-control-travel" v-model="travelmodel.InternalData.RejectedComments"></b-form-textarea>
                              </b-col>
                            </b-row>
                            <b-row v-if="travelmodel.InternalData.OCONUSTravel == 'Yes'" class="mb-1">
                              <b-col v-if="isWPManager" cols="4">Request Authorization To Proceed</b-col>
                              <b-col v-if="isWPManager" cols="8">
                                <b-form-radio-group v-model="travelmodel.InternalData.ATPRequested" name="atprequest-radios">
                                  <b-form-radio value="Yes">Yes</b-form-radio>
                                  <b-form-radio value="No">No</b-form-radio>
                                </b-form-radio-group>
                              </b-col>
                            </b-row>
                            <b-row v-if="travelmodel.InternalData.ApprovalRequested == 'Yes'" class="mb-1">
                              <b-col v-if="isWPManager" cols="4">Select Approver</b-col>
                              <b-col v-if="isWPManager" cols="8">
                                <!-- <b-form-select multiple select-size="8" v-model="travelmodel.InternalData.ApproverSelected" :options="govTrvlApprovers"></b-form-select> -->
                                <b-form-checkbox-group v-model="travelmodel.InternalData.ApproverSelected" stacked :options="govTrvlApprovers" name="selectedapprovers"></b-form-checkbox-group>
                              </b-col>
                            </b-row>
                          </b-tab>
                          <b-tab v-if="travelmodel.Status != 'Denied'" class="mtab">
                            <template slot="title">
                              <font-awesome-icon fas icon="cog" class="icon"></font-awesome-icon>
                              Government Approvals
                            </template>
                            <b-row v-if="travelmodel.InternalData.ATPRequested == 'Yes'" class="mb-1">
                              <b-col cols="4">Authorization To Proceed</b-col>
                              <b-col cols="8">
                                <b-form-radio-group v-model="travelmodel.InternalData.ATP" name="atprequest-radios">
                                  <b-form-radio value="Yes" @change="ATPChanged">Yes</b-form-radio>
                                  <b-form-radio value="No" @change="ATPDeniedChanged">No</b-form-radio>
                                </b-form-radio-group>
                              </b-col>
                            </b-row>
                            <b-row v-if="travelmodel.InternalData.ATP == 'Yes'" class="mb-1">
                              <b-col cols="4">Authorization Granted By</b-col>
                              <b-col cols="8"><b-form-input class="form-control-sm form-control-travel" v-model="travelmodel.InternalData.ATPGrantedBy"></b-form-input></b-col>
                            </b-row>
                            <b-row v-if="travelmodel.InternalData.ATP == 'Yes'" class="mb-1">
                              <b-col cols="4">Authorization Granted On</b-col>
                              <b-col cols="8"><b-form-input class="form-control-sm form-control-travel form-control-travel-date" v-model="travelmodel.InternalData.ATPGrantedOn" type="date"></b-form-input></b-col>
                            </b-row>
                            <b-row v-if="travelmodel.InternalData.ATP == 'No'" class="mb-1">
                              <b-col cols="4">Authorization Denied By</b-col>
                              <b-col cols="8"><b-form-input class="form-control-sm form-control-travel" v-model="travelmodel.InternalData.ATPDeniedBy"></b-form-input></b-col>
                            </b-row>
                            <b-row v-if="travelmodel.InternalData.ATP == 'No'" class="mb-1">
                              <b-col cols="4">Authorization Denied On</b-col>
                              <b-col cols="8"><b-form-input class="form-control-sm form-control-travel form-control-travel-date" v-model="travelmodel.InternalData.ATPDeniedOn" type="date"></b-form-input></b-col>
                            </b-row>
                            <b-row v-if="travelmodel.InternalData.ATP == 'No'" class="mb-1">
                              <b-col cols="4">Authorization Denial Comments</b-col>
                              <b-col cols="8"><b-form-textarea class="form-control-sm form-control-travel" v-model="travelmodel.InternalData.ATPDenialComments"></b-form-textarea></b-col>
                            </b-row>
                            <b-row v-if="travelmodel.InternalData.ApprovalRequested == 'Yes' || travelmodel.InternalData.ApprovalRequested == 'No'" class="mb-1">
                              <b-col cols="4">Approval</b-col>
                              <b-col cols="8">
                                <b-form-radio-group v-model="travelmodel.InternalData.Approval" name="approval-radios">
                                  <b-form-radio value="Yes" @change="ApprovedChanged">Yes</b-form-radio>
                                  <b-form-radio value="No" @change="DeniedChanged">No</b-form-radio>
                                </b-form-radio-group>
                              </b-col>
                            </b-row>
                            <b-row v-if="travelmodel.InternalData.Approval == 'Yes'" class="mb-1">
                              <b-col cols="4">Travel Approved By</b-col>
                              <b-col cols="8"><b-form-input class="form-control-sm form-control-travel" v-model="travelmodel.InternalData.ApprovedBy"></b-form-input></b-col>
                            </b-row>
                            <b-row v-if="travelmodel.InternalData.Approval == 'Yes'" class="mb-1">
                              <b-col cols="4">Travel Approved On</b-col>
                              <b-col cols="8"><b-form-input class="form-control-sm form-control-travel form-control-travel-date" v-model="travelmodel.InternalData.ApprovedOn" type="date"></b-form-input></b-col>
                            </b-row>
                            <b-row v-if="travelmodel.InternalData.Approval == 'No'" class="mb-1">
                              <b-col cols="4">Travel Denied By</b-col>
                              <b-col cols="8"><b-form-input class="form-control-sm form-control-travel" v-model="travelmodel.InternalData.DeniedBy"></b-form-input></b-col>
                            </b-row>
                            <b-row v-if="travelmodel.InternalData.Approval == 'No'" class="mb-1">
                              <b-col cols="4">Travel Denied On</b-col>
                              <b-col cols="8"><b-form-input class="form-control-sm form-control-travel form-control-travel-date" v-model="travelmodel.InternalData.DeniedOn" type="date"></b-form-input></b-col>
                            </b-row>
                            <b-row v-if="travelmodel.InternalData.Approval == 'No'" class="mb-1">
                              <b-col cols="4">Travel Denial Comments</b-col>
                              <b-col cols="8"><b-form-textarea class="form-control-sm form-control-travel" v-model="travelmodel.InternalData.DenialComments"></b-form-textarea></b-col>
                            </b-row>
                          </b-tab>
                        </b-tabs>
                      </b-card>
                    </b-form>
                  </b-tab>
                </b-tabs>
              </b-card>
            </div>
          </b-row>
          <b-row no-gutters class="bg-black formfooter">
            <div class="col-4 p-0 text-left">
              <b-button-group class="mt-2">
                <b-button v-if="isWPManager && !isAFRL && !iSubcontractor" variant="info" @click="emailTravelPOC" class="mr-2 p-1">Email Travel POC</b-button>
                <b-button v-if="isWPManager && travelmodel.OCONUS == 'Yes'" variant="info" @click="emailTravelDocs" class="p-1">Email Travel Documents</b-button>
                <a ref="TPOCLink" :href="'mailto:' + travelmodel.CreatedByEmail" v-show="false">{{ travelmodel.CreatedBy }}</a>
                <a ref="DocsLink" v-bind:href="generateDocsLink()" v-show="false">Travel Documents</a>
              </b-button-group>
            </div>
            <div class="col-4 p-0 text-center">
              <b-button-group class="mt-2">
                <b-button variant="primary" v-if="tabIndex > 0" ref="btnPrev" @click="tabIndex--" class="mr-2 text-white">Previous</b-button>
                <b-button variant="primary" v-if="tabIndex < 5" ref="btnNext" @click="tabIndex++" class="text-white">Next</b-button>
              </b-button-group>
            </div>
            <div class="col-4 p-0 text-right">
              <b-button-group class="mt-2">
                <b-button variant="danger" ref="btnCancel" class="mr-2" @click="onModalHide">Cancel</b-button>
                <b-button v-if="formValid" variant="success" ref="btnOk" class="ml-2" @click="verifyModalSave">Submit</b-button>
                <a ref="EmailLink" href="#" v-show="false">Email</a>
              </b-button-group>
            </div>
          </b-row>
        </b-container>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import Vue from 'vue'
import moment from 'moment'
import axios from 'axios'
import { EventBus } from '../../main'
import Todo from '@/models/Todo'
import User from '@/models/User'
import Travel from '@/models/Travel'
import Personnel from '@/models/Personnel'
import Workplan from '@/models/WorkPlan'
import Company from '@/models/Company'
import { Page, Sort, Filter, Edit, Resize, Reorder, ColumnMenu, Toolbar } from '@syncfusion/ej2-vue-grids'

let vm = null

let SPCI = null
if (window._spPageContextInfo) {
  SPCI = window._spPageContextInfo
}

let url = SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Travel')/items?$orderby=IndexNumber&$select=IndexNumber&$filter=(WorkPlanNumber eq '"

export default {
  name: 'EditTravel',
  props: {
    mode: {
      type: String,
      default: 'default'
    },
    TripId: {
      type: Number
    }
  },
  provide: {
    grid: [Page, Sort, Filter, Edit, Reorder, Resize, ColumnMenu, Toolbar]
  },
  computed: {
    emailRequired() {
      return Travel.getters('emailRequired')
    },
    triploaded() {
      return Travel.getters('triploaded')
    },
    selectedtrip() {
      return Travel.getters('selectedtrip')
    },
    personnel() {
      return Personnel.getters('allPersonnel')
    },
    workplans() {
      return Workplan.getters('DropDown')
    },
    companies() {
      return Company.getters('DropDown')
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
    isSubcontractor() {
      return User.getters('isSubcontractor')
    },
    isTravelApprover() {
      return User.getters('isTravelApprover')
    },
    pca() {
      return this.$store.state.database.travel.pca
    },
    delegates() {
      return this.$store.state.database.travel.delegates
    },
    govTrvlApprovers() {
      return this.$store.state.database.travel.govapprovers
    }
  },
  mounted: function() {
    console.log('EditTravel Mounted')
    this.$nextTick(function() {
      try {
        Todo.dispatch('getDigest')
        Travel.dispatch('getDigest')
        Travel.dispatch('getDelegates')
        Travel.dispatch('getGetGovTrvlApprovers')
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
      this.company = this.currentuser[0].Company
      vm = this
      try {
        let payload = {}
        if (this.$route) {
          let idx = this.$route.query.id
          console.log('idx: ' + idx)
          if (idx === undefined || idx === null) {
            console.log('TEST B')
            payload.id = vm.TripId
          } else {
            console.log('TEST A')
            payload.id = idx
          }
          console.log('PAYLOAD ID: ' + payload.id)
        } else {
          payload.id = vm.TripId
        }
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
    })
  },
  data: function() {
    return {
      busyTitle: 'Getting Trip Data. Please Wait.',
      isDenied: false,
      actionselected: false,
      company: null,
      searchinput: '',
      newindex: null,
      editing: false,
      EndBeforeStart: null,
      BadEndDate: null,
      pdata: [],
      IndexNumbers: [],
      UniqueIndexes: 0,
      TravelCount: 0,
      ShowIndexPicker: false,
      tabIndex: 0,
      tabInvalid: false,
      InvalidMessage: 'Not all fields are filled out correctly.',
      headerBgVariant: 'dark',
      showApprovalHelp: false,
      isAuthor: false,
      travelmodel: {
        id: 0,
        Status: '',
        WorkPlan: '',
        WorkPlanText: '',
        WorkPlanNumber: '',
        OriginalWorkPlanNumber: '',
        OCONUS: '',
        OCONUSLocation: '',
        OCONUSRequest: '',
        OCONUSApprovedBy: '',
        OCONUSApprovedOn: '',
        PreApproved: '',
        RequestApproval: '',
        Approval: '',
        WorkPlanData: '',
        Company: '',
        Subject: '',
        StartTime: 'Enter A Valid Date',
        EndTime: 'Enter A Valid Date',
        TravelFrom: '',
        TravelTo: '',
        Travelers: [],
        Sponsor: '',
        POCName: '',
        POCEmail: '',
        POCPhone: '',
        Comments: '',
        Clearance: '',
        InternalData: {
          Status: '',
          PreApproved: '',
          OCONUSTravel: '',
          OCONUSLocation: '',
          Rejected: '',
          RejectedComments: '',
          DeniedForAdmin: '',
          RequiredCorrections: '',
          ApprovalRequested: '',
          ApproverSelected: [],
          Approval: '',
          ApprovedBy: '',
          ApprovedOn: '',
          DeniedBy: '',
          DeniedOn: '',
          DenialComments: '',
          ATPRequested: '',
          ATP: '',
          ATPGrantedBy: '',
          ATPGrantedOn: '',
          ATPDeniedBy: '',
          ATPDeniedOn: '',
          ATPDenialComments: '',
          ManagerEmail: '',
          date: moment().format('MM/DD/YYYY')
        },
        VisitRequest: '',
        SecurityAction: '',
        SecurityActionCompleted: '',
        EstimatedCost: '',
        IndexNumber: '',
        CreatedBy: '',
        CreatedByEmail: '',
        etag: '',
        uri: ''
      },
      pageSettings: { pageSize: 30 },
      editSettings: {
        allowEditing: true,
        allowAdding: false,
        allowDeleting: false,
        mode: 'Dialog'
      },
      sortSettings: {
        columns: [{ field: 'LastName', direction: 'Ascending' }]
      },
      toolbarSettings: {
        items: [
          'Bold',
          'Italic',
          'Underline',
          'Outdent',
          'Indent',
          '|',
          'ClearFormat',
          'Print',
          /* 'SourceCode',
          'FullScreen', */
          '|',
          'Undo',
          'Redo'
        ]
      },
      filterSettings: { type: 'Menu' },
      fieldsFirstTab: ['WorkPlan', 'Company', 'start', 'end', 'TravelFrom', 'TravelTo', 'IndexNumber'],
      fieldsFirstTabAuthor: ['WorkPlan', 'Company', 'start', 'end', 'TravelFrom', 'TravelTo'],
      fieldsThirdTab: ['Sponsor', 'EstimatedCost', 'Comments'],
      fieldsFourthTab: ['Clearance', 'POCName', 'POCEmail', 'POCPhone'],
      travelerData: [],
      ManagerEmail: null,
      formValid: false,
      fields: [
        {
          key: 'actions',
          label: 'Action',
          thClass: 'bg-warning text-white text-center px40'
        },
        {
          key: 'firstName',
          label: 'First Name',
          thClass: 'bg-warning text-white text-center px80'
        },
        {
          key: 'lastName',
          label: 'Last Name',
          thClass: 'bg-warning text-white text-center px80'
        },
        {
          key: 'email',
          label: 'Email',
          thClass: 'bg-warning text-white text-center px200'
        },
        {
          key: 'phone',
          label: 'Phone',
          thClass: 'bg-warning text-white text-center px100'
        }
      ],
      levels: [
        { value: 'None', text: 'None' },
        { value: 'S', text: 'S' },
        { value: 'TS', text: 'TS' },
        { value: 'TSSCI', text: 'TS/SCI' }
      ],
      subcontractorLevels: [
        { value: 'None', text: 'None' },
        { value: 'TSSCI', text: 'TS/SCI' }
      ],
      yesno: [
        { value: 'Yes', text: 'Yes' },
        { value: 'No', text: 'No' }
      ],
      approval: [
        { value: 'Approved', text: 'Approve' },
        { value: 'Denied', text: 'Deny' }
      ],
      grant: [
        { value: 'Granted', text: 'Grant' },
        { value: 'Denied', text: 'Deny' }
      ],
      locations: [
        { value: 'Germany', text: 'Germany' },
        { value: 'Korea', text: 'Korea' }
      ],
      actions: [
        { text: 'Select...', value: 'S' },
        { text: 'Collateral VR Sent', value: 'Collateral VR Sent' },
        { text: 'SCI VR Sent', value: 'SCI VR Sent' },
        { text: 'Verified VR Processed in JPAS', value: 'Verified VR Processed in JPAS' },
        { text: 'Contacted Sub FSO', value: 'Contacted Sub FSO' }
      ],
      requiresSecurity: false
    }
  },
  methods: {
    /* ---------------------------------------------------------------------------------------------------------------- Base Events -------------------------------------------------------------------------------- */
    setPersonnel() {
      if (this.personnel.length > 0) {
        clearInterval(this.$options.interval)
        this.pdata = this.personnel
      }
    },
    waitForTrip: function() {
      // Waits for the travel item to load
      if (this.triploaded) {
        clearInterval(this.$options.interval)
        let giraffe = JSON.parse(this.selectedtrip.Travelers)
        this.travelmodel.id = this.selectedtrip.id
        this.travelmodel.Status = this.selectedtrip.Status
        this.travelmodel.WorkPlan = this.selectedtrip.WorkPlan
        this.travelmodel.WorkPlanNumber = this.selectedtrip.WorkPlanNumber
        this.travelmodel.OriginalWorkPlanNumber = this.selectedtrip.OriginalWorkPlanNumber
        this.travelmodel.WorkPlanText = this.selectedtrip.WorkPlanText
        this.travelmodel.OCONUS = this.selectedtrip.OCONUS
        this.travelmodel.OCONUSLocation = this.selectedtrip.OCONUSLocation == 'Select...' ? '' : this.selectedtrip.OCONUSLocation
        this.travelmodel.OCONUSApprovedBy = this.selectedtrip.OCONUSApprovedBy
        this.travelmodel.OCONUSApprovedOn = moment(this.selectedtrip.OCONUSApprovedOn).format('YYYY-MM-DD')
        this.travelmodel.OCONUSApprovedEmail = this.selectedtrip.OCONUSApprovedEmail
        this.travelmodel.PreApproved = this.selectedtrip.InternalData.PreApproved
        this.travelmodel.Company = this.selectedtrip.Company
        this.travelmodel.Subject = this.selectedtrip.Subject
        this.travelmodel.StartTime = moment(this.selectedtrip.StartTime).format('YYYY-MM-DD')
        this.travelmodel.EndTime = moment(this.selectedtrip.EndTime).format('YYYY-MM-DD')
        this.travelmodel.TravelFrom = this.selectedtrip.TravelFrom
        this.travelmodel.TravelTo = this.selectedtrip.TravelTo
        this.travelmodel.Sponsor = this.selectedtrip.Sponsor
        this.travelmodel.POCName = this.selectedtrip.POCName
        this.travelmodel.POCEmail = this.selectedtrip.POCEmail
        this.travelmodel.POCPhone = this.selectedtrip.POCPhone
        this.travelmodel.Comments = this.selectedtrip.Comments
        this.travelmodel.InternalData = this.selectedtrip.InternalData !== '' ? JSON.parse(this.selectedtrip.InternalData) : ''
        this.travelmodel.Clearance = this.selectedtrip.Clearance
        this.travelmodel.VisitRequest = this.selectedtrip.VisitRequest
        this.travelmodel.SecurityAction = this.selectedtrip.SecurityAction
        this.travelmodel.SecurityActionCompleted = moment(this.selectedtrip.SecurityActionCompleted).format('YYYY-MM-DD')
        this.travelmodel.EstimatedCost = this.selectedtrip.EstimatedCost
        this.travelmodel.IndexNumber = this.selectedtrip.IndexNumber
        this.travelmodel.Travelers = giraffe.length > 0 ? giraffe : []
        this.travelmodel.CreatedBy = this.selectedtrip.CreatedBy
        this.travelmodel.CreatedByEmail = this.selectedtrip.CreatedByEmail
        this.travelmodel.etag = this.selectedtrip.etag
        this.travelmodel.uri = this.selectedtrip.uri
        Travel.dispatch('getPCAForWP', this.travelmodel.WorkPlanNumber)
        if (this.travelmodel.CreatedByEmail.indexOf(this.currentuser[0].Email) >= 0) {
          this.isAuthor = true
        }
        if (this.travelmodel.Status == 'Denied') {
          this.isDenied = true
        }
        this.$bvToast.hide('form-toast')
        // personnel are filtered by company
        let payload = {}
        payload.company = this.company
        if (this.isSubcontractor == true) {
          try {
            Personnel.dispatch('getPersonnelByCompany', payload).then(function() {
              Workplan.dispatch('getWorkplans').then(function() {
                vm.$options.interval = setInterval(vm.setPersonnel, 1000)
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
        } else {
          try {
            Personnel.dispatch('getPersonnel').then(function() {
              Workplan.dispatch('getWorkplans').then(function() {
                Company.dispatch('getCompanies').then(function() {
                  vm.$options.interval = setInterval(vm.setPersonnel, 1000)
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
        }
        // go get the travel indexes on load
        vm.IndexNumbers = [] // empty out the collection first
        vm.TravelCount = 0 // reset
        let turl = url
        turl += this.travelmodel.WorkPlanNumber
        turl += "')"
        return axios
          .get(turl, {
            headers: {
              accept: 'application/json;odata=verbose'
            }
          })
          .then(function(response) {
            let results = response.data.d.results
            if (results.length > 0) {
              vm.TravelCount = results.length
              for (let i = 0; i < results.length; i++) {
                let idx = results[i].IndexNumber
                if (idx !== null && !Vue._.includes(vm.IndexNumbers, idx)) {
                  vm.IndexNumbers.push({
                    text: results[i].IndexNumber,
                    value: results[i].IndexNumber
                  })
                }
              }
            } else {
              // TODO: There are no travel items for this work plan so do we need to let the user know and auto select the automatic option
            }
          })
          .catch(function(error) {
            console.log('Error Getting Index Numbers: ' + error)
          })
      }
    },
    getRef(text, idx) {
      return text + '_' + idx
    },
    onModalShown() {
      EventBus.$emit('refresh')
    },
    onCreate: function() {
      EventBus.$on('refresh', this.refreshRte)
    },
    refreshRte() {
      this.$refs.rteOCONUSApprovedEmail.refreshUI()
    },
    /* ---------------------------------------------------------------------------------------------------------------- End Base Events ---------------------------------------------------------------------------- */
    /* ---------------------------------------------------------------------------------------------------------------- Validation Events -------------------------------------------------------------------------- */
    ValidateMe: function(control) {
      console.log('VALIDATION: ' + control)
      let phoneNumberPattern = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/
      let emailPattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
      let ti = /([\d]{2})-([a-zA-Z0-9]{4})-([\d]{1,})/
      let ret = false
      switch (control) {
        case 'OCONUS':
          if (this.travelmodel.OCONUS == 'Yes' || this.travelmodel.OCONUS == 'No') {
            ret = true
          }
          break

        case 'LOCATION':
          if (this.travelmodel.OCONUS == 'Yes') {
            console.log('LOCATION LENGTH: ' + this.travelmodel.OCONUSLocation.length)
            if (this.travelmodel.OCONUSLocation.length > 2) {
              ret = true
            }
          } else {
            ret = true
          }
          break

        case 'Subject':
          ret = this.travelmodel.Subject.length > 2 ? true : false
          break

        case 'IndexNumber':
          var str = this.travelmodel.IndexNumber
          var pattern = new RegExp(ti)
          ret = pattern.test(str)
          break

        case 'Company':
          if (this.isSubcontractor) {
            ret = this.travelmodel.Company == this.company ? true : false
          } else {
            ret = this.travelmodel.Company == '' || this.travelmodel.Company == 'S' ? false : true
          }
          break

        case 'WorkPlan':
          var val = this.travelmodel.WorkPlanNumber
          var good = false
          if (val.length > 0) {
            good = true
          }
          ret = good
          break

        case 'start':
          ret = moment(this.travelmodel.StartTime).isValid() ? true : false
          break

        case 'end':
          // Check to ensure that the end date is valid and not before the start date
          this.BadEndDate = moment(this.travelmodel.EndTime).isValid() ? false : true
          if (moment(this.travelmodel.StartTime).isValid() && moment(this.travelmodel.EndTime).isValid()) {
            this.EndBeforeStart = moment(this.travelmodel.EndTime).isBefore(this.travelmodel.StartTime) ? true : false
          }
          ret = this.BadEndDate === true || this.EndBeforeStart === true ? false : true
          break

        case 'TravelFrom':
          ret = this.travelmodel.TravelFrom.length > 2 ? true : false
          break

        case 'TravelTo':
          ret = this.travelmodel.TravelTo.length > 2 ? true : false
          break

        case 'Sponsor':
          ret = this.travelmodel.Sponsor.length > 4 ? true : false
          break

        case 'EstimatedCost':
          ret = this.travelmodel.EstimatedCost.length > 1 ? true : false
          break

        case 'POCName':
          ret = this.travelmodel.POCName.length > 4 ? true : false
          break

        case 'POCEmail':
          ret = emailPattern.test(this.travelmodel.POCEmail) ? true : false
          break

        case 'POCPhone':
          ret = phoneNumberPattern.test(this.travelmodel.POCPhone) ? true : false
          break

        case 'Comments':
          ret = this.travelmodel.Comments.length > 4 ? true : false
          break

        case 'Clearance':
          var req = this.travelmodel.VisitRequest
          val = this.travelmodel.Clearance
          good = false
          if (req === 'Yes' && val !== 'None') {
            good = true
          }
          ret = good
          break
      }
      return ret
    },
    validateFirstTab: function() {
      // check all the fields in the first tab to see that they are properly validated
      let valid = true
      if (this.isAuthor == true) {
        for (let i = 0; i < this.fieldsFirstTabAuthor.length; i++) {
          if (this.$refs[this.fieldsFirstTab[i]].state === false) {
            valid = false
          }
        }
      } else {
        for (let i = 0; i < this.fieldsFirstTab.length; i++) {
          if (this.$refs[this.fieldsFirstTab[i]].state === false) {
            valid = false
          }
        }
      }
      return valid
    },
    validateSecondTab: function() {
      // check all the fields in the first tab to see that they are properly validated
      let valid = true
      if (this.travelmodel.Travelers.length <= 0) {
        valid = false
      }
      return valid
    },
    validateThirdTab: function() {
      // check all the fields in the first tab to see that they are properly validated
      let valid = true
      for (let i = 0; i < this.fieldsThirdTab.length; i++) {
        if (this.fieldsThirdTab[i] !== 'Clearance') {
          if (this.$refs[this.fieldsThirdTab[i]].state === false) {
            valid = false
          }
        } else {
          let req = this.travelmodel.VisitRequest
          let val = this.travelmodel.Clearance
          if (req === 'yes' && val === 'Select') {
            valid = false
          }
        }
      }
      return valid
    },
    validateFourthTab: function() {
      // If VR is selected YES then we need to check POCName, POCEmail and POCPhone
      let valid = true
      if (this.travelmodel.VisitRequest.toLowerCase() === 'yes') {
        for (let i = 0; i < this.fieldsFourthTab.length; i++) {
          if (this.$refs[this.fieldsFourthTab[i]].state === false) {
            valid = false
          }
        }
      }
      return valid
    },
    /* ---------------------------------------------------------------------------------------------------------------- End Validation Events ------------------------------------------------------------------------ */
    /* ---------------------------------------------------------------------------------------------------------------- Form Events ---------------------------------------------------------------------------------- */
    onModalHide: function() {
      let back = String(this.$router.currentRoute.params.back) === 'undefined' ? 'monkey' : String(this.$router.currentRoute.params.back)
      console.log('BACK: ' + back + ', ' + typeof back)
      if (back === 'monkey') {
        this.$router.push({ name: 'Travel Tracker' }) // default
      } else {
        this.$router.push({ name: back })
      }
    },
    onTabSelected: function(newidx, oldidx, event) {
      // Now we can validate the tabs based on what tab is clicked
      this.tabInvalid = false
      if (newidx > 0) {
        switch (newidx) {
          case 1:
            if (newidx > oldidx) {
              let valid = this.validateFirstTab()
              if (!valid) {
                event.preventDefault()
                this.tabInvalid = true
              }
            }
            break

          case 2:
            if (newidx > oldidx) {
              let valid = this.validateFirstTab()
              if (!valid) {
                event.preventDefault()
                this.tabInvalid = true
              } else {
                let valid = this.validateSecondTab()
                if (!valid) {
                  event.preventDefault()
                  this.tabInvalid = true
                }
              }
            }
            break

          case 3:
            if (newidx > oldidx) {
              let valid = this.validateFirstTab()
              if (!valid) {
                event.preventDefault()
                this.tabInvalid = true
              } else {
                let valid = this.validateSecondTab()
                if (!valid) {
                  event.preventDefault()
                  this.tabInvalid = true
                } else {
                  let valid = this.validateThirdTab()
                  if (!valid) {
                    event.preventDefault()
                    this.tabInvalid = true
                  }
                }
              }
            }
            break

          case 4:
            var fv = true
            if (newidx > oldidx) {
              let valid = this.validateFirstTab()
              if (!valid) {
                event.preventDefault()
                this.tabInvalid = true
                fv = false
              } else {
                let valid = this.validateSecondTab()
                if (!valid) {
                  event.preventDefault()
                  this.tabInvalid = true
                  fv = false
                } else {
                  let valid = this.validateThirdTab()
                  if (!valid) {
                    event.preventDefault()
                    this.tabInvalid = true
                    fv = false
                  } else {
                    let valid = this.validateFourthTab()
                    if (!valid) {
                      event.preventDefault()
                      this.tabInvalid = true
                      fv = false
                    }
                  }
                }
              }
            }
            this.formValid = fv
            break

          case 5:
            fv = true
            if (newidx > oldidx) {
              let valid = this.validateFirstTab()
              if (!valid) {
                event.preventDefault()
                this.tabInvalid = true
                fv = false
              } else {
                let valid = this.validateSecondTab()
                if (!valid) {
                  event.preventDefault()
                  this.tabInvalid = true
                  fv = false
                } else {
                  let valid = this.validateThirdTab()
                  if (!valid) {
                    event.preventDefault()
                    this.tabInvalid = true
                    fv = false
                  } else {
                    let valid = this.validateFourthTab()
                    if (!valid) {
                      event.preventDefault()
                      this.tabInvalid = true
                      fv = false
                    }
                  }
                }
              }
            }
            this.formValid = fv
            break
        }
      }
    },
    searchme: function() {
      this.$refs.TravelPersonnelGrid.search(this.searchinput)
    },
    onOCONUSSelected: function() {
      // TODO: Maybe show location area from here
      if (this.travelmodel.OCONUS == 'Yes') {
        this.fieldsFirstTab.push('OCONUSLocation')
      } else {
        // if the user accidentally selected yes and then changes it, we have to remove location from the validation array
        this.fieldsFirstTab = this.fieldsFirstTab.filter(e => e != 'OCONUSLocation')
      }
    },
    AutoIndex() {
      // get count of unique index numbers based on workplan # and increment by 1
      // 3/9/2021 - removed the increment by one b/c it uses the number of Travel items related to the WP# of which the current item is one of them.
      let c = vm.TravelCount
      this.travelmodel.IndexNumber = this.travelmodel.WorkPlanNumber + '-' + c
    },
    SelectIndex() {
      // show side bar selector
      this.ShowIndexPicker = true
    },
    IndexNumberChanged() {
      this.ShowIndexPicker = false
    },
    onWorkplanSelected: function() {
      let s = String(this.travelmodel.WorkPlanNumber)
      let t = this.workplans.filter(workplan => workplan.value == s)
      let wp = t[0].data
      wp = wp.split(', ')
      this.workplanuri = wp[4]
      this.workplanetag = wp[5]
      this.newindex = parseInt(wp[3]) + 1
      this.travelmodel.WorkPlan = t[0].data
      this.travelmodel.WorkPlanText = wp[1]
      // go get the travel indexes
      vm.IndexNumbers = [] // empty out the collection first
      vm.TravelCount = 0 // reset
      let turl = url
      turl += s
      turl += "')"
      return axios
        .get(turl, {
          headers: {
            accept: 'application/json;odata=verbose'
          }
        })
        .then(function(response) {
          let results = response.data.d.results
          if (results.length > 0) {
            vm.TravelCount = results.length // current item edited included in this returned array
            for (let i = 0; i < results.length; i++) {
              let idx = results[i].IndexNumber
              if (!Vue._.includes(vm.IndexNumbers, idx)) {
                vm.IndexNumbers.push({
                  text: results[i].IndexNumber,
                  value: results[i].IndexNumber
                })
              }
            }
          } else {
            // TODO: There are no travel items for this work plan so do we need to let the user know and auto select the automatic option
          }
        })
        .catch(function(error) {
          console.log('Error Getting Index Numbers: ' + error)
        })
    },
    VisitRequest(checked) {
      this.travelmodel.VisitRequest = checked ? true : false
    },
    btnAddTraveler: function() {
      // Used in EditTravelUser when selecting a traveler.
      this.$bvModal.show('EditTravelUser')
    },
    PersonnelActionBegin(args) {
      // Used in EditTravelUser when selecting a traveler.
      switch (args.requestType) {
        case 'beginEdit':
          args.cancel = true
          vm.travelmodel.Travelers.push({
            firstName: args.rowData.FirstName,
            lastName: args.rowData.LastName,
            email: args.rowData.Email,
            phone: args.rowData.Phone
          })
          this.$bvModal.hide('EditTravelUser')
          break
      }
    },
    emailTravelPOC: function() {
      this.$refs['TPOCLink'].click()
    },
    emailTravelDocs: function() {
      this.$refs['DocsLink'].click()
    },
    generateDocsLink: function() {
      // Get emails of travelers and the list of documents for the part of OCONUS Location so that this can be emailed to the travelers
      let emails = ''
      let body = ''
      if (this.travelmodel.Travelers.length > 0) {
        for (let i = 0; i < this.travelmodel.Travelers.length; i++) {
          if (i == 0 && this.travelmodel.Travelers.length > 1) {
            let email = String(this.travelmodel.Travelers[i]['email'])
            email += '?cc='
            emails = email
          } else if (i > 0 && this.travelmodel.Travelers.length > 1) {
            let email = String(this.travelmodel.Travelers[i]['email'])
            emails += ', ' + email
          } else {
            emails = this.travelmodel.Travelers[i]['email']
          }
        }
        body += 'Please fill out these required documents: SERE Training, ISO Prep, AT Level 1, Travel Tracker'
        // TODO: add docs based on OCONUSLocation
        switch (this.travelmodel.OCONUSLocation) {
          case 'Korea': {
            body += ', USFK 700-19, USFK Theater Training, Ordinary Residency Memo'
            break
          }

          case 'Germany': {
            body += ', BACO-90'
            break
          }
        }
        let subject = 'Travel Documents For Trip ' + this.travelmodel.IndexNumber
        let href = 'mailto:' + emails + '?subject=' + subject + '&body=' + body
        return href
      }
    },
    deleteme: function(idx) {
      this.travelmodel.Travelers.splice(idx, 1)
    },
    DeniedChanged: function(checked) {
      console.log('DeniedChanged: ' + checked)
      if (checked) {
        this.travelmodel.InternalData.ATPRequested = 'No'
        this.travelmodel.InternalData.ApprovalRequested = 'No'
        this.travelmodel.InternalData.DeniedBy = this.currentuser[0]['Email']
        this.travelmodel.InternalData.DeniedOn = moment().format('YYYY-MM-DD')
        this.travelmodel.InternalData.ApprovedBy = ''
        this.travelmodel.InternalData.ApprovedOn = ''
      }
    },
    ApprovedChanged: function(checked) {
      console.log('ApprovedChanged: ' + checked)
      if (checked) {
        this.travelmodel.InternalData.ATPRequested = 'No'
        this.travelmodel.InternalData.ApprovalRequested = 'No'
        this.travelmodel.InternalData.ApprovedBy = this.currentuser[0]['Email']
        this.travelmodel.InternalData.ApprovedOn = moment().format('YYYY-MM-DD')
        this.travelmodel.InternalData.DeniedBy = ''
        this.travelmodel.InternalData.DeniedOn = ''
      }
    },
    ATPDeniedChanged: function(checked) {
      console.log('DeniedChanged: ' + checked)
      if (checked) {
        this.travelmodel.InternalData.ApprovalRequested = 'No'
        this.travelmodel.InternalData.ATPDeniedBy = this.currentuser[0]['Email']
        this.travelmodel.InternalData.ATPDeniedOn = moment().format('YYYY-MM-DD')
      }
    },
    ATPChanged: function(checked) {
      console.log('ApprovedChanged: ' + checked)
      if (checked) {
        this.travelmodel.InternalData.ApprovalRequested = 'No'
        this.travelmodel.InternalData.GrantedBy = this.currentuser[0]['Email']
        this.travelmodel.InternalData.GrantedOn = moment().format('YYYY-MM-DD')
      }
    },
    async verifyModalSave() {
      this.tabInvalid = false
      if (!(await this.validateFirstTab())) {
        this.tabInvalid = true
      } else if (!(await this.validateSecondTab())) {
        this.tabInvalid = true
      } else if (!(await this.validateThirdTab())) {
        this.tabInvalid = true
      } else if (!(await this.validateFourthTab())) {
        this.tabInvalid = true
      }
      if (!this.tabInvalid) {
        await this.onModalSave()
      }
    },
    async onModalSave() {
      // Update the trip information in SharePoint.
      // Need to calculate the status based on current state of selected fields
      let event = []
      let start = moment(this.travelmodel.StartTime).format('YYYY-MM-DD[T]HH:MM:[00Z]')
      let end = moment(this.travelmodel.EndTime).format('YYYY-MM-DD[T]HH:MM:[00Z]')
      let securityactioncompleted = moment(this.travelmodel.SecurityActionCompleted).isValid() ? moment(this.travelmodel.SecurityActionCompleted).format('YYYY-MM-DD[T]HH:MM:[00Z]') : null
      let status = this.travelmodel.Status
      // TODO: Setup internal data to ensure that we can track what to do for tracking state

      if (this.isDenied == true && this.travelmodel.InternalData.DeniedForAdmin == 'Yes') {
        // set to WPMReview and allow for resubmission
        this.actionselected = true
        status = 'WPMReview'
        this.travelmodel.InternalData.Status = 'WPMReview'
        let emailto = []
        let taskid = []
        emailto.push(vm.travelmodel.InternalData.ManagerEmail)
        for (let i = 0; i < vm.delegates.length; i++) {
          if (vm.delegates[i]['EMail'] == vm.travelmodel.InternalData.ManagerEmail) {
            // add the delegates to the email and task array
            taskid.push(vm.delegates[i]['Id'])
            let j = vm.delegates[i]['Delegates']
            for (let k = 0; k < j.length; k++) {
              emailto.push(j[k]['EMail'])
              taskid.push(j[k]['Id'])
            }
          }
        }
        console.log('EMAILS: ' + emailto.toString())
        let payload = {}
        payload.id = vm.travelmodel.id
        payload.email = emailto
        payload.title = vm.travelmodel.Subject
        payload.workplan = vm.travelmodel.WorkPlanNumber
        payload.company = vm.travelmodel.Company
        payload.travelers = vm.travelmodel.Travelers
        payload.start = vm.travelmodel.StartTime
        payload.end = vm.travelmodel.EndTime
        // create task and send emails
        let taskpayload = {
          Title: 'Approve or Deny Travel Request',
          AssignedToId: taskid,
          Description: 'Please Review The Trip',
          IsMilestone: false,
          PercentComplete: 0,
          TaskType: 'WPMReview',
          TaskLink: '/travel/page/edit?id=' + vm.travelmodel.id,
          TaskInfo: 'Type:TravelData, TrvlID:' + vm.travelmodel.id + ', IN:' + vm.travelmodel.IndexNumber
        }
        let deletepayload = {
          url: SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Tasks')/items?$select=*&$filter=substringof('TrvlID:" + vm.travelmodel.id + "',TaskInfo)"
        }
        Todo.dispatch('completeTodosByQuery', deletepayload).then(function() {
          Todo.dispatch('addTodo', taskpayload)
        })
        Travel.dispatch('EditTripEmail', payload)
      }

      if (this.travelmodel.InternalData.PreApproved == 'Yes' && this.actionselected == false) {
        this.actionselected = true
        status = 'Approved'
        this.travelmodel.InternalData.Status = 'Approved'
        this.travelmodel.InternalData.Approval = 'Yes'

        let payload = {}
        payload.id = vm.travelmodel.id
        payload.email = [vm.travelmodel.CreatedByEmail]
        payload.title = 'Travel Request Approved'
        payload.workplan = vm.travelmodel.WorkPlanNumber
        payload.indexnumber = vm.travelmodel.IndexNumber
        payload.company = vm.travelmodel.Company
        payload.travelers = vm.travelmodel.Travelers
        payload.start = vm.travelmodel.StartTime
        payload.end = vm.travelmodel.EndTime
        payload.comments = 'Travel Approved'
        try {
          let deletepayload = {
            url: SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Tasks')/items?$select=*&$filter=substringof('TrvlID:" + vm.travelmodel.id + "',TaskInfo)"
          }
          Todo.dispatch('completeTodosByQuery', deletepayload).then(function() {
            Travel.dispatch('EditTripEmail', payload)
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

      if (this.isAuthor == true && this.actionselected == false) {
        if (!this.isWPManager) {
          // the author should only be able to edit if the status is Denied or RejectedByWPM
          this.actionselected = true
          status = 'WPMReview'
          this.travelmodel.InternalData.Status = 'WPMReview'

          let emailto = []
          let taskid = []
          emailto.push(vm.travelmodel.InternalData.ManagerEmail)
          for (let i = 0; i < vm.delegates.length; i++) {
            if (vm.delegates[i]['EMail'] == vm.travelmodel.InternalData.ManagerEmail) {
              // add the delegates to the email and task array
              taskid.push(vm.delegates[i]['Id'])
              let j = vm.delegates[i]['Delegates']
              for (let k = 0; k < j.length; k++) {
                emailto.push(j[k]['EMail'])
                taskid.push(j[k]['Id'])
              }
            }
          }
          console.log('EMAILS: ' + emailto.toString())
          let payload = {}
          payload.id = vm.travelmodel.id
          payload.email = emailto
          payload.title = vm.travelmodel.Subject
          payload.workplan = vm.travelmodel.WorkPlanNumber
          payload.company = vm.travelmodel.Company
          payload.travelers = vm.travelmodel.Travelers
          payload.start = vm.travelmodel.StartTime
          payload.end = vm.travelmodel.EndTime
          // create task and send emails
          let taskpayload = {
            Title: 'Approve or Deny Travel Request',
            AssignedToId: taskid,
            Description: 'Please Review The Trip',
            IsMilestone: false,
            PercentComplete: 0,
            TaskType: 'WPMReview',
            TaskLink: '/travel/page/edit?id=' + vm.travelmodel.id,
            TaskInfo: 'Type:TravelData, TrvlID:' + vm.travelmodel.id + ', IN:' + vm.travelmodel.IndexNumber
          }
          let deletepayload = {
            url: SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Tasks')/items?$select=*&$filter=substringof('TrvlID:" + vm.travelmodel.id + "',TaskInfo)"
          }
          Todo.dispatch('completeTodosByQuery', deletepayload).then(function() {
            Todo.dispatch('addTodo', taskpayload)
          })
          Travel.dispatch('EditTripEmail', payload)
        }
      }

      if (this.travelmodel.InternalData.DeniedForAdmin == 'Yes' && this.actionselected == false) {
        this.actionselected = true
        console.log('DeniedForAdmin')
        this.travelmodel.Status = 'Denied'
        this.travelmodel.InternalData.Status = 'Denied'
        let payload = {}
        payload.id = vm.travelmodel.id
        payload.email = [vm.travelmodel.CreatedByEmail]
        payload.title = 'Please Correct Travel Request'
        payload.workplan = vm.travelmodel.WorkPlanNumber
        payload.company = vm.travelmodel.Company
        payload.travelers = vm.travelmodel.Travelers
        payload.start = vm.travelmodel.StartTime
        payload.end = vm.travelmodel.EndTime
        payload.comments = vm.travelmodel.InternalData.RequiredCorrections
        try {
          // create task and send emails
          let taskpayload = {
            Title: 'Travel Request Correction Required',
            AssignedToId: [vm.travelmodel.CreatedBy],
            Description: 'Please make the requested updates to the travel and resubmit.\n' + vm.travelmodel.InternalData.RequiredCorrections,
            IsMilestone: false,
            PercentComplete: 0,
            TaskType: 'Denied',
            TaskLink: '/travel/page/edit?id=' + vm.travelmodel.id,
            TaskInfo: 'Type:Travel, TrvlID:' + vm.travelmodel.id + ', IN:' + vm.travelmodel.IndexNumber
          }
          let deletepayload = {
            url: SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Tasks')/items?$select=*&$filter=substringof('TrvlID:" + vm.travelmodel.id + "',TaskInfo)"
          }
          Todo.dispatch('completeTodosByQuery', deletepayload).then(function() {
            Todo.dispatch('addTodo', taskpayload)
          })
          Travel.dispatch('EditTripEmail', payload)
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

      if (this.travelmodel.InternalData.Approval == 'Yes' && this.actionselected == false) {
        this.actionselected = true
        console.log('APPROVALYES')
        // TODO: Validate if a user should get a task here for approved travel. Currently not creating one
        status = 'Approved'
        this.travelmodel.InternalData.Status = 'Approved'
        if (this.travelmodel.InternalData.OCONUSTravel == 'Yes') {
          this.travelmodel.OCONUSApprovedBy = this.travelmodel.InternalData.ApprovedBy
          this.travelmodel.OCONUSApprovedOn = this.travelmodel.InternalData.ApprovedOn
        }
        let payload = {}
        payload.id = vm.travelmodel.id
        payload.email = [vm.travelmodel.CreatedByEmail]
        payload.title = 'Travel Request Approved'
        payload.workplan = vm.travelmodel.WorkPlanNumber
        payload.indexnumber = vm.travelmodel.IndexNumber
        payload.company = vm.travelmodel.Company
        payload.travelers = vm.travelmodel.Travelers
        payload.start = vm.travelmodel.StartTime
        payload.end = vm.travelmodel.EndTime
        payload.comments = 'Travel Approved'
        try {
          let deletepayload = {
            url: SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Tasks')/items?$select=*&$filter=substringof('TrvlID:" + vm.travelmodel.id + "',TaskInfo)"
          }
          Todo.dispatch('completeTodosByQuery', deletepayload).then(function() {
            Travel.dispatch('EditTripEmail', payload)
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

      if (this.travelmodel.InternalData.Approval == 'No' && this.actionselected == false) {
        this.actionselected = true
        console.log('APPROVALNO')
        status = 'Denied'
        this.travelmodel.InternalData.Status = 'Denied'
        this.travelmodel.InternalData.ApprovalRequested = 'No'
        this.travelmodel.InternalData.ATPRequested = 'No'
        // TODO: Loop through the delegates to see if this WPM has delegates that need to have the email and tasks
        let emailto = []
        let taskid = []
        emailto.push(vm.travelmodel.InternalData.ManagerEmail)
        for (let i = 0; i < vm.delegates.length; i++) {
          if (vm.delegates[i]['EMail'] == vm.travelmodel.InternalData.ManagerEmail) {
            // add the delegates to the email and task array
            taskid.push(vm.delegates[i]['Id'])
            let j = vm.delegates[i]['Delegates']
            for (let k = 0; k < j.length; k++) {
              emailto.push(j[k]['EMail'])
              taskid.push(j[k]['Id'])
            }
          }
        }
        let payload = {}
        payload.id = vm.travelmodel.id
        payload.email = emailto
        payload.title = 'Travel Request Denied'
        payload.workplan = vm.travelmodel.WorkPlanNumber
        payload.indexnumber = vm.travelmodel.IndexNumber
        payload.company = vm.travelmodel.Company
        payload.travelers = vm.travelmodel.Travelers
        payload.start = vm.travelmodel.StartTime
        payload.end = vm.travelmodel.EndTime
        payload.comments = vm.travelmodel.InternalData.DenialComments
        try {
          // create task and send emails
          let taskpayload = {
            Title: 'Travel Request Denied',
            AssignedToId: taskid,
            Description: 'Please Review The Request.',
            IsMilestone: false,
            PercentComplete: 0,
            TaskType: 'TravelDenied',
            TaskLink: '/travel/page/edit?id=' + vm.travelmodel.id,
            TaskInfo: 'Type:TravelData, TrvlID:' + vm.travelmodel.id + ', IN:' + vm.travelmodel.IndexNumber
          }
          let deletepayload = {
            url: SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Tasks')/items?$select=*&$filter=substringof('TrvlID:" + vm.travelmodel.id + "',TaskInfo)"
          }
          Todo.dispatch('completeTodosByQuery', deletepayload).then(function() {
            Todo.dispatch('addTodo', taskpayload)
          })
          Travel.dispatch('EditTripEmail', payload)
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

      if (this.travelmodel.InternalData.Rejected == 'Yes' && this.actionselected == false) {
        this.actionselected = true
        console.log('REJECTED')
        status = 'RejectedByWPM'
        this.travelmodel.InternalData.Status = 'RejectedByWPM'
        this.travelmodel.InternalData.ApprovalRequested = 'No'
        this.travelmodel.InternalData.Approval = ''
        let payload = {}
        payload.id = vm.travelmodel.id
        payload.email = [vm.travelmodel.CreatedByEmail]
        payload.title = 'Travel Request Rejected By WPM'
        payload.workplan = vm.travelmodel.WorkPlanNumber
        payload.company = vm.travelmodel.Company
        payload.travelers = vm.travelmodel.Travelers
        payload.start = vm.travelmodel.StartTime
        payload.end = vm.travelmodel.EndTime
        payload.comments = vm.travelmodel.InternalData.RejectedComments
        try {
          // create task and send emails
          let taskpayload = {
            Title: 'Travel Request Rejected By WPM',
            AssignedToId: [vm.travelmodel.CreatedBy],
            Description: 'Please make the requested updates to the travel and resubmit.',
            IsMilestone: false,
            PercentComplete: 0,
            TaskType: 'RejectedByWPM',
            TaskLink: '/travel/page/edit?id=' + vm.travelmodel.id,
            TaskInfo: 'Type:Travel, TrvlID:' + vm.travelmodel.id + ', IN:' + vm.travelmodel.IndexNumber
          }
          let deletepayload = {
            url: SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Tasks')/items?$select=*&$filter=substringof('TrvlID:" + vm.travelmodel.id + "',TaskInfo)"
          }
          Todo.dispatch('completeTodosByQuery', deletepayload).then(function() {
            Todo.dispatch('addTodo', taskpayload)
          })
          Travel.dispatch('EditTripEmail', payload)
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

      if (this.travelmodel.InternalData.ApprovalRequested == 'Yes' && this.actionselected == false) {
        this.actionselected = true
        console.log('APPROVALREQUESTED')
        let approverids = []
        let approveremails = []
        let approverselected = vm.travelmodel.InternalData.ApproverSelected
        // approverselected control is multiselect so selected users will be in an array
        for (let i = 0; i < approverselected.length; i++) {
          let a = approverselected[i].split(',')
          approverids.push(a[0])
          approveremails.push(a[1])
        }
        // approverselected = approverselected.split(',')
        status = 'AFRLReview'
        vm.travelmodel.InternalData.Status = 'AFRLReview'
        let payload = {}
        payload.id = vm.travelmodel.id
        payload.email = approveremails
        payload.title = vm.travelmodel.Subject
        payload.workplan = vm.travelmodel.WorkPlanNumber
        payload.indexnumber = vm.travelmodel.IndexNumber
        payload.company = vm.travelmodel.Company
        payload.travelers = vm.travelmodel.Travelers
        payload.start = vm.travelmodel.StartTime
        payload.end = vm.travelmodel.EndTime
        payload.linktext = 'Approve or Reject Travel Request'
        payload.review = 'Travel Approval'
        try {
          // create task and send emails
          let taskpayload = {
            Title: 'New Travel Approval Request',
            AssignedToId: approverids,
            Description: 'Please review the trip request and approve/deny as applicable.',
            IsMilestone: false,
            PercentComplete: 0,
            TaskType: 'AFRLReview',
            TaskLink: '/travel/page/edit?id=' + vm.travelmodel.id,
            TaskInfo: 'Type:Travel, TrvlID:' + vm.travelmodel.id + ', IN:' + vm.travelmodel.IndexNumber
          }
          let deletepayload = {
            url: SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Tasks')/items?$select=*&$filter=substringof('TrvlID:" + vm.travelmodel.id + "',TaskInfo)"
          }
          Todo.dispatch('completeTodosByQuery', deletepayload).then(function() {
            Todo.dispatch('addTodo', taskpayload)
          })
          /* Todo.dispatch('addTodo', taskpayload) */
          Travel.dispatch('EditTripEmail', payload)
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

      if (this.travelmodel.InternalData.ATPRequested == 'Yes' && this.actionselected == false) {
        this.actionselected = true
        console.log('ATPREQUESTED')
        status = 'AFRLReview'
        this.travelmodel.InternalData.Status = 'AFRLReview'
        let payload = {}
        payload.id = vm.travelmodel.id
        payload.email = [vm.travelmodel.InternalData.ManagerEmail]
        payload.title = vm.travelmodel.Subject
        payload.workplan = vm.travelmodel.WorkPlanNumber
        payload.company = vm.travelmodel.Company
        payload.travelers = vm.travelmodel.Travelers
        payload.start = vm.travelmodel.StartTime
        payload.end = vm.travelmodel.EndTime
        payload.review = 'OCONUS Travel Authorization To Proceed'
        try {
          Travel.dispatch('EditTripEmail', payload)
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
      if (this.travelmodel.InternalData.ATP == 'Yes') {
        this.actionselected = true
        console.log('ATP YES')
        status = 'WPMReview'
        this.travelmodel.InternalData.Status = 'WPMReview'
        let payload = {}
        payload.id = vm.travelmodel.id
        payload.email = [vm.travelmodel.InternalData.ManagerEmail]
        payload.title = vm.travelmodel.Subject
        payload.workplan = vm.travelmodel.WorkPlanNumber
        payload.company = vm.travelmodel.Company
        payload.travelers = vm.travelmodel.Travelers
        payload.start = vm.travelmodel.StartTime
        payload.end = vm.travelmodel.EndTime
        payload.comments = 'OCONUS Travel Authorization To Proceed Granted'
        try {
          Travel.dispatch('EditTripEmail', payload)
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
      if (this.travelmodel.InternalData.ATP == 'No' && this.actionselected == false) {
        this.actionselected = true
        console.log('ATP NO')
        status = 'Denied'
        this.travelmodel.InternalData.Status = 'Denied'
        this.travelmodel.InternalData.ApprovalRequested = 'No'
        // TODO: Loop through the delegates to see if this WPM has delegates that need to have the email and tasks
        let emailto = []
        let taskid = []
        emailto.push(vm.travelmodel.InternalData.ManagerEmail)
        for (let i = 0; i < vm.delegates.length; i++) {
          if (vm.delegates[i]['EMail'] == vm.travelmodel.InternalData.ManagerEmail) {
            // add the delegates to the email and task array
            taskid.push(vm.delegates[i]['Id'])
            let j = vm.delegates[i]['Delegates']
            for (let k = 0; k < j.length; k++) {
              emailto.push(j[k]['EMail'])
              taskid.push(j[k]['Id'])
            }
          }
        }
        let payload = {}
        payload.id = vm.travelmodel.id
        payload.email = emailto
        payload.title = 'OCONUS Travel Authorization To Proceed Denied'
        payload.workplan = vm.travelmodel.WorkPlanNumber
        payload.indexnumber = vm.travelmodel.IndexNumber
        payload.company = vm.travelmodel.Company
        payload.travelers = vm.travelmodel.Travelers
        payload.start = vm.travelmodel.StartTime
        payload.end = vm.travelmodel.EndTime
        payload.comments = vm.travelmodel.InternalData.ATPDenialComments
        try {
          // create task and send emails
          let taskpayload = {
            Title: 'OCONUS Travel Authorization To Proceed Denied',
            AssignedToId: taskid,
            Description: 'Please Review The Request.',
            IsMilestone: false,
            PercentComplete: 0,
            TaskType: 'TravelDenied',
            TaskLink: '/travel/page/edit?id=' + vm.travelmodel.id,
            TaskInfo: 'Type:TravelData, TrvlID:' + vm.travelmodel.id + ', IN:' + vm.travelmodel.IndexNumber
          }
          let deletepayload = {
            url: SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Tasks')/items?$select=*&$filter=substringof('TrvlID:" + vm.travelmodel.id + "',TaskInfo)"
          }
          Todo.dispatch('completeTodosByQuery', deletepayload).then(function() {
            Todo.dispatch('addTodo', taskpayload)
          })
          Travel.dispatch('EditTripEmail', payload)
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
      this.travelmodel.InternalData.date = moment().format('MM/DD/YYYY')

      event.push({
        Subject: this.travelmodel.Subject,
        StartTime: start,
        EndTime: end,
        Status: status,
        WorkPlan: this.travelmodel.WorkPlan,
        WorkPlanNumber: this.travelmodel.WorkPlanNumber,
        OriginalWorkPlanNumber: this.travelmodel.OriginalWorkPlanNumber,
        WorkPlanText: this.travelmodel.WorkPlanText,
        IndexNumber: this.travelmodel.IndexNumber,
        OCONUS: this.travelmodel.OCONUS,
        OCONUSLocation: this.travelmodel.OCONUSLocation,
        PreApproved: this.travelmodel.InternalData.PreApproved,
        Company: this.travelmodel.Company,
        TravelFrom: this.travelmodel.TravelFrom,
        TravelTo: this.travelmodel.TravelTo,
        Travelers: this.travelmodel.Travelers,
        Sponsor: this.travelmodel.Sponsor,
        POCName: this.travelmodel.POCName,
        POCEmail: this.travelmodel.POCEmail,
        POCPhone: this.travelmodel.POCPhone,
        Comments: this.travelmodel.Comments,
        Clearance: this.travelmodel.Clearance,
        InternalData: this.travelmodel.InternalData,
        VisitRequest: this.travelmodel.VisitRequest,
        SecurityAction: this.travelmodel.SecurityAction,
        SecurityActionCompleted: securityactioncompleted,
        EstimatedCost: this.travelmodel.EstimatedCost,
        etag: this.travelmodel.etag,
        uri: this.travelmodel.uri
      })
      try {
        let response = await Travel.dispatch('editTrip', event)
        this.$store.dispatch('support/addActivity', '<div class="bg-success">EditTravel - Edit Trip completed</div>')
        this.$store.dispatch('support/addActivity', '<div class="bg-secondary">' + response.toString() + '</div>')
        this.$router.push({ name: 'Travel Tracker' })
        /* if (this.$router.currentRoute.params.back !== undefined || this.$router.currentRoute.params.back !== null) {
          this.$router.push({ name: this.$router.currentRoute.params.back })
        } else {
          this.$router.push({ name: 'Travel Tracker' }) // default
        } */
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
}
</script>

<style lang="scss" scoped>
.helpHide {
  margin: 1rem;
}

.summarytable {
  font-size: 0.8rem !important;
  width: 100%;
}

.formdiv {
  height: 450px;
}

.form-control-travel {
  padding: 2px !important;
  font-size: 0.75rem !important;
  height: 20px !important;
}

.form-control-travel-textarea {
  width: 100%;
}

.form-control-travel-date.is-invalid,
.form-control-travel-date.is-valid,
.was-validated .form-control-travel-date:invalid,
.was-validated .form-control-travel-date:valid {
  background-position: right calc(1.5rem) center !important;
}

.formheader,
.formmessage,
.formfooter {
  height: 50px !important;
  color: white;
  vertical-align: middle;
}

.formheader {
  line-height: 50px !important;
}

.formbody {
  min-height: 360px;
}
</style>
