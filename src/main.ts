import * as core from '@actions/core'
import * as io from '@actions/io'
import * as exec from '@actions/exec'
import * as path from 'path'
import {fixPath} from '../src/util'

async function run(): Promise<void> {
  try {
    const buildType: string = core.getInput('build-type') || 'Release'
    const installBuild: string = core.getInput('install-build')
    const runTest: string = core.getInput('run-test')
    const cc: string = core.getInput('cc') || 'gcc'
    const cxx: string = core.getInput('cxx') || 'g++'
    const target: string = core.getInput('target') || 'all'
    const parallel: string = core.getInput('parallel') || '4'
    const options: string[] = core.getInput('options').split(' ')
    const ctestOptions: string[] = core.getInput('ctest-options').split(' ')
    let buildDir: string = core.getInput('build-dir') || 'build'

    // setup build directory
    buildDir = path.join(__dirname, buildDir)
    await io.mkdirP(buildDir)

    //export CC & CXX
    core.exportVariable('CC', cc)
    core.exportVariable('CXX', cxx)

    //fix path by removing sh.exe
    core.startGroup('Fixing Path')
    await fixPath()
    core.endGroup()

    //configure options
    const configOptions = [
      `-DCMAKE_BUILD_TYPE=${buildType}`,
      `-H${__dirname}`,
      `-B${buildDir}`,
      ...options
    ]
    const buildOptions = [
      '--build',
      buildDir,
      '--config',
      buildType,
      '--target',
      target,
      `-j${parallel}`
    ]

    //Configure CMake
    core.startGroup('Configure CMake')
    await exec.exec('cmake', configOptions)
    core.endGroup()

    //Build CMake Project
    core.startGroup(`Build Target - ${target}`)
    await exec.exec('cmake', buildOptions)
    core.endGroup()

    // Install Targets
    if (installBuild !== '') {
      core.startGroup(`Installing Build`)
      await exec.exec('cmake', ['--install'])
      core.endGroup()
    }

    // Run Ctest
    const sourceDir: string = process.cwd()
    if (runTest !== '') {
      process.chdir(buildDir)
      core.startGroup('Running CTest')
      await exec.exec('ctest', [`-j${parallel}`, ...ctestOptions])
      core.endGroup()
      process.chdir(sourceDir)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
