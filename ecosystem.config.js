module.exports = {
  apps: [
    {
      name: 'match-api',
      script: 'apps/api/dist/src/main.js',
      cwd: '/opt/match',
      instances: 1,
      memory: '256M',
      node_args: '--max-old-space-size=200',
      env: {
        NODE_ENV: 'production',
        PORT: 4001
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '256M'
    },
    {
      name: 'match-admin',
      script: 'server.mjs',
      cwd: '/opt/match',
      instances: 1,
      memory: '128M',
      node_args: '--max-old-space-size=100',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '128M'
    }
  ]
}