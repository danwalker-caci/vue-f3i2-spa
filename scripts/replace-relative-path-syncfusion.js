const replace = require('replace-in-file')
const options = {
  files: ['node_modules/@syncfusion/**/bootstrap*.scss', 'node_modules/@syncfusion/**/_*.scss'],
  from: /@import 'ej2-/g,
  to: "@import 'node_modules/@syncfusion/ej2-"
}

replace(options)
  .then(results => {
    console.log('Replacement results:', results)
  })
  .catch(error => {
    console.error('Error occurred:', error)
  })
