import axios from 'axios'

let SPCI = null
if (window._spPageContextInfo) {
  SPCI = window._spPageContextInfo
}

let url = SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('ErrorLog')/items"

async function logToSharePoint(err) {
  const response = await axios.request({
    url: SPCI.webServerRelativeUrl + '/_api/contextinfo',
    method: 'post',
    headers: { Accept: 'application/json; odata=verbose' }
  })
  const digest = response.data.d.GetContextWebInformation.FormDigestValue
  console.log(`DIGEST: ${digest}`)
  console.log(`ERROR: ${err}`)
  let itemprops = {
    __metadata: { type: 'SP.Data.ErrorLogListItem' }
  }
  if (err.vm !== undefined) {
    console.log('VUE ERROR ' + err)
    itemprops.Message = err.err.message
    itemprops.Stack = err.err.stack
    itemprops.Component = err.vm.$vnode ? err.vm.$vnode.tag : ''
  } else {
    console.log('WINDOW ERRO ' + err)
    itemprops.Message = err.message
    itemprops.Stack = err.stack
    itemprops.Component = err.source
    itemprops.Line = String(err.lineno)
    itemprops.Column = String(err.colno)
  }

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
    const response = await axios.post(url, itemprops, config)
    return response
  } catch (error) {
    console.log('Unable to log Error: ' + error + ', Actual error object: ' + err)
  }
}

class AppLogger {
  constructor() {
    this.initLogger()
  }
  initLogger() {
    this.logToServer = err => {
      logToSharePoint(err)
    }
  }
}

let logger = new AppLogger()

export { logger }
