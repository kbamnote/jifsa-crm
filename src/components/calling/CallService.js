import { UserAgent, Registerer, Inviter, SessionState } from 'sip.js';

class CallService {
  constructor() {
    this.userAgent = null;
    this.registerer = null;
    this.currentSession = null;
    this.isRegistered = false;
    this.callbacks = {
      onRegistered: null,
      onUnregistered: null,
      onCallReceived: null,
      onCallStarted: null,
      onCallEnded: null,
      onCallFailed: null,
    };
  }

  // Initialize SIP connection
  async initialize(config) {
    try {
      const { sipServer, username, password, domain = sipServer } = config;
      
      const uri = `sip:${username}@${domain}`;
      const transportOptions = {
        server: `wss://${sipServer}:8089/ws`,
        // Fallback to ws if wss fails
        connectionTimeout: 5000,
      };

      const userAgentOptions = {
        uri,
        transportOptions,
        authorizationUsername: username,
        authorizationPassword: password,
        sessionDescriptionHandlerFactoryOptions: {
          constraints: {
            audio: true,
            video: false
          }
        }
      };

      this.userAgent = new UserAgent(userAgentOptions);
      
      // Handle incoming calls
      this.userAgent.delegate = {
        onInvite: (invitation) => {
          console.log('Incoming call from:', invitation.remoteIdentity.uri);
          this.currentSession = invitation;
          
          if (this.callbacks.onCallReceived) {
            this.callbacks.onCallReceived(invitation.remoteIdentity.uri.toString());
          }

          // Auto-setup session state handling
          this.setupSessionHandlers(invitation);
        }
      };

      await this.userAgent.start();
      
      // Create registerer
      this.registerer = new Registerer(this.userAgent);
      
      // Handle registration events
      this.registerer.stateChange.addListener((state) => {
        console.log('Registration state:', state);
        if (state === 'Registered') {
          this.isRegistered = true;
          if (this.callbacks.onRegistered) {
            this.callbacks.onRegistered();
          }
        } else if (state === 'Unregistered') {
          this.isRegistered = false;
          if (this.callbacks.onUnregistered) {
            this.callbacks.onUnregistered();
          }
        }
      });

      // Register with SIP server
      await this.registerer.register();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize SIP:', error);
      throw error;
    }
  }

  // Make outgoing call
  async makeCall(phoneNumber) {
    if (!this.userAgent || !this.isRegistered) {
      throw new Error('SIP client not registered');
    }

    try {
      const target = `sip:${phoneNumber}@${this.userAgent.configuration.uri.host}`;
      const inviter = new Inviter(this.userAgent, target);
      
      this.currentSession = inviter;
      this.setupSessionHandlers(inviter);

      await inviter.invite();
      
      console.log('Call initiated to:', phoneNumber);
      return inviter;
    } catch (error) {
      console.error('Failed to make call:', error);
      if (this.callbacks.onCallFailed) {
        this.callbacks.onCallFailed(error.message);
      }
      throw error;
    }
  }

  // Answer incoming call
  async answerCall() {
    if (!this.currentSession) {
      throw new Error('No incoming call to answer');
    }

    try {
      await this.currentSession.accept();
      console.log('Call answered');
    } catch (error) {
      console.error('Failed to answer call:', error);
      throw error;
    }
  }

  // Hang up current call
  async hangup() {
    if (!this.currentSession) {
      return;
    }

    try {
      if (this.currentSession.state === SessionState.Initial || 
          this.currentSession.state === SessionState.Establishing) {
        await this.currentSession.cancel();
      } else if (this.currentSession.state === SessionState.Established) {
        await this.currentSession.bye();
      }
      
      this.currentSession = null;
      console.log('Call ended');
    } catch (error) {
      console.error('Failed to hang up:', error);
    }
  }

  // Setup session event handlers
  setupSessionHandlers(session) {
    session.stateChange.addListener((state) => {
      console.log('Session state:', state);
      
      switch (state) {
        case SessionState.Established:
          if (this.callbacks.onCallStarted) {
            this.callbacks.onCallStarted();
          }
          break;
        case SessionState.Terminated:
          this.currentSession = null;
          if (this.callbacks.onCallEnded) {
            this.callbacks.onCallEnded();
          }
          break;
      }
    });
  }

  // Set event callbacks
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Check if currently in a call
  isInCall() {
    return this.currentSession && this.currentSession.state === SessionState.Established;
  }

  // Get current call status
  getCallStatus() {
    if (!this.currentSession) return 'idle';
    return this.currentSession.state;
  }

  // Disconnect from SIP server
  async disconnect() {
    try {
      if (this.currentSession) {
        await this.hangup();
      }
      
      if (this.registerer && this.isRegistered) {
        await this.registerer.unregister();
      }
      
      if (this.userAgent) {
        await this.userAgent.stop();
      }
      
      this.userAgent = null;
      this.registerer = null;
      this.currentSession = null;
      this.isRegistered = false;
      
      console.log('SIP client disconnected');
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }
}

// Create singleton instance
const callService = new CallService();
export default callService;