/* eslint-disable no-console */
import fs from 'fs'
import YAML from 'yaml'
import * as cp from 'child_process'
import * as path from 'path'
// import * as io from '@actions/io'


const ACTION_FILE = fs.readFileSync('action.yml', 'utf8')

const actionFile = path.join('action.yml')
const srcDir = path.join('test', 'DemoProject')
const buildDir = path.join('test', 'build')

function setupInputs() {
  const parseObj = YAML.parse(fs.readFileSync(actionFile, 'utf-8'))
  const inputs = parseObj.inputs
  for (const key of Object.keys(inputs)) {
    if (inputs[key].default) {
      const inputEnv = `INPUT_${key.replace(/ /g, '_').toUpperCase()}`
      process.env[inputEnv] = inputs[key].default
      console.log(`${inputEnv}=${inputs[key].default}`)
    }
  }
}

// shows how the runner will run a javascript action with env / stdout protocol

setupInputs()
// Clean Build dir
// io.mkdirP(buildDir)
// cd into source dir
process.env['INPUT_BUILD-DIR'] = buildDir
process.env['INPUT_SOURCE-DIR'] = srcDir
const ip = path.join('lib', 'main.js')
const options = {
  env: process.env,
  stdio: 'inherit'
}
const spawnProc = cp.spawn('node', [ip], options)
spawnProc.on('close', code => {
  if (code !== 0) {
    throw Error(`Action exited with code ${code}`)
  }
})

