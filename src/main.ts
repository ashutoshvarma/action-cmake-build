/*
 * MIT License
 *
 * Copyright (c) 2020 Ashutosh Varma
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH
 * THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import * as core from '@actions/core'
import * as io from '@actions/io'
import * as util from './util'
import * as runner from './cmake_runner'

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
    const configureOptions: string = core.getInput('configure-options')
    const ctestOptions: string = core.getInput('ctest-options')
    const buildOptions: string = core.getInput('build-options')
    const installOptions: string = core.getInput('install-options')
    const buildDir: string = core.getInput('build-dir')
    const srcDir: string = core.getInput('source-dir')

    if (!buildDir) {
      throw Error('Build Directory is not specified')
    }

    // update git submodule
    if (submoduleUpdate !== 'false') {
      core.startGroup('Updating Git Submodules')
      await util.updateSubmodules()
      core.endGroup()
    }

    // setup build directory
    await io.mkdirP(buildDir)

    //export CC & CXX
    core.exportVariable('CC', cc)
    core.exportVariable('CXX', cxx)

    //fix path by removing sh.exe
    core.startGroup('Fixing Path')
    await util.fixPath()
    // eslint-disable-next-line no-console
    console.log(process.env.PATH)
    core.endGroup()

    const cOptions: runner.CMakeOptions = {
      buildType,
      target,
      parallel,
      extraArgs: {
        extraConfigArgs: configureOptions,
        extraBuildArgs: buildOptions,
        extraInstallArgs: installOptions,
        extraTestArgs: ctestOptions
      }
    }

    const CRunner: runner.CMakeRunner = new runner.CMakeRunner(
      srcDir,
      buildDir,
      cOptions
    )

    core.startGroup('Configure CMake')
    await CRunner.configure()
    core.endGroup()

    core.startGroup('Building Project')
    await CRunner.build()
    core.endGroup()

    if (installBuild !== 'false') {
      core.startGroup('Installing Build')
      await CRunner.install()
      core.endGroup()
    }

    if (runTest !== 'false') {
      core.startGroup('Running CTest')
      await CRunner.test()
      core.endGroup()
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
