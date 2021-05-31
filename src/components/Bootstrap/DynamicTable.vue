<template>
  <b-container fluid class="contentHeight m-0 p-0">
    <b-modal id="FileModal" ref="FileModal" centered hide-footer header-bg-variant="light-blue" size="lg" header-text-variant="light">
      <template v-slot:modal-title>Upload File</template>
      <b-container v-if="table.hasRequiredFields" fluid class="p-0">
        <b-row class="m-0" v-for="field in table.fields" :key="field" :style="showIfRequired(field)">
          <b-col cols="12" class="p-0">
            <b-form-group :label="field.label">
              <b-form-file v-if="field.type == 'file'" placeholder="Choose a file" no-drop class="form-control" v-model="field.selected" :id="'required_' + field.field" @input="fileSelected(field)" :state="field.selected !== ''" :ref="field.field"></b-form-file>
              <b-form-select v-if="field.type == 'lookup'" class="form-control" :options="field.options" v-model="field.selected" :id="'required_' + field.field" :state="field.selected !== ''" :ref="field.field"></b-form-select>
            </b-form-group>
          </b-col>
        </b-row>
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
          <!-- <b-form @submit="onSubmit"> -->
          <b-row no-gutters class="contentHeight">
            <b-overlay :show="loaded == false" :variant="overlayVariant" z-index="3000">
              <b-container fluid class="contentHeight m-0 p-0">
                <b-row v-if="table.buttons.length > 0" no-gutters :class="table.headerClass" class="button-row">
                  <b-col cols="12" class="m-0 p-0">
                    <span v-for="button in table.buttons" :key="button">
                      <b-button v-if="button == 'Upload'" v-b-modal.FileModal variant="light-blue"><font-awesome-icon fas icon="upload" class="icon"></font-awesome-icon>&nbsp;Upload</b-button>
                    </span>
                  </b-col>
                </b-row>
                <b-row no-gutters class="table-row">
                  <b-table-simple :id="getID('DynamicTable', table.id)" :ref="getID('DynamicTable', table.id)" table-variant="light" table-class="table-full" :bordered="bordered" :hover="hover">
                    <b-thead>
                      <b-tr>
                        <b-th v-for="field in table.fields" :key="field">{{ field.label }}</b-th>
                      </b-tr>
                    </b-thead>
                    <b-tbody>
                      <b-tr v-for="item in items" :key="item" :style="getStyle('tr')">
                        <b-td v-for="field in table.fields" :key="field" class="text-black"><span v-html="formatCell(item, field)"></span></b-td>
                      </b-tr>
                    </b-tbody>
                  </b-table-simple>
                </b-row>
                <!-- <b-row v-if="table.allowPaging" no-gutters class="paging-row bg-light"></b-row> -->
              </b-container>
              <template #overlay>
                <div class="text-center">
                  <p id="busy-label">{{ overlayText }}</p>
                </div>
              </template>
            </b-overlay>
          </b-row>
          <!-- </b-form> -->
        </b-container>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
/* eslint-disable no-prototype-builtins */
import axios from 'axios'

let vm = null

var slash = '/'
var tp1 = String(window.location.protocol)
var tp2 = String(window.location.host)

let SPCI = null
if (window._spPageContextInfo) {
  SPCI = window._spPageContextInfo
}
// let baseurl = SPCI.webAbsoluteUrl

