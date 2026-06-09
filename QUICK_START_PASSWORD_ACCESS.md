# Quick Start - Password-Based Access Control

## What Changed?

Instead of **device registration**, your system now uses **admin password**.

**Before**: Each device had to be registered
**Now**: Any device can access with the admin password

## Getting Started (3 Steps)

### Step 1: Start the App
```bash
npm run dev
```

### Step 2: Login
1. Open http://localhost:3000
2. Log in with your credentials
3. **Password modal appears**

### Step 3: Set Up Password (First Time Only)
- Enter a strong admin password
- Click "Initialize Password"
- You're now logged in!

## Using the System

### From Your Device
✅ Log in → Enter password → Full access

### From Another Device
✅ Log in → Enter same password → Full access

### From a Third Device
✅ Log in → Enter same password → Full access

## Password Requirements

- Minimum 4 characters
- Use a strong password (mix of letters, numbers, symbols recommended)
- Keep it private and secure
- Share only with authorized admins

## Session Duration

- **Valid for**: 24 hours after entering password
- **Automatic refresh**: Each request extends the session
- **Logout**: Click logout button to clear session immediately

## Common Tasks

### Changing Password
1. Go to **Admin Settings**
2. Find "Change Admin Password"
3. Enter current password and new password
4. Click "Update"
5. All sessions are cleared
6. You'll need to login and verify again

### Logging Out
- Click the **Logout** button (top right)
- Session token is cleared
- Next access requires password again

### Forgot Password?
Reset the database (for testing):
```bash
# Stop the server
# Delete: server/attendance.db
# Restart server
# Set up new password on next access
```

## What's Protected?

✅ Student data (view, edit, import)
✅ Attendance records (view, submit, clear)
✅ Backlog information
✅ Settings and configurations

## What's Public?

🌐 Password verification endpoint
🌐 Initial password setup
🌐 Login/registration pages (app logic)

## Testing the System

### Test 1: Same Device
✅ Log in → Enter password → Access all features

### Test 2: Different Device
✅ On another computer, log in with same password → Should work

### Test 3: Wrong Password
✅ Enter incorrect password → See error message → Try again

### Test 4: Session Expiry (Advanced)
✅ Delete localStorage key `app_admin_session` → Refresh → Need password again

## Browser Storage

Your session is stored in localStorage:
- `app_admin_session` - Token for this session
- `app_session_expiry` - When session expires (milliseconds)

To manually clear:
```javascript
// Open browser console (F12)
localStorage.removeItem('app_admin_session');
localStorage.removeItem('app_session_expiry');
// Refresh page
```

## How It Works (Behind the Scenes)

1. **Password submitted** → Hashed with SHA-256
2. **Hashes compared** → Match = verified ✓
3. **Session token created** → 64-character random string
4. **Token stored** → In browser localStorage
5. **Token expires** → After 24 hours
6. **Each request includes token** → Server verifies it

## Security Notes

🔒 **Password is hashed** - Original password never stored
🔒 **Session token is random** - Can't be guessed or predicted
🔒 **Token has expiry** - Automatically invalid after 24 hours
🔒 **HTTP header protected** - Token sent in headers, not in URL
🔒 **Password change invalidates all sessions** - Everyone must re-authenticate

## Advantages Over Device Registration

| Advantage | Benefit |
|-----------|---------|
| Any Device | Don't need to register each device separately |
| Simple Password | Easy to remember and manage |
| Multi-User | Share same password with other admins |
| Easy Update | Change password anytime |
| No Hardware Dependency | Works on any device |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Password not configured" | First time? Set up password when prompted |
| "Incorrect password" | Check if you entered it correctly |
| "Session expired" | 24 hours passed - re-enter password |
| "Can't access from other device" | Use the same password - should work |
| "Stuck on password screen" | Clear browser cache, reload page |

## FAQ

**Q: Can multiple people use the same password?**
A: Yes, that's the idea. All admins use the same password.

**Q: What if someone leaves the team?**
A: Change the password. Everyone will need to re-authenticate.

**Q: Is this secure?**
A: Yes, passwords are hashed and sessions are encrypted. Use a strong password.

**Q: Can I set different passwords for different users?**
A: Not in this version. All admins share one password. Future versions might support multiple accounts.

**Q: What if I forget the password?**
A: You'll need to reset the database or have someone with database access help.

**Q: How do I know if my session is still active?**
A: Check if you can access student data. If denied, session expired - re-enter password.

**Q: Can I change password from any device?**
A: Yes, as long as you know the current password.

## Next Steps

1. ✅ Start the app: `npm run dev`
2. ✅ Log in with credentials
3. ✅ Set up your admin password
4. ✅ Test access from another device
5. ✅ Read [PASSWORD_ACCESS_CONTROL.md](PASSWORD_ACCESS_CONTROL.md) for detailed docs

---

**Summary**: Simple, secure, device-agnostic password protection. Enter password once, access for 24 hours. Perfect for team collaboration! 🔐
