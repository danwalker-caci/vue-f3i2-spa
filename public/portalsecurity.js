function loadscript(url, callback) {
  var script = document.createElement('script')
  script.type = 'text/javascript'
  if (script.readyState) {
    //IE
    script.onreadystatechange = function() {
      if (script.readyState == 'loaded' || script.readyState == 'complete') {
        script.onreadystatechange = null
        callback()
      }
    }
  } else {
    //Others
    script.onload = function() {
      callback()
    }
  }
  script.src = url
  document.documentElement.insertBefore(script, document.documentElement.firstChild)
}

loadscript('/sites/f3i2/SiteAssets/html/static/js/axios.min.js', function() {
  console.log('PORTAL SECURITY LOADED')

  let SPCI = null

  if (window._spPageContextInfo) {
    SPCI = window._spPageContextInfo
  }

  let test = new String(window.location)
  let valid = test.indexOf('Home.aspx') >= 1 || test.indexOf('Test.aspx') >= 1 || test.indexOf('drew.aspx') >= 1 || test.indexOf('Dev.aspx') >= 1 || test.indexOf('Dan.aspx') >= 1 || test.indexOf('/Subcontractor%20Training/Forms/AllItems.aspx?isDlg=1') >= 1
  console.log('VALID: ' + valid)
  let goback = false

  let baseUrl = SPCI.webServerRelativeUrl
  let idurl = baseUrl + '/_api/Web/CurrentUser?$select=Id'
  let id = null

  function getUserId() {
    // eslint-disable-next-line no-undef
    return axios
      .get(idurl, {
        headers: {
          accept: 'application/json;odata=verbose'
        }
      })
      .then(function(response) {
        return response
      })
  }

  function getUserGroups(id) {
    let groupurl = baseUrl + '/_api/web/getuserbyid(' + id + ')/groups'
    // eslint-disable-next-line no-undef
    return axios
      .get(groupurl, {
        headers: {
          accept: 'application/json;odata=verbose'
        }
      })
      .then(function(response) {
        return response
      })
  }

  if (!valid) {
    getUserId()
      .then(response => {
        id = response.data.d.Id
        getUserGroups(id).then(response => {
          let usergroups = response.data.d.results
          let isDeveloper = false
          let isSubcontractor = false
          for (let i = 0; i < usergroups.length; i++) {
            // console.log('USERGROUP: ' + usergroups[i].Title)
            switch (usergroups[i].Title) {
              case 'Subcontractors':
                isSubcontractor = true
                break

              case 'Developers':
                isDeveloper = true
                break
            }
          }
          if (isSubcontractor === true && isDeveloper === false) {
            window.location = window.location.protocol + '//' + window.location.host + '/sites/f3i2/Pages/Home.aspx'
          }
          if (document.getElementById('WPQ2_ListTitleViewSelectorMenu_Container_overflow')) {
            document.getElementById('WPQ2_ListTitleViewSelectorMenu_Container_overflow').style.display = 'none'
          }
        })
      })
      .catch(error => {
        console.log('PORTAL SECURITY There was an error getting User Id: ', error.response)
      })
  }
})
