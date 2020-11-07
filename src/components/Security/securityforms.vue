<template>
  <!-- Add Form where users can download master docs and upload the changed docs. -->
  <div>
    <!-- Use the upload travel docs as a template for uploading documents -->
    <!-- If user is SUBC, only load the related personnel to their company. 
         Otherwise, load companies into dropdown and on user selection load all personnel related to that company into a dropdown. -->
    <!-- on submission, split the personnel first name, last name out of the dropdown. -->
    <b-modal v-model="Show" ref="TripReport" centered hide-footer no-fade modal-class="animated bounceInLeft" @close="onModalHide">
      <template v-slot:modal-title>Upload Account Forms</template>
      <table class="mt-1">
        <tbody>
          <tr class="text-center bg-warning text-white">
            <th>Upload an Account From</th>
          </tr>
          <tr>
            <td><ejs-uploader id="fileupload" name="UploadFiles" :selected="onFileSelect" :multiple="false"></ejs-uploader></td>
          </tr>
          <tr>
            <td>
              <div class="col p-0 text-right">
                <b-button-group class="mt-2">
                  <b-button variant="success" ref="btnOk" class="ml-2" @click="onModalSave">Submit</b-button>
                </b-button-group>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </b-modal>
  </div>
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
      return Personnel.getters('getPersonalByCompany')
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
      AccountMasterDocs: '/sites/f3i2/SiteDocuments/',
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
