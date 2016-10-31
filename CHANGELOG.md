# Change Log
All notable changes to this project will be documented in this file.

## [0.2.2] 2016-10-31
### Fixed
 - PNDA-2368: Fix version of the redis-parser npm module to 2.0.4.

## [0.2.1] 2016-10-21
### Fixed
- PNDA-2120: Rotate console backend log files to prevent disk filling up

## [0.2.0] 2016-09-07
### Changed
- PNDA-820: Historical metric support. Console backend stores a timeseries of metric values in graphite
### Fixed
- PNDA-1980: Debug output adjusted to prevent console backend log files growing very large

## [0.1.0] 2016-07-01
### First version

## [Pre-release]

### 2016-05-26
- Fixed a bug preventing the data logger and data manager to start properly.

### 2016-05-25
- Update Gruntfile.js for data-logger and data-manager components to compress and build a tarball for deployment.

### 2016-05-17
- Use built-in base64 encode/decode functions.

### 2016-05-13
- Updated file headers.
- Added Swagger documentation for the data logger.

### 2016-05-03
- Fixed unit tests for data logger and data manager.
- Refactored the logger and CORS options.

### 2016-04-12
- Added frisby unit tests.

### 2016-04-07
- Package, Application & Data management now live. 
- Added jshint, jscs to improve code style.

### 2016-03-21
- First release of the PNDA platform console frontend.
