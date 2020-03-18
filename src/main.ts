import * as core from '@actions/core'
import * as io from '@actions/io'
import * as exec from '@actions/exec'
import {fixPath} from './util'

async function run(): Promise<void> {
  try {
    const buildType: string = core.getInput('build-type')
    const installBuild: string = core.getInput('install-build')
    const runTest: string = core.getInput('run-test')
    const submoduleUpdate: string = core.getInput('submodule-update')
    const cc: string = core.getInput('cc')
    const cxx: string = core.getInput('cxx')
    const target: string = core.getInput('target')
    const parallel: string = core.getInput('parallel')
    const options: string[] = core.getInput('options').split(' ')
    const ctestOptions: string[] = core.getInput('ctest-options').split(' ')
    const buildDir: string = core.getInput('build-dir')
    const srcDir: string = process.cwd()

    // update git submodule
    if (submoduleUpdate !== 'false') {
      core.startGroup('Updating Git Submodules')
      await exec.exec('git', ['submodule', 'update', '--init', '--recursive'])
      core.endGroup()
    }

    // setup build directory
    await io.mkdirP(buildDir)

    //export CC & CXX
    core.exportVariable('CC', cc)
    core.exportVariable('CXX', cxx)

    //fix path by removing sh.exe
    core.startGroup('Fixing Path')
    await fixPath()
    // eslint-disable-next-line no-console
    console.log(process.env.PATH)
    core.endGroup()

    //configure options
    const configOptions = [
      ...options,
      `-DCMAKE_BUILD_TYPE=${buildType}`,
      `-S${srcDir}`,
      `-B${buildDir}`,
    ]
    const buildOptions = [
      '--build',
      buildDir,
      '--config',
      buildType,
      `-j${parallel}`
    ]

    if (target !== '') {
      buildOptions.push('--target')
      buildOptions.push(target)
    }

    //Configure CMake
    core.startGroup('Configure CMake')
    await exec.exec('cmake', configOptions)
    core.endGroup()

    //Build CMake Project
    core.startGroup(`Build Target - ${target}`)
    await exec.exec('cmake', buildOptions)
    core.endGroup()

    // Install Targets
    if (installBuild !== 'false') {
      core.startGroup(`Installing Build - ${installBuild}`)
      await exec.exec('cmake', ['--install', buildDir])
      core.endGroup()
    }

    // Run Ctest
    const sourceDir: string = process.cwd()
    if (runTest !== 'false') {
      process.chdir(buildDir)
      core.startGroup('Running CTest')
      await exec.exec('ctest', [
        // -C is required for MSBuild otherwise it won't run tests
        '-C',
        buildType,
        `-j${parallel}`,
        ...ctestOptions
      ])
      core.endGroup()
      process.chdir(sourceDir)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
