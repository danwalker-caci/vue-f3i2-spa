<template>
  <b-container fluid class="contentHeight p-0">
    <b-row class="m-1 buttonrow">
      <b-dropdown :text="month ? month : 'Month'" class="filterSelection" v-if="monthValues.length > 0" variant="secondary">
        <b-dropdown-item v-for="monthValue in monthValues" :key="monthValue.value" :value="monthValue.value" @click="internalMonth = monthValue.value">{{ monthValue.text }}</b-dropdown-item>
      </b-dropdown>
      <b-dropdown :text="year ? year : 'Year'" class="filterSelection" v-if="yearValues.length > 0" variant="secondary">
        <b-dropdown-item v-for="yearValue in yearValues" :key="yearValue.value" :value="yearValue.value" @click="internalYear = yearValue.value">{{ yearValue.text }}</b-dropdown-item>
      </b-dropdown>
      <b-dropdown id="workplans" :text="workplan ? workplan : 'Workplan'" class="filterSelection" v-if="workplans.length > 0" variant="secondary">
        <b-dropdown-item v-for="workplanValue in workplans" :key="workplanValue" :value="workplanValue.value" @click="internalWP = workplanValue.value">{{ workplanValue.value }}</b-dropdown-item>
      </b-dropdown>
      <b-button variant="danger" class="filterSelection" @click="clearFilters()">Clear</b-button>
      <b-button variant="success" class="filterSelection" @click="filterLibrary()">Filter</b-button>
      <b-button variant="light" class="filterSelection" @click="copyFilter()">Copy Filter Link</b-button>
    </b-row>
    <iframe id="LibraryFrame" :src="iframe.src" @load="load" v-show="iframe.loaded" :height="rect.height - 70" width="100%"></iframe>
  </b-container>
</template>

<script>
import Workplan from '@/models/WorkPlan'
/*const date = new Date()
const currentMonth = date.toLocaleString('default', { month: 'short' }).toLocaleUpperCase()
const currentYear = date.toLocaleString('default', { year: 'numeric' })*/
const originalUrl = '/sites/f3i2/MSRLibrary/Forms/AllItems.aspx?isDlg=1'
let vm = null
export default {
  name: 'msr-library',
  props: {
    month: {
      type: String
    },
    year: {
      type: String
    },
    workplan: {
      type: String
    }
  },
  computed: {
    workplans() {
      return Workplan.getters('DropDown')
    },
    rect() {
      return this.$store.state.support.contentrect
    }
  },
  data: function() {
    return {
      iframe: {
        src: originalUrl,
        loaded: false
      },
      // adding internal mutable stuff
      internalMonth: '',
      internalYear: '',
      internalWP: '',
      filterArray: [],
      // Get these converted over to objects like above
      monthValues: [
        { value: null, text: 'Select ...' },
        { value: 'JAN', text: 'JAN' },
        { value: 'FEB', text: 'FEB' },
        { value: 'MAR', text: 'MAR' },
        { value: 'APR', text: 'APR' },
        { value: 'MAY', text: 'MAY' },
        { value: 'JUN', text: 'JUN' },
        { value: 'JUL', text: 'JUL' },
        { value: 'AUG', text: 'AUG' },
        { value: 'SEP', text: 'SEP' },
        { value: 'OCT', text: 'OCT' },
        { value: 'NOV', text: 'NOV' },
        { value: 'DEC', text: 'DEC' }
      ],
      yearValues: [
        { value: null, text: 'Select ...' },
        { value: '2019', text: '2019' },
        { value: '2020', text: '2020' },
        { value: '2021', text: '2021' },
        { value: '2022', text: '2022' }
      ]
    }
  },
  mounted: function() {
    vm = this
    this.filterLibrary()
    this.internalMonth = this.month
    this.internalYear = this.year
    this.internalWP = this.workplan
  },
  methods: {
    clearFilters: function() {
      console.log(`CLEARING FILTER: ${this.url}`)
      this.internalMonth = null
      this.internalYear = null
      this.internalWP = null
      this.filterArray.forEach(function(fa) {
        vm.filterArray.pop(fa)
      })
      this.filterLibrary()
    },
    copyFilter: function() {
      let link = window.location.href
      if (this.internalMonth) {
        link += '/month/' + this.internalMonth
      }
      if (this.internalYear) {
        link += '/year/' + this.internalYear
      }
      if (this.internalWP) {
        link += '/workplan/' + this.internalWP
      }
      let filterText = document.createElement('textarea')
      filterText.value = link
      filterText.setAttribute('readonly', '')
      filterText.style.position = 'absolute'
      filterText.style.left = '-9999px'
      document.body.appendChild(filterText)
      filterText.select()
      document.execCommand('copy')
      document.body.removeChild(filterText)
    },
    filterLibrary: function() {
      this.url = originalUrl
      /*if (this.clin) {
        if (console) {
          console.log(`CLIN: ${this.clin}`)
        }
        this.filterArray.push({ type: 'CLIN', value: this.clin })
      }*/
      if (this.internalMonth) {
        if (console) {
          console.log(`Month: ${this.internalMonth}`)
        }
        this.filterArray.push({ type: 'Month', value: this.internalMonth })
      }
      if (this.internalYear) {
        if (console) {
          console.log(`Year: ${this.internalYear}`)
        }
        this.filterArray.push({ type: 'Year', value: this.internalYear })
      }
      if (this.internalWP) {
        if (console) {
          console.log(`Workplan: ${this.internalWP}`)
        }
        this.filterArray.push({ type: 'WorkplanNumber0', value: this.internalWP })
      }
      if (this.filterArray.length > 0) {
        try {
          this.filterArray.forEach(function(fa, i) {
            var number = i + 1
            vm.url += '&FilterField' + number + '=' + fa.type + '&FilterValue' + number + '=' + fa.value
          })
        } catch (e) {
          console.log(`ERROR: ${e}`)
        }
      }
      this.iframe.loaded = false
      this.iframe.src = this.url
      this.$options.interval = setInterval(this.load, 750)
    },
    load: function() {
      clearInterval(this.$options.interval)
      try {
        let frame = document.getElementsByTagName('iframe')[0].contentWindow
        frame.document.getElementById('s4-ribbonrow').style.display = 'none'
        frame.document.getElementById('s4-workspace').style.padding = '15px'
        frame.document.getElementById('WPQ2_ListTitleViewSelectorMenu_Container').style.display = 'none'
        frame.document.getElementById('Hero-WPQ2').style.display = 'none'
      } catch (e) {
        // don't care here
      }
      this.iframe.loaded = true
    }
  }
}
</script>

<style lang="scss" scoped>
.buttonrow {
  height: 50px;
}

.filterSelection {
  margin-left: 0.75rem;
}
</style>
