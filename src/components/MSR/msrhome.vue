<template>
  <b-container fluid class="contentHeight p-0" id="MainContainer">
    <!-- <b-toast id="busy-toast" variant="warning" solid no-auto-hide>
      <template v-slot:toast-title>
        <div class="d-flex flex-grow-1 align-items-baseline">
          <b-img blank blank-color="#ff0000" class="mr-2" width="12" height="12"></b-img>
          <strong class="mr-auto">{{ busyTitle }}</strong>
        </div>
      </template>
      <b-progress :variant="busyVariant" :value="busyValue" :max="busyMax" show-progress animated></b-progress>
    </b-toast> -->
    <b-row ref="MainRow" class="contentHeight">
      <b-col cols="12">
        <b-overlay :show="msrs.length == 0" :variant="overlayVariant" z-index="3000">
          <ejs-grid id="MSRGrid" ref="MSRGrid" :dataSource="msrs" :allowPaging="true" :pageSettings="pageSettings" :dataBound="dataBound" rowHeight="20" :height="rect.height - 80" :width="rect.width - 5" :actionComplete="actionComplete">
            <e-columns>
              <e-column headerText="Actions" textAlign="Left" width="300" :template="ActionsTemplate"></e-column>
              <e-column field="WPMReview" headerText="WPM Review" textAlign width="100"></e-column>
              <e-column field="QAReview" headerText="QA Review" textAlign width="100"></e-column>
              <e-column field="PCAReview" headerText="PCA Review" textAlign width="100"></e-column>
              <e-column field="WorkplanNumber" headerText="Work Plan Number" width="100"></e-column>
              <e-column field="WorkplanTitle" headerText="Work Plan Title" textAlign="Left" width="200"></e-column>
              <e-column field="Status" headerText="Status" width="100"></e-column>
              <e-column field="Month" headerText="Month" textAlign="Left" width="50"></e-column>
              <e-column field="Year" headerText="Year" textAlign="Left" width="50"></e-column>
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
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import Vue from 'vue'
import MSR from '@/models/MSR'
import User from '@/models/User'
import Workplan from '@/models/WorkPlan'
import Personnel from '@/models/Personnel'
import { Page, DetailRow } from '@syncfusion/ej2-vue-grids'

let vm = null

