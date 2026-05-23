pipeline {
    agent any

    environment {
        DOCKER_COMPOSE = 'docker compose'
        DB_PASSWORD = credentials('match-db-password')
        JWT_SECRET = credentials('match-jwt-secret')
        GITHUB_TOKEN = credentials('github-personal-token')
        REGISTRY = credentials('docker-registry')
    }

    triggers {
        githubPush()
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: "https://${GITHUB_TOKEN}@github.com/LuoHuacheng/nest-monorepo.git"
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
                sh '${DOCKER_COMPOSE} build api'
                sh '${DOCKER_COMPOSE} build admin'
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
