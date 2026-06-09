# Password-Based Access Control System

## Overview

Your attendance portal now uses **admin password-based access control**. Every device can access the system by entering the admin password. This replaces the previous device registration system with a simpler, more flexible approach.

## Key Features

✅ **Device-Agnostic**: Access from any device with the password
✅ **Session-Based**: Password verified once, session valid for 24 hours
✅ **Password Management**: Change admin password anytime
✅ **Multiple Sessions**: Multiple devices can be logged in simultaneously
✅ **Easy to Use**: Simple password prompt before data access

## How It Works

### First Time Setup

1. **Open the application** and log in with your credentials
2. **Password modal appears** - "Admin Access Required"
3. **Set up admin password** - Create a strong password (min 4 characters)
4. **System initializes** - Password is set and you're automatically logged in
5. **Access granted** - All features are available

### Subsequent Access

1. **Open the application** and log in with your credentials
2. **Password modal appears** - "Admin Access Required"
3. **Enter admin password** - Type the password you set
4. **System authenticates** - Password verified against stored hash
5. **Session created** - Token valid for 24 hours
6. **Access granted** - Full access to all features

### Session Management

- **Session Duration**: 24 hours from authentication
- **Automatic Refresh**: Last access time updated on each request
- **Session Token**: Stored in browser localStorage (`app_admin_session`)
- **Token Expiry**: Tracked in localStorage (`app_session_expiry`)
- **Logout**: Clear session by clicking logout button

## Protected Endpoints

The following endpoints require password verification (via `x-admin-token` header):
- `GET /api/students` - View student data
- `PUT /api/students/:roll` - Update student information
- `POST /api/students/bulk` - Import student data
- `GET /api/attendance` - View attendance records
- `POST /api/attendance` - Submit attendance reports
- `DELETE /api/attendance` - Clear attendance history
- `GET /api/settings/:key` - Retrieve settings
- `POST /api/settings/:key` - Save settings

## Public Endpoints (No Password Needed)

- `POST /api/admin/verify-password` - Verify password
- `POST /api/admin/initialize-password` - Set up initial password

## Files Modified/Created

### New Files

1. **src/services/passwordAuthService.js**
   - Session token management
   - Password verification with server
   - Password change functionality

2. **src/components/AdminPasswordModal.jsx**
   - UI for password input
   - Password initialization
   - Error handling

### Modified Files

1. **server/index.js**
   - Removed device-based middleware
   - Added password verification endpoints
   - Added `verifyAdminToken` middleware
   - Protected endpoints now check for token

2. **server/db.js**
   - Removed `authorized_devices` table
   - Added `admin_settings` table (stores hashed password)
   - Added `admin_sessions` table (tracks active sessions)

3. **src/services/apiService.js**
   - Changed to use admin token instead of device ID
   - Updated `admin` API methods

4. **src/App.jsx**
   - Replaced device registration with password authentication
   - Added password check on app initialization

## API Reference

### Initialize Admin Password (First Time)
```
POST /api/admin/initialize-password
Body: { password: "your_password" }
Response: { success: true, token: "...", message: "Admin password initialized" }
No authentication required
```

### Verify Password
```
POST /api/admin/verify-password
Body: { password: "your_password" }
Response: { success: true, token: "...", message: "Password verified" }
No authentication required
```

### Change Password
```
POST /api/admin/set-password
Headers: x-admin-token: <token>
Body: { currentPassword: "old_pass", newPassword: "new_pass" }
Response: { success: true, message: "Password changed successfully..." }
Requires valid token (invalidates all existing sessions)
```

### Logout
```
POST /api/admin/logout
Headers: x-admin-token: <token>
Response: { success: true, message: "Logged out successfully" }
Requires valid token
```

## Security Considerations

### Password Storage
- ✅ Passwords hashed with SHA-256 before storage
- ✅ Never stored in plain text
- ✅ Hash cannot be reversed to get original password

### Session Security
- ✅ Session token is 64-character random hex string
- ✅ Tokens expire after 24 hours
- ✅ Tokens invalidated when password changes
- ✅ One-time use tokens for registration

### Data Protection
- ✅ All requests verified against session token
- ✅ Expired tokens rejected automatically
- ✅ Last access timestamp tracked for audit

### Best Practices
1. **Use a strong password** - Mix letters, numbers, symbols
2. **Keep password private** - Don't share with others
3. **Change password regularly** - Update every few months
4. **Monitor access** - Check last access timestamps
5. **Logout when done** - Don't leave browser unattended

## Usage Examples

### Changing Your Password
1. Go to Admin Settings
2. Look for "Change Admin Password"
3. Enter current password
4. Enter new password (confirm)
5. Click "Update Password"
6. You'll be logged out (need to login and verify again)

### Multiple User Accounts
Since this uses a single admin password:
- All admins use the same password
- Consider password changes when people leave
- Track who changed what (if needed)

### Forgot Password?
If you forget the admin password:
1. **Option 1**: Delete the database (`server/attendance.db`)
   - This will reset everything (not recommended for production)
2. **Option 2**: Direct database edit
   - Stop the server
   - Delete the `admin_settings` table entry
   - Restart server
   - Re-initialize password

## Troubleshooting

### "Admin password not configured"
- **Cause**: First time access or password was reset
- **Solution**: Set up a new password when prompted

### "Incorrect admin password"
- **Cause**: Wrong password entered
- **Solution**: Double-check the password, consider resetting if forgotten

### "Session expired"
- **Cause**: 24 hours passed since last authentication
- **Solution**: Re-enter the admin password to refresh session

### "Invalid or expired token"
- **Cause**: Browser localStorage was cleared
- **Solution**: Refresh page and verify password again

### Multiple users see "Device not authorized"
- **Cause**: Old device-based system might still be in code
- **Solution**: Clear browser cache and reload; check that you're using updated code

## Comparison: Device vs Password Based

| Feature | Device-Based | Password-Based |
|---------|--------------|----------------|
| Setup   | Automatic    | Manual password |
| Access  | Single device| Any device |
| Multiple Users | Multiple devices | Single password |
| Session | Permanent    | 24 hours |
| Change  | New device = new ID | Change password anytime |
| Sharing | Hard to share| Easy to share |
| Security| Hardware-based | Password-based |

## Migration from Device-Based

If you were using the device-based system:

1. **Old files can be removed** (optional):
   - `src/services/deviceAuthService.js`
   - `src/components/DeviceRegistrationModal.jsx`
   - `server/deviceAuth.js`

2. **Database changes**:
   - Old `authorized_devices` table not used
   - New `admin_settings` and `admin_sessions` tables created

3. **No data loss**:
   - All student data preserved
   - All attendance records preserved
   - Settings preserved

## Future Enhancements

Potential improvements:
- Multiple admin accounts with different passwords
- Two-factor authentication (2FA)
- IP-based restrictions
- Automatic session timeout UI warning
- Activity logging for security audit
- Password strength requirements
- Session management dashboard

---

**Implementation Date**: June 2026
**Version**: 1.0
**Status**: Production Ready
