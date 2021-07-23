const spsave = require('spsave').spsave
const sppurge = require('sppurge').default
const fs = require('fs')
const dotenv = require('dotenv')

const filePath = 'dist/'
const jsFilePath = 'dist/static/js/'
const cssFilePath = 'dist/static/css/'
const args = process.argv.slice(2)
if (args[0] === 'development') {
  dotenv.config({ path: '.env.development.local' })
} else if (args[0] === 'test') {
  dotenv.config({ path: '.env.test' })
} /*else if (args[0] === 'production') {
  dotenv.config({ path: '.env.production' })
}*/
dotenv.config({ path: '.env.user.local' })

// first delete all of the old files on the SP server
fs.promises
  .readdir(filePath)
  .then(files => {
    files.forEach(file => {
      if (file === 'index.html') {
        fs.promises
          .readFile(filePath + file, 'utf8')
          .then(index => {
            deleteFromSharePoint(process.env.BASE_URL, file, process.env.BASE_SITE)
            //uploadSharePoint(process.env.BASE_URL, file, index, process.env.BASE_SITE)
          })
          .catch(e => {
            console.log('Cannot Read index.html file contents')
            console.log(e)
          })
      }
    })
  })
  .catch(e => {
    console.log('Cannot Read Directory')
    console.log(e)
  })

// first read all of the files in the dist directory
// fs.readdir('../dist', )

let deleteFromSharePoint = (folder, filePath, baseSite) => {
  var creds = {
    username: process.env.USER_LOGIN,
    password: process.env.USER_PASSWORD
  }
  var fileOpts = {
    folder: folder,
    filePath: filePath // fs list files
  }
  var coreOpts = {
    siteUrl: baseSite,
    creds: creds
  }
  console.log(coreOpts)
  console.log(fileOpts)
  sppurge(coreOpts, fileOpts)
    .then(data => {
      console.log(data)
      console.log('File Deleted!')
    })
    .catch(function(err) {
      console.log(err)
      console.log('Error occurred')
    })
}

/**
 * Upload to SharePoint
 * @param String filePath - Full Path to the file
 * @param String fileName - The File Name
 * @param String fileContents - The File Contents
 * @param String base_site - The Base Site to place the file
 */
let uploadSharePoint = (filePath, fileName, fileContents, base_site) => {
  var creds = {
    username: process.env.USER_LOGIN,
    password: process.env.USER_PASSWORD
  }
  var fileOpts = {
    folder: filePath,
    fileName: fileName, // fs list files
    fileContent: fileContents // fs read file contents
  }
  var coreOpts = {
    siteUrl: base_site
  }

  spsave(coreOpts, creds, fileOpts)
    .then(data => {
      console.log('File uploaded!')
    })
    .catch(err => {
      console.log('Error occurred')
    })
}
