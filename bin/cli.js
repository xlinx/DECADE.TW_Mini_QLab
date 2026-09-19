#!/usr/bin/env node

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';
import os from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distWebDir = path.join(rootDir, 'dist-web');

// Read version from package.json
let version = 'unknown';
try {
  const pkgJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  version = pkgJson.version || 'unknown';
} catch {
  // Ignore
}

// Parse command line arguments
const args = process.argv.slice(2);
let port = 3000;
let host = '0.0.0.0';
let shouldOpen = true;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--help' || arg === '-h') {
    printHelp();
    process.exit(0);
  } else if (arg === '--version' || arg === '-v') {
    console.log(`mini-qlab v${version}`);
    process.exit(0);
  } else if (arg === '--port' || arg === '-p') {
    port = parseInt(args[++i], 10) || 3000;
  } else if (arg === '--host') {
    host = args[++i] || '0.0.0.0';
  } else if (arg === '--no-open') {
    shouldOpen = false;
  }
}

function printHelp() {
  console.log(`
Mini QLab - Browser-based cue-list controller
Usage: npx mini-qlab [options]

Options:
  -p, --port <number>  Port to run the server on (default: 3000)
  --host <string>      Host to bind to (default: 0.0.0.0)
  --no-open            Do not automatically open the browser
  -v, --version        Display version number
  -h, --help           Display this help message
`);
}

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.wasm': 'application/wasm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf'
};

function checkDistWeb() {
  const indexPath = path.join(distWebDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('\x1b[31m%s\x1b[0m', `Error: Web build not found at ${distWebDir}`);
    console.error('Please run "npm run build:web" before running this command.');
    process.exit(1);
  }
}

function getNetworkAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  return addresses;
}

function openBrowser(url) {
  const startCommands = {
    darwin: `open "${url}"`,
    win32: `start "" "${url}"`,
    default: `xdg-open "${url}"`
  };
  const command = startCommands[process.platform] || startCommands.default;
  exec(command, () => {
    // Ignore errors opening browser (e.g. running on headless servers)
  });
}

function startServer(initialPort, maxRetries = 10) {
  checkDistWeb();

  let currentPort = initialPort;
  let attempts = 0;

  function tryListen() {
    const server = http.createServer((req, res) => {
      // Only handle GET and HEAD
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
        return;
      }

      let reqPath = '/';
      try {
        const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        reqPath = decodeURIComponent(parsedUrl.pathname);
      } catch {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Bad Request');
        return;
      }

      // Prevent directory traversal attacks
      let safePath = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, '');
      let filePath = path.join(distWebDir, safePath);

      // Verify filePath is inside distWebDir
      if (!filePath.startsWith(distWebDir)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
      }

      // Check if file exists
      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          // If path has no extension or is not found, fallback to index.html for SPA
          if (!path.extname(safePath)) {
            filePath = path.join(distWebDir, 'index.html');
          } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
            return;
          }
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        const headers = {
          'Content-Type': contentType,
          'X-Content-Type-Options': 'nosniff'
        };

        // Cache policy: HTML files no-cache, assets cacheable
        if (ext === '.html') {
          headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        } else {
          headers['Cache-Control'] = 'public, max-age=31536000, immutable';
        }

        if (req.method === 'HEAD') {
          res.writeHead(200, headers);
          res.end();
          return;
        }

        res.writeHead(200, headers);
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
        stream.on('error', () => {
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
          }
          res.end('Internal Server Error');
        });
      });
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        attempts++;
        if (attempts <= maxRetries) {
          console.log(`Port ${currentPort} is in use, trying ${currentPort + 1}...`);
          currentPort++;
          setTimeout(tryListen, 200);
        } else {
          console.error(`Error: Could not find an open port after ${maxRetries} attempts.`);
          process.exit(1);
        }
      } else {
        console.error('Server error:', err.message);
        process.exit(1);
      }
    });

    server.listen(currentPort, host, () => {
      const displayHost = host === '0.0.0.0' ? 'localhost' : host;
      const localUrl = `http://${displayHost}:${currentPort}`;
      const networkIps = getNetworkAddresses();

      console.log('\n\x1b[36m%s\x1b[0m', '  DECADE.TW Mini QLab');
      console.log('\x1b[90m%s\x1b[0m', `  Version ${version}`);
      console.log('');
      console.log(`  ➜  \x1b[1mLocal:\x1b[0m   \x1b[36m${localUrl}\x1b[0m`);
      if (host === '0.0.0.0') {
        networkIps.forEach((ip) => {
          console.log(`  ➜  \x1b[1mNetwork:\x1b[0m \x1b[36mhttp://${ip}:${currentPort}\x1b[0m`);
        });
      }
      console.log('');
      console.log('\x1b[90m%s\x1b[0m\n', '  Press Ctrl+C to stop.');

      if (shouldOpen) {
        openBrowser(localUrl);
      }
    });
  }

  tryListen();
}

startServer(port);
