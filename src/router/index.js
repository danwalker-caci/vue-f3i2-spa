import Vue from 'vue'
import VueRouter from 'vue-router'
import ThemeLayout from '@/components/Layout/DashboardLayout.vue'

Vue.use(VueRouter)

let adminMenu = {
  path: '/admin',
  component: ThemeLayout,
  redirect: '/admin/home',
  children: [
    {
      path: 'home/:mode',
      name: 'Admin',
      component: () => import(/* webpackChunkName: "admin" */ '../components/Admin/admin.vue'),
      props: true
    }
  ]
}

let pagesMenu = {
  path: '/pages',
  component: ThemeLayout,
  redirect: '/pages/home/dashboard',
  children: [
    {
      path: 'home/:mode',
      name: 'Home',
      component: () => import(/* webpackChunkName: "pages" */ '../components/Pages/Home2.vue'),
      props: true
    },
    {
      path: 'page/home',
      name: 'Dashboard',
      component: () => import(/* webpackChunkName: "dashboard" */ '../components/Pages/Dashboard.vue'),
      props: true
    },
    {
      path: 'page/dropoff',
      name: 'FileExchange',
      component: () => import(/* webpackChunkName: "dropoff" */ '../components/Pages/DropoffLibrary.vue'),
      props: true
    }
  ]
}

let travelMenu = {
  path: '/travel',
  component: ThemeLayout,
  redirect: '/travel/home',
  children: [
    {
      path: 'home/:mode',
      name: 'Travel',
      component: () => import(/* webpackChunkName: "travel" */ '../components/Travel/Home.vue'),
      props: true
    },
    {
      path: 'page/tracker',
      name: 'Travel Tracker',
      component: () => import(/* webpackChunkName: "travel" */ '../components/Travel/TravelTracker2.vue'),
      props: true
    },
    {
      path: 'page/calendar',
      name: 'Travel Calendar',
      component: () => import(/* webpackChunkName: "travel" */ '../components/Travel/TravelCalendar.vue'),
      props: true
    },
    {
      path: 'page/new',
      name: 'New Travel',
      component: () => import(/* webpackChunkName: "travel" */ '../components/Travel/NewTravel.vue'),
      props: true
    },
    {
      path: 'page/edit',
      name: 'Edit Travel',
      component: () => import(/* webpackChunkName: "travel" */ '../components/Travel/EditTravel.vue'),
      props: true
    },
    {
      path: 'page/view',
      name: 'View Travel',
      component: () => import(/* webpackChunkName: "travel" */ '../components/Travel/ViewTravel.vue'),
      props: true
    },
    {
      path: 'page/report',
      name: 'Trip Report',
      component: () => import(/* webpackChunkName: "travel" */ '../components/Travel/TripReport.vue'),
      props: true
    }
  ]
}

let securityMenu = {
  path: '/security',
  component: ThemeLayout,
  redirect: '/security/account',
  children: [
    {
      path: '/security/add/:formType',
      name: 'Add Security',
      component: () => import(/* webpackChunkName: "security" */ '../components/Security/securityadd.vue'),
      props: true
    },
    {
      path: '/security/edit/:id',
      name: 'Edit Security',
      component: () => import(/* webpackChunkName: "security" */ '../components/Security/securityedit.vue'),
      props: true
    },
    {
      path: '/security/view/:id/:form',
      name: 'Review Security',
      component: () => import(/* webpackChunkName: "security" */ '../components/Security/securityreview.vue'),
      props: true
    },
    {
      path: '/security/tracker',
      name: 'Security Tracker',
      component: () => import(/* webpackChunkName: "security" */ '../components/Security/securitytracker.vue'),
      props: true
    }
  ]
}

