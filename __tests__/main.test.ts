import {fixPath} from '../src/util'
import * as io from '@actions/io'

test('test path fix', async () => {
  process.env.PATH = await fixPath(<string>process.env.PATH)
  const shPath: string = await io.which('sh.exe')
  expect(shPath).toBe('')
})
