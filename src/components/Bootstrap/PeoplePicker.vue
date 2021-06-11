<template>
  <b-row :id="'picker_row_' + id" class="m-0">
    <b-col cols="12" class="p-0">
      <b-modal :id="'modal_' + id" centered header-bg-variant="light-blue" size="lg" header-text-variant="light">
        <template v-slot:modal-title>Select Users for {{ title }}</template>
        <b-container class="p-0">
          <b-row>
            <b-col cols="12">
              <b-form-group label="Filter" label-cols-sm="3" label-align-sm="right" label-size="sm" class="mb-0">
                <b-input-group size="sm">
                  <b-form-input id="filter-input" v-model="filter" type="search" placeholder="Type to Search"></b-form-input>
                  <b-input-group-append>
                    <b-button :disabled="!filter" @click="filter = ''">Clear</b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="12">
              <b-table
                v-model="shownData"
                :id="'table_' + id"
                :ref="'table_' + id"
                :items="getItems"
                :fields="fields"
                :current-page="currentPage"
                no-provider-paging="true"
                no-provider-filtering="true"
                no-provider-sorting="true"
                :per-page="perPage"
                :filter="filter"
                :filter-included-fields="filterOn"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :sort-direction="sortDirection"
                show-empty
                small
                @filtered="onFiltered"
              >
                <template #cell(actions)="row">
                  <b-form-checkbox v-model="row.item.selected" @input.native="toggleUser(row.item, $event)"></b-form-checkbox>
                </template>
              </b-table>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="12">
              <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" align="fill" size="sm" class="my-0"></b-pagination>
            </b-col>
          </b-row>
        </b-container>
      </b-modal>
      <b-form-group :label="title">
        <b-input-group>
          <template #prepend>
            <b-button variant="light-blue" @click="showPicker(id, kind)" :id="'btn_' + id">Select</b-button>
          </template>
          <b-form-checkbox-group stacked :name="'cbg_' + id" class="p-2" v-model="selected">
            <b-form-checkbox v-for="item in items" :key="item.id" @input.native="toggleUser(item, $event)" :value="item.value">{{ item.name }}</b-form-checkbox>
          </b-form-checkbox-group>
        </b-input-group>
      </b-form-group>
    </b-col>
  </b-row>
</template>

<script>
/* eslint-disable no-unused-vars */
import Vue from 'vue'
import { EventBus } from '../../main'
import axios from 'axios'

let vm = null

var slash = '/'
var tp1 = String(window.location.protocol)
var tp2 = String(window.location.host)

let SPCI = null
if (window._spPageContextInfo) {
  SPCI = window._spPageContextInfo
}

export default {
  name: 'PeoplePicker',
  props: ['kind', 'title', 'id', 'user'],
  data: function() {
    return {
      items: [],
      selected: [],
      shownData: [],
      fields: [
        { key: 'actions', label: 'Select' },
        { key: 'name', label: 'Name' }
      ],
      totalRows: 1,
      currentPage: 1,
      perPage: 15,
      sortBy: 'name',
      sortDesc: false,
      sortDirection: 'asc',
      filter: null
    }
  },
  created() {
    vm = this
  },
  methods: {
    getItems: async function(ctx) {
      console.log('KIND: ' + this.kind)
      let that = this
      let url = null
      if (this.kind === 'Company') {
        let company = this.user[0].Company
        url = tp1 + slash + slash + tp2 + "/sites/f3i2/_api/lists/getbytitle('Personnel')/items?$select=UserAccount/EMail,UserAccount/Title,UserAccount/Id&$expand=UserAccount&$filter=Company eq '"
        url += company
        url += "' and UserAccount/Id gt 0"
        let promise = axios.get(url, { headers: { accept: 'application/json;odata=verbose' } })
        const response = await promise
        let j = response.data.d.results
        // if (console) console.log('RESPONSE: ' + JSON.stringify(j))
        let z = []
        for (let i = 0; i < j.length; i++) {
          z.push({
            name: j[i]['UserAccount']['Title'],
            id: j[i]['UserAccount']['Id'],
            email: j[i]['UserAccount']['EMail'],
            company: company,
            selected: this.isSelected(j[i]['UserAccount']['Id'])
          })
        }
        this.totalRows = z.length
        return z
      }
      if (this.kind === 'Group') {
        url = tp1 + slash + slash + tp2 + "/sites/f3i2/_api/Web/SiteGroups/GetByName('" + this.title + "')/users"
        console.log('GROUP URL: ' + url)
        let promise = axios.get(url, { headers: { accept: 'application/json;odata=verbose' } })
        const response = await promise
        let j = response.data.d.results
        // if (console) console.log('RESPONSE: ' + JSON.stringify(j))
        let y = []
        for (let i = 0; i < j.length; i++) {
          y.push({
            name: j[i]['Title'],
            id: j[i]['Id'],
            email: j[i]['Email'],
            selected: this.isSelected(j[i]['Id'])
          })
        }
        this.totalRows = y.length
        return y
      }
      if (this.kind === 'Companies') {
        this.fields.push({
          key: 'company',
          label: 'Company'
        })
        url = tp1 + slash + slash + tp2 + "/sites/f3i2/_api/lists/getbytitle('Personnel')/items?$select=Company,UserAccount/EMail,UserAccount/Title,UserAccount/Id&$expand=UserAccount&$filter=Company gt '' and UserAccount/Id gt 0"
        let promise = axios.get(url, { headers: { accept: 'application/json;odata=verbose' } })
        const response = await promise
        let j = response.data.d.results
        if (console) console.log('RESPONSE: ' + JSON.stringify(j))
        let x = []
        for (let i = 0; i < j.length; i++) {
          x.push({
            name: j[i]['UserAccount']['Title'],
            id: j[i]['UserAccount']['Id'],
            email: j[i]['UserAccount']['EMail'],
            company: j[i]['Company'],
            selected: this.isSelected(j[i]['UserAccount']['Id'])
          })
        }
        this.totalRows = x.length
        return x
      }
    },
    showPicker: function(id, kind) {
      let m = 'modal_' + id
      vm.$bvModal.show(m)
    },
    isSelected: function(id) {
      // would be used on mutiple openings of the select modal in case a user forgot to add a recipient
      if (this.selected.length > 0) {
        let s = false
        for (let i = 0; i < this.selected.length; i++) {
          if (this.selected[i] === id) {
            s = true
          }
        }
        return s
      } else {
        return false
      }
    },
    toggleUser: function(item, event) {
      // if (console) console.log('USER: ' + JSON.stringify(item))
      // the text and value fields below are used to draw the checkboxes
      let selecteduser = {
        text: item.name,
        value: item.id,
        id: item.id,
        name: item.name,
        email: item.email
      }
      // if the user is in the array already, then remove them
      if (this.selected.length > 0) {
        // loop through the array and see if the user is in there
        let index = 0
        for (let i = 0; i < this.selected.length; i++) {
          if (this.selected[i] === item.id) {
            index = i
          }
        }
        if (index > 0) {
          this.items.splice(index, 1)
          this.selected.splice(index, 1)
          EventBus.$emit('RemoveRecipient', selecteduser)
        } else {
          // user not found so add them
          this.items.push(selecteduser)
          EventBus.$emit('AddRecipient', selecteduser)
          this.selected.push(item.id)
        }
      } else {
        this.items.push(selecteduser)
        EventBus.$emit('AddRecipient', selecteduser)
        this.selected.push(item.id)
      }
    },
    onFiltered: function(filteredItems) {
      this.totalRows = filteredItems.length
      this.currentPage = 1
    }
  }
}
</script>

<style lang="scss"></style>
