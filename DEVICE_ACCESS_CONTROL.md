# Device-Based Access Control System

## Overview

Your attendance portal now has **device-based access control** that restricts access to sensitive student and backlog data to only authorized devices. This ensures that your data remains private and cannot be accessed from unauthorized locations.

## How It Works

### Device Registration
1. When you first open the application, you will be prompted to register your device
2. A unique device ID is generated based on your device's hardware characteristics (hostname, MAC addresses, platform)
3. This device ID is stored in the browser's localStorage and registered with the server
4. Only your registered device can access sensitive data

### Protected Endpoints
The following endpoints require device verification (via `x-device-id` header):
- `GET /api/students` - View student data
- `PUT /api/students/:roll` - Update student information
- `POST /api/students/bulk` - Import student data
- `GET /api/attendance` - View attendance records
- `POST /api/attendance` - Submit attendance reports
- `DELETE /api/attendance` - Clear attendance history
- `GET /api/settings/:key` - Retrieve settings
- `POST /api/settings/:key` - Save settings

### Public Endpoints (No Device Verification Needed)
- `GET /api/device/info` - Get current device ID
- `POST /api/device/register` - Register a new device

## Files Added/Modified

### New Files Created

1. **server/deviceAuth.js**
   - Device authentication logic
   - Functions for device registration, verification, and management
   - Device ID generation based on hardware characteristics

2. **src/services/deviceAuthService.js**
   - Frontend device management service
   - Stores device ID in localStorage
   - Handles device registration with the server
   - Provides authentication headers for API requests

3. **src/services/apiService.js**
   - API wrapper that automatically includes device ID in requests
   - Provides easy-to-use API methods
   - Centralizes all API communication

4. **src/components/DeviceRegistrationModal.jsx**
   - UI component for device registration
   - Shows device ID and registration status
   - Provides user-friendly registration interface

### Modified Files

1. **server/db.js**
   - Added `authorized_devices` table to store registered devices
   - Tracks device registration time and last access

2. **server/index.js**
   - Added device registration endpoints
   - Added `verifyDevice` middleware for sensitive endpoints
   - Protected student, attendance, and settings endpoints

3. **src/App.jsx**
   - Integrated device registration check
   - Shows registration modal if device not authorized
   - Calls `handleDeviceRegistered()` when registration succeeds

## Usage

### For Your Device (First Time)
1. Open the application
2. Log in with your credentials
3. You'll see the "Device Registration" modal
4. Click "Register This Device"
5. Your device is now registered and you can access all features

### For Other Devices
If someone else tries to access the app from a different device:
1. They will see the device registration modal
2. They can enter the same app, but they will NOT be able to access:
   - Student data
   - Attendance records
   - Backlog information
3. They will see an error: "This device is not authorized to access student and backlog data"

### To Access on Multiple Devices
If you want to authorize another device (e.g., personal laptop):
1. Open the app on that device
2. Complete the registration process
3. The new device will get its own unique device ID
4. You can manage authorized devices through the admin settings

## Technical Details

### Device ID Generation
The device ID is generated using:
- Hostname (device name)
- Operating system platform
- MAC addresses from network interfaces
- All hashed with SHA-256 for security

This ensures that:
- Each device has a unique, stable ID
- The ID cannot be easily spoofed
- The ID persists across browser restarts

### Storage
- **Client-side**: Device ID stored in localStorage with key `app_device_id`
- **Server-side**: Authorized devices stored in SQLite `authorized_devices` table
- **Device Status**: Registration status tracked with key `app_device_registered` in localStorage

### Security Considerations
- Device ID is included in HTTP header `x-device-id`
- Server verifies device authorization before returning sensitive data
- Each successful access updates the device's `last_access` timestamp
- Devices can be revoked by deleting their record from the server

## API Reference

### Device Endpoints

#### Get Device Info
```
GET /api/device/info
Returns: { deviceId: "..." }
No authentication required
```

#### Register Device
```
POST /api/device/register
Body: {
  deviceId: "...",
  label: "My Device" (optional)
}
Returns: { success: true, message: "Device registered successfully" }
No authentication required for first registration
```

#### Get Authorized Devices
```
GET /api/device/authorized
Headers: x-device-id: <your-device-id>
Returns: { devices: [...] }
Requires device verification
```

#### Revoke Device
```
DELETE /api/device/:deviceId
Headers: x-device-id: <your-device-id>
Returns: { success: true, message: "Device revoked" }
Requires device verification
```

## Troubleshooting

### "Device ID required" Error
- Make sure your browser's localStorage is enabled
- Try clearing browser data and registering again

### "Device is not authorized" Error
- Your device is not registered with the server
- You may be accessing from a different device or network
- Register your device to gain access

### Lost Access
If you clear your browser data or localStorage:
1. The device ID will be regenerated
2. You'll need to re-register your device
3. The new registration will use the same device but get a new ID in localStorage

### Multiple Devices
To maintain records for multiple devices:
1. Register each device separately
2. Each will get its own unique device ID
3. You can manage all authorized devices through admin settings

## Security Best Practices

1. **Don't Share Device IDs** - Each device ID should remain unique to that device
2. **Register Only Your Devices** - Only register devices you own and trust
3. **Revoke Old Devices** - Remove authorization from devices you no longer use
4. **Monitor Last Access** - Check the "last access" timestamp to detect unusual activity
5. **Use HTTPS** - In production, always use HTTPS to protect device IDs in transit

## Future Enhancements

Potential improvements to the device access system:
- Device name customization
- Automatic device expiration after 90 days of inactivity
- Device activity logs
- Two-factor authentication for device registration
- Geographic restrictions (optional)
- IP whitelisting
