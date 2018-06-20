# Change Log
All notable changes to this project will be documented in this file.

## [Unreleased]
### Fixed
- PNDA-4226: Expire sessions after inactivity rather than a fixed time period

## [1.0.0] 2018-02-10
### Added
- PNDA-439: Support deploying/running app as specific user
- PNDA-3562: Add PAM authentication
- PNDA-3596: Use passportjs for managing authentication
- PNDA-2834: Report application status by deployment manager
- PNDA-4560: Provide identity to all deployment manager API calls

### Changed
- PNDA-3601: Disable emailtext in Jenkins file and replace it with notifier stage and job
- PNDA-3624: Update Login API
- PNDA-4546: Pass user to Deployment Manager APIs as a URL parameter instead of in the body
- PNDA-4613: Rename user parameter for deployment manager API from user to user.name to match the default knox behaviour

### Fixed
- PNDA-3609: Use passport on socketio and put the secret in configuration file
- PNDA-3626: Use the secure cookie information to create an application.
- PNDA-3635: Fix issue on socketio by using session store to Redis
- PNDA-3622: Stop the build if a command failed

## [0.4.0] 2017-06-29
### Added
- PNDA-2691: Allow offline installation
- PNDA-2374: Pin down specific dependencies
### Changed
- PNDA-2682: review logging and routes
### Fixed
- PNDA-3086: Only send notifications for metrics when they change (except health metrics)
- PNDA-2785: Pin compress to 1.3.0

## [0.3.0] 2017-01-20
### Changed
- PNDA-2499: The response body from the Deployment Manager is returned to the caller. Console will now display more helpful error messages.

## [0.2.3] 2016-12-12
### Changed
- Externalized build logic from Jenkins to shell script so it can be reused

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
