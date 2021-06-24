<template>
  <b-container fluid class="m-0 p-0" id="FilePickerContainer">
    <b-row no-gutters class="m-0">
      <b-col cols="12" class="p-0">
        <b-modal id="FilePickerModal" centered header-bg-variant="light-blue" size="xl" header-text-variant="light">
          <template v-slot:modal-title>Selected Files Check</template>
          <b-container class="p-0">
            <b-row>
              <b-col cols="12">
                <b-table v-model="shownData" :id="'table_' + id" :ref="'table_' + id" :items="items" :fields="fields" :current-page="currentPage" no-provider-paging="true" no-provider-filtering="true" no-provider-sorting="true" :per-page="perPage">
                  <template #cell(actions)="row">
                    <b-button class="actionbutton text-white m-1" variant="danger" @click="removeFile(shownData[row.index].id)" v-b-tooltip.hover.v-dark title="Remove File From Upload">
                      <font-awesome-icon far icon="times-circle" class="icon"></font-awesome-icon>
                    </b-button>
                    <b-button class="actionbutton text-white" variant="success" @click="fixFile(shownData[row.index].id)" v-b-tooltip.hover.v-dark title="Fix File Name Issues">
                      <font-awesome-icon far icon="edit" class="icon"></font-awesome-icon>
                    </b-button>
                    <b-button v-if="fileExists(shownData[row.index].id)" class="actionbutton text-white m-1" variant="warning" @click="overwriteFile(shownData[row.index].id)" v-b-tooltip.hover.v-dark title="Delete Existing File">
                      <font-awesome-icon far icon="trash-alt" class="icon"></font-awesome-icon>
                    </b-button>
                    <b-button v-if="fileExists(shownData[row.index].id)" class="actionbutton text-white m-1" variant="danger" @click="deleteFile(shownData[row.index].id)" v-b-tooltip.hover.v-dark title="Delete Existing File">
                      <font-awesome-icon far icon="trash-alt" class="icon"></font-awesome-icon>
                    </b-button>
                  </template>
                  <template #cell(name)="row">
                    <b-form-input class="form-control" size="sm" v-model="shownData[row.index].name" :id="getID('txt-', shownData[row.index].id)" @input="onInput(shownData[row.index].id)"></b-form-input>
                  </template>
                  <template #cell(isSpecial)="row">
                    <b-button v-if="shownData[row.index].isSpecial" class="actionbutton text-white m-1" variant="danger">
                      <font-awesome-icon far icon="times-circle" class="icon"></font-awesome-icon>
                    </b-button>
                    <b-button v-else class="actionbutton text-white m-1" variant="success">
                      <font-awesome-icon far icon="check-circle" class="icon"></font-awesome-icon>
                    </b-button>
                  </template>
                  <template #cell(isLong)="row">
                    <b-button v-if="shownData[row.index].isLong" class="actionbutton text-white m-1" variant="danger">
                      <font-awesome-icon far icon="times-circle" class="icon"></font-awesome-icon>
                    </b-button>
                    <b-button v-else class="actionbutton text-white m-1" variant="success">
                      <font-awesome-icon far icon="check-circle" class="icon"></font-awesome-icon>
                    </b-button>
                  </template>
                  <template #cell(isExisting)="row">
                    <b-button v-if="shownData[row.index].isExisting" class="actionbutton text-white m-1" variant="danger">
                      <font-awesome-icon far icon="times-circle" class="icon"></font-awesome-icon>
                    </b-button>
                    <b-button v-else class="actionbutton text-white m-1" variant="success">
                      <font-awesome-icon far icon="check-circle" class="icon"></font-awesome-icon>
                    </b-button>
                  </template>
                  <!-- <template #cell(issues)="row">
                    <div v-for="issue in shownData[row.index].issues" :key="issue">
                      <p v-if="issue == 'isOk'">No issues in the selected file.</p>
                      <p v-if="issue == 'isLong'">The selected file is too long.</p>
                      <p v-if="issue == 'isSpecial'">The selected file contains special characters.</p>
                      <p v-if="issue == 'isExisting'">The selected file already exists.</p>
                    </div>
                  </template> -->
                </b-table>
              </b-col>
            </b-row>
          </b-container>
        </b-modal>
        <b-input-group>
          <b-form-file placeholder="Select File(s)" multiple no-drop class="form-control" browse-text="Select File(s)" v-model="SelectedFiles" @input="filesSelected"></b-form-file>
        </b-input-group>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
/* ------------- FilePicker ----------------------------------------------------------------------------------------------------
props: (passed from parent component)
  id: string - represents the name/id of the component.
  library: string - represents the name of the document library the files will be uploaded to.
  checkExists: boolean - determines if selected files should be checked for existence in the document library.
  config: string[JSON] - contains the configuration for file naming conventions and other rules.
    {
      allowedFiles: ['.pdf', '.docx'] (or pass empty array [] for no restrictions)
      addTimestamp: true/false (unix based on date/time)
      addPrefix: 'Prefix'
      addSuffix: 'Suffix'
      preLength: 100 (size to initially test length of filenames)
      postLength: 250 (tested last to be sure rules don't create file name that is too large.)
    }

items: array - Array of selected files. Manually created with a globally unique id (guid) and fileBuffer

/* -------------------------------------------------------------------------------------------------------------------------- */

