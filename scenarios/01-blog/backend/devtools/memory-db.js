// Lab infrastructure: runs a real MongoDB in memory on the standard port.
// This file is not part of the exercise. Do not modify it.
import { MongoMemoryServer } from 'mongodb-memory-server';

const checkOnly = process.argv.includes('--check');

const start = async () => {
  let server;
  try {
    server = await MongoMemoryServer.create({
      instance: { ip: '127.0.0.1', port: 27017 }
    });
  } catch (error) {
    console.error('Could not start the in-memory MongoDB on port 27017.');
    console.error('If another program is using this port, stop it and try again.');
    console.error(error.message);
    process.exit(1);
  }

  console.log('In-memory MongoDB running at mongodb://127.0.0.1:27017');

  if (checkOnly) {
    await server.stop();
    console.log('MongoDB binary is downloaded and working.');
    process.exit(0);
  }

  console.log('Press Ctrl+C to stop.');
  const stop = async () => {
    await server.stop();
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
};

start();
