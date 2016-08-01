node {
    try {
        stage 'Build'
        def workspace = pwd() 

        sh '''

            cp -R $PWD@script/console-backend-utils $PWD@script/console-backend-data-logger/
            cd $PWD@script/console-backend-data-logger
            npm install
            echo "{ \\"name\\": \\"console-backend-data-logger\\", \\"version\\": \\"$BRANCH_NAME\\" }" > package-version.json
            grunt package

            cd ..

            cp -R $PWD/console-backend-utils $PWD/console-backend-data-manager/
            cd $PWD/console-backend-data-manager
            npm install
            echo "{ \\"name\\": \\"console-backend-data-manager\\", \\"version\\": \\"$BRANCH_NAME\\" }" > package-version.json
            grunt package
        '''

        stage 'Test'
        sh '''
        '''

        stage 'Deploy' 
        build job: 'deploy-component', parameters: [[$class: 'StringParameterValue', name: 'branch', value: env.BRANCH_NAME],[$class: 'StringParameterValue', name: 'component', value: "console"],[$class: 'StringParameterValue', name: 'release_path', value: "platform/releases"],[$class: 'StringParameterValue', name: 'release', value: "${workspace}@script/console-backend-data-logger/console-backend-data-logger-${env.BRANCH_NAME}.tar.gz"]]
        build job: 'deploy-component', parameters: [[$class: 'StringParameterValue', name: 'branch', value: env.BRANCH_NAME],[$class: 'StringParameterValue', name: 'component', value: "console"],[$class: 'StringParameterValue', name: 'release_path', value: "platform/releases"],[$class: 'StringParameterValue', name: 'release', value: "${workspace}@script/console-backend-data-manager/console-backend-data-manager-${env.BRANCH_NAME}.tar.gz"]]

        emailext attachLog: true, body: "Build succeeded (see ${env.BUILD_URL})", subject: "[JENKINS] ${env.JOB_NAME} succeeded", to: "${env.EMAIL_RECIPIENTS}"

    }
    catch(error) {
        emailext attachLog: true, body: "Build failed (see ${env.BUILD_URL})", subject: "[JENKINS] ${env.JOB_NAME} failed", to: "${env.EMAIL_RECIPIENTS}"
        currentBuild.result = "FAILED"
        throw error
    }
}
