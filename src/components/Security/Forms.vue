<template>
  <!-- Add Form where users can download master docs and upload the changed docs. -->
  <div></div>
</template>
<script>
import User from '@/models/User'
import Personnel from '@/models/Personnel'
import Workplan from '@/models/WorkPlan'
import Company from '@/models/Company'
export default {
  name: 'SecurityForms',
  props: {
    // Switches the form type between Account, CAC and SCI
    formType: {
      type: String,
      default: 'Account'
    }
  },
  computed: {
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
    }
  },
  data: function() {
    return {
      AccountMasterDocs: '/sites/f3i2/AccountsMasterDocs/',
      AccountsNIPRDocs: '/sites/f3i2/AccountsNIPR/',
      AccountsDRENDocs: '/sites/f3i2/AccountsDREN/',
      AccountsSIPRDocs: '/sites/f3i2/AccountsSIPR/',
      AccountsJWICSDocs: '/sites/f3i2/AccountsJWICS/'
    }
  },
  mounted: function() {
    this.checkType(this.formType)
  },
  methods: {
    checkType: function(type) {
      switch (type) {
        case 'Account':
          // Load the Account form
          // Get all of the Account forms from the master doc library and write them on a new tab with the following url:
          // https://mysite.sharepoint.com/_layouts/download.aspx?SourceUrl=https://mysite.sharepoint.com/documents/myfiie.pdf
          break
        case 'CAC':
          // Load CAC Form
          // Get all of the CAC forms from the master doc library and write them on a new tab with the following url:
          // https://mysite.sharepoint.com/_layouts/download.aspx?SourceUrl=https://mysite.sharepoint.com/documents/myfiie.pdf
          break
        case 'SCI':
          // Load SCI Form
          // Get all of the SCI forms from the master doc library and write them on a new tab with the following url:
          // https://mysite.sharepoint.com/_layouts/download.aspx?SourceUrl=https://mysite.sharepoint.com/documents/myfiie.pdf
          break
      }
    }
  }
}
</script>
<style lang="scss"></style>
