<template>
  <b-container fluid class="contentHeight m-0 p-0">
    <b-row no-gutters class="contentHeight">
      <b-col cols="12" class="m-0 p-0">
        <dynamic-table
          v-if="queryset"
          :user="currentUser"
          :table="{ id: id, title: title, list: list, query: query, headerClass: headerClass, buttons: buttons, fields: fields, isLibrary: isLibrary, hasRequiredFields: hasRequiredFields, rowHeight: rowHeight, allowPaging: allowPaging, pageSize: pageSize, height: height, width: width }"
        ></dynamic-table>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import User from '@/models/User'
import DynamicTable from '../Bootstrap/DynamicTable'

export default {
  components: { DynamicTable },
  name: 'droppoff-library',
  computed: {
    currentuser() {
      return User.getters('CurrentUser')
    }
  },
  data: function() {
    return {
      id: 1,
      title: 'Documents' /* Header Title and Table Title */,
      list: 'GovernmentDocuments' /* list name to get data for. Also used to create links for library files. */,
      currentUser: null,
      headerClass: 'text-left bg-light-blue',
      action: '',
      buttons: ['Upload'] /* Add, Edit, Export, Filter, Search, Upload, Print */,
      fields: [
        { field: 'Actions', label: 'Actions', actions: ['Delete'], width: '80' }, // actions should be permissions the users permissions can be checked to see if they can perform the actions on the given list/item
        { field: 'Name', label: 'Title', type: 'file', format: 'link', required: true, selected: '', url: '', rurl: '' },
        { field: 'Author', label: 'Uploaded By', type: 'user', format: 'text' },
        { field: 'Created', label: 'Uploaded', type: 'default', format: 'date', dateformat: 'date-time' }
      ],
      query: '',
      queryset: false,
      isLibrary: true,
      hasFolders: false,
      hasRequiredFields: true,
      maximized: true,
      rowHeight: 20,
      allowPaging: true,
      pageSize: 0,
      height: 0,
      width: 0
    }
  },
  mounted: function() {
    this.currentUser = this.currentuser
    let url = "https://infoplus.caci.com/sites/f3i2/_api/web/lists/getByTitle('GovernmentDocuments')/items?$select=*,Author/Title,File/Name,File/ServerRelativeUrl&$expand=Author,File&$filter=(FSObjType ne 1)"
    this.query = url
    this.queryset = true
  }
}
</script>
