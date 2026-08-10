import 'dotenv/config';
import express from 'express';
import os from 'os';
import apiApp from '../api/index.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(apiApp);

const getLocalIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

app.listen(port, '0.0.0.0', () => {
  const localIp = getLocalIp();
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Access backend on local network via: http://${localIp}:${port}`);
});
