// Lab infrastructure: makes sure a MongoDB is listening on 127.0.0.1:27017
// before running the given command, starting an in-memory one if needed.
// This file is not part of the exercise. Do not modify it.
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const PORT = 27017;
const HOST = '127.0.0.1';

// Make the backend's local CLI tools (cross-env, mocha) available no matter
// which directory the wrapper was launched from.
const backendBin = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'node_modules', '.bin');
const pathKey = Object.keys(process.env).find((k) => k.toUpperCase() === 'PATH') || 'PATH';
const childEnv = {
  ...process.env,
  [pathKey]: `${backendBin}${path.delimiter}${process.env[pathKey] || ''}`
};

const portInUse = () =>
  new Promise((resolve) => {
    const socket = net.connect({ host: HOST, port: PORT });
    socket.setTimeout(1000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => resolve(false));
  });

const run = async () => {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node devtools/with-db.js <command...>');
    process.exit(1);
  }

  let server = null;
  if (await portInUse()) {
    // Something is already listening (npm start, npm run db, or a real
    // MongoDB). Confirm it really is MongoDB, then reuse it and leave it
    // running afterwards.
    const { default: mongoose } = await import('mongoose');
    try {
      await mongoose.connect(
        `mongodb://${HOST}:${PORT}/?directConnection=true&serverSelectionTimeoutMS=2000`
      );
      await mongoose.disconnect();
    } catch (error) {
      console.error(`Port ${PORT} is in use, but it does not appear to be a MongoDB server.`);
      console.error('Stop whatever is using the port and try again.');
      process.exit(1);
    }
  } else {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    try {
      server = await MongoMemoryServer.create({
        instance: { ip: HOST, port: PORT }
      });
      console.log('In-memory MongoDB running at mongodb://127.0.0.1:27017');
    } catch (error) {
      console.error('Could not start the in-memory MongoDB on port 27017.');
      console.error('If another program is using this port, stop it and try again.');
      console.error(error.message);
      process.exit(1);
    }
  }

  // A single argument is a full shell command (may contain && and spaces);
  // multiple arguments are joined, re-quoting any that contain spaces so
  // things like `mocha -g "should create"` survive on Windows.
  const command =
    args.length === 1
      ? args[0]
      : args.map((a) => (a.includes(' ') ? `"${a}"` : a)).join(' ');

  const child = spawn(command, { stdio: 'inherit', shell: true, env: childEnv });

  const shutdown = async (code) => {
    if (server) {
      await server.stop();
    }
    process.exit(code);
  };

  child.on('exit', (code) => {
    shutdown(code === null ? 1 : code);
  });
  process.on('SIGINT', () => {
    child.kill('SIGINT');
  });
  process.on('SIGTERM', () => {
    child.kill('SIGTERM');
  });
};

run();