let msrMenu = {
  path: '/msr',
  component: ThemeLayout,
  redirect: '/msr/home',
  children: [
    {
      path: 'home',
      name: 'Home',
      component: () => import(/* webpackChunkName: "msr" */ '../components/MSR/msrhome.vue'),
      props: true
    },
    {
      path: 'form/:id',
      name: 'MSRForm',
      component: () => import(/* webpackChunkName: "msr" */ '../components/MSR/msrform.vue'),
      props: true
    },
    {
      path: 'library',
      name: 'MSR Library',
      component: () => import(/* webpackChunkName: "msr" */ '../components/MSR/library.vue'),
      props: true
    },
    {
      path: 'library/month/:month',
      name: 'MSR Library',
      component: () => import(/* webpackChunkName: "msr" */ '../components/MSR/library.vue'),
      props: true
    },
    {
      path: 'library/year/:year',
      name: 'MSR Library',
      component: () => import(/* webpackChunkName: "msr" */ '../components/MSR/library.vue'),
      props: true
    },
    {
      path: 'library/workplan/:workplan',
      name: 'MSR Library',
      component: () => import(/* webpackChunkName: "msr" */ '../components/MSR/library.vue'),
      props: true
    },
    {
      path: 'library/month/:month/year/:year',
      name: 'MSR Library',
      component: () => import(/* webpackChunkName: "msr" */ '../components/MSR/library.vue'),
      props: true
    },
    {
      path: 'library/month/:month/workplan/:workplan',
      name: 'MSR Library',
      component: () => import(/* webpackChunkName: "msr" */ '../components/MSR/library.vue'),
      props: true
    },
    {
      path: 'library/year/:year/workplan/:workplan',
      name: 'MSR Library',
      component: () => import(/* webpackChunkName: "msr" */ '../components/MSR/library.vue'),
      props: true
    },
    {
      path: 'library/month/:month/year/:year/workplan/:workplan',
      name: 'MSR Library',
      component: () => import(/* webpackChunkName: "msr" */ '../components/MSR/library.vue'),
      props: true
    }
  ]
}

let financialMenu = {
  path: '/financial',
  component: ThemeLayout,
  redirect: '/financial/home',
  children: [
    {
      path: 'home',
      name: 'Home',
      component: () => import(/* webpackChunkName: "financial" */ '../components/Financial/dashboard.vue'),
      props: true
    },
    {
      path: 'library',
      name: 'Financial Documents',
      component: () => import(/* webpackChunkName: "financial" */ '../components/Financial/library.vue'),
      props: true
    },
    {
      path: 'library/clin/:clin',
      name: 'Financial Documents',
      component: () => import(/* webpackChunkName: "financial" */ '../components/Financial/library.vue'),
      props: true
    },
    {
      path: 'library/clin/:clin/month/:month',
      name: 'Financial Documents',
      component: () => import(/* webpackChunkName: "financial" */ '../components/Financial/library.vue'),
      props: true
    },
    {
      path: 'library/clin/:clin/year/:year',
      name: 'Financial Documents',
      component: () => import(/* webpackChunkName: "financial" */ '../components/Financial/library.vue'),
      props: true
    },
    {
      path: 'library/clin/:clin/workplan/:workplan',
      name: 'Financial Documents',
      component: () => import(/* webpackChunkName: "financial" */ '../components/Financial/library.vue'),
      props: true
    },
    {
      path: 'library/clin/:clin/month/:month/year/:year',
      name: 'Financial Documents',
      component: () => import(/* webpackChunkName: "financial" */ '../components/Financial/library.vue'),
      props: true
    },
    {
      path: 'library/clin/:clin/month/:month/year/:year/workplan/:workplan',
      name: 'Financial Documents',
      component: () => import(/* webpackChunkName: "financial" */ '../components/Financial/library.vue'),
      props: true
    },
    {
      path: 'library/month/:month/',
      name: 'Financial Documents',
      component: () => import(/* webpackChunkName: "financial" */ '../components/Financial/library.vue'),
      props: true
    },
    {
      path: 'library/month/:month/year/:year',
      name: 'Financial Documents',
      component: () => import(/* webpackChunkName: "financial" */ '../components/Financial/library.vue'),
      props: true
    },
    {
      path: 'library/month/:month/workplan/:workplan',
      name: 'Financial Documents',
      component: () => import(/* webpackChunkName: "financial" */ '../components/Financial/library.vue'),
      props: true
    },
    {
      path: 'library/year/:year/',
      name: 'Financial Documents',
      component: () => import(/* webpackChunkName: "financial" */ '../components/Financial/library.vue'),
      props: true
    },
    {
      path: 'library/year/:year/workplan/:workplan',
      name: 'Financial Documents',
      component: () => import(/* webpackChunkName: "financial" */ '../components/Financial/library.vue'),
      props: true
    },
    {
      path: 'library/workplan/:workplan',
      name: 'Financial Documents',
      component: () => import(/* webpackChunkName: "financial" */ '../components/Financial/library.vue'),
      props: true
    },
    {
      path: 'manning',
      name: 'Manning Report',
      component: () => import(/* webpackChunkName: "financial" */ '../components/Financial/manning.vue'),
      props: true
    }
  ]
}

