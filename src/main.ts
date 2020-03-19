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
    const buildOptions: string[] = core.getInput('build-options').split(' ')
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
      `-B${buildDir}`
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
    await exec.exec('cmake', [
      '--build',
      buildDir,
      '--config',
      buildType,
      ...buildOptions,
      `-j${parallel}`
    ])
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
