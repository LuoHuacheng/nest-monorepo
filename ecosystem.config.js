module.exports = {
  apps: [
    {
      name: 'match-api',
      script: 'apps/api/dist/src/main.js',
      cwd: '/opt/match',
      instances: 1,
      memory: 400,
      env: {
        NODE_ENV: 'production',
        PORT: 4001
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '400M'
    },
    {
      name: 'match-admin',
      script: 'server.mjs',
      cwd: '/opt/match',
      instances: 1,
      memory: 200,
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '200M'
    }
  ]
}