/* eslint-disable no-unused-vars */
import axios from 'axios'
import Vue from 'vue'
import { EventBus } from '../../main'

let vm = null
let SPCI = null
if (window._spPageContextInfo) {
  SPCI = window._spPageContextInfo
}

export default {
  name: 'FilePicker',
  props: ['id', 'library', 'checkExists', 'config'],
  data: function() {
    return {
      SelectedFiles: [],
      items: [],
      shownData: [],
      fields: [
        { key: 'actions', label: 'Actions' },
        { key: 'name', label: 'Name', thClass: 'px300' },
        { key: 'isSpecial', label: 'File has special characters.' },
        { key: 'isLong', label: 'File is too long.' },
        { key: 'isExisting', label: 'File already exists.' }
        /* { key: 'issues', label: 'Issues', thClass: 'px300' } */
      ],
      hasIssues: false,
      totalRows: 1,
      currentPage: 1,
      perPage: 20
    }
  },
  created() {
    vm = this
  },
  methods: {
    getID: function(text, id) {
      return text + '_' + id
    },
    async filesSelected() {
      // loop through the SelectedFiles array and assemble the files to be returned.
      // create an items array for display in the table if there are files with errors.
      this.items = []
      let regex = /^[a-zA-Z0-9\s_.-]*$/g
      await this.asyncForEach(this.SelectedFiles, async SelectedFile => {
        // build item for table and return files array
        let item = {}
        // build item array
        let name = String(SelectedFile.name)
        // let issues = []
        let isLong = name.length > 100 ? true : false
        if (isLong) {
          // issues.push('isLong')
          item.isLong = true
          vm.hasIssues = true
        }
        let isSpecial = regex.test(name) == true ? false : true
        if (isSpecial) {
          // issues.push('isSpecial')
          item.isSpecial = true
          vm.hasIssues = true
        }
        // Only check existing files if they are not too long or if they don't have special characters as those files would not exist in the library
        // TODO: add naming convention rules first before checking if the file exists. Need to build the name from the rules and then check
        if (!isSpecial && !isLong) {
          let isExisting = await this.fileExistsInLibrary(name, this.library)
          if (isExisting) {
            // issues.push('isExisting')
            item.isExisting = true
          }
        }
        item.id = Math.uuid()
        item.name = name
        // item.issues = issues
        item.buffer = await this.getFileBuffer(SelectedFile)
        item.overwrite = false
        this.items.push(item)
      })
      vm.totalRows = vm.items.length
      if (vm.hasIssues === true) {
        this.$bvModal.show('FilePickerModal')
      } else {
        // TODO: return the array of files to the parent component
        console.log('NOTHING TO SEE HERE')
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
    },
    fixFile(id) {
      // loop through files for the id and then automatically fix the file name
      // TODO: determine if we need to check if the file exists after name modification
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].id === id) {
          // remove special characters and then trim file name size
          let name = String(this.items[i].name)
          name = name.replace(/[^a-zA-Z0-9\s_.-]/g, '')
          if (name.length >= 100) {
            let temp = name.split('.')
            name = temp[0].substring(0, 99)
            name += '.' + temp[1]
          }
          this.items[i].name = name
          this.items[i].issues = ['isOk']
        }
      }
    },
    removeFile(id) {
      // loop through files for the id and then remove the file from the array
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].id === id) {
          this.items.splice(i, 1)
        }
      }
    },
    overwriteFile(id) {
      // loop through files for the id and then remove the file from the array
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].id === id) {
          this.items[i].overwrite = true
        }
      }
    },
    onInput(id) {
      // check updated filename to see if it is in compliance again and update accordingly
      // TODO: determine if we need to check if the file exists after name modification
      let regex = /^[a-zA-Z0-9\s_.-]*$/g
      let issues = []
      for (let i = 0; i < this.shownData.length; i++) {
        if (this.shownData[i].id === id) {
          let name = this.shownData[i].name
          let isLong = name.length > 100 ? true : false
          if (isLong) {
            issues.push('isLong')
          }
          let isSpecial = regex.test(name) == true ? false : true
          if (isSpecial) {
            issues.push('isSpecial')
          }
          if (!isLong && !isSpecial) {
            issues.push('isOk')
          }
        }
      }
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].id === id) {
          this.items[i].issues = issues
        }
      }
    },
    fileExists(id) {
      let exists = false
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].id === id) {
          let test = []
          test = new Array(this.items[i].issues)
          if (test.indexOf('isExisting') >= 0) {
            exists = true
          }
        }
      }
      return exists
    },
    async fileExistsInLibrary(name, library) {
      let doesExist = false
      let url = SPCI.webServerRelativeUrl + "/_api/web/GetFolderByServerRelativeUrl('" + library + "')/Files?$select=*&$filter=Name eq '" + name + "'"
      console.log('GETDOCUMENTS URL: ' + url)
      let response = await axios.get(url, {
        headers: {
          accept: 'application/json;odata=verbose'
        }
      })
      let dog = response.data.d.results
      if (dog.length > 0) {
        doesExist = true
      }
      return doesExist
    },
    asyncForEach: async function(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
      }
    }
  }
}
</script>

<style lang="scss"></style>
