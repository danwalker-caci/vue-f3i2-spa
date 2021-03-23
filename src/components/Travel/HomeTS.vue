<template>
  <b-container fluid class="contentHeight"></b-container>
</template>

<script>
export default {
  name: 'Home',
  props: {
    mode: {
      type: String,
      default: 'default'
    }
  },
  mounted: function() {
    if (this.mode == 'refreshtracker') {
      this.$router.push({ name: 'Travel Tracker' })
    }
    if (this.mode == 'refreshcalendar') {
      this.$router.push({ name: 'Travel Calendar' })
    }
    if (this.mode == 'new') {
      this.$router.push({ name: 'New Travel', params: { back: 'Travel Tracker' } })
    }
  },
  beforeDestroy() {
    this.$store.dispatch('support/setLegendItems', [])
  }
}
</script>

<style lang="scss"></style>
