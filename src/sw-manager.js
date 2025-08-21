// Service Worker Manager for handling app updates
export class SWManager {
  constructor() {
    this.registration = null;
    this.updateAvailable = false;
    this.updateNotification = null;
    this.init();
  }

  async init() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        this.setupEventListeners();
        this.checkForUpdates();
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  setupEventListeners() {
    // Listen for service worker updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Reload the page when a new service worker takes control
      window.location.reload();
    });

    // Listen for messages from the service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
        this.updateAvailable = true;
        this.showUpdateNotification();
      }
    });

    // Check for updates when the page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForUpdates();
      }
    });

    // Listen for waiting service worker
    if (this.registration) {
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is installed and waiting
              this.updateAvailable = true;
              this.showUpdateNotification();
            }
          });
        }
      });
    }
  }

  async checkForUpdates() {
    if (this.registration) {
      try {
        await this.registration.update();
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    }
  }

  showUpdateNotification() {
    // Remove existing notification if present
    if (this.updateNotification) {
      this.updateNotification.remove();
    }

    // Create update notification element
    this.updateNotification = document.createElement('div');
    this.updateNotification.className = 'update-notification';
    this.updateNotification.innerHTML = `
      <div class="update-content">
        <div class="update-icon">🔄</div>
        <div class="update-text">
          <div class="update-title">Update Available</div>
          <div class="update-description">A new version of the app is available. Click to update.</div>
        </div>
        <button class="update-button" onclick="window.swManager.updateApp()">
          Update Now
        </button>
        <button class="update-dismiss" onclick="window.swManager.dismissUpdate()">
          ✕
        </button>
      </div>
    `;

    // Add to page
    document.body.appendChild(this.updateNotification);

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (this.updateNotification && this.updateNotification.parentNode) {
        this.updateNotification.classList.add('fade-out');
        setTimeout(() => {
          if (this.updateNotification && this.updateNotification.parentNode) {
            this.updateNotification.remove();
            this.updateNotification = null;
          }
        }, 300);
      }
    }, 10000);
  }

  updateApp() {
    if (this.registration && this.registration.waiting) {
      // Send message to service worker to skip waiting
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Hide the notification
      this.dismissUpdate();
      
      // Show a brief message that the update is being applied
      this.showUpdateInProgressMessage();
    }
  }

  showUpdateInProgressMessage() {
    const message = document.createElement('div');
    message.className = 'update-notification update-in-progress';
    message.innerHTML = `
      <div class="update-content">
        <div class="update-icon">⏳</div>
        <div class="update-text">
          <div class="update-title">Updating...</div>
          <div class="update-description">The app is being updated. Please wait...</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(message);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (message.parentNode) {
        message.remove();
      }
    }, 3000);
  }

  dismissUpdate() {
    if (this.updateNotification) {
      this.updateNotification.remove();
      this.updateNotification = null;
    }
  }

  // Method to manually check for updates (can be called from UI)
  async manualUpdateCheck() {
    if (this.registration) {
      try {
        // Update the button to show checking state
        this.updateCheckButtonState('checking');
        
        await this.registration.update();
        
        // Check if there's a waiting service worker
        if (this.registration.waiting) {
          this.updateCheckButtonState('update-available');
          this.showUpdateStatus('New update available! Click "Update Now" to apply.', 'success');
        } else {
          this.updateCheckButtonState('no-update');
          this.showUpdateStatus('No updates available. You have the latest version.', 'info');
        }
        
        return true;
      } catch (error) {
        console.error('Manual update check failed:', error);
        this.updateCheckButtonState('error');
        this.showUpdateStatus('Failed to check for updates. Please try again.', 'error');
        return false;
      }
    } else {
      this.showUpdateStatus('Service Worker not available.', 'error');
      return false;
    }
  }

  updateCheckButtonState(state) {
    const checkUpdateBtn = document.getElementById("checkUpdateBtn");
    if (!checkUpdateBtn) return;

    switch (state) {
      case 'checking':
        checkUpdateBtn.disabled = true;
        checkUpdateBtn.innerHTML = '<i data-lucide="loader-2" width="20" height="20" style="animation: spin 1s linear infinite;"></i> Checking...';
        break;
      case 'update-available':
        checkUpdateBtn.disabled = false;
        checkUpdateBtn.innerHTML = '<i data-lucide="download" width="20" height="20"></i> Update Available';
        checkUpdateBtn.onclick = () => this.updateApp();
        break;
      case 'no-update':
        checkUpdateBtn.disabled = false;
        checkUpdateBtn.innerHTML = '<i data-lucide="check-circle" width="20" height="20"></i> No Updates';
        checkUpdateBtn.onclick = () => this.manualUpdateCheck();
        break;
      case 'error':
        checkUpdateBtn.disabled = false;
        checkUpdateBtn.innerHTML = '<i data-lucide="refresh-cw" width="20" height="20"></i> Try Again';
        checkUpdateBtn.onclick = () => this.manualUpdateCheck();
        break;
    }
  }

  showUpdateStatus(message, type = 'info') {
    const updateStatus = document.getElementById("updateStatus");
    const updateStatusMessage = document.querySelector(".update-status-message");
    
    if (updateStatus && updateStatusMessage) {
      updateStatus.style.display = "block";
      
      // Set message and styling based on type
      updateStatusMessage.textContent = message;
      updateStatus.style.background = type === 'success' ? 'var(--color-success)' : 
                                    type === 'error' ? 'var(--color-error)' : 
                                    'var(--color-stroke-weak)';
      updateStatus.style.color = type === 'success' || type === 'error' ? 'white' : 'var(--color-text-strong)';
      
      // Auto-hide after 5 seconds for success/info messages
      if (type !== 'error') {
        setTimeout(() => {
          if (updateStatus.style.display !== 'none') {
            updateStatus.style.display = 'none';
          }
        }, 5000);
      }
    }
  }
}
