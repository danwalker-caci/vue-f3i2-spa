<template>
  <b-container fluid class="contentHeight m-0 p-0">
    <b-row no-gutters class="contentHeight">
      <b-col cols="12" class="m-0 p-0">
        <b-container fluid class="contentHeight m-0 p-0">
          <b-form @submit="onSubmit">
            <b-row no-gutters class="buttonrow">
              <GridFilter filtertype="travel"></GridFilter>
            </b-row>
            <b-row no-gutters class="gridrow">
              <b-overlay :show="filteredtravel.length == 0" :variant="overlayVariant" z-index="3000">
                <ejs-grid
                  v-if="loaded"
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
                  :rowDataBound="rowDataBound"
                  :actionBegin="actionBegin"
                  :actionComplete="actionComplete"
                  :queryCellInfo="formatCell"
                  :excelQueryCellInfo="formatExcelCell"
                  rowHeight="20"
                  :height="contentrect.height - 165"
                  :width="contentwidth - 5"
                >
                  <e-columns>
                    <e-column headerText="Actions" textAlign="Left" width="100" :lockColumn="true" :template="actionsTemplate"></e-column>
                    <e-column field="Status" :lockColumn="true" headerText="Status" width="150"></e-column>
                    <e-column field="Title" headerText="Subject" textAlign="Left" minWidth="200" width="300" maxWidth="500"></e-column>
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
                    <e-column field="Comments" headerText="Purpose" textAlign="Left" width="350"></e-column>
                    <e-column field="TripReport" headerText="Trip Report" textAlign="Left" width="180" :template="tripReportTemplate"></e-column>
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

<script lang="ts">
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component, Vue, Ref } from 'vue-property-decorator'
import { EventBus } from '../../main'
import { namespace } from 'vuex-class'
import GridFilter from '../Layout/GridFilter2TS.vue'
import { Notification } from '../../interfaces/Notification'
import { ClickEventArgs } from '@syncfusion/ej2-vue-navigations'
import { GridComponent, EditSettings, ActionEventArgs, RowDataBoundEventArgs, QueryCellInfoEventArgs, ExcelQueryCellInfoEventArgs } from '@syncfusion/ej2-vue-grids'
import { Page, Edit, Toolbar, Resize, Reorder, VirtualScroll, ExcelExport, DetailRow, Freeze } from '@syncfusion/ej2-vue-grids'
import ActionsTemplate from './ActionsTemplate.vue'
import TripReportTemplate from './TripReportTemplate.vue'
import { FilterFieldItem } from '@/interfaces/FilterFieldItem'
import moment from 'moment'

const notify = namespace('notify')
const support = namespace('support')
const users = namespace('users')
const travel = namespace('travel')

let vm: any = null

@Component({
  name: 'TravelTracker',
  components: {
    GridFilter
  },
  provide: {
    grid: [Page, Edit, DetailRow, Toolbar, Resize, Reorder, VirtualScroll, ExcelExport, Freeze]
  }
})
export default class TravelTracker extends Vue {
  public loaded?: boolean = false
  public overlayText?: string = 'Getting Data. Please Wait...'
  public overlayVariant?: string = 'light'

  @notify.Action
  public add!: (notification: Notification) => void

  @travel.Action
  public getDigest!: () => Promise<boolean>

  @travel.Action
  public getTravel!: (payload: any) => Promise<boolean>

  @travel.Action
  public setFilteredTravel!: (payload: any) => Promise<boolean>

  @travel.Action
  public setfilterFields!: (fields: Array<FilterFieldItem>) => void

  public actionsTemplate() {
    return { template: ActionsTemplate }
  }

  public tripReportTemplate() {
    return { template: TripReportTemplate }
  }

  get Digest() {
    return this.$store.state.travel.digest
  }

  get Loaded() {
    return this.$store.state.travel.loaded
  }

  get travel() {
    return this.$store.state.travel.alltravel
  }

  get filteredtravel() {
    return this.$store.state.travel.filteredtravel
  }

  get isSubcontractor() {
    return this.$store.state.users.currentUser.isSubcontractor
  }

  get contentwidth() {
    return this.$store.state.support.contentwidth
  }

  get contentrect() {
    return this.$store.state.support.contentrect
  }

  @Ref('TravelGrid') TravelGrid!: GridComponent

  /** @method - lifecycle hook */
  created() {
    window.addEventListener('resize', function() {
      window.location.reload()
    })
    EventBus.$on('showhide', (data: any) => {
      this.showorhide(data)
    })
    EventBus.$on('sortit', (data: any) => {
      this.sortit(data)
    })
    EventBus.$on('SidebarChanged', (data: any) => {
      this.resetGrid(data)
    })
  }

  /** @method - lifecycle hook */
  mounted() {
    vm = this
    this.getDigest()
    const payload: any = {}
    payload.query = '?$select=*&$orderby=Id desc'
    this.getTravel(payload).then(response => {
      vm.loaded = true
    })
  }

