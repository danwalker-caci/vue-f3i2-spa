<template>
  <b-container fluid class="contentHeight" id="MainContainer">
    <b-row ref="MainRow" class="contentHeight">
      <b-col md="12" xs="12">
        <iframe id="FinancialDashboard" title="Financial Dashboard" ref="frame" @load="load" v-show="iframe.loaded" :src="iframe.src" class="full-frame"></iframe>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  name: 'home',
  data: function() {
    return {
      iframe: {
        src: process.env.VUE_APP_BASE_URL + '/Pages/FinancialDashboard.aspx?isDlg=1',
        loaded: false
      }
    }
  },
  props: {
    mode: {
      type: String,
      default: 'default'
    }
  },
  mounted: function() {
    this.$nextTick(function() {
      const notification = {
        type: 'info',
        message: 'Loading Financial Dashboard'
      }
      this.$store.dispatch('notification/add', notification, { root: true })
    })
  },
  methods: {
    load: function() {
      this.iframe.loaded = true
    }
  }
}
</script>
