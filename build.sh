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
if [[ $(npm --version 2>&1) == "1.3"* ]]; then
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
cp -R console-backend-utils console-backend-data-logger/
cd console-backend-data-logger
npm install
echo "{ \"name\": \"console-backend-data-logger\", \"version\": \"${VERSION}\" }" > package-version.json
grunt package
cd ..
mv console-backend-data-logger/console-backend-data-logger-$VERSION.tar.gz pnda-build/
sha512sum pnda-build/console-backend-data-logger-$VERSION.tar.gz > pnda-build/console-backend-data-logger-$VERSION.tar.gz.sha512.txt

cp -R console-backend-utils console-backend-data-manager/
cd console-backend-data-manager
npm install
echo "{ \"name\": \"console-backend-data-manager\", \"version\": \"${VERSION}\" }" > package-version.json
grunt package
cd ..
mv console-backend-data-manager/console-backend-data-manager-$VERSION.tar.gz pnda-build/
sha512sum pnda-build/console-backend-data-manager-$VERSION.tar.gz > pnda-build/console-backend-data-manager-$VERSION.tar.gz.sha512.txt
