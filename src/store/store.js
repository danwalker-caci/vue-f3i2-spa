import Vue from 'vue'
import Vuex from 'vuex'
import VuexORM from '@vuex-orm/core'
import * as support from '@/store/modules/support.js'
import * as notification from '@/store/modules/notification.js'
import User from '@/models/User'
import usermodule from '@/modules/usermodule'
import Todo from '@/models/Todo'
import todomodule from '@/modules/todomodule'
import Event from '@/models/Event'
import eventmodule from '@/modules/eventmodule'
import Travel from '@/models/Travel'
import travelmodule from '@/modules/travelmodule'
import Personnel from '@/models/Personnel'
import personnelmodule from '@/modules/personnelmodule'
import WorkPlan from '@/models/WorkPlan'
import workplanmodule from '@/modules/workplanmodule'
import Manning from '@/models/Manning'
import manningmodule from '@/modules/manningmodule'
import Feature from '@/models/Feature'
import featuremodule from '@/modules/featuremodule'
import Bug from '@/models/Bug'
import bugmodule from '@/modules/bugmodule'
import Company from '@/models/Company'
import companymodule from '@/modules/companymodule'
import MSR from '@/models/MSR'
import msrmodule from '@/modules/msrmodule'
import Security from '@/models/Security'
import securitymodule from '@/modules/securitymodule'

Vue.use(Vuex)
const database = new VuexORM.Database()

// Register Models.
database.register(User, usermodule)
database.register(Todo, todomodule)
database.register(Event, eventmodule)
database.register(Travel, travelmodule)
database.register(Personnel, personnelmodule)
database.register(WorkPlan, workplanmodule)
database.register(Manning, manningmodule)
database.register(Feature, featuremodule)
database.register(Bug, bugmodule)
database.register(Company, companymodule)
database.register(MSR, msrmodule)
database.register(Security, securitymodule)

Vue.config.devtools = true

export default new Vuex.Store({
  modules: {
    support,
    notification
  },
  plugins: [VuexORM.install(database, { namespace: 'database' })]
})