let trainingMenu = {
  path: '/training',
  component: ThemeLayout,
  redirect: '/training/home',
  children: [
    {
      path: 'home',
      name: 'Training',
      component: () => import(/* webpackChunkName: "training" */ '../components/Training/library.vue'),
      props: true
    },
    {
      path: '/training/:library',
      name: 'Training',
      component: () => import(/* webpackChunkName: "training" */ '../components/Training/library.vue'),
      props: true
    }
  ]
}

let calendarMenu = {
  path: '/calendar',
  component: ThemeLayout,
  redirect: '/calendar/home',
  children: [
    {
      path: 'home',
      name: 'Calendar',
      component: () => import(/* webpackChunkName: "calendar" */ '../components/Pages/calendar.vue'),
      props: true
    }
  ]
}

let refreshMenu = {
  path: '/refresh',
  component: ThemeLayout,
  redirect: '/refresh/home',
  children: [
    {
      path: 'home/:action',
      name: 'Refresh',
      component: () => import(/* webpackChunkName: "refresh" */ '../components/Layout/Refresh.vue'),
      props: true
    }
  ]
}

let featureMenu = {
  path: '/feature',
  component: ThemeLayout,
  redirect: '/feature/home',
  children: [
    {
      path: 'home',
      name: 'Feature',
      component: () => import(/* webpackChunkName: "features" */ '../components/Features/feature.vue')
    }
  ]
}

let featuresMenu = {
  path: '/features',
  component: ThemeLayout,
  redirect: '/features/home',
  children: [
    {
      path: 'home',
      name: 'Features',
      component: () => import(/* webpackChunkName: "features" */ '../components/Features/features.vue'),
      props: true
    }
  ]
}

let bugsMenu = {
  path: '/bugs',
  component: ThemeLayout,
  redirect: '/bugs/home',
  children: [
    {
      path: 'home',
      name: 'Bugs',
      component: () => import(/* webpackChunkName: "features" */ '../components/Features/bugs.vue'),
      props: true
    }
  ]
}

let personnelMenu = {
  path: '/personnel',
  component: ThemeLayout,
  redirect: '/personnel/home',
  children: [
    {
      path: 'home/reports/:mode',
      name: 'Reports',
      component: () => import(/* webpackChunkName: "personnel" */ '../components/Personnel/personnel.vue'),
      props: true
    },
    {
      path: 'home/reports/:mode/:id',
      name: 'Personnel',
      component: () => import(/* webpackChunkName: "personnel" */ '../components/Personnel/personnel.vue'),
      props: true
    },
    {
      path: 'home/refresh/:mode',
      name: 'Personnel',
      component: () => import(/* webpackChunkName: "personnel" */ '../components/Personnel/personnel.vue'),
      props: true
    },
    {
      path: 'home/new/:mode',
      name: 'Onboarding',
      component: () => import(/* webpackChunkName: "personnel" */ '../components/Personnel/personnel.vue'),
      props: true
    }
  ]
}

let workplanMenu = {
  path: '/workplans',
  component: ThemeLayout,
  redirect: '/workplans/home',
  children: [
    {
      path: 'home/active',
      name: 'Work Plans',
      component: () => import(/* webpackChunkName: "workplan" */ '../components/Workplans/workplan.vue'),
      props: true
    }
  ]
}

const routes = [
  {
    path: '/',
    redirect: '/pages/page/home'
  },
  {
    path: '/pages/home',
    redirect: '/pages/page/home'
  },
  adminMenu,
  msrMenu,
  financialMenu,
  calendarMenu,
  travelMenu,
  featureMenu,
  featuresMenu,
  bugsMenu,
  personnelMenu,
  trainingMenu,
  securityMenu,
  workplanMenu,
  refreshMenu,
  pagesMenu
]

const router = new VueRouter({
  routes
})

export default router
