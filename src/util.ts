import * as io from '@actions/io'
import * as path from 'path'

export async function fixPath(oldPath: string): Promise<string> {
  const shDir: string = await io.which('sh.exe')
  if (shDir !== '') {
    oldPath = oldPath.replace(path.dirname(shDir), 'DUMMY_PATH')
  }
  return oldPath
}
