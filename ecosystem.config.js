module.exports = {
  apps: [
    {
      name: 'match-api',
      script: 'apps/api/dist/src/main.js',
      cwd: '/opt/match',
      instances: 1,
      memory: '200M',
      node_args: '--max-old-space-size=150',
      env: {
        NODE_ENV: 'production',
        PORT: 4001
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '200M'
    },
    {
      name: 'match-admin',
      script: 'apps/admin/dist/server/server.js',
      cwd: '/opt/match',
      instances: 1,
      memory: '100M',
      node_args: '--max-old-space-size=80',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '100M'
    }
  ]
}
