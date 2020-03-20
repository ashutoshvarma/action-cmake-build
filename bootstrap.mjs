/* eslint-disable no-console */
import fs from 'fs'
import YAML from 'yaml'
import {exec} from 'child_process'

const ACTION_FILE = fs.readFileSync('action.yml', 'utf8')

const parseObj = YAML.parse(ACTION_FILE)
// console.log(parseObj)
const inputs = parseObj.inputs

let envString = ''

for (const key of Object.keys(inputs)) {
  if (inputs[key].default) {
    envString = `${envString} INPUT_${key.replace(/ /g, '_').toUpperCase()}='${
      inputs[key].default
    }'`
  }
}

exec(`env ${envString} node lib/main.js`, (err, stdout, stderr) => {
  if (err) {
    console.log(err.message)
  }
  // the *entire* stdout and stderr (buffered)
  console.log(`stdout:-\n ${stdout}`)
  console.log(`stderr:-\n ${stderr}`)
})
