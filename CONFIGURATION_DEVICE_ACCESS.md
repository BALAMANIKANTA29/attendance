# Configuration Guide - Device Access Control

## API Base URL Configuration

The device access system communicates with your server. Make sure the API base URL is correctly configured for your environment.

### For Local Development (Default)
The system defaults to `http://localhost:3001`

**How it works:**
```javascript
// deviceAuthService.js
export const registerDevice = async (apiBaseUrl = 'http://localhost:3001') => {
  // Registers device with server
}
```

### For Custom API URLs

If your server is running on a different port or domain, update the API base URL in:

#### 1. DeviceRegistrationModal.jsx
```jsx
// Line in the component where registerDevice is called:
const result = await registerDevice('http://your-domain:PORT');
```

#### 2. deviceAuthService.js
Update the function signatures:
```javascript
export const registerDevice = async (apiBaseUrl = 'http://your-domain:PORT') => {
  // Your URL here
}
```

#### 3. apiService.js
Update the API_BASE_URL constant:
```javascript
const API_BASE_URL = 'http://your-domain:PORT';
```

## Environment-Specific Setup

### Development (Local Machine)
- Server: `http://localhost:3001`
- Frontend: `http://localhost:3000` (via Vite)
- Device registration: Works automatically

### Production (Server Deployment)
- Update API_BASE_URL to your production domain
- Ensure HTTPS is used (`https://your-domain.com:PORT`)
- Update CORS settings in `server/index.js` if needed

### Testing on Network
If you want to test from another device on your network:

1. **Find your computer's IP:**
   - Windows: `ipconfig` in terminal (look for IPv4 Address)
   - Mac/Linux: `ifconfig` in terminal

2. **Update API base URL to your IP:**
   ```javascript
   const API_BASE_URL = 'http://YOUR_IP:3001';
   ```

3. **Access from other device:**
   ```
   http://YOUR_IP:3000
   ```

## Server Configuration

### CORS Settings
The server currently allows all origins:
```javascript
app.use(cors());
```

For production, restrict CORS:
```javascript
app.use(cors({
  origin: ['https://your-domain.com', 'https://www.your-domain.com'],
  credentials: true
}));
```

### Server Port
Default server port is `3001`. To change:

**In server/index.js:**
```javascript
const port = 3001; // Change this number
```

**Restart server after changing port.**

## Database Configuration

### Authorized Devices Table
The system automatically creates this table on first run:

```sql
CREATE TABLE IF NOT EXISTS authorized_devices (
  device_id TEXT PRIMARY KEY,
  label TEXT,
  registered_at TEXT,
  last_access TEXT
);
```

### Backup Database
Your device authorizations are stored in `server/attendance.db`

To backup:
```bash
cp server/attendance.db server/attendance.db.backup
```

To restore:
```bash
cp server/attendance.db.backup server/attendance.db
```

## HTTPS Configuration

For production deployments, use HTTPS:

### Using Self-Signed Certificate (Testing)
```bash
# Generate certificate
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365

# Update server/index.js
import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(port, '0.0.0.0');
```

### Using Let's Encrypt (Production)
Follow the Let's Encrypt documentation for your hosting provider.

## Browser Storage Configuration

### localStorage Settings
Device IDs are stored in browser localStorage:
- Key: `app_device_id`
- Key: `app_device_registered`

These are stored per origin (`http://localhost:3000` is different from `http://192.168.1.100:3000`).

### Clearing Device Registration

To manually clear device registration in DevTools:
```javascript
// Open DevTools Console and run:
localStorage.removeItem('app_device_id');
localStorage.removeItem('app_device_registered');
```

After clearing, refresh the page and re-register.

## Monitoring Device Access

### View Registered Devices
Access via database:
```bash
# From server directory
sqlite3 attendance.db
sqlite> SELECT * FROM authorized_devices;
```

### Last Access Timestamps
Check when each device last accessed data:
```sql
SELECT 
  device_id, 
  label, 
  registered_at, 
  last_access 
FROM authorized_devices 
ORDER BY last_access DESC;
```

### Revoke Device Access
Remove a device from the database:
```javascript
// Via API (from authorized device):
POST /api/device/{deviceId}
Headers: x-device-id: <your-device-id>

// Or directly in database:
// sqlite> DELETE FROM authorized_devices WHERE device_id = '...';
```

## Troubleshooting Network Access

### Problem: Devices can't connect to server
1. Check firewall settings - port 3001 must be open
2. Verify server is running: `npm run server`
3. Check if server is listening on `0.0.0.0`: ✅ Yes (it is)
4. From client device, test connectivity: `ping your_ip`

### Problem: Device ID differs between networks
- Device ID is unique to the machine, not the network
- Same physical device gets same ID on WiFi and Ethernet
- Different MAC = different device

### Problem: "API is unreachable"
1. Update API_BASE_URL in the code
2. Ensure server is running on correct port
3. Check firewall allows port access
4. Check network connectivity between devices

## Security Recommendations

### 1. Use HTTPS in Production
- Device IDs travel over the network
- Always use HTTPS to encrypt transit

### 2. Rotate Device Keys
- Regularly review authorized devices
- Remove unused devices

### 3. Monitor Access Logs
- Check last_access timestamps regularly
- Investigate unusual access patterns

### 4. Network Isolation
- Consider running on private network only
- Use VPN for remote access

### 5. Database Backup
- Regularly backup attendance.db
- Keep backup in secure location

## Advanced Configuration

### Custom Device Labels
When registering, you can set custom labels:

```javascript
registerDevice('your-device-id', 'Work Laptop - Office');
```

Labels help identify devices in logs.

### API Request Headers
All protected endpoints require this header:
```
x-device-id: <sha256-hash-of-device-info>
```

This is added automatically by the API service.

### Extending the System

To add new protected endpoints:

1. In `server/index.js`, add middleware:
```javascript
app.get('/api/your-endpoint', verifyDevice, (req, res) => {
  // Your code here
});
```

2. In frontend, use apiService:
```javascript
import apiService from './services/apiService';

// Or use fetch with headers:
const headers = getAuthHeaders();
fetch('/api/your-endpoint', { headers });
```

---

For more information, see [DEVICE_ACCESS_CONTROL.md](DEVICE_ACCESS_CONTROL.md) and [QUICK_START_DEVICE_ACCESS.md](QUICK_START_DEVICE_ACCESS.md).
