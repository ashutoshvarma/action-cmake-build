/* eslint-disable no-console */
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import YAML from 'yaml'
import fs from 'fs'
import * as io from '@actions/io'

const actionFile: string = path.join(__dirname, '../action.yml')
const srcDir: string = path.join(__dirname, '../test', 'DemoProject')
const buildDir: string = path.join(__dirname, '../test', 'build')

function setupInputs(): void {
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
test('test runs', () => {
  setupInputs()
  // Clean Build dir
  io.rmRF(buildDir)
  // cd into source dir
  process.env['INPUT_BUILD-DIR'] = buildDir
  process.env['INPUT_SOURCE-DIR'] = srcDir
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecSyncOptions = {
    env: process.env,
    stdio: 'inherit'
  }
  const spawnProc = cp.spawn('node', [ip], options)
  spawnProc.on('close', code => {
    if (code !== 0) {
      throw Error(`Action exited with code ${code}`)
    }
  })
})
