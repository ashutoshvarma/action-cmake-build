import * as main from '../src/main'

test("test path fix", () =>{
  let testPath = 'C:\\Program Files\\Git\\mingw64\\bin;C:\\Program Files\\Git\\usr\\bin;C:\\Users\\Ashutosh\\bin;C:\\Python27\\;C:\\Python27\\Scripts;C:\\Windows\\system32;C:\\Windows;C:\\Windows\\System32\\Wbem'
  let fixedPath = 'C:\\Program Files\\Git\\mingw64\\bin;DUMMY_PATH;C:\\Users\\Ashutosh\\bin;C:\\Python27\\;C:\\Python27\\Scripts;C:\\Windows\\system32;C:\\Windows;C:\\Windows\\System32\\Wbem'
  return expect(main.fixPath(testPath)).resolves.toBe(fixedPath)
})

