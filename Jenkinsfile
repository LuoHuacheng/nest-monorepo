pipeline {
    agent any

    environment {
        DOCKER_COMPOSE = 'docker compose'
        DB_PASSWORD = credentials('match-db-password')
        JWT_SECRET = credentials('match-jwt-secret')
        GITHUB_TOKEN = credentials('github-personal-token')
    }

    triggers {
        githubPush()
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: "https://${GITHUB_TOKEN}@github.com/your-username/match.git"
            }
        }

        stage('Prisma Migrate') {
            steps {
                sh '''
                    cd apps/api
                    npx prisma migrate deploy
                '''
            }
        }

        stage('Build') {
            steps {
                sh '${DOCKER_COMPOSE} build'
            }
        }

        stage('Test') {
            steps {
                sh 'pnpm test'
            }
        }

        stage('Deploy') {
            steps {
                sh '${DOCKER_COMPOSE} up -d'
            }
        }
    }

    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed!'
            sh '${DOCKER_COMPOSE} logs --tail=100'
        }
    }
}
