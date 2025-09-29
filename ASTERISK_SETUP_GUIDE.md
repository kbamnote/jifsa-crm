# Free IVR Integration Setup Guide

## Overview
This guide will help you set up a **completely free IVR system** using Asterisk with WebRTC integration for your CRM system.

## 🚀 Quick Start Options

### Option 1: Local Asterisk Installation (Recommended for Development)

#### 1. Install Asterisk on Windows (WSL2)
```bash
# Install WSL2 Ubuntu
wsl --install -d Ubuntu

# Update packages
sudo apt update && sudo apt upgrade -y

# Install Asterisk dependencies
sudo apt install -y build-essential wget libssl-dev libncurses5-dev libnewt-dev libxml2-dev linux-headers-$(uname -r) libsqlite3-dev uuid-dev libjansson-dev

# Download and compile Asterisk
cd /usr/src
sudo wget http://downloads.asterisk.org/pub/telephony/asterisk/asterisk-20-current.tar.gz
sudo tar zxf asterisk-20-current.tar.gz
cd asterisk-20*/

# Configure, compile and install
sudo ./configure --with-jansson-bundled
sudo make menuselect  # Select chan_pjsip, res_pjsip, res_pjsip_websocket
sudo make && sudo make install
sudo make samples
```

#### 2. Configure Asterisk for WebRTC

**Edit `/etc/asterisk/pjsip.conf`:**
```ini
[transport-wss]
type=transport
protocol=wss
bind=0.0.0.0:8089
cert_file=/etc/asterisk/keys/asterisk.crt
priv_key_file=/etc/asterisk/keys/asterisk.key
method=tlsv1_2

[transport-ws]
type=transport
protocol=ws
bind=0.0.0.0:8088

; WebRTC endpoint template
[webrtc_client](!)
type=endpoint
transport=transport-wss
context=from-internal
disallow=all
allow=ulaw,alaw,gsm,g726,g722,opus
direct_media=no
force_rport=yes
rewrite_contact=yes
rtp_symmetric=yes
ice_support=yes
media_encryption=optional
dtls_auto_generate_cert=yes

; User extensions
[1001](webrtc_client)
auth=1001
aors=1001

[1002](webrtc_client)
auth=1002
aors=1002

; Auth sections
[1001]
type=auth
auth_type=userpass
username=1001
password=SecurePassword123

[1002]
type=auth
auth_type=userpass
username=1002
password=SecurePassword123

; AOR sections
[1001]
type=aor
max_contacts=1
remove_existing=yes

[1002]
type=aor
max_contacts=1
remove_existing=yes
```

**Edit `/etc/asterisk/extensions.conf`:**
```ini
[from-internal]
; Extension to extension calling
exten => _10XX,1,Dial(PJSIP/${EXTEN})
exten => _10XX,n,Hangup()

; Echo test
exten => 1234,1,Answer()
exten => 1234,n,Echo()
exten => 1234,n,Hangup()

; Call external numbers (if you have a trunk)
exten => _NXXNXXXXXX,1,Dial(PJSIP/${EXTEN}@external-trunk)
exten => _NXXNXXXXXX,n,Hangup()
```

**Edit `/etc/asterisk/http.conf`:**
```ini
[general]
enabled=yes
bindaddr=0.0.0.0
bindport=8088
tlsenable=yes
tlsbindaddr=0.0.0.0:8089
tlscertfile=/etc/asterisk/keys/asterisk.crt
tlsprivatekey=/etc/asterisk/keys/asterisk.key
```

#### 3. Generate SSL Certificates
```bash
sudo mkdir -p /etc/asterisk/keys
cd /etc/asterisk/keys

# Generate self-signed certificate for testing
sudo openssl req -new -x509 -days 365 -nodes -out asterisk.crt -keyout asterisk.key \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

sudo chown asterisk:asterisk asterisk.*
sudo chmod 600 asterisk.*
```

#### 4. Start Asterisk
```bash
sudo systemctl enable asterisk
sudo systemctl start asterisk

# Check status
sudo asterisk -r
```

### Option 2: Cloud Asterisk (FreePBX)

