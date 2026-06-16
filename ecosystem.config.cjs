const path = require('path');
const projectRoot = __dirname;

module.exports = {
  apps: [
    {
      name: 'intern-backend',
      script: path.join(projectRoot, 'backend', 'venv', 'Scripts', 'python.exe'),
      args: path.join(projectRoot, 'backend', 'manage.py') + ' runserver 0.0.0.0:8000',
      cwd: path.join(projectRoot, 'backend'),
      env: {
        PYTHONUNBUFFERED: '1',
      },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      restart_delay: 3000,
    },
    {
      name: 'intern-frontend',
      script: path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js'),
      node_args: '--import=module',
      cwd: projectRoot,
      env: {
        PORT: '5174',
      },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      restart_delay: 3000,
    },
  ],
};