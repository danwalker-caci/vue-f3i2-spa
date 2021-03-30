<template>
  <div>
    <b-link :to="{ name: 'Tasks', params: { Type: 'TripReportReview', TripId: data.Id } }">{{ data.TripReport }}</b-link>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: {}
    }
  },
  computed: {
    isPM() {
      return this.$store.state.users.currentUser.isPM
    },
    isAdmin() {
      return this.$store.state.users.currentUser.isAdmin
    },
    isWPManager() {
      return this.$store.state.users.currentUser.isWPManager
    },
    isSubcontractor() {
      return this.$store.state.users.currentUser.isSubcontractor // format when user built in users.ts not ORM
    },
    isAFRL() {
      return this.$store.state.users.currentUser.isAFRL
    }
  }
}
</script>

<style lang="scss">
.actionbutton {
  margin: 2px;
}
</style>
