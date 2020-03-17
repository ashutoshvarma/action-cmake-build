import * as io from '@actions/io'
import * as core from '@actions/core'
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
