<template>
  <b-container fluid class="m-0 p-0">
    <b-row no-gutter class="cui">
      <b-col cols="4" class="p-0"></b-col>
      <b-col cols="4" class="p-0 text-center text-white">THIS SITE CONTAINS CONTROLLED UNCLASSIFIED INFORMATION</b-col>
      <b-col cols="4" class="p-0"></b-col>
    </b-row>
    <b-row no-gutter>
      <div v-if="userloaded" class="wrapper" :class="{ 'nav-open': $sidebar.showSidebar }">
        <NotificationContainer />
        <side-bar v-if="userloaded">
          <user-menu v-if="userloaded"></user-menu>
          <template slot="links">
            <sidebar-item :link="{ name: 'Travel', library: 'fas', icon: 'plane', path: '/travel/home' }">
              <sidebar-item :link="{ name: 'Travel Calendar', library: 'fas', icon: 'calendar', path: '/travel/home/refreshcalendar' }"></sidebar-item>
              <sidebar-item :link="{ name: 'Travel Tracker', library: 'fas', icon: 'subway', path: '/travel/home/refreshtracker' }"></sidebar-item>
              <sidebar-item :link="{ name: 'New Travel Request', library: 'fas', icon: 'plane-departure', path: '/travel/home/new' }"></sidebar-item>
            </sidebar-item>
            <sidebar-item :link="{ name: 'Personnel', library: 'fas', icon: 'users' }">
              <sidebar-item :link="{ name: 'Onboarding', library: 'fas', icon: 'user-check', path: '/personnel/home/new/onboarding' }"></sidebar-item>
              <sidebar-item :link="{ name: 'Roster', library: 'fas', icon: 'id-card', path: '/personnel/home/reports/default' }"></sidebar-item>
            </sidebar-item>
            <sidebar-item :link="{ name: 'Work Plans', library: 'fas', icon: 'briefcase' }">
              <sidebar-item :link="{ name: 'Active Work Plans', library: 'fas', icon: 'briefcase', path: '/workplans/home/active' }"></sidebar-item>
            </sidebar-item>
            <sidebar-item :link="{ name: 'PMO Calendar', library: 'far', icon: 'calendar-alt', path: '/calendar/home' }"></sidebar-item>
            <sidebar-item :link="{ name: 'Features and Bugs', library: 'far', icon: 'lightbulb' }">
              <sidebar-item :link="{ name: 'Report Bug or Request Feature', library: 'fas', icon: 'bug', path: '/feature/home' }"></sidebar-item>
              <sidebar-item :link="{ name: 'Features', library: 'fas', icon: 'cubes', path: '/features/home' }"></sidebar-item>
              <sidebar-item :link="{ name: 'Bugs', library: 'fas', icon: 'spider', path: '/bugs/home' }"></sidebar-item>
            </sidebar-item>
            <sidebar-item :link="{ name: 'Monthly Status Reports', library: 'fas', icon: 'file-contract' }">
              <sidebar-item v-if="!isAFRL" :link="{ name: 'Edit Reports', library: 'fas', icon: 'file-signature', path: '/msr/home' }"></sidebar-item>
              <sidebar-item v-if="!isSubcontractor" :link="{ name: 'Report Library', library: 'fas', icon: 'folder', path: '/msr/library' }"></sidebar-item>
            </sidebar-item>
            <sidebar-item :link="{ name: 'Training', library: 'fas', icon: 'chalkboard-teacher' }">
              <sidebar-item v-if="!isSubcontractor" :link="{ name: 'AFRL Training', library: 'fas', icon: 'folder', path: '/training/AFRL' }"></sidebar-item>
              <sidebar-item v-if="!isAFRL" :link="{ name: 'Subcontractor Training', library: 'fas', icon: 'folder', path: '/training/Subcontractor' }"></sidebar-item>
              <sidebar-item v-if="!isSubcontractor && !isAFRL" :link="{ name: 'CACI Training', library: 'fas', icon: 'folder', path: '/training/CACI' }"></sidebar-item>
            </sidebar-item>
            <sidebar-item v-if="!isSubcontractor" :link="{ name: 'Financial', library: 'fas', icon: 'money-check-alt' }">
              <sidebar-item :link="{ name: 'Dashboard', library: 'fas', icon: 'file-invoice', path: '/financial/home' }"></sidebar-item>
              <sidebar-item :link="{ name: 'Documents', library: 'fas', icon: 'book', path: '/financial/library' }"></sidebar-item>
              <!-- <sidebar-item :link="{ name: 'Manning Report', library: 'fas', icon: 'users', path: '/financial/manning' }"></sidebar-item> -->
            </sidebar-item>
            <!-- Add Security Menu Links -->
            <sidebar-item :link="{ name: 'Security', library: 'fas', icon: 'user-shield' }">
              <sidebar-item :link="{ name: 'Add Accounts', library: 'fas', icon: 'id-card-alt', path: '/security/account' }"></sidebar-item>
              <sidebar-item :link="{ name: 'Add CAC', library: 'fas', icon: 'id-badge', path: '/security/cac' }"></sidebar-item>
              <sidebar-item :link="{ name: 'Add SCI', library: 'fas', icon: 'id-card', path: '/security/sci' }"></sidebar-item>
              <sidebar-item :link="{ name: 'Security Actions Tracker', library: 'fas', icon: 'id-card', path: '/security/tracker/accounts' }"></sidebar-item>
            </sidebar-item>
            <sidebar-item v-if="isAdmin" :link="{ name: 'Portal Administration', library: 'fas', icon: 'user-lock', path: '/admin/home/home' }"></sidebar-item>
          </template>
        </side-bar>
        <div v-if="userloaded" class="main-panel">
          <top-navbar></top-navbar>
          <dashboard-content @click.native="toggleSidebar"></dashboard-content>
          <content-footer></content-footer>
        </div>
      </div>
      <div v-else id="LoadingBars">
        <div class="blockG" id="rotateG_01"></div>
        <div class="blockG" id="rotateG_02"></div>
        <div class="blockG" id="rotateG_03"></div>
        <div class="blockG" id="rotateG_04"></div>
        <div class="blockG" id="rotateG_05"></div>
        <div class="blockG" id="rotateG_06"></div>
        <div class="blockG" id="rotateG_07"></div>
        <div class="blockG" id="rotateG_08"></div>
      </div>
    </b-row>
    <b-row no-gutter class="cui">
      <b-col cols="4" class="p-0"></b-col>
      <b-col cols="4" class="p-0 text-center text-white">THIS SITE CONTAINS CONTROLLED UNCLASSIFIED INFORMATION</b-col>
      <b-col cols="4" class="p-0"></b-col>
    </b-row>
  </b-container>
