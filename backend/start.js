import { spawn } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiPath = path.join(__dirname, '..', 'frontend', 'src', 'utils', 'api.js');

console.log('='.repeat(50));
console.log('HackArena Backend Startup');
console.log('='.repeat(50));

console.log('\n[1] Starting backend server...');
const backend = spawn('node', ['src/index.js'], {
  cwd: __dirname,
  shell: true,
  stdio: 'inherit'
});

backend.on('error', (err) => {
  console.error('Backend error:', err);
  process.exit(1);
});

setTimeout(() => {
  console.log('\n[2] Starting localtunnel...');
  const tunnel = spawn('npx', ['localtunnel', '--port', '5000'], {
    cwd: __dirname,
    shell: true,
    stdio: ['pipe', 'pipe', 'inherit']
  });

  let tunnelUrl = '';

  tunnel.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(output);
    
    const match = output.match(/your url is: (https:\/\/[^\s]+)/);
    if (match) {
      tunnelUrl = match[1];
      console.log('\n[3] Updating frontend API URL...');
      updateApiUrl(tunnelUrl);
    }
  });

  tunnel.on('error', (err) => {
    console.error('Tunnel error:', err);
  });

  tunnel.on('close', () => {
    console.log('\nTunnel closed. Press Ctrl+C to exit.');
  });
}, 2000);

function updateApiUrl(url) {
  try {
    const apiContent = readFileSync(apiPath, 'utf-8');
    const newContent = apiContent.replace(
      /const API_BASE = 'https:\/\/[^']+'/,
      `const API_BASE = '${url}'`
    );
    writeFileSync(apiPath, newContent);
    console.log(`Updated to: ${url}`);
    console.log('\nCommitting and pushing to GitHub...');
    
    const git = spawn('git', ['add', 'frontend/src/utils/api.js'], {
      cwd: path.join(__dirname, '..'),
      shell: true,
      stdio: 'inherit'
    });
    
    setTimeout(() => {
      spawn('git', ['commit', '-m', `Update API URL: ${url}`], {
        cwd: path.join(__dirname, '..'),
        shell: true,
        stdio: 'inherit'
      });
    }, 1000);
    
    setTimeout(() => {
      spawn('git', ['push', 'hackarena', 'master'], {
        cwd: path.join(__dirname, '..'),
        shell: true,
        stdio: 'inherit'
      });
    }, 2000);
    
    console.log('\n' + '='.repeat(50));
    console.log('READY!');
    console.log('Frontend will update in ~30 seconds');
    console.log('='.repeat(50));
    
  } catch (err) {
    console.error('Failed to update API URL:', err.message);
  }
}

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  backend.kill();
  process.exit(0);
});