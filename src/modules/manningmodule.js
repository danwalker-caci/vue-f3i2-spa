/* eslint-disable */
import Vue from 'vue'
import Manning from '@/models/Manning'
import ManningService from '@/services/ManningService.js'
import moment from 'moment'

const getters = {
  allManning() {
    return Manning.all()
  },
  Loaded: state => {
    return state.loaded
  },
  PercentSupport: state => {
    return state.percentsupport
  },
  MasterEffort: state => {
    return state.mastereffort
  },
  SubEffort: state => {
    return state.subeffort
  },
  DDFields: state => {
    return state.ddFields
  }
}

const actions = {
  getDigest() {
    ManningService.getFormDigest()
      .then(response => {
        if (console) {
          console.log('ManningModule DIGEST: ' + response)
        }
        Manning.commit((state) => {
          state.digest = response.data.d.GetContextWebInformation.FormDigestValue
        }) 
      })
      .catch(error => {
        console.log('There was an error getting digest data: ', error.response)
      })
  },
  async getManning({ state, commit }) {
    // console.log('GETTING ALL MANNING.')
    let response = await ManningService.getManning()
    Manning.create({ data: formatManning(response) })
    Manning.commit(state => {
      state.loaded = true
    })
  },
  async addManningItem({ state }, payload) {
    let response = await ManningService.addManningItem(payload, state.digest)
    return response
  },
  async editManningItem({ state }, payload) {
    let response = await ManningService.editManningItem(payload, state.digest)
    return response
  }
}

function formatManning(j) {
  let p = []
  for (let i = 0; i < j.length; i++) {
    p.push({
      id: j[i]['Id'],
      Id: j[i]['Id'],
      Title: j[i]['Title'],
      Number: j[i]['Number'],
      Last: j[i]['Last'],
      First: j[i]['First'],
      Middle: j[i]['Middle'],
      MasterEffort: j[i]['MasterEffort'],
      SubEffort: j[i]['SubEffort'],
      Location: j[i]['Location'],
      Email: j[i]['Email'],
      PercentSupport: j[i]['PercentSupport'],
      Company: j[i]['Company'],
      EmployeeID: j[i]['EmployeeID'],
      FunctionalManager: j[i]['FunctionalManager'],
      StartDate: moment(j[i]['StartDate']).isValid() ? String(moment(j[i]['StartDate']).format('MM/DD/YYYY')) : '', // date
      EndDate: moment(j[i]['EndDate']).isValid() ? String(moment(j[i]['EndDate']).format('MM/DD/YYYY')) : '', // date
      FullBurdenedCost: j[i]['FullBurdenedCost'],
      etag: j[i]['__metadata']['etag'],
      uri: j[i]['__metadata']['uri']
    })
  }
  p = Vue._.orderBy(p, 'Last', 'asc')
  return p
}

export default {
  getters,
  actions
}
