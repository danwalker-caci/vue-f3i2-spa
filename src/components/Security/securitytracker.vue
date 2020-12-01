<template>
  <div>
    <ejs-grid id="FormsGrid" ref="FormsGrid" :dataSource="forms" :allowPaging="true" :allowReordering="false" :pageSettings="pageSettings" :editSettings="editSettings" :filterSettings="filterSettings" :toolbar="toolbar" :allowExcelExport="false" :detailTemplate="detailTemplate" rowHeight="20" height="100%" width="100%">
      <e-columns>
        <e-column field="PersonName" headerText="Person Name" textAlign="Left" width="250"></e-column>
        <e-column field="Company" headerText="Company" width="100" textAlign="Left"></e-column>
        <e-column field="AccountTypes" headerText="Account Types" textAlign="Left" width="150"></e-column>
        <e-column field="Id" headerText="Id" :visible="false" textAlign="Left" width="40" :isPrimaryKey="true"></e-column>
        <!-- Add a hidden column that is showable using the Types entries. Need to format the Types entries and add conditional logical buttons for each. -->
        <e-column field="GovSentDate" :visible="false" textAlign="Left" width="40"></e-column>
        <e-column field="GovCompleteDate" :visible="false" textAlign="Left" width="40"></e-column>
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
  data: function() {
    return {
      forms: null,
      pageSettings: { pageSize: 15 },
      editSettings: {
        allowEditing: false,
        allowAdding: false,
        allowDeleting: false,
        mode: 'Dialog'
      },
      filterSettings: { type: 'Menu' },
      toolbar: ['Edit', 'Print', 'Search', 'ExcelExport']
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
    // get all of the entries from the SecurityForms list
  },
  methods: {
    checkType: async function() {
      switch (this.form) {
        case 'NIPR':
          // set the url for the post of file
          this.library = 'AccountsNIPR'
          this.libraryUrl = this.AccountsNIPRForms
          this.formType = 'account'
          break
        case 'SIPR':
          this.library = 'AccountsSIPR'
          this.libraryUrl = this.AccountsSIPRForms
          this.formType = 'account'
          break
        case 'DREN':
          this.library = 'AccountsDREN'
          this.libraryUrl = this.AccountsDRENForms
          this.formType = 'account'
          break
        case 'JWICS':
          this.library = 'AccountsJWICS'
          this.libraryUrl = this.AccountsJWICSForms
          this.formType = 'account'
          break
        case 'CAC':
          this.library = 'CACForms'
          this.libraryUrl = this.CACForms
          this.formType = 'cac'
          break
        case 'SCI':
          this.library = 'SCIForms'
          this.libraryUrl = this.SCIForms
          this.formType = 'sci'
          break
      }
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