</template>
<script>
import User from '@/models/User'
import UserMenu from './UserMenu.vue'
import TopNavbar from './TopNavbar.vue'
import ContentFooter from './ContentFooter.vue'
import DashboardContent from './Content.vue'
import NotificationContainer from '@/components/NotificationContainer.vue'
export default {
  computed: {
    isAdmin() {
      return User.getters('isAdmin')
    },
    isAFRL() {
      return User.getters('isAFRL')
    },
    isSubcontractor() {
      return User.getters('isSubcontractor')
    },
    isMember() {
      return User.getters('isMember')
    },
    isDeveloper() {
      return User.getters('isDeveloper')
    },
    isCACI() {
      return !this.isSubcontractor && !this.isAdmin
    },
    userloaded() {
      return User.getters('Loaded')
    }
  },
  components: {
    NotificationContainer,
    TopNavbar,
    ContentFooter,
    DashboardContent,
    UserMenu
  },
  mounted: function() {
    this.$options.interval = setInterval(this.waitForUser, 1000)
  },
  methods: {
    waitForUser() {
      if (this.userloaded) {
        clearInterval(this.$options.interval)
        // get the bounds of the content class which represents the main content area.
        let el = document.getElementById('maincontent')
        let rect = el.getBoundingClientRect()
        this.$store.dispatch('support/setContentRect', rect)
        this.$store.dispatch('support/addActivity', '<div class="bg-success text-white">DashboardLayout-MOUNTED: ' + rect.top + ', ' + rect.left + ', ' + rect.width + ', ' + rect.height + '</div>')
      }
    },
    toggleSidebar() {
      if (this.$sidebar.showSidebar) {
        this.$sidebar.displaySidebar(false)
      }
    }
  }
}
</script>
<style lang="scss">
.cui {
  height: 25px;
  line-height: 25px;
  background-color: #8d1d8d;
}

#LoadingBars {
  position: relative;
  width: 240px;
  height: 298px;
  margin: auto;
}

.blockG {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.69);
  width: 39px;
  height: 93px;
  border-radius: 31px 31px 0 0;
  -o-border-radius: 31px 31px 0 0;
  -ms-border-radius: 31px 31px 0 0;
  -webkit-border-radius: 31px 31px 0 0;
  -moz-border-radius: 31px 31px 0 0;
  transform: scale(0.4);
  -o-transform: scale(0.4);
  -ms-transform: scale(0.4);
  -webkit-transform: scale(0.4);
  -moz-transform: scale(0.4);
  animation-name: fadeG;
  -o-animation-name: fadeG;
  -ms-animation-name: fadeG;
  -webkit-animation-name: fadeG;
  -moz-animation-name: fadeG;
  animation-duration: 0.732s;
  -o-animation-duration: 0.732s;
  -ms-animation-duration: 0.732s;
  -webkit-animation-duration: 0.732s;
  -moz-animation-duration: 0.732s;
  animation-iteration-count: infinite;
  -o-animation-iteration-count: infinite;
  -ms-animation-iteration-count: infinite;
  -webkit-animation-iteration-count: infinite;
  -moz-animation-iteration-count: infinite;
  animation-direction: normal;
  -o-animation-direction: normal;
  -ms-animation-direction: normal;
  -webkit-animation-direction: normal;
  -moz-animation-direction: normal;
}

