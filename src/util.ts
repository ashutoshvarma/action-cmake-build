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
import * as io from '@actions/io'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as path from 'path'

export async function fixPath(): Promise<void> {
  let shDir: string = await io.which('sh.exe')
  if (shDir !== '') {
    const envPath: string = <string>(
      process.env.PATH?.replace(path.dirname(shDir), 'DUMMY_PATH')
    )
    core.exportVariable('PATH', envPath)
    shDir = await io.which('sh.exe')
    if (shDir !== '') {
      await fixPath()
    }
  }
}

export async function updateSubmodules(): Promise<number> {
  return exec.exec('git', ['submodule', 'update', '--init', '--recursive'])
}