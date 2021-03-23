<template>
  <!-- Add Form where users can download master docs and upload the changed docs. -->
  <b-container fluid class="contentHeight p-0" id="MainContainer">
    <div id="form" class="col-12 p-0">
      <b-row class="bg-dark formheader">
        <b-col cols="4" class="p-0 text-left"></b-col>
        <b-col cols="4" class="p-0 text-center font-weight-bold">
          <h3 class="text-white">{{ formTitle }}</h3>
        </b-col>
        <b-col cols="4" class="p-0 text-right"></b-col>
      </b-row>
      <b-card no-body class="p-0">
        <div class="p-1">
          <b-form-row>
            <b-col>
              <b-button @click="$router.push({ path: '/security/tracker' })" variant="secondary">Return to Tracker</b-button>
            </b-col>
          </b-form-row>
          <b-form-row>
            <b-col>
              <b-form-group label="Company: " label-for="company">
                <b-form-input id="company" v-model="company" value="{{ company }}" disabled />
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group label="Name: " label-for="name">
                <b-form-input id="name" v-model="name" value="{{ name }}" disabled />
              </b-form-group>
            </b-col>
          </b-form-row>
          <b-form-row v-if="isAFRL">
            <b-col>
              <!-- Upload Area Here -->
              <b-form-group>
                <ejs-uploader id="formFileUpload" name="formFileUpload" :selected="onFileSelect" :multiple="true"></ejs-uploader>
              </b-form-group>
            </b-col>
          </b-form-row>
        </div>
      </b-card>
    </div>
  </b-container>
</template>
<script>
/* eslint-disable no-unused-vars */
let vm = null
// eslint-disable-next-line no-undef
let url = _spPageContextInfo.webAbsoluteUrl
import moment from 'moment'
import Security from '@/models/Security'
import Todo from '@/models/Todo'
import User from '@/models/User'

export default {
  name: 'SecurityEdit',
  props: {
    id: {
      type: Number
    }
  },
  computed: {
    userid() {
      return User.getters('CurrentUserId')
    },
    isSecurity() {
      return User.getters('isSecurity')
    },
    isAFRL() {
      return User.getters('isAFRL')
    }
  },
  data: function() {
    return {
      AccountID: '',
      AFRLID: '',
      SecurityID: ''
    }
  },
  mounted: async function() {
    vm = this
    await Security.dispatch('getDigest')
    await this.getUserIDs()
    await this.checkType()
    await this.getForms()
  },
  methods: {
    getUserIDs: async function() {
      this.AccountId = await this.$store.dispatch('support/getAccountUser')
      this.AFRLId = await this.$store.dispatch('support/getAFRLUser')
      this.SecurityId = await this.$store.dispatch('support/getCACSCIUser')
      // console.log(this.$store.state.support.AFRLUserID)
      // console.log(this.$store.state.support.AccountUserID)
      // console.log(this.$store.state.support.CACSCIUserID)
    }
  }
}
</script>
<style lang="scss">
#MainContainer {
  overflow: auto;
}
#form {
  overflow-x: hidden;
}
</style>
