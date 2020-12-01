<template>
  <div>
    <ejs-grid id="TodoGrid" ref="TodoGrid" :dataSource="mytodos" :allowPaging="true" :allowReordering="false" :pageSettings="pageSettings" :editSettings="editSettings" :filterSettings="filterSettings" :toolbar="toolbar" :allowExcelExport="false" :detailTemplate="detailTemplate" rowHeight="20" height="100%" width="100%">
      <e-columns>
        <e-column headerText="Actions" textAlign="Left" width="100" :template="ActionsTemplate"></e-column>
        <e-column field="Title" headerText="Title" textAlign="Left" width="200"></e-column>
        <e-column field="Status" headerText="Number" width="100"></e-column>
        <e-column headerText="Go To Item" textAlign="Left" width="125" :template="GoToTemplate"></e-column>
        <e-column field="StartDate" headerText="POP Start" textAlign="Left" width="150"></e-column>
        <e-column field="DueDate" headerText="POP End" textAlign="Left" width="150"></e-column>
        <e-column field="TaskType" headerText="Task Type" textAlign="Left" width="200"></e-column>
        <e-column field="Id" headerText="Id" :visible="false" textAlign="Left" width="40" :isPrimaryKey="true"></e-column>
        <e-column field="Body" :visible="false" textAlign="Left" width="40"></e-column>
        <e-column field="uri" :visible="false" textAlign="Left" width="40"></e-column>
        <e-column field="etag" :visible="false" textAlign="Left" width="40"></e-column>
      </e-columns>
    </ejs-grid>
  </div>
</template>
<script>
let vm = null
let url = _spPageContextInfo.webAbsoluteUrl

import User from '@/models/User'
import Personnel from '@/models/Personnel'
import Workplan from '@/models/WorkPlan'
import Company from '@/models/Company'
import Security from '@/models/Security'

export default {
  name: 'SecurityForms',
  props: {
    // Switches the form type between Account, CAC and SCI
    formType: {
      type: String,
      default: 'account'
    }
  },
  computed: {
    workplans() {
      return Workplan.getters('DropDown')
    },
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
    isSubcontractor() {
      return User.getters('isSubcontractor')
    }
  },
  mounted: async function() {
    vm = this
    // First get current user informaiton
    // Setup a timing chaing so that we don't try to get the personnel by Company Dropdown until the state is loaded.
    if (this.isSubcontractor) {
      Company.dispatch('getCompanies').then(function() {
        vm.$options.interval = setInterval(vm.waitForPersonnel, 1500)
      })
    }
  },
  methods: {
    checkType: async function() {
      console.log('Check the route and then determine what should be loaded.')
    },
    waitForPersonnel: async function() {
      if (this.currentuser) {
        // finally have user - now get the personnel based on their company
        this.form.Company = this.currentuser[0].Company ? this.currentuser[0].Company : this.companies[0]
        let payload = {}
        payload.company = this.form.Company
        Personnel.dispatch('getPersonnelByCompany', payload).then(function() {
          // Load all forms for personnel
        })
        clearInterval(vm.$options.interval)
      }
    },
    getPersonnelByCompany: async function() {
      let payload = {
        company: this.form.Company
      }
      await Personnel.dispatch('getPersonnelByCompany', payload).then(function() {
        if (vm.form.setName === 'Yes') {
          vm.form.PersonnelID = 'S'
        }
      })
    }
  }
}
</script>
<style lang="sass"></style>
