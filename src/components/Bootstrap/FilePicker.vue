<template>
  <b-container fluid class="m-0 p-0" id="FilePickerContainer">
    <b-row no-gutters class="m-0">
      <b-col cols="12" class="p-0">
        <b-modal id="FilePickerModal" centered header-bg-variant="light-blue" footer-bg-variant="light-blue" size="xl" header-text-variant="light">
          <template v-slot:modal-title>Selected Files Check</template>
          <b-container class="p-0">
            <b-row>
              <b-col cols="12">
                <b-table v-model="shownData" :id="'table_' + id" :ref="'table_' + id" :items="items" :fields="fields" :current-page="currentPage" no-provider-paging="true" no-provider-filtering="true" no-provider-sorting="true" :per-page="perPage">
                  <template #cell(actions)="row">
                    <b-button class="actionbutton text-white" variant="danger" @click="removeFile(row.item.id)" v-b-tooltip.hover.v-dark title="Remove File From Upload">
                      <font-awesome-icon far icon="times-circle" class="icon"></font-awesome-icon>
                    </b-button>
                    <b-button class="actionbutton text-white ml-1" variant="success" @click="replaceFile(row.item.id)" v-b-tooltip.hover.v-dark title="Replace Selected File">
                      <font-awesome-icon far icon="redo-alt" class="icon"></font-awesome-icon>
                    </b-button>
                    <b-button class="actionbutton text-white ml-1" variant="success" @click="fixFile(row.item.id)" v-b-tooltip.hover.v-dark title="Fix File Name Issues">
                      <font-awesome-icon far icon="edit" class="icon"></font-awesome-icon>
                    </b-button>
                    <b-button v-if="row.item.doesExist" class="actionbutton text-white ml-1" variant="warning" @click="overwriteFile(row.item.id)" v-b-tooltip.hover.v-dark title="Overwrite Existing File">
                      <font-awesome-icon far icon="trash-alt" class="icon"></font-awesome-icon>
                    </b-button>
                    <b-button v-if="row.item.doesExist" class="actionbutton text-white ml-1" variant="danger" @click="deleteFile(row.item.id)" v-b-tooltip.hover.v-dark title="Delete Existing File">
                      <font-awesome-icon far icon="trash-alt" class="icon"></font-awesome-icon>
                    </b-button>
                  </template>
                  <template #cell(name)="row">
                    <b-form-input size="sm" v-model="row.item.name" :id="getID('txt-', row.item.id)" @input="onInput(row.item.id)"></b-form-input>
                    <div style="display: none;">
                      <!-- <input type="file" :id="'file-' + row.item.id" @change.native="onFileReplaced" /> -->
                      <b-form-file :id="'file-' + row.item.id" v-model="row.item.replacement" @change="onFileReplaced(row.item.id, $event)"></b-form-file>
                    </div>
                  </template>
                  <template #cell(isNotAllowed)="row">
                    <b-button v-if="row.item.isNotAllowed" class="actionbutton text-white mx-auto" variant="danger">
                      <font-awesome-icon far icon="times-circle" class="icon"></font-awesome-icon>
                    </b-button>
                    <b-button v-else class="actionbutton text-white mx-auto" variant="success">
                      <font-awesome-icon far icon="check-circle" class="icon"></font-awesome-icon>
                    </b-button>
                  </template>
                  <template #cell(isSpecial)="row">
                    <b-button v-if="row.item.isSpecial" class="actionbutton text-white mx-auto" variant="danger">
                      <font-awesome-icon far icon="times-circle" class="icon"></font-awesome-icon>
                    </b-button>
                    <b-button v-else class="actionbutton text-white mx-auto" variant="success">
                      <font-awesome-icon far icon="check-circle" class="icon"></font-awesome-icon>
                    </b-button>
                  </template>
                  <template #cell(isLong)="row">
                    <b-button v-if="row.item.isLong" class="actionbutton text-white mx-auto" variant="danger">
                      <font-awesome-icon far icon="times-circle" class="icon"></font-awesome-icon>
                    </b-button>
                    <b-button v-else class="actionbutton text-white mx-auto" variant="success">
                      <font-awesome-icon far icon="check-circle" class="icon"></font-awesome-icon>
                    </b-button>
                  </template>
                  <template #cell(doesExist)="row">
                    <b-button v-if="row.item.doesExist" class="actionbutton text-white mx-auto" variant="danger">
                      <font-awesome-icon far icon="times-circle" class="icon"></font-awesome-icon>
                    </b-button>
                    <b-button v-else class="actionbutton text-white mx-auto" variant="success">
                      <font-awesome-icon far icon="check-circle" class="icon"></font-awesome-icon>
                    </b-button>
                  </template>
                </b-table>
              </b-col>
            </b-row>
          </b-container>
          <template v-slot:modal-footer>
            <div class="container">
              <div class="row">
                <div class="col-sm"></div>
                <div class="col-sm"></div>
                <div class="col-sm text-right">
                  <b-button class="text-white" @click="cancel()" v-b-tooltip.hover.v-dark title="Cancel">
                    Cancel
                  </b-button>
                  <b-button v-if="handleUpload" class="text-white ml-1" variant="light-blue" @click="uploadFiles()" v-b-tooltip.hover.v-dark title="Upload Selected Files">
                    Upload
                  </b-button>
                  <b-button class="text-white ml-1" variant="success" @click="returnToParent()" v-b-tooltip.hover.v-dark title="Accept Changes">
                    Ok
                  </b-button>
                </div>
              </div>
            </div>
          </template>
        </b-modal>
        <b-input-group>
          <b-form-file placeholder="Select File(s)" multiple class="form-control" browse-text="Select File(s)" v-model="SelectedFiles" @input="filesSelected"></b-form-file>
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
  handleUpload: boolean - determines if this control will handle uploading the files.
  rules: string[JSON] - contains the configuration for file naming conventions and other rules.
    {
      hasRules: false (pass true if there are rules to follow)
      addTimestamp: true/false (unix based on date/time)
      addPrefix: 'Prefix'
      addSuffix: 'Suffix'
      delimiter: '-' can be dash underscore or space. default is dash. Separates rules
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
  props: {
    id: {
      type: String
    },
    library: {
      type: String
    },
    checkExists: {
      type: Boolean,
      default: false
    },
    allowedFiles: {
      type: Array,
      default: () => [] // ['.pdf', '.docx']
    },
    handleUpload: {
      type: Boolean,
      default: false
    },
    rules: {
      type: Object,
      default: () => {
        return {
          hasRules: false,
          addTimestamp: false,
          addPrefix: '',
          addSuffix: '',
          delimiter: '-' // can be a dash, underscore, or space. Default is dash
        }
      }
    }
  },
  data: function() {
    return {
      SelectedFiles: [],
      items: [],
      shownData: [],
      fields: [
        { key: 'actions', label: 'Actions' },
        { key: 'name', label: 'Name', thClass: 'px400' },
        { key: 'isSpecial', label: 'Has special characters.', tdClass: 'px200 text-center' },
        { key: 'isLong', label: 'Is too long.', tdClass: 'px100 text-center' },
        { key: 'doesExist', label: 'Already exists.', tdClass: 'px150 text-center' },
        { key: 'isNotAllowed', label: 'Type not allowed.', tdClass: 'px150 text-center' }
        /* { key: 'issues', label: 'Issues', thClass: 'px300' } */
      ],
      hasIssues: false,
      totalRows: 1,
      currentPage: 1,
      perPage: 20,
      maxSize: 200 // size of any filename after any naming conventions are added.
    }
  },
  created() {
    vm = this
  },
  changed() {
    if (console) console.log('CHANGED')
  },
  methods: {
    getID: function(text, id) {
      return text + '_' + id
    },
    async filesSelected() {
      // loop through the SelectedFiles array and assemble the files to be returned.
      // create an items array for display in the table.
      this.items = []
      let regex = /^[a-zA-Z0-9\s_.-]*$/g
      await this.asyncForEach(this.SelectedFiles, async SelectedFile => {
        // build item for table and return files array
        let item = {}
        // build item array
        let name = String(SelectedFile.name)
        item.originalName = name
        item.doesExist = false // set to false initially to ensure property exists.
        item.isSpecial = false // set to false initially to ensure property exists.
        item.isLong = false // set to false initially to ensure property exists.
        let isSpecial = regex.test(name) == true ? false : true
        if (isSpecial) {
          item.isSpecial = true
          this.hasIssues = true
        }
        let isNotAllowed = false
        let temp = name.split('.')
        if (this.allowedFiles.length > 0) {
          if (this.allowedFiles.indexOf(temp[1]) >= 0) {
            isNotAllowed = true
            item.isNotAllowed = true // will not actually get passed to parent
            this.hasIssues = true
          }
        }
        // Only check existing files if they are not too long or if they don't have special characters as those files would not exist in the library
        // TODO: add naming convention rules first before checking if the file exists. Need to build the name from the rules and then check
        if (!isSpecial && !isNotAllowed) {
          // Add naming convention rules if any
          if (this.rules.hasRules) {
            // add rules to name
            let temp = name.split('.')
            let prename = temp[0]
            if (this.rules.addPrefix.length > 0) {
              prename = this.rules.addPrefix + this.rules.delimiter + prename
            }
            if (this.rules.addSuffix.length > 0) {
              prename = prename + this.rules.delimiter + this.rules.addSuffix
            }
            if (this.rules.addTimestamp) {
              prename = prename + this.rules.delimiter + Date.now().toString()
            }
            name = prename + temp[1]
          }
          let isLong = name.length > this.maxSize ? true : false
          if (isLong) {
            item.isLong = true
            this.hasIssues = true
          } else {
            // File existence tested after all other tests are complete
            let Exists = await this.fileExistsInLibrary(name, this.library)
            if (Exists) {
              item.doesExist = true
              this.hasIssues = true
            }
          }
        }
        item.id = Math.uuid()
        item.name = name
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
    replaceFile(id) {
      let element = 'file-' + id
      document.getElementById(element).click()
    },
    async onFileReplaced(id, event) {
      if (console) console.log('FILE REPLACEMENT: ' + id + ', EVENT: ' + event)
      let files = event.target.files
      if (files.length < 1) {
        // TODO: Since no file was actually selected do we need to do anything?
      } else {
        let file = files[0]
        // alert('File changed to: ' + file.name)
        // Recheck new file for all the things and update items array.
        for (let i = 0; i < this.items.length; i++) {
          if (this.items[i].id === id) {
            let regex = /^[a-zA-Z0-9\s_.-]*$/g
            let name = String(file.name)
            let isSpecial = regex.test(name) == true ? false : true
            if (isSpecial) {
              this.items[i].isSpecial = true
            } else {
              this.items[i].isSpecial = false
            }
            let isNotAllowed = false
            let temp = name.split('.')
            if (this.allowedFiles.length > 0) {
              if (this.allowedFiles.indexOf(temp[1]) >= 0) {
                isNotAllowed = true
                this.items[i].isNotAllowed = true // will not actually get passed to parent
              }
            }
            if (!isSpecial && !isNotAllowed) {
              // Add naming convention rules if any
              if (this.rules.hasRules) {
                // add rules to name
                let temp = name.split('.')
                let prename = temp[0]
                if (this.rules.addPrefix.length > 0) {
                  prename = this.rules.addPrefix + this.rules.delimiter + prename
                }
                if (this.rules.addSuffix.length > 0) {
                  prename = prename + this.rules.delimiter + this.rules.addSuffix
                }
                if (this.rules.addTimestamp) {
                  prename = prename + this.rules.delimiter + Date.now().toString()
                }
                name = prename + '.' + temp[1]
              }
              let isLong = name.length > this.maxSize ? true : false
              if (isLong) {
                this.items[i].isLong = true
              } else {
                this.items[i].isLong = false
                // File existence tested after all other tests are complete
                let Exists = await this.fileExistsInLibrary(name, this.library)
                if (Exists) {
                  this.items[i].doesExist = true
                } else {
                  this.items[i].doesExist = false
                }
              }
            }
            this.items[i].buffer = await this.getFileBuffer(file)
            this.items[i].name = name
          }
        }
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
          /* if (name.length >= 100) {
            let temp = name.split('.')
            name = temp[0].substring(0, 99)
            name += '.' + temp[1]
          } */
          this.items[i].name = name
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
      if (console) console.log('onInput')
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
      if (console) console.log('fileExists')
      let exists = false
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].id === id) {
          let test = []
          test = new Array(this.items[i].issues)
          if (test.indexOf('doesExist') >= 0) {
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
