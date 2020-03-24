![Main workflow](https://github.com/ashutoshvarma/action-cmake-build/workflows/Main%20Workflow/badge.svg)

# action-cmake-build

Build & Test CMake Projects with GitHub workflows.   


## Quickstart
This acion does not manage dependencies for you, all the dependencies for your project should be resolved before using this action.
```yaml
   - name: Build & Test
        uses: ashutoshvarma/action-cmake-build@master
        with:
          build-dir: ${{ runner.workspace }}/build
          # will set the CC & CXX for cmake
          cc: gcc
          cxx: g++
          build-type: Release
          # Extra options pass to cmake while configuring project
          configure-options: -DCMAKE_C_FLAGS=-w32 -DPNG_INCLUDE=OFF
          run-test: true
          ctest-options: -R mytest
          # install the build using cmake --install
          install-build: true
          # run build using '-j [parallel]' to use multiple threads to build
          parallel: 14
```

### Action Reference: All Input/Output & Defaults
[action.yml](https://github.com/ashutoshvarma/action-cmake-build/blob/master/action.yml) 

## License
All the content in this repository is licensed under the MIT License.

Copyright (c) 2019-2020 Ashutosh Varma