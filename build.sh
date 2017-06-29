#!/bin/bash
#
# Please check pnda-build/ for the build products

VERSION=${1}

function error {
    echo "Not Found"
    echo "Please run the build dependency installer script"
    exit -1
}

echo -n "npm: "
NPM_VERSION=$(npm --version 2>&1)
if [[ ${NPM_VERSION} == "1.3"* ]] || [[ ${NPM_VERSION} == "3.5.2" ]] || [[ ${NPM_VERSION} == "3.10"* ]]; then
    echo "OK"
else
    error
fi

echo -n "grunt-cli: "
if [[ $(grunt --version 2>&1) == *"grunt-cli v1.2"* ]]; then
    echo "OK"
else
    error
fi

mkdir -p pnda-build
cd console-backend-data-logger
npm install
echo "{ \"name\": \"console-backend-data-logger\", \"version\": \"${VERSION}\" }" > package-version.json
grunt package
cd ..
mv console-backend-data-logger/console-backend-data-logger-$VERSION.tar.gz pnda-build/
sha512sum pnda-build/console-backend-data-logger-$VERSION.tar.gz > pnda-build/console-backend-data-logger-$VERSION.tar.gz.sha512.txt

cd console-backend-data-manager
npm install
echo "{ \"name\": \"console-backend-data-manager\", \"version\": \"${VERSION}\" }" > package-version.json
grunt package
cd ..
mv console-backend-data-manager/console-backend-data-manager-$VERSION.tar.gz pnda-build/
sha512sum pnda-build/console-backend-data-manager-$VERSION.tar.gz > pnda-build/console-backend-data-manager-$VERSION.tar.gz.sha512.txt

cd console-backend-utils
npm install
echo "{ \"name\": \"console-backend-utils\", \"version\": \"${VERSION}\" }" > package-version.json
grunt package
cd ..
mv console-backend-utils/console-backend-utils-$VERSION.tar.gz pnda-build/
sha512sum pnda-build/console-backend-utils-$VERSION.tar.gz > pnda-build/console-backend-utils-$VERSION.tar.gz.sha512.txt
