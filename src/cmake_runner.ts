import * as exec from '@actions/exec'
import * as core from '@actions/core'

export interface CMakeExtraArgs {
  extraConfigArgs?: string
  extraBuildArgs?: string
  extraTestArgs?: string
  extraInstallArgs?: string
}

export interface CMakeOptions {
  buildType: string
  target?: string
  parallel?: string
  extraArgs?: CMakeExtraArgs
}

export class CMakeRunner {
  _cmake: string = 'cmake'
  _ctest: string = 'ctest'
  _options: CMakeOptions
  _rootDir: string
  _buildDir: string
  constructor(rootDir: string, buildDir: string, options: CMakeOptions) {
    this._options = options
    this._rootDir = rootDir
    this._buildDir = buildDir
  }

  async run(executable: string, args?: string[]): Promise<number> {
    try {
      return await exec.exec(executable, args)
    } catch (error) {
      core.setFailed(error.message)
    }
    return -1
  }

  async cmake(args?: string[]): Promise<number> {
    // console.log('cmake ' + args?.join(' '))
    // return new Promise<number>((resolve) => {})
    return await this.run(this._cmake, args)
  }

  async ctest(args?: string[]): Promise<number> {
    // console.log('cmake ' + args?.join(' '))
    // return new Promise<number>((resolve) => {})
    return await this.run(this._ctest, args)
  }

  async configure(): Promise<number> {
    let execOptions: string[] = [
      `-DCMAKE_BUILD_TYPE=${this._options.buildType}`,
      `-S${this._rootDir}`,
      `-B${this._buildDir}`
    ]

    if (this._options.extraArgs?.extraConfigArgs) {
      execOptions = [
        ...this._options.extraArgs.extraConfigArgs.split(' '),
        ...execOptions
      ]
    }
    return this.cmake(execOptions)
  }

  async build(): Promise<number> {
    let execOptions: string[] = [
      `--build`,
      this._buildDir,
      '--config',
      this._options.buildType
    ]
    if (this._options.target) {
      execOptions = [...execOptions, '--target', this._options.target]
    }
    if (this._options.parallel) {
      execOptions = [...execOptions, '--parallel', this._options.parallel]
    }
    if (this._options.extraArgs?.extraBuildArgs) {
      execOptions = [
        ...execOptions,
        ...this._options.extraArgs.extraBuildArgs.split(' ')
      ]
    }
    return this.cmake(execOptions)
  }

  async install(): Promise<number> {
    let execOptions: string[] = [`--install`, this._buildDir]
    if (this._options.extraArgs?.extraInstallArgs) {
      execOptions = [
        ...execOptions,
        ...this._options.extraArgs.extraInstallArgs.split(' ')
      ]
    }
    return this.cmake(execOptions)
  }

  async test(): Promise<number> {
    const pwdCurrent: string = process.cwd()
    process.chdir(this._buildDir)

    // '-C' is required for multiconfig build systems
    let execOptions: string[] = ['-C', this._options.buildType]
    if (this._options.extraArgs?.extraTestArgs) {
      execOptions = [
        ...execOptions,
        ...this._options.extraArgs.extraTestArgs.split(' ')
      ]
    }
    const result: number = await this.ctest(execOptions)
    process.chdir(pwdCurrent)
    return result
  }
}
