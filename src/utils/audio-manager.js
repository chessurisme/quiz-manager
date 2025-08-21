export class AudioManager {
  constructor() {
    this.sounds = {};
    this.isMuted = localStorage.getItem('audioMuted') === 'true';
    this.volume = parseFloat(localStorage.getItem('audioVolume')) || 0.7;
    this._loadSounds();
    
    // Initialize UI after a short delay to ensure DOM is ready
    setTimeout(() => {
      this._updateMuteIcon();
      this._updateVolumeSlider();
    }, 100);

    // Handle user interaction to enable audio context
    this._setupAudioContext();
  }

  _loadSounds() {
    // Load all available sound effects
    const soundFiles = {
      correct: '/assets/sfx/correct_sfx.mp3',
      wrong: '/assets/sfx/wrong_sfx.mp3',
      gameComplete: '/assets/sfx/game_complete_sfx.mp3'
    };

    // Preload all sounds
    Object.entries(soundFiles).forEach(([key, path]) => {
      this._loadSound(key, path);
    });
  }

  _loadSound(key, path) {
    try {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audio.volume = this.volume;
      
      // Store the audio element
      this.sounds[key] = audio;
      
      // Handle loading errors gracefully
      audio.addEventListener('error', (e) => {
        console.warn(`Failed to load sound: ${key}`, e);
      });

      // Handle successful loading
      audio.addEventListener('canplaythrough', () => {
        console.log(`Sound loaded successfully: ${key}`);
      });
    } catch (error) {
      console.warn(`Failed to create audio for: ${key}`, error);
    }
  }

  play(soundKey) {
    if (this.isMuted) return;
    
    const sound = this.sounds[soundKey];
    if (!sound) {
      console.warn(`Sound not found: ${soundKey}`);
      return;
    }

    try {
      // Clone the audio to allow multiple simultaneous plays
      const audioClone = sound.cloneNode();
      audioClone.volume = this.volume;
      audioClone.play().catch(error => {
        console.warn(`Failed to play sound: ${soundKey}`, error);
      });
    } catch (error) {
      console.warn(`Error playing sound: ${soundKey}`, error);
    }
  }

  playCorrect() {
    this.play('correct');
  }

  playWrong() {
    this.play('wrong');
  }

  playGameComplete() {
    this.play('gameComplete');
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('audioVolume', this.volume.toString());
    Object.values(this.sounds).forEach(sound => {
      if (sound) {
        sound.volume = this.volume;
      }
    });
    
    // Update volume display in settings modal if available
    const volumeValue = document.getElementById('audioVolumeValue');
    if (volumeValue) {
      volumeValue.textContent = Math.round(this.volume * 100) + '%';
    }
  }

  mute() {
    this.isMuted = true;
    localStorage.setItem('audioMuted', 'true');
    this._updateMuteIcon();
  }

  unmute() {
    this.isMuted = false;
    localStorage.setItem('audioMuted', 'false');
    this._updateMuteIcon();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('audioMuted', this.isMuted.toString());
    this._updateMuteIcon();
    return this.isMuted;
  }

  _updateMuteIcon() {
    const muteBtn = document.getElementById('muteBtn');
    const muteIcon = document.getElementById('muteIcon');
    const muteText = document.getElementById('audioMuteText');
    
    if (muteBtn && muteIcon) {
      if (this.isMuted) {
        muteIcon.setAttribute('data-lucide', 'volume-x');
        muteBtn.classList.add('muted');
      } else {
        muteIcon.setAttribute('data-lucide', 'volume-2');
        muteBtn.classList.remove('muted');
      }
      
      // Refresh lucide icons if available
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }
    
    // Update mute text in settings modal if available
    if (muteText) {
      muteText.textContent = this.isMuted ? 'Muted' : 'Unmuted';
    }
  }

  _updateVolumeSlider() {
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('audioVolumeValue');
    
    if (volumeSlider) {
      volumeSlider.value = Math.round(this.volume * 100);
    }
    
    if (volumeValue) {
      volumeValue.textContent = Math.round(this.volume * 100) + '%';
    }
  }

  isSoundLoaded(soundKey) {
    return this.sounds[soundKey] && this.sounds[soundKey].readyState >= 2;
  }

  testAllSounds() {
    console.log('Testing all sounds...');
    Object.keys(this.sounds).forEach(key => {
      console.log(`${key}: ${this.isSoundLoaded(key) ? 'Loaded' : 'Not loaded'}`);
    });
  }

  getLoadedSoundsCount() {
    return Object.values(this.sounds).filter(sound => this.isSoundLoaded(sound)).length;
  }

  _setupAudioContext() {
    // Some browsers require user interaction before playing audio
    const enableAudio = () => {
      // Try to play a silent sound to enable audio context
      if (this.sounds.correct) {
        this.sounds.correct.play().then(() => {
          this.sounds.correct.pause();
          this.sounds.correct.currentTime = 0;
        }).catch(() => {
          // Ignore errors, audio will work on next user interaction
        });
      }
      
      // Remove event listeners after first interaction
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };

    // Add event listeners for user interaction
    document.addEventListener('click', enableAudio, { once: true });
    document.addEventListener('keydown', enableAudio, { once: true });
  }
}
