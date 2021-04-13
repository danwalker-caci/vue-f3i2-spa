import SupportService from '@/services/SupportService.js'

export const namespaced = true

export const state = {
  legendItems: [],
  legendLoaded: false,
  legendLoading: false,
  profile: {},
  loaded: false,
  activity: '',
  portalemail: 'F3I-2Portal@caci.com',
  // TO DO: Place these in a setting list to be looked up.
  AFRLUserEmail: 'juan.esparza@us.af.mil',
  AFRLUserId: null,
  AccountUserEmail: 'monica.dennis@caci.com',
  AccountUserId: null,
  SCIUserEmails: ['Michele.Blackburn@caci.com', 'louis.ellis@caci.com'],
  SCIUserIds: null,
  CACUserEmails: ['Michele.Blackburn@caci.com', 'tammy.willson@caci.com'],
  CACUserIds: null,
  contentrect: {}
}

export const mutations = {
  SET_LOADED(state, loaded) {
    state.loaded = loaded
  },
  SET_PROFILE(state, profile) {
    state.profile = profile
  },
  SET_LEGEND(state, legendItems) {
    state.legendItems = legendItems
  },
  SET_CONTENTRECT(state, values) {
    state.contentrect = values
  },
  SET_ACTIVITY(state, activity) {
    if (state.activity == '') {
      state.activity = activity
    } else {
      state.activity += '<br/>' + activity
    }
  },
  SET_ACCOUNTID(state, accountid) {
    state.AccountUserId = accountid
  },
  SET_AFRLID(state, afrlid) {
    state.AFRLUserId = afrlid
  },
  SET_SCIID(state, sciid) {
    state.SCIUserId = sciid
  },
  SET_CACID(state, cacid) {
    state.CACUserId = cacid
  }
}

export const actions = {
  getUserProfile({ commit }) {
    SupportService.getUserProfile()
      .then(response => {
        // console.log('Profile Data: ' + response)
        let profile = {}
        let properties = response.data.d.UserProfileProperties.results
        profile.PictureUrl = response.data.d.PictureUrl
        profile.PersonalUrl = response.data.d.PersonalUrl
        profile.Email = response.data.d.Email
        profile.EmailLink = 'mailto:' + response.data.d.Email
        profile.DisplayName = response.data.d.DisplayName
        for (let i = 0; i < properties.length; i++) {
          let property = properties[i]
          // console.log('Key: ' + property.Key)
          switch (property.Key) {
            case 'WorkPhone':
              profile.Phone = property.Value
              break

            case 'CellPhone':
              profile.CellPhone = property.Value
              break

            case 'Manager':
              profile.Manager = property.Value
              break
          }
        }
        commit('SET_PROFILE', profile)
      })
      .catch(error => {
        console.log('There was an error getting profile data: ', error.response)
      })
  },
  setLegendItems({ commit }, items) {
    commit('SET_LEGEND', items)
  },
  addActivity({ commit }, activity) {
    commit('SET_ACTIVITY', activity)
  },
  setContentRect({ commit }, values) {
    commit('SET_CONTENTRECT', values)
  },
  async getAccountUser({ commit }) {
    let response = await SupportService.getUserIdByEmail(state.AccountUserEmail)
    commit('SET_ACCOUNTID', response.data.d.results[0].Id)
    return response.data.d.results[0].Id
  },
  async getAFRLUser({ commit }) {
    let response = await SupportService.getUserIdByEmail(state.AFRLUserEmail)
    commit('SET_AFRLID', response.data.d.results[0].Id)
    return response.data.d.results[0].Id
  },
  async getSCIUser({ commit }) {
    let sciids = []
    for (var i = 0; i < state.SCIUserEmails.length; i++) {
      let response = await SupportService.getUserIdByEmail(state.SCIUserEmails[i])
      sciids.push(response.data.d.results[0].Id)
    }
    commit('SET_SCIID', sciids)
    return sciids
  },
  async getCACUser({ commit }) {
    let cacids = []
    for (var i = 0; i < state.CACUserEmails.length; i++) {
      let response = await SupportService.getUserIdByEmail(state.CACUserEmails[i])
      cacids.push(response.data.d.results[0].Id)
    }
    commit('SET_CACID', cacids)
    return cacids
  }
}

export const getters = {
  getLegendItems(state) {
    return state.legendItems
  },
  getContentRect(state) {
    return state.contentrect
  },
  getPortalEmail(state) {
    return state.portalemail
  },
  getAccountUserId(state) {
    return state.AccountUserId
  },
  getSCIUserId(state) {
    return state.SCIUserId
  },
  getCACUserId(state) {
    return state.CACUserId
  },
  getAFRLUserId(state) {
    return state.AFRLUserId
  }
}
