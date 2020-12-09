/* eslint-disable no-case-declarations */
import axios from 'axios'
import moment from 'moment'

let SPCI = null
if (window._spPageContextInfo) {
  SPCI = window._spPageContextInfo
}

let geturl = SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Manning')/items?$select=*&$orderby=Last"
let url = SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Manning')/items"

export default {
  getFormDigest() {
    return axios.request({
      url: SPCI.webServerRelativeUrl + '/_api/contextinfo',
      method: 'post',
      headers: { Accept: 'application/json; odata=verbose' }
    })
  },
  async getManning() {
    let allManning = []
    async function getAllManning(purl) {
      if (purl === null) {
        purl = geturl
      }

      let response = await axios.get(purl, {
        headers: {
          accept: 'application/json;odata=verbose'
        }
      })
      let results = response.data.d.results
      allManning = allManning.concat(results)
      // recursively load
      if (response.data.d.__next) {
        purl = response.data.d.__next
        return getAllManning(purl)
      } else {
        return allManning
      }
    }
    return getAllManning(null)
  },
  async editManningItem(payload, digest) {
    url = payload.uri
    let headers = {
      'Content-Type': 'application/json;odata=verbose',
      Accept: 'application/json;odata=verbose',
      'X-RequestDigest': digest,
      'X-HTTP-Method': 'MERGE',
      'If-Match': payload.etag
    }
    let config = {
      headers: headers
    }

    let itemprops = {
      __metadata: { type: 'SP.Data.ManningListItem' },
      Title: payload.Title,
      Number: payload.Number,
      First: payload.First,
      Middle: payload.Middle,
      Last: payload.Last,
      Position: payload.Position,
      Location: payload.Location,
      Email: payload.Email,
      MasterEffort: payload.MasterEffort,
      SubEffort: payload.SubEffort,
      Company: payload.Company,
      PercentSupport: payload.PercentSupport,
      EmployeeID: payload.EmployeeID,
      StartDate: moment(payload.StartDate).isValid()
        ? String(
            moment(payload.StartDate)
              .add(6, 'hours')
              .format('YYYY-MM-DD[T]HH:MM:[00Z]')
          )
        : null,
      EndDate: moment(payload.EndDate).isValid()
        ? String(
            moment(payload.EndDate)
              .add(6, 'hours')
              .format('YYYY-MM-DD[T]HH:MM:[00Z]')
          )
        : null,
      FunctionalManager: payload.FunctionalManager,
      FullBurdenedCost: payload.FullBurdenedCost
    }

    try {
      await axios.post(url, itemprops, config)
      // go get the data for the saved item to return back to the user
      return axios
        .get(url, {
          headers: {
            accept: 'application/json;odata=verbose'
          }
        })
        .then(function(response) {
          return response
        })
    } catch (error) {
      console.log('ManningService Error Updating Manning: ' + error)
    }
  },
  async addManningItem(payload, digest) {
    let headers = {
      'Content-Type': 'application/json;odata=verbose',
      Accept: 'application/json;odata=verbose',
      'X-RequestDigest': digest,
      'X-HTTP-Method': 'POST'
    }
    let config = {
      headers: headers
    }

    let itemprops = {
      __metadata: { type: 'SP.Data.ManningListItem' },
      Title: payload.Title,
      Number: payload.Number,
      First: payload.First,
      Middle: payload.Middle,
      Last: payload.Last,
      Position: payload.Position,
      Location: payload.Location,
      Email: payload.Email,
      MasterEffort: payload.MasterEffort,
      SubEffort: payload.SubEffort,
      Company: payload.Company,
      PercentSupport: payload.PercentSupport,
      EmployeeID: payload.EmployeeID,
      StartDate: moment(payload.StartDate).isValid()
        ? String(
            moment(payload.StartDate)
              .add(6, 'hours')
              .format('YYYY-MM-DD[T]HH:MM:[00Z]')
          )
        : null,
      EndDate: moment(payload.EndDate).isValid()
        ? String(
            moment(payload.EndDate)
              .add(6, 'hours')
              .format('YYYY-MM-DD[T]HH:MM:[00Z]')
          )
        : null,
      FunctionalManager: payload.FunctionalManager,
      FullBurdenedCost: payload.FullBurdenedCost
    }

    try {
      await axios.post(url, itemprops, config)
      // go get the data for the saved item to return back to the user
      return axios
        .get(url, {
          headers: {
            accept: 'application/json;odata=verbose'
          }
        })
        .then(function(response) {
          return response
        })
    } catch (error) {
      console.log('ManningService Error Updating Manning: ' + error)
    }
  }
}