export default {
  name: 'msrhome',
  /* props: {
    refresh: {
      type: Boolean
    }
  }, */
  errorCaptured(err, vm, info) {
    const notification = {
      type: 'danger',
      title: 'Error in MSR Home ' + err,
      message: info,
      push: true
    }
    this.$store.dispatch('notification/add', notification, { root: true })
  },
  computed: {
    userloaded() {
      return User.getters('Loaded')
    },
    loaded() {
      return MSR.getters('Loaded')
    },
    workplansloaded() {
      return Workplan.getters('Loaded')
    },
    personnelloaded() {
      return Personnel.getters('Loaded')
    },
    user() {
      return User.getters('CurrentUser')
    },
    userid() {
      return User.getters('CurrentUserId')
    },
    allmsrs() {
      return MSR.getters('allMSRs')
    },
    currentmsrs() {
      return MSR.getters('CurrentMSRs')
    },
    allpersonnel() {
      // TODO: Do we need to keep this? Used for getting subs for workplans
      return Personnel.getters('allPersonnel')
    },
    allworkplans() {
      return Workplan.getters('allWorkplans')
    },
    appversion() {
      return User.getters('AppVersion')
    },
    isPM() {
      return User.getters('isPM')
    },
    isDeveloper() {
      return User.getters('isDeveloper')
    },
    isOwner() {
      return User.getters('isOwner')
    },
    isWPManager() {
      return User.getters('isWPManager')
    },
    isPCA() {
      return User.getters('isPCA')
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
      pageSettings: { pageSize: 30 },
      refreshcount: 0,
      formheight: 0,
      WorkplanNumber: '',
      viewTitle: 'MSR View for WP ',
      busyTitle: 'Getting Data. Please Wait.',
      overlayText: 'Getting Data. Please Wait...',
      overlayVariant: 'light',
      interval: null,
      busyMax: 100,
      busyValue: 0,
      busyVariant: 'success',
      Company: '',
      Email: '',
      Month: '',
      Year: 2020,
      msrs: [],
      workplans: [],
      temp: [],
      count: 0,
      total: 0,
      timer: '',
      showForm: false,
      selecteddata: null,
      distribution: {
        WorkplanNumber: null,
        Title: '',
        Name: '',
        Organization: '',
        Phone: '',
        Location: '',
        Email: '',
        From: '',
        To: '',
        Id: null
      },
      ManagerEmail: '',
      ActionsTemplate: function() {
        return {
          template: Vue.component('columnTemplate', {
            template: `
            <div>
              <div v-if="data.Locked === 'Yes'">
                <b-button disabled class="actionbutton" v-b-tooltip.hover.v-dark title="Locked For Editing">
                  <font-awesome-icon far icon="eye" class="icon"></font-awesome-icon> Edit MSR
                </b-button>
                <b-button disabled v-if="isWPManager" variant="warning" class="actionbutton" @click="wpmreview(data)" v-b-tooltip.hover.v-dark title="Locked For Editing">
                  <font-awesome-icon far icon="user-tie" class="icon"></font-awesome-icon><div class="float-right" v-html="tooltipme('WPMReview', data)"></div>
                </b-button>
                <b-button disabled v-if="isPCA" variant="warning" class="actionbutton" @click="pcareview(data)" v-b-tooltip.hover.v-dark title="Locked For Editing">
                  <font-awesome-icon far icon="user-tag" class="icon"></font-awesome-icon><div class="float-right" v-html="tooltipme('PCAReview', data)"></div>
                </b-button>
                <b-button disabled v-if="isQA" variant="warning" class="actionbutton" @click="qareview(data)" v-b-tooltip.hover.v-dark title="Locked For Editing">
                  <font-awesome-icon far icon="user-lock" class="icon"></font-awesome-icon><div class="float-right" v-html="tooltipme('QAReview', data)"></div>
                </b-button>
              </div>
              <div v-else>
                <b-button variant="success" class="actionbutton" @click="edit(data)" v-b-tooltip.hover.v-dark title="Edit">
                  <font-awesome-icon far icon="eye" class="icon"></font-awesome-icon> Edit MSR
                </b-button>
                <b-button v-if="isWPManager" variant="warning" class="actionbutton" @click="wpmreview(data)" v-b-tooltip.hover.v-dark :title="tooltipme('WPMReview', data)">
                  <font-awesome-icon far icon="user-tie" class="icon"></font-awesome-icon><div class="float-right" v-html="tooltipme('WPMReview', data)"></div>
                </b-button>
                <b-button v-if="isPCA" variant="warning" class="actionbutton" @click="pcareview(data)" v-b-tooltip.hover.v-dark :title="tooltipme('PCAReview', data)">
                  <font-awesome-icon far icon="user-tag" class="icon"></font-awesome-icon><div class="float-right" v-html="tooltipme('PCAReview', data)"></div>
                </b-button>
                <b-button v-if="isQA" variant="warning" class="actionbutton" @click="qareview(data)" v-b-tooltip.hover.v-dark :title="tooltipme('QAReview', data)">
                  <font-awesome-icon far icon="user-lock" class="icon"></font-awesome-icon><div class="float-right" v-html="tooltipme('QAReview', data)"></div>
                </b-button>
              </div>
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
              isDeveloper() {
                return User.getters('isDeveloper')
              },
              isWPManager() {
                return User.getters('isWPManager')
              },
              isPCA() {
                return User.getters('isPCA')
              },
              isQA() {
                return User.getters('isQA')
              },
              isSubcontractor() {
                return User.getters('isSubcontractor')
              }
            },
            methods: {
              edit: async function(data) {
                // Add a digest call here to ensure that the msr is updated properly
                await MSR.dispatch('getDigest')
                if (console) {
                  console.log('Locking and Editing MSR')
                }
                clearInterval(vm.$options.interval)
                vm.selecteddata = data
                let payload = {}
                payload.field = 'Locked'
                payload.value = 'Yes'
                payload.uri = data.uri
                payload.etag = data.etag
                MSR.dispatch('updateMSRData', payload).then(function(response) {
                  vm.$router.push({ name: 'MSRForm', params: { id: response.Id, msrdata: response } })
                })
              },
              tooltipme: function(s, data) {
                let tooltip = 'Mark as '
                switch (s) {
                  case 'WPMReview':
                    tooltip += ' WPM Review '
                    switch (data.WPMReview) {
                      case 'Complete':
                        tooltip += 'Pending'
                        break

                      case 'Pending':
                        tooltip += 'Complete'
                        break
                    }
                    break

                  case 'PCAReview':
                    tooltip += ' PCA Review '
                    switch (data.PCAReview) {
                      case 'Complete':
                        tooltip += 'Pending'
                        break

                      case 'Pending':
                        tooltip += 'Complete'
                        break
                    }
                    break

                  case 'QAReview':
                    tooltip += ' QA Review '
                    switch (data.QAReview) {
                      case 'Complete':
                        tooltip += 'Pending'
                        break

                      case 'Pending':
                        tooltip += 'Complete'
                        break
                    }
                    break
                }
                return tooltip
              },
              wpmreview: function(data) {
                const notification = {
                  type: 'danger',
                  title: 'Toggling WPM Review',
                  message: 'Please wait...',
                  push: true
                }
                this.$store.dispatch('notification/add', notification, { root: true })
                let payload = {}
                payload.field = 'WPMReview'
                switch (data.WPMReview) {
                  case 'Complete':
                    payload.value = 'Pending'
                    break

                  case 'Pending':
                    payload.value = 'Complete'
                    break
                }
                payload.uri = data.uri
                payload.etag = data.etag
                MSR.dispatch('updateMSRData', payload).then(function() {
                  vm.$router.push({ name: 'Refresh', params: { action: 'msrhome' } })
                })
              },
              pcareview: function(data) {
                const notification = {
                  type: 'danger',
                  title: 'Toggling PCA Review',
                  message: 'Please wait...',
                  push: true
                }
                this.$store.dispatch('notification/add', notification, { root: true })
                let payload = {}
                payload.field = 'PCAReview'
                switch (data.PCAReview) {
                  case 'Complete':
                    payload.value = 'Pending'
                    break

                  case 'Pending':
                    payload.value = 'Complete'
                    break
                }
                payload.uri = data.uri
                payload.etag = data.etag
                MSR.dispatch('updateMSRData', payload).then(function() {
                  vm.$router.push({ name: 'Refresh', params: { action: 'msrhome' } })
                })
              },
              qareview: function(data) {
                const notification = {
                  type: 'danger',
                  title: 'Toggling QA Review',
                  message: 'Please wait...',
                  push: true
                }
                this.$store.dispatch('notification/add', notification, { root: true })
                let payload = {}
                payload.field = 'QAReview'
                switch (data.QAReview) {
                  case 'Complete':
                    payload.value = 'Pending'
                    break

                  case 'Pending':
                    payload.value = 'Complete'
                    break
                }
                payload.uri = data.uri
                payload.etag = data.etag
                MSR.dispatch('updateMSRData', payload).then(function() {
                  vm.$router.push({ name: 'Refresh', params: { action: 'msrhome' } })
                })
              }
            }
          })
        }
      }
    }
  },
  mounted: async function() {
    vm = this
    await MSR.dispatch('getDigest') // waits for the digest to be loaded
    this.getData()
  },
  beforeDestroy() {
    this.$store.dispatch('support/setLegendItems', [])
  },
  methods: {
    getData: function() {
      MSR.dispatch('getMSRs')
        .then(function() {
          vm.interval = setInterval(vm.displayMSRs, 500)
        })
        .then(() => {
          // Reload the page after 15 minutes
          vm.$options.interval = setInterval(vm.reloadPage, 1080000) // Updating to 18 minutes for reload
        })
    },
    reloadPage: function() {
      clearInterval(this.$options.interval)
      if (window.location.hash.indexOf('/msr/home') > -1) window.location.reload()
    },
    displayMSRs: function() {
      if (this.loaded) {
        clearInterval(this.interval)
        try {
          if (vm.isSubcontractor) {
            vm.$store.dispatch('support/addActivity', '<div class="bg-primary">msrhome-displayMSRs Step 1 isSubcontractor: ' + vm.$moment().format() + '</div>')
            let hasWorkplans = false
            if (vm.user[0].WPData && vm.user[0].WPData.length > 2) {
              let wpdata = JSON.parse(vm.user[0].WPData)
              for (let i = 0; i < wpdata.length; i++) {
                let ps = Number(wpdata[i]['PercentSupport'])
                vm.$store.dispatch('support/addActivity', '<div class="bg-primary">msrhome-displayMSRs Step 2 WPDATA Loop Percent Support: ' + ps + '</div>')
                if (ps > 0) {
                  hasWorkplans = true
                  let wpn = wpdata[i]['WorkplanNumber']
                  // loop through msrs and assign based on wp
                  vm.$store.dispatch('support/addActivity', '<div class="bg-primary">msrhome-displayMSRs Step 3 Checking all msrs for match: ' + vm.$moment().format() + '</div>')
                  for (let j = 0; j < vm.allmsrs.length; j++) {
                    // add a check to see if the msrs already includes the specified MSR
                    if (vm.allmsrs[j]['WorkplanNumber'] === wpn && !vm.msrs.includes(vm.allmsrs[j])) {
                      vm.msrs.push(vm.allmsrs[j])
                    }
                  }
                }
              }
            }
            if (hasWorkplans === false) {
              /* const notification = {
                  type: 'danger',
                  title: 'Error in MSR Home',
                  message: 'You are not assigned any MSRs',
                  push: true
                }
                this.$store.dispatch('notification/add', notification, { root: true }) */
              this.overlayText = 'You are not assigned to any workplans in the portal. Please contact us...'
              this.overlayVariant = 'warning'
            }
          } else {
            vm.$store.dispatch('support/addActivity', '<div class="bg-primary">msrhome-displayMSRs Step 4: ' + vm.$moment().format() + '</div>')
            // User is something other than Subcontractor
            vm.msrs = Vue._.orderBy(vm.allmsrs, 'WorkplanNumber', 'asc')
          }
        } catch (e) {
          this.overlayText = 'There was an error getting MSR data. Please contact us...'
          this.overlayVariant = 'danger'
          // Add user notification and system logging
          /* const notification = {
              type: 'danger',
              title: 'Portal Error',
              message: e,
              push: true
            }
            this.$store.dispatch('notification/add', notification, {
              root: true
            })
            console.log('ERROR: ' + e) */
        }
      } else {
        // will we ever get here
        if (console) {
          console.log('NOT LOADED. LOADING AGAIN.')
        }
        this.getData()
      }
    },
    onModalHide: function() {
      this.showForm = false
    },
    setClosed: function() {
      this.showForm = false
    },
    actionComplete(args) {
      if (args.requestType == 'columnstate') {
        this.$refs.MSRGrid.autoFitColumns()
      }
      if (args.requestType == 'refresh') {
        let h1 = 0
        let h2 = this.$refs.MSRGrid.$el.children[2].children[0].clientHeight // cildren[2] matches .e-gridconent
        h1 = Math.floor(h2 / 20)
        this.pageSettings.pageSize = h1
        this.$refs.MSRGrid.pageSettings = { pageSize: h1 }
        this.$refs.MSRGrid.autoFitColumns()
      }
    },
    dataBound: function() {
      this.$refs.MSRGrid.autoFitColumns()
    }
  },
  cron: {
    time: 10000,
    method: 'getData'
  },
  provide: {
    grid: [Page, DetailRow]
  }
}
</script>

<style lang="scss">
.flexcontainer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}
.list {
  flex: 1;
  border: 1px solid red;
}
</style>