  public rowData?: any = {}
  public newData?: any = {}
  public pageSettings?: any = { pageSize: 30 }
  public editSettings?: any = {
    allowEditing: this.isSubcontractor ? false : true,
    allowAdding: this.isSubcontractor ? false : true,
    allowDeleting: false,
    mode: 'Dialog'
  }
  public toolbar?: any = this.isSubcontractor ? ['Search'] : ['Add', 'Edit', 'Print', 'Search', 'ExcelExport']

  public onSubmit(event: any) {
    event.preventDefault()
  }

  public resetGrid(width: any) {
    // redraw the grid when the sidebar hides or unhides
    const that = this
    window.setTimeout(function() {
      console.log('RESET GRID: ' + width)
      ;(that.$refs['TravelGrid'] as GridComponent).setProperties(
        {
          width: width - 5
        },
        false
      )
    }, 500)
  }

  public toolbarClick(args?: ClickEventArgs) {
    switch (args!.item!.id) {
      case 'TravelGrid_excelexport':
        ;(this.$refs['TravelGrid'] as GridComponent).excelExport()
        break

      case 'TravelGrid_print':
        ;(this.$refs['TravelGrid'] as GridComponent).print()
        break
    }
  }

  public actionBegin(args?: ActionEventArgs) {
    switch (args!.requestType) {
      case 'add':
        args!.cancel = true
        this.$router.push({ name: 'New Travel', params: { back: 'Travel Tracker' } })
        break
    }
  }

  public actionComplete(args?: ActionEventArgs | undefined) {
    if (args!.requestType == 'columnstate') {
      ;(this.$refs['TravelGrid'] as GridComponent).autoFitColumns()
    }
    if (args!.requestType == 'refresh') {
      let h1 = 0
      const h2 = (this.$refs['TravelGrid'] as GridComponent).$el.children[7].children[0].clientHeight // children[7] matches .e-gridcontent
      h1 = Math.floor(h2 / 20)
      this.pageSettings = { pageSize: h1 }
    }
  }

  public dataBound() {
    ;(this.$refs['TravelGrid'] as GridComponent).autoFitColumns()
    let h1 = 0
    const h2 = (this.$refs['TravelGrid'] as GridComponent).$el.children[7].children[0].clientHeight // children[7] matches .e-gridcontent
    h1 = Math.floor(h2 / 20)
    this.pageSettings = { pageSize: h1 }
  }

  public rowDataBound(args?: RowDataBoundEventArgs) {
    let c = String(args!.data!['Status'])
    c = 'travel-' + c
    args!.row!.classList.add(c)
  }

  public formatCell(args?: QueryCellInfoEventArgs) {
    let c = String(args!.data!['Status'])
    c = 'travel-' + c
    if (args!.column!.field! == 'TripReport') {
      args!.cell!.classList.add('bg-white', 'text-dark')
    } else {
      args!.cell!.classList.add(c)
    }
  }

  public formatExcelCell(args?: ExcelQueryCellInfoEventArgs) {
    switch (args!.column!.field) {
      case 'Created': {
        args!.value = moment(args!.value as string).format('MM/DD/YYYY')
        break
      }
      case 'StartTime': {
        args!.value = moment(args!.value as string).format('MM/DD/YYYY')
        break
      }
      case 'EndTime': {
        args!.value = moment(args!.value as string).format('MM/DD/YYYY')
        break
      }
      case 'OCONUSApprovedOn': {
        args!.value = moment(args!.value as string).format('MM/DD/YYYY')
        break
      }
      case 'SecurityActionCompleted': {
        args!.value = moment(args!.value as string).format('MM/DD/YYYY')
        break
      }
    }
  }

  public showorhide(e: any) {
    const checked = e.checked
    const displayname = String(e.displayname)
    if (e.type == 'travel') {
      if (checked) {
        ;(this.$refs['TravelGrid'] as GridComponent).showColumns(displayname)
        ;(this.$refs['TravelGrid'] as GridComponent).autoFitColumns()
      } else {
        ;(this.$refs['TravelGrid'] as GridComponent).hideColumns(displayname)
        ;(this.$refs['TravelGrid'] as GridComponent).autoFitColumns()
      }
    }
  }

  public sortit(e: any) {
    let p = this.filteredtravel
    if (e.datatype == 'Date') {
      p = Vue._.orderBy(
        p,
        function(o: any) {
          return moment(o[e.fieldname]).format('YYYYMMDD')
        },
        e.direction
      )
    } else {
      p = Vue._.orderBy(p, e.fieldname, e.direction)
    }
    this.setFilteredTravel(p).then(function() {
      ;(vm.$refs['TravelGrid'] as GridComponent).refresh()
    })
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
.tableHeight {
  height: calc(100vh - 180px);
}
</style>
