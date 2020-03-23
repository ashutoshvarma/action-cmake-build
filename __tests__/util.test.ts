import {fixPath} from '../src/util'
import * as io from '@actions/io'

test('test path fix', async () => {
  await fixPath()
  const shPath: string = await io.which('sh.exe')
  expect(shPath).toBe('')
})