#### Using FreePBX Cloud (Free Trial)
1. Sign up at https://www.freepbx.org/
2. Create a free cloud instance
3. Configure WebRTC extensions
4. Update your CRM settings with cloud details

### Option 3: Docker Asterisk (Quick Setup)

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  asterisk:
    image: andrius/asterisk
    ports:
      - "8088:8088"  # HTTP
      - "8089:8089"  # HTTPS/WSS
      - "5060:5060/udp"  # SIP
    volumes:
      - ./asterisk-config:/etc/asterisk
    environment:
      - ASTERISK_UID=1000
      - ASTERISK_GID=1000
```

Run with:
```bash
docker-compose up -d
```

## 🔧 CRM Configuration

### 1. SIP Settings in Your CRM
In the CRM's Phone interface, configure:
- **SIP Server**: `localhost` (or your server IP)
- **Username**: `1001` (or your extension)
- **Password**: `SecurePassword123` (or your password)
- **Domain**: `localhost` (or your domain)

### 2. Testing the Connection
1. Open your CRM Dashboard
2. Go to the Phone interface
3. Enter SIP settings
4. Click "Connect"
5. You should see "Connected" status

### 3. Making Test Calls
- Call `1234` for echo test
- Call another extension like `1002`
- Use click-to-call buttons on customer records

## 📞 Features Implemented

### ✅ Current Features
- **WebRTC Calling**: Browser-based calling without plugins
- **Click-to-Call**: Call customers directly from records
- **Call Logging**: Automatic call history in CRM
- **Call History**: View all call logs
- **Call Controls**: Answer, hang up, mute functions
- **Screen Pop**: Customer info during calls

### 🔄 Call Flow
1. User clicks phone number in CRM
2. WebRTC establishes connection to Asterisk
3. Call is initiated through SIP
4. Call details logged to CRM backend
5. Call history updated in real-time

## 🛠 Troubleshooting

### Common Issues

#### 1. Connection Failed
```bash
# Check Asterisk status
sudo asterisk -r
pjsip show endpoints

# Check WebSocket
ss -tlnp | grep 8089
```

#### 2. Audio Issues
- Ensure microphone permissions in browser
- Check firewall settings for RTP ports
- Verify DTLS certificates

#### 3. Call Quality
- Use `allow=opus` for better quality
- Check network conditions
- Consider using STUN/TURN servers

#### 4. HTTPS Requirements
Modern browsers require HTTPS for WebRTC:
```bash
# For development, use ngrok
ngrok http 8089
```

## 🌐 Production Deployment

### Security Considerations
1. Use proper SSL certificates (Let's Encrypt)
2. Implement firewall rules
3. Use strong passwords
4. Enable fail2ban for SIP protection

### Scaling Options
1. **Asterisk Cluster**: Multiple Asterisk servers
2. **Load Balancer**: Distribute WebRTC connections
3. **Database Backend**: Centralized configuration

### External Connectivity
To connect to PSTN (real phone numbers):
1. **VoIP Provider**: Twilio, Vonage, etc.
2. **SIP Trunks**: Configure in `pjsip.conf`
3. **Number Porting**: Move existing numbers

## 📋 Backend API Requirements

Your backend should implement these endpoints:

```javascript
// Call logging endpoints
POST /calls/log - Log call details
GET /calls/history/:customerId - Get customer call history
GET /calls/all - Get all call logs
PATCH /calls/:callId/status - Update call status
```

Example call log data:
```json
{
  "type": "outbound_call",
  "phoneNumber": "+1234567890",
  "customerName": "John Doe",
  "timestamp": "2024-01-01T12:00:00Z",
  "duration": 120,
  "status": "completed"
}
```

## 🆘 Support

### Getting Help
1. **Asterisk Documentation**: https://docs.asterisk.org/
2. **FreePBX Community**: https://community.freepbx.org/
3. **WebRTC Samples**: https://webrtc.github.io/samples/

### Testing Tools
- **SIP Clients**: Linphone, Zoiper
- **WebRTC Test**: https://test.webrtc.org/
- **Network Test**: Check firewall/NAT settings

This setup provides a completely free, professional-grade calling system integrated with your CRM!