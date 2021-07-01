<template>
  <b-container fluid class="contentHeight m-0 p-0">
    <b-modal id="FileModal" ref="FileModal" centered hide-footer header-bg-variant="light-blue" size="lg" header-text-variant="light" @show="resetModal">
      <template v-slot:modal-title>Upload File</template>
      <b-container fluid class="p-0">
        <b-row class="m-0">
          <b-col cols="12" class="p-0">
            <b-form-group label="NOTICE">
              <b-form-textarea id="textarea_notice" v-html="notice" rows="3" disabled class="text-dark" style="resize: none;"></b-form-textarea>
            </b-form-group>
          </b-col>
        </b-row>
      </b-container>
      <b-container v-if="table.hasRequiredFields" fluid class="p-0">
        <b-row class="m-0" v-for="field in table.fields" :key="field" :style="showIfRequired(field)">
          <b-col cols="12" class="p-0">
            <b-form-group :label="field.label">
              <b-form-file v-if="field.type == 'file'" placeholder="Choose a file" no-drop class="form-control" v-model="field.selected" :id="'required_' + field.field" @input="fileSelected(field)" :state="!Invalid" :ref="field.field"></b-form-file>
              <b-form-select v-if="field.type == 'lookup'" class="form-control" :options="field.options" v-model="field.selected" :id="'required_' + field.field" :state="field.selected !== ''" :ref="field.field"></b-form-select>
            </b-form-group>
          </b-col>
        </b-row>
      </b-container>
      <b-container v-if="table.hasRecipients" fluid class="p-0">
        <div v-for="(option, index) in table.recipientOptions" :key="index">
          <keep-alive>
            <component :key="option.id" :is="option.component" v-bind="option"></component>
          </keep-alive>
        </div>
      </b-container>
      <b-container fluid class="p-0">
        <b-row class="m-0">
          <b-col cols="4" class="p-0">
            <b-alert v-if="Invalid" variant="danger" show class="p-0">{{ InvalidMessage }}</b-alert>
          </b-col>
          <b-col cols="4" class="p-0"></b-col>
          <b-col cols="4" class="p-0 text-right">
            <b-button v-if="isUploading" variant="success"><b-spinner variant="danger" class="loading-spinner"></b-spinner>&nbsp;Uploading...</b-button>
            <b-button variant="light-blue" @click.stop="UploadFile" title="Upload"><font-awesome-icon far icon="file-upload" class="icon"></font-awesome-icon>Upload</b-button>
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
    <b-row no-gutters class="contentHeight">
      <b-col cols="12" class="m-0 p-0">
        <b-container fluid class="contentHeight m-0 p-0">
          <b-row no-gutters class="contentHeight">
            <b-overlay :show="loaded == false" :variant="overlayVariant" z-index="3000">
              <b-container fluid class="contentHeight m-0 p-0">
                <b-row no-gutters :class="table.headerClass" class="dt-button-row">
                  <b-col cols="6" class="m-0 p-0" v-if="table.buttons.length > 0">
                    <span v-for="button in table.buttons" :key="button">
                      <b-button v-if="button == 'Upload'" v-b-modal.FileModal variant="light-blue"><font-awesome-icon fas icon="upload" class="icon"></font-awesome-icon>&nbsp;Upload</b-button>
                    </span>
                  </b-col>
                  <b-col cols="6" v-if="searchEnabled" class="pr-3">
                    <b-form @submit="onSubmit">
                      <b-input-group v-on:submit.native.prevent class="w-50 float-right">
                        <b-form-input v-on:submit.native.prevent size="small" v-model="search" placeholder="Search ..." @keyup.native="filtering"></b-form-input>
                        <b-input-group-append>
                          <b-button v-on:submit.native.prevent size="small" variant="primary" @click="searchFiltering($event)"><font-awesome-icon fas icon="search"></font-awesome-icon></b-button>
                        </b-input-group-append>
                      </b-input-group>
                    </b-form>
                  </b-col>
                </b-row>
                <b-row no-gutters class="table-row">
                  <b-overlay :show="noitems" :opacity="100" :variant="overlayVariant" z-index="3000">
                    <b-table-simple :id="getID('DynamicTable', table.id)" :ref="getID('DynamicTable', table.id)" table-variant="light" table-class="table-full" :bordered="bordered" :hover="hover">
                      <b-thead>
                        <b-tr>
                          <b-th v-for="field in table.fields" :key="field" :style="getStyle('th', field)">{{ field.label }}</b-th>
                        </b-tr>
                      </b-thead>
                      <b-tbody :id="getID('DynamicTableBody', table.id)">
                        <b-tr v-for="item in items" :key="item" :style="getStyle('tr', null)">
                          <b-td v-for="field in table.fields" :key="field" class="text-black">
                            <span v-if="field.field === 'Actions'" :id="field.field + '_' + item.id" :ref="field.field + '_' + item.id">
                              <component v-for="comp in item.renderItems" :key="comp.id" :is="comp.component" v-bind="comp.props"></component>
                            </span>
                            <span v-else :id="field.field + '_' + item.id" :ref="field.field + '_' + item.id"></span>
                          </b-td>
                        </b-tr>
                      </b-tbody>
                    </b-table-simple>
                    <template #overlay>
                      <div class="text-center">
                        <p id="busy-label">No Items Found ...</p>
                      </div>
                    </template>
                  </b-overlay>
                </b-row>
              </b-container>
              <template #overlay>
                <div class="text-center">
                  <p id="busy-label">{{ overlayText }}</p>
                </div>
              </template>
            </b-overlay>
          </b-row>
        </b-container>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
/* eslint-disable no-prototype-builtins */
import Vue from 'vue'
import axios from 'axios'
import { EventBus } from '../../main'
import PeoplePicker from '../Bootstrap/PeoplePicker'
import Todo from '@/models/Todo'

let vm = null
let timeout = null

var slash = '/'
var tp1 = String(window.location.protocol)
var tp2 = String(window.location.host)

let SPCI = null
if (window._spPageContextInfo) {
  SPCI = window._spPageContextInfo
}

export default {
  components: { PeoplePicker },
  name: 'dynamic-table',
  props: {
    hascomponents: {
      type: Boolean,
      default: false
    },
    user: {
      type: Object
    },
    table: {
      type: Object,
      default: () => {
        return {
          id: '',
          title: '' /* Header Title and Table Title */,
          list: '' /* list name to get data for */,
          action: '',
          headerClass: 'text-center bg-warning',
          buttons: ['Add', 'Edit', 'Export', 'Filter', 'Search', 'Upload'] /* Add, Edit, Export, Filter, Search, Upload */,
          fields: [],
          query: '' /* pass custom query. */,
          isLibrary: false,
          hasFolders: false,
          folderField: '',
          hasRequiredFields: false,
          permissionBase: 'SharePoint' /* Field or SharePoint */,
          permissionField: '' /* Used for field permissions. Assumes upload will assign a 'Recipients' field */,
          hasRecipients: false /* turns on recipient based permissions if true */,
          recipientOptions: [] /* used to determine where recipients are pulled from. Company is special and based on current user company. Others are names of groups */,
          recipients: [] /* comma separated list of user's who are selected to receive the document */,
          maximized: false,
          rowHeight: 20,
          pageSize: 0 /* 0 default means dynamic based on space available and rowHeight */,
          height: 0 /* 0 for dynamic */,
          width: 0 /* 0 for dynamic */
        }
      }
    },
    searchEnabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    hasComponents() {
      return this.hascomponents === true
    }
  },
  data: function() {
    return {
      notice: 'Please select the file you wish to upload into the F3I-2 Portal.  Please identify which user will have access to the document by using the add recipients button. Please note, selected users will have the ability to view/download the document.',
      GoOn: 'No',
      isAuthor: false,
      Invalid: false,
      InvalidMessage: 'Not all fields are filled out correctly.',
      validrefs: [],
      overlayText: 'Loading Please Wait...',
      overlayVariant: 'light',
      modalOverlayText: 'Uploading Please Wait...',
      modalOverlayVariant: 'light',
      noitems: false,
      items: [],
      filtereditems: [],
      shownData: [],
      loading: true,
      loaded: false,
      recipients: [],
      permissions: null,
      striped: true,
      bordered: true,
      outlined: true,
      small: true,
      hover: true,
      dark: false,
      fixed: false,
      isUploading: false,
      fileName: null,
      fileBuffer: null,
      search: ''
    }
  },
  created: function() {
    vm = this
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function() {
      // console.log('sp.js is loaded')
      vm.init()
    })
  },
  mounted: async function() {
    for (let i = 0; i < this.table.fields.length; i++) {
      if (this.table.fields[i].required) {
        // go get the field options if it is a lookup
        if (this.table.fields[i].type === 'lookup') {
          let ops = await vm.getOptions(this.table.fields[i])
          this.table.fields[i].options = ops
        }
        if (!this.table.fields[i].userProp) {
          this.validrefs.push('required_' + this.table.fields[i].field)
        }
      }
    }
    console.log('User Info: ' + this.user[0].Company + ', ' + this.user[0].Email)
  },
  methods: {
    filtering: e => {
      e.preventDefault()
      clearTimeout(timeout)
      // https://stackoverflow.com/questions/44312924/filter-array-of-objects-whose-any-properties-contains-a-value
      timeout = setTimeout(() => {
        vm.items = vm.filtereditems.filter(data =>
          JSON.stringify(data)
            .toLowerCase()
            .includes(e.target.value.toLowerCase())
        )
        if (vm.items.length === 0) {
          vm.noitems = true
        } else {
          vm.noitems = false
        }
        vm.formatCells()
      }, 25)
    },
    searchFiltering: e => {
      e.preventDefault()
      // https://stackoverflow.com/questions/44312924/filter-array-of-objects-whose-any-properties-contains-a-value
      vm.items = vm.filtereditems.filter(data =>
        JSON.stringify(data)
          .toLowerCase()
          .includes(vm.search.toLowerCase())
      )
      if (vm.items.length === 0) {
        vm.noitems = true
      } else {
        vm.noitems = false
      }
      vm.formatCells()
    },
    onSubmit: event => {
      event.preventDefault() // prevent form submit! VERY IMPORTANT because search function adds input box which will perform a submit.
    },
    init: function() {
      EventBus.$on('AddRecipient', data => {
        this.AddRecipient(data)
      })
      EventBus.$on('RemoveRecipient', data => {
        this.RemoveRecipient(data)
      })
      this.getData()
    },
    getID: function(text, id) {
      return text + '_' + id
    },
    fixString: function(s) {
      s = String(s)
      s = s.replace(/\s+/g, '').toLowerCase()
      return s
    },
    resetModal: function() {
      this.Invalid = false
      this.InvalidMessage = 'Not all fields are filled out correctly.'
    },
    AddRecipient: function(data) {
      // add a user to recipients array
      this.recipients.push(data)
    },
    RemoveRecipient: function(data) {
      // remove a user from recipients array
      let index = 0
      for (let i = 0; i < this.recipients.length; i++) {
        if (this.recipients[i]['id'] === data.id) {
          index = i
        }
      }
      if (index >= 0) {
        this.recipients.splice(index, 1)
      }
    },
    showIfRequired: function(field) {
      if (!field.required) {
        return {
          display: 'none'
        }
      } else {
        if (field.userProp) {
          return {
            display: 'none'
          }
        }
      }
    },
    getData: async function() {
      // currently support passed in query only
      vm.items = []
      vm.filtereditems = []
      vm.loading = true
      vm.loaded = false
      let url = this.table.query
      let response = await axios.get(url, {
        headers: {
          accept: 'application/json;odata=verbose'
        }
      })
      // console.log('GETITEMS RESPONSE: ' + response)
      let j = response.data.d.results
      let fields = this.table.fields
      for (let i = 0; i < j.length; i++) {
        let f = {}
        for (let k = 0; k < fields.length; k++) {
          if (fields[k].field !== 'Actions') {
            // actions are not part of the items array
            f['id'] = j[i]['Id'] // add id regardless
            f['AuthorId'] = j[i]['Author']['Id']
            f['CreatedDate'] = new Date(j[i]['Created']).toLocaleString()
            // f['Permissions'] = j[i]['Permissions']
            let type = fields[k].type
            switch (type) {
              case 'file':
                f[fields[k].field] = j[i]['File'][fields[k].field]
                f['url'] = tp1 + slash + slash + tp2 + j[i]['File']['ServerRelativeUrl'] // ServerRelativeUrl must be in the query
                f['rurl'] = j[i]['File']['ServerRelativeUrl'] // ServerRelativeUrl must be in the query
                f['renderItems'] = []
                break

              case 'user':
                f[fields[k].field] = j[i][fields[k].field]['Title']
                break

              case 'lookup':
                f[fields[k].field] = j[i][fields[k].field]['Title']
                break

              case 'default':
                f[fields[k].field] = j[i][fields[k].field]
                break
            }
          }
        }
        vm.items.push(f)
      }
      setTimeout(function() {
        vm.filtereditems = vm.items
        vm.loading = false
        vm.loaded = true
        vm.formatCells()
      }, 1000)
    },
    getOptions: async function(field) {
      let url = SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('" + field.list + "')/items?$select=*&$orderby=Title"
      let response = await axios.get(url, {
        headers: {
          accept: 'application/json;odata=verbose'
        }
      })
      // console.log('RESPONSE: ' + response)
      let j = response.data.d.results
      let p = []
      for (let i = 0; i < j.length; i++) {
        p.push({
          value: j[i]['Id'],
          text: j[i]['Title']
        })
      }
      return p
    },
    getStyle: function(element, field) {
      var style = {}
      switch (element) {
        case 'tr':
          if (vm.table.rowHeight === '0') {
            style.height = '30px'
          } else {
            style.height = vm.table.rowHeight + 'px'
          }
          break

        case 'th':
          if (field.width) {
            style.width = field.width + 'px'
          }
          break
      }
      return style
    },
    formatCells: function() {
      for (let i = 0; i < vm.items.length; i++) {
        let item = vm.items[i]
        for (let j = 0; j < vm.table.fields.length; j++) {
          let field = vm.table.fields[j]
          vm.formatCell(item, field)
        }
      }
    },
    formatCell: async function(item, field) {
      // build cell based on passed in data and props
      let ret = ''
      // let element = '#' + field.field + '_' + item.id
      if (field.field === 'Actions') {
        // if the current user is the author they can delete
        if (Number(item.AuthorId) === Number(this.user[0].id)) {
          let id = 'delete_' + item.id
          let button = Vue.component(id, {
            template: `
              <b-button class="actionbutton text-white bg-light-blue" @click="DeleteFile(deleteId)" v-b-tooltip.hover.v-dark title="Delete File">
                <font-awesome-icon fas icon="trash-alt" class="icon"></font-awesome-icon>
              </b-button>
            `,
            props: {
              deleteId: {
                type: Number
              }
            },
            methods: {
              DeleteFile: function(id) {
                vm.DeleteFile(id)
              }
            }
          })

          if (
            !item.renderItems.filter(i => {
              return i.id === id
            }).length > 0
          ) {
            item.renderItems.push({
              id: id,
              component: button,
              props: {
                deleteId: item.id
              }
            })
          }
        }
        // other ways?
        if (this.table.permissionBase === 'Field') {
          // based on field permissions so get field and information to determine if user can perform the action
        } else {
          let response = await vm.getUserPermissions(item)
          let permissions = new SP.BasePermissions()
          permissions.initPropertiesFromJson(response.data.d.GetUserEffectivePermissions)
          let result = {}
          for (var level in SP.PermissionKind.prototype) {
            if (SP.PermissionKind.hasOwnProperty(level)) {
              var permLevel = SP.PermissionKind.parse(level)
              if (permissions.has(permLevel)) result[level] = true
              else result[level] = false
            }
          }
          for (let y = 0; y < field.actions.length; y++) {
            switch (field.actions[y]) {
              case 'Delete':
                // can the user delete?
                var w = result.hasOwnProperty('deleteListItems')
                if (w) {
                  if (result.deleteListItems) {
                    // user can delete
                    let button = Vue.component('delete_' + item.id, {
                      template: `
                        <b-button class="actionbutton text-white bg-light-blue" @click="DeleteFile(deleteId)" v-b-tooltip.hover.v-dark title="Delete File">
                          <font-awesome-icon fas icon="trash-alt" class="icon"></font-awesome-icon>
                        </b-button>
                      `,
                      props: {
                        deleteId: {
                          type: Number
                        }
                      },
                      methods: {
                        DeleteFile: function(id) {
                          vm.DeleteFile(id)
                        }
                      }
                    })
                    item.renderItems.push({
                      id: 'delete_' + item.id,
                      component: button,
                      props: {
                        deleteId: item.id
                      }
                    })
                  }
                }
                break
            }
          }
        }
      } else {
        switch (field.format) {
          case 'link':
            ret = '<a href="' + item['url'] + '" target="_blank">' + item[field.field] + '</a>'
            break

          case 'text':
            ret = item[field.field]
            break

          case 'date':
            switch (field.dateformat) {
              case 'date-time':
                ret = new Date(item[field.field]).toLocaleString()
            }
            break
        }
        document.getElementById(field.field + '_' + item.id).innerHTML = ret
      }
    },
    getUserPermissions: async function(item) {
      // go get the users permissions for the item
      let url = tp1 + slash + slash + tp2 + slash + "sites/f3i2/_api/web/lists/getByTitle('" + vm.table.list + "')/items(" + item['id'] + ')/getusereffectivepermissions(@v)?@v=%27' + encodeURIComponent(vm.user[0].LoginName) + '%27'
      let response = await axios.get(url, {
        headers: {
          accept: 'application/json;odata=verbose'
        }
      })
      return response
    },
    DeleteFile: async function(id) {
      // just do it
      this.loaded = false
      this.loading = true
      let response = await axios.request({
        url: SPCI.webServerRelativeUrl + '/_api/contextinfo',
        method: 'post',
        headers: { Accept: 'application/json; odata=verbose' }
      })
      let digest = response.data.d.GetContextWebInformation.FormDigestValue
      let url = SPCI.webServerRelativeUrl + "/_api/web/lists/getbytitle('" + vm.table.list + "')/items(" + id + ')'
      let headers = {
        Accept: 'application/json;odata=verbose',
        'X-RequestDigest': digest,
        'IF-MATCH': '*',
        'X-HTTP-Method': 'DELETE'
      }
      response = await axios({
        url: url,
        method: 'POST',
        headers: headers
      })
      window.setTimeout(function() {
        let deletepayload = {
          url: SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Tasks')/items?$select=*&$filter=substringof('DocID:" + id + "',TaskInfo)"
        }
        Todo.dispatch('completeTodosByQuery', deletepayload)
        vm.$router.push({ name: 'Refresh', params: { action: 'dropofflibrary' } })
      }, 2000)
    },
    fileSelected: async function(field) {
      this.Invalid = false
      let doesExist = false
      let url = SPCI.webServerRelativeUrl + "/_api/web/GetFolderByServerRelativeUrl('DropoffLibrary')/Files?$select=*&$filter=Name eq '" + field.selected.name + "'"
      console.log('GETDOCUMENTS URL: ' + url)
      let response = await axios.get(url, {
        headers: {
          accept: 'application/json;odata=verbose'
        }
      })
      // console.log('GETDOCUMENTS RESPONSE: ' + JSON.stringify(response))
      let dog = response.data.d.results
      if (dog.length > 0) {
        doesExist = true
      }
      let regex = /^[a-zA-Z0-9\s_.-]*$/g
      let matches = regex.test(String(field.selected.name))
      let isLong = String(field.selected.name).length > 200
      // console.log(matches + ', ' + isLong)
      if (matches === true && isLong === false && doesExist === false) {
        vm.fileName = field.selected.name
        let buffer = vm.getFileBuffer(field.selected)
        buffer.then(function(buff) {
          vm.fileBuffer = buff
        })
      } else {
        vm.Invalid = true
        let text = ''
        if (matches === false) {
          text += 'Document name contains invalid characters. '
        }
        if (isLong === true) {
          text += 'Document name is too long. '
        }
        if (doesExist === true) {
          text += 'The selected document already exists. '
        }
        text += 'Rename the file.'
        vm.InvalidMessage = text
        // field.selected = ''
      }
    },
    UploadFile: async function() {
      // upload if options filled out
      vm.Invalid = false
      for (let s = 0; s < vm.validrefs.length; s++) {
        let element = document.getElementById(vm.validrefs[s])
        if (element.classList.contains('is-invalid')) {
          vm.Invalid = true
          vm.InvalidMessage = 'Not all required fields are filled out.'
        }
      }
      if (this.recipients.length < 1) {
        vm.Invalid = true
        vm.InvalidMessage = 'You must select at least one recipient.'
      }
      // console.log('Invalid: ' + vm.Invalid)
      if (!vm.Invalid) {
        vm.isUploading = true
        let response = await axios.request({
          url: SPCI.webServerRelativeUrl + '/_api/contextinfo',
          method: 'post',
          headers: { Accept: 'application/json; odata=verbose' }
        })
        let digest = response.data.d.GetContextWebInformation.FormDigestValue
        let url = ''
        if (vm.table.hasFolders) {
          url = SPCI.webServerRelativeUrl + "/_api/web/lists/getbytitle('" + vm.table.list + "')/RootFolder/folders('" + vm.user[0].Company + "')/Files/Add" // TODO: Update if needed more complex folder hierarchy
        } else {
          url = SPCI.webServerRelativeUrl + "/_api/web/lists/getbytitle('" + vm.table.list + "')/RootFolder/Files/Add"
        }
        let part = "(url='"
        part += vm.fileName + "',overwrite=true)"
        url = url + part
        console.log('UPLOADURL: ' + url)
        let data = vm.fileBuffer
        let headers = {
          Accept: 'application/json;odata=verbose',
          'X-RequestDigest': digest
        }
        response = await axios({
          url: url,
          method: 'POST',
          data: data,
          processData: false,
          async: false,
          headers: headers
        })
        let uri = response.data.d.ListItemAllFields.__deferred.uri
        response = await axios({
          method: 'GET',
          url: uri,
          headers: {
            Accept: 'application/json;odata=verbose'
          }
        })
        data = response.data.d.__metadata
        let DocID = response.data.d.Id
        console.log('DocId: ' + DocID)
        let endpoint = data.uri
        headers = {
          'Content-Type': 'application/json;odata=verbose',
          Accept: 'application/json;odata=verbose',
          'X-RequestDigest': digest,
          'X-HTTP-Method': 'MERGE',
          'If-Match': data.etag
        }
        let config = {
          headers: headers
        }
        let itemprops = {
          __metadata: { type: data.type },
          FileLeafRef: data.name
        }
        /* for (let i = 0; i < this.table.fields.length; i++) {
          if (this.table.fields[i].required) {
            if (this.table.fields[i].type === 'lookup') {
              itemprops[this.table.fields[i].lookupfield] = this.table.fields[i].selected
            }
            if (this.table.fields[i].type === 'default') {
              if (this.table.fields[i].userProp === true) {
                itemprops[this.table.fields[i].field] = this.user[0][this.table.fields[i].field]
              }
            }
          }
        } */
        // add recipients to the file. the Author will have delete permissions so must also set up Permissions object
        let permissions = []
        let recipients = []
        let emails = []
        for (let i = 0; i < this.recipients.length; i++) {
          recipients.push(this.recipients[i].id)
          emails.push(this.recipients[i].email)
          if (this.recipients[i].isAuthor) {
            permissions.push({
              user: this.recipients[i].id,
              permissions: ['Delete']
            })
          }
        }
        itemprops['RecipientsId'] = { results: recipients }
        itemprops['Permissions'] = JSON.stringify(permissions)
        // this.$store.dispatch('support/addActivity', '<div class="bg-info">' + JSON.stringify(itemprops) + '</div>')
        return axios
          .post(endpoint, itemprops, config)
          .then(function() {
            // send emails and tasks. A task for each recipient. Email sent to each recipient.
            let emails = []
            for (let i = 0; i < vm.recipients.length; i++) {
              if (!vm.recipients[i].isAuthor) {
                emails.push(vm.recipients[i].email)
              }
            }
            let payload = {}
            payload.id = DocID
            payload.email = emails
            payload.title = 'New File Exchange Document'
            payload.body = ''
            payload.body += '<p>A new document has been added that requires your attention.</p>'
            payload.body += '<p>The document will be automatically deleted after 30 days.</p>'
            payload.body += '<p></p>'
            payload.body += '<p><a href="' + SPCI.webAbsoluteUrl + slash + vm.table.list + slash + vm.fileName + '" target="_blank">' + vm.fileName + '</a></p>'
            // vm.$store.dispatch('support/SendEmail', payload)
            let taskpayload = {
              Title: 'New File Exchange Document',
              TaskType: 'FileExchangeDocument',
              TaskLink: SPCI.webAbsoluteUrl + slash + vm.table.list + slash + vm.fileName
            }
            for (let i = 0; i < vm.recipients.length; i++) {
              if (!vm.recipients[i].isAuthor) {
                taskpayload['AssignedToId'] = [vm.recipients[i].id]
                taskpayload['TaskInfo'] = 'Type:FileExchangeDocument, DocID:' + DocID + ', Email:' + vm.recipients[i].email
                Todo.dispatch('addTodo', taskpayload)
              }
            }
            vm.isUploading = false
            vm.loaded = false
            vm.loading = true
            vm.$bvModal.hide('FileModal')
            window.setTimeout(function() {
              vm.$router.push({ name: 'Refresh', params: { action: 'dropofflibrary' } })
            }, 5000)
          })
          .catch(function(error) {
            console.log(error)
            vm.isUploading = false
            vm.Invalid = true
            vm.InvalidMessage = error
          })
      }
    },
    getFileBuffer(file) {
      let p = new Promise(function(resolve, reject) {
        var reader = new FileReader()
        reader.onloadend = function(e) {
          resolve(e.target.result)
        }
        reader.onerror = function(e) {
          reject(e.target.error)
        }
        reader.readAsArrayBuffer(file)
      })
      return p
    }
  }
}
</script>

<style lang="scss">
.dt-button-row,
.dt-paging-row {
  height: 40px !important;
}
.table-full,
.table-full td,
.table-full th {
  border: 1px solid #000000 !important;
}
</style>