#rotateG_01 {
  left: 0;
  top: 109px;
  animation-delay: 0.2695s;
  -o-animation-delay: 0.2695s;
  -ms-animation-delay: 0.2695s;
  -webkit-animation-delay: 0.2695s;
  -moz-animation-delay: 0.2695s;
  transform: rotate(-90deg);
  -o-transform: rotate(-90deg);
  -ms-transform: rotate(-90deg);
  -webkit-transform: rotate(-90deg);
  -moz-transform: rotate(-90deg);
}

#rotateG_02 {
  left: 31px;
  top: 39px;
  animation-delay: 0.366s;
  -o-animation-delay: 0.366s;
  -ms-animation-delay: 0.366s;
  -webkit-animation-delay: 0.366s;
  -moz-animation-delay: 0.366s;
  transform: rotate(-45deg);
  -o-transform: rotate(-45deg);
  -ms-transform: rotate(-45deg);
  -webkit-transform: rotate(-45deg);
  -moz-transform: rotate(-45deg);
}

#rotateG_03 {
  left: 101px;
  top: 12px;
  animation-delay: 0.4525s;
  -o-animation-delay: 0.4525s;
  -ms-animation-delay: 0.4525s;
  -webkit-animation-delay: 0.4525s;
  -moz-animation-delay: 0.4525s;
  transform: rotate(0deg);
  -o-transform: rotate(0deg);
  -ms-transform: rotate(0deg);
  -webkit-transform: rotate(0deg);
  -moz-transform: rotate(0deg);
}

#rotateG_04 {
  right: 31px;
  top: 39px;
  animation-delay: 0.549s;
  -o-animation-delay: 0.549s;
  -ms-animation-delay: 0.549s;
  -webkit-animation-delay: 0.549s;
  -moz-animation-delay: 0.549s;
  transform: rotate(45deg);
  -o-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  -webkit-transform: rotate(45deg);
  -moz-transform: rotate(45deg);
}

#rotateG_05 {
  right: 0;
  top: 109px;
  animation-delay: 0.6355s;
  -o-animation-delay: 0.6355s;
  -ms-animation-delay: 0.6355s;
  -webkit-animation-delay: 0.6355s;
  -moz-animation-delay: 0.6355s;
  transform: rotate(90deg);
  -o-transform: rotate(90deg);
  -ms-transform: rotate(90deg);
  -webkit-transform: rotate(90deg);
  -moz-transform: rotate(90deg);
}

#rotateG_06 {
  right: 31px;
  bottom: 27px;
  animation-delay: 0.732s;
  -o-animation-delay: 0.732s;
  -ms-animation-delay: 0.732s;
  -webkit-animation-delay: 0.732s;
  -moz-animation-delay: 0.732s;
  transform: rotate(135deg);
  -o-transform: rotate(135deg);
  -ms-transform: rotate(135deg);
  -webkit-transform: rotate(135deg);
  -moz-transform: rotate(135deg);
}

#rotateG_07 {
  bottom: 0;
  left: 101px;
  animation-delay: 0.8185s;
  -o-animation-delay: 0.8185s;
  -ms-animation-delay: 0.8185s;
  -webkit-animation-delay: 0.8185s;
  -moz-animation-delay: 0.8185s;
  transform: rotate(180deg);
  -o-transform: rotate(180deg);
  -ms-transform: rotate(180deg);
  -webkit-transform: rotate(180deg);
  -moz-transform: rotate(180deg);
}

#rotateG_08 {
  left: 31px;
  bottom: 27px;
  animation-delay: 0.905s;
  -o-animation-delay: 0.905s;
  -ms-animation-delay: 0.905s;
  -webkit-animation-delay: 0.905s;
  -moz-animation-delay: 0.905s;
  transform: rotate(-135deg);
  -o-transform: rotate(-135deg);
  -ms-transform: rotate(-135deg);
  -webkit-transform: rotate(-135deg);
  -moz-transform: rotate(-135deg);
}

@keyframes fadeG {
  0% {
    background-color: rgb(255, 0, 0);
  }

  100% {
    background-color: rgb(255, 255, 255);
  }
}

@-o-keyframes fadeG {
  0% {
    background-color: rgb(255, 0, 0);
  }

  100% {
    background-color: rgb(255, 255, 255);
  }
}

@-ms-keyframes fadeG {
  0% {
    background-color: rgb(255, 0, 0);
  }

  100% {
    background-color: rgb(255, 255, 255);
  }
}

@-webkit-keyframes fadeG {
  0% {
    background-color: rgb(255, 0, 0);
  }

  100% {
    background-color: rgb(255, 255, 255);
  }
}

@-moz-keyframes fadeG {
  0% {
    background-color: rgb(255, 0, 0);
  }

  100% {
    background-color: rgb(255, 255, 255);
  }
}
</style>