export default {
  name: 'dynamic-table',
  props: {
    hascomponents: {
      type: Boolean,
      default: false
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
          maximized: false,
          rowHeight: 20,
          pageSize: 0 /* 0 default means dynamic based on space available and rowHeight */,
          height: 0 /* 0 for dynamic */,
          width: 0 /* 0 for dynamic */
        }
      }
    }
  },
  computed: {
    hasComponents() {
      return this.hascomponents === true
    },
    currentUser() {
      return this.$store.state.database.users
    }
  },
  data: function() {
    return {
      GoOn: 'No',
      Invalid: false,
      InvalidMessage: 'Not all fields are filled out correctly.',
      validrefs: [],
      overlayText: 'Loading Please Wait...',
      overlayVariant: 'light',
      modalOverlayText: 'Uploading Please Wait...',
      modalOverlayVariant: 'light',
      items: [],
      filtereditems: [],
      shownData: [],
      loading: true,
      loaded: false,
      timer: '',
      striped: true,
      bordered: true,
      outlined: true,
      small: true,
      hover: true,
      dark: false,
      fixed: false,
      isUploading: false,
      fileName: null,
      fileBuffer: null
    }
  },
  created: function() {
    vm = this
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function() {
      console.log('sp.js is loaded')
      vm.init()
    })
    // vm.init()
  },
  methods: {
    init: async function() {
      // any preliminary stuff?
      this.getData()
      for (let i = 0; i < this.table.fields.length; i++) {
        if (this.table.fields[i].required) {
          // go get the field options if it is a lookup
          if (this.table.fields[i].type === 'lookup') {
            let ops = await vm.getOptions(this.table.fields[i])
            this.table.fields[i].options = ops
          }
          this.validrefs.push('required_' + this.table.fields[i].field)
        }
      }
      vm.timer = setInterval(vm.getData, 30000) // 1 minute
    },
    getID: function(text, id) {
      return text + '_' + id
    },
    showIfRequired: function(field) {
      if (!field.required) {
        return {
          display: 'none'
        }
      }
    },
    getData: async function() {
      // currently support passed in query only
      vm.items = []
      vm.loading = true
      vm.loaded = false
      let url = this.table.query
      let response = await axios.get(url, {
        headers: {
          accept: 'application/json;odata=verbose'
        }
      })
      console.log('GETITEMS RESPONSE: ' + response)
      let j = response.data.d.results
      let fields = this.table.fields
      for (let i = 0; i < j.length; i++) {
        let f = {}
        for (let k = 0; k < fields.length; k++) {
          if (fields[k].field !== 'Actions') {
            // actions are not part of the items array
            f['id'] = j[i]['Id'] // add id regardless
            let type = fields[k].type
            switch (type) {
              case 'file':
                f[fields[k].field] = j[i]['File'][fields[k].field]
                f['url'] = tp1 + slash + slash + tp2 + j[i]['File']['ServerRelativeUrl'] // ServerRelativeUrl must be in the query
                f['rurl'] = j[i]['File']['ServerRelativeUrl'] // ServerRelativeUrl must be in the query
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
      vm.loading = false
      vm.loaded = true
    },
    getOptions: async function(field) {
      let url = SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('" + field.list + "')/items?$select=*&$orderby=Title"
      let response = await axios.get(url, {
        headers: {
          accept: 'application/json;odata=verbose'
        }
      })
      console.log('RESPONSE: ' + response)
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
    getStyle: function(element) {
      var style = {}
      switch (element) {
        case 'tr':
          if (vm.table.rowHeight === '0') {
            style.height = '30px'
          } else {
            style.height = vm.table.rowHeight + 'px'
          }
          break
      }
      return style
    },
    formatCell: function(item, field) {
      // build cell based on passed in data and props
      let ret = ''
      if (field.field === 'Actions') {
        // loop through the actions and determine if the user can perform the action on this item
        vm.getUserPermissions(item).then(function(response) {
          console.log('getUserPermissions: ' + response)
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
          console.log('PERMISSION RESULTS: ' + result)
          for (let y = 0; y < field.actions.length; y++) {
            switch (field.actions[y]) {
              case 'Delete':
                // can the user delete?
                var w = result.hasOwnProperty('deleteListItems')
                if (w) {
                  if (result.deleteListItems) {
                    // user can delete
                    console.log('CAN DELETE')
                    ret = 'CAN DELETE'
                  }
                }
                break
            }
          }
        })
      } else {
        if (field.format === 'link') {
          // let href = baseurl + '/' + vm.table.list + '/' + item[field.field]
          ret = '<a href="' + item['url'] + '">' + item[field.field] + '</a>'
        } else {
          ret = item[field.field]
        }
      }
      return ret
    },
    getUserPermissions: async function(item) {
      // go get the users permissions for the item
      let url = tp1 + slash + slash + tp2 + slash + "sites/f3i2/_api/web/lists/getByTitle('" + vm.table.list + "')/items(" + item['id'] + ')/getusereffectivepermissions(@v)?@v=%27' + encodeURIComponent(vm.currentUser.LoginName) + '%27'
      // console.log('GETPERMISSIONS URL: ' + url)
      let response = await axios.get(url, {
        headers: {
          accept: 'application/json;odata=verbose'
        }
      })
      console.log('GETPERMISSIONS RESPONSE: ' + response)
      return response
    },
    fileSelected: function(field) {
      vm.fileName = field.selected.name
      // vm.fileName = vm.uploadfile.name
      let buffer = vm.getFileBuffer(field.selected)
      // let buffer = vm.getFileBuffer(vm.uploadfile)
      buffer.then(function(buff) {
        vm.fileBuffer = buff
      })
    },
    UploadFile: async function() {
      // upload if options filled out
      vm.Invalid = false
      for (let s = 0; s < vm.validrefs.length; s++) {
        let element = document.getElementById(vm.validrefs[s])
        if (element.classList.contains('is-invalid')) {
          vm.Invalid = true
        }
      }
      console.log('Invalid: ' + vm.Invalid)
      if (!vm.Invalid) {
        clearInterval(vm.timer)
        vm.isUploading = true
        let response = await axios.request({
          url: SPCI.webServerRelativeUrl + '/_api/contextinfo',
          method: 'post',
          headers: { Accept: 'application/json; odata=verbose' }
        })
        let digest = response.data.d.GetContextWebInformation.FormDigestValue
        let url = SPCI.webServerRelativeUrl + "/_api/web/lists/getbytitle('" + vm.table.list + "')/RootFolder/Files/Add"
        let part = "(url='"
        part += vm.fileName + "',overwrite=true)"
        url = url + part
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
          FileLeafRef: data.name,
          Title: data.name
        }
        for (let i = 0; i < this.table.fields.length; i++) {
          if (this.table.fields[i].required) {
            if (this.table.fields[i].type === 'lookup') {
              // must use field name with Id
              itemprops[this.table.fields[i].lookupfield] = this.table.fields[i].selected
            }
            // TODO: add other types if needed?
          }
        }
        return axios
          .post(endpoint, itemprops, config)
          .then(function() {
            vm.isUploading = false
            vm.$bvModal.hide('FileModal')
            vm.timer = setInterval(vm.getData, 30000) // 1 minute
          })
          .catch(function(error) {
            console.log(error)
            vm.isUploading = false
            vm.Invalid = true
            vm.InvalidMessage = error
          })
      } else {
        this.Valid
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
  },
  beforeDestroy() {
    clearInterval(this.timer)
  }
}
</script>

<style lang="scss" scoped>
.button-row,
.paging-row {
  height: 40px !important;
}
.table-bordered,
.table-bordered td,
.table-bordered th {
  border: 1px solid #000000 !important;
}
.table th,
.table td {
  padding: 2px;
}
</style>
