import store from '../store/store'
import axios from 'axios'

let SPCI = null
if (window._spPageContextInfo) {
  SPCI = window._spPageContextInfo
}

// Rimming out until we need to send emails from Security
// let portalemail = ''

let formurlstart = SPCI.webServerRelativeUrl + "/_api/web/lists/getbytitle('"
let formurlend = "')/RootFolder/Files/Add"

export default {
  async getFormDigest() {
    const response = await axios.request({
      url: SPCI.webServerRelativeUrl + '/_api/contextinfo',
      method: 'post',
      headers: { Accept: 'application/json; odata=verbose' }
    })
    // portalemail = store.state.support.portalemail
    return response
  },
  async getForm(state, uri) {
    const response = await axios({
      method: 'GET',
      url: uri,
      headers: {
        Accept: 'application/json;odata=verbose'
      }
    })
    return response
  },
  async uploadForm(payload) {
    let part = "(url='"
    part += payload.file + "',overwrite=true)"
    let url = formurlstart + payload.library + formurlend + part
    let data = payload.buffer
    let headers = {
      Accept: 'application/json;odata=verbose',
      'X-RequestDigest': payload.digest
    }
    try {
      // doing the upload
      const response = await axios({
        url: url,
        method: 'POST',
        data: data,
        processData: false,
        async: false,
        headers: headers
      })
      return response
    } catch (error) {
      console.log('SecurityService Error Adding Form: ' + error)
    }
  },
  async updateForm(payload, digest) {
    let endpoint = payload.uri
    let headers = {
      'Content-Type': 'application/json;odata=verbose',
      Accept: 'application/json;odata=verbose',
      'X-RequestDigest': payload.digest ? payload.digest : digest,
      'X-HTTP-Method': 'MERGE',
      'If-Match': payload.etag
    }
    let config = {
      headers: headers
    }
    let itemprops = {
      __metadata: { type: payload.type },
      FileLeafRef: payload.name,
      Title: payload.name,
      PersonnelID: payload.PersonnelID,
      Company: payload.Company
    }
    return axios
      .post(endpoint, itemprops, config)
      .then(function(response) {
        return response
      })
      .catch(function(error) {
        const notification = {
          type: 'danger',
          title: 'Security Service Error: ' + error,
          message: 'Error Updating Security Form Data',
          push: true
        }
        store.dispatch('notification/add', notification, { root: true })
      })
  }
}
