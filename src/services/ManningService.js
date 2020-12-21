/* eslint-disable no-case-declarations */
import axios from 'axios'

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
      'If-Match': '*'
    }
    let config = {
      headers: headers
    }

    try {
      let response = await axios.post(url, payload.itemprops, config)
      return response
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

    try {
      await axios.post(url, payload.itemprops, config)
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
      console.log('ManningService Error Adding Manning Item: ' + error)
    }
  }
}
