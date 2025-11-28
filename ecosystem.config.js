module.exports = {
    apps: [
        {
            name: 'inboxly-api',
            script: './dist/index.js',
            cwd: './apps/api',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env_production: {
                NODE_ENV: 'production'
            }
        },
        {
            name: 'inboxly-workers',
            script: './dist/worker.js',
            cwd: './apps/api',
            instances: 2,  // Run 2 worker processes for better performance
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
            env_production: {
                NODE_ENV: 'production'
            }
        }
    ]
};
