export class UIController {
  constructor(dependencies = {}) {
    this.folderController = dependencies.folderController;
    this.playController = dependencies.playController;
    this.quizController = dependencies.quizController;
    this.routerController = dependencies.routerController;
    this.importedQuizId = null;
    this.importedQuizIdsBatch = [];
    this.importFailedCount = 0;
  }

  // Welcome messages array
  welcomeMessages = [
    "Welcome to Quiz Manager! 🎯",
    "Let your light shine through knowledge! ✨",
    "Wisdom begins with the fear of Jehovah 📖",
    "The truth will set you free! 🕊️",
    "Blessed are those hungering for righteousness 🍞",
    "Every quiz is a step toward wisdom 🧠",
    "Your mind is a garden—plant good seeds 🌱",
    "Small steps lead to big achievements 🐾",
    "Be as wise as Solomon in your studies 👑",
    "Faith like Abraham—step into the unknown 🏔️",
    "Patient like Job—your time will come ⏳",
    "Trust in Jehovah with all your heart ❤️",
    "Be strong and courageous! 💪",
    "The joy of Jehovah is your strength 😊",
    "Walk by faith, not by sight 👁️",
    "Jehovah’s plans for you are good 🙏",
    "Every correct answer is a victory! 🎉",
    "Your knowledge is your superpower! ⚡",
    "Keep seeking, keep finding 📚",
    "Diligence brings rich rewards 💎",
    "Meditate on what you learn 🪷",
    "Let love guide your learning ❤️",
    "Stay curious, stay humble 🔍",
    "Rejoice in small victories 🎊",
    "Persistence brings progress 🛠️",
    "Remember your Creator in your youth 🌅",
    "A wise heart accepts instruction 📖",
    "Good friends sharpen one another 🔪",
    "Guard your heart—it is the source of life 💖",
    "Speak truth with kindness 🌼",
    "Patience is better than pride 🕰️",
    "A joyful heart makes for good learning 😊",
    "Ask, and it will be given 🙌",
    "Plan your steps, but trust Jehovah 🗺️",
    "Learn with a willing spirit ✍️",
    "Take a deep breath—Jehovah cares 🌬️",
    "Break time! Stretch a little ☕",
    "Pause and thank Jehovah for wisdom 🙏",
    "Hydrate before your next quiz 💧",
    "Rest your eyes for a moment 👀",
    "Smile—you’re making progress 😄",
    "Time for a 2-minute walk 🚶",
    "Encourage someone else today 🤝",
    "Think on things that are true and noble 🕊️",
    "Apply what you learn in daily life 🔑",
    "Let endurance have its work 🏃",
    "Keep your goal in sight 🎯",
    "You’re building treasures that last forever 🌟",
    "Finish strong—you’ve got this! 🏆",
    "Jehovah blesses your efforts 💐"
  ];
  

  // Function to update welcome message
  updateWelcomeMessage() {
    const welcomeTitle = document.querySelector('.welcome-title');
    if (welcomeTitle) {
      const randomIndex = Math.floor(Math.random() * this.welcomeMessages.length);
      welcomeTitle.textContent = this.welcomeMessages[randomIndex];
    }
  }
  toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebarBackdrop");
    const willOpen = !sidebar.classList.contains("open");
    sidebar.classList.toggle("open");
    if (backdrop) {
      backdrop.classList.toggle("open", willOpen);
    }
  }

  hideSidebar() {
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebarBackdrop");
    sidebar.classList.remove("open");
    if (backdrop) backdrop.classList.remove("open");
  }

  openSettings() {
    this.showSettingsPage();
  }

  openModal(modalId) {
    document.getElementById(modalId).classList.add("open");
  }

  // Generic modal helpers (alert/confirm/prompt)
  _buildDynamicModal({ title = "", contentNode = null, actions = [] }) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay open";
    const modal = document.createElement("div");
    modal.className = "modal";

    // Header
    const header = document.createElement("div");
    header.className = "modal-header";
    const h3 = document.createElement("h3");
    h3.className = "modal-title";
    h3.textContent = title || "";
    const closeBtn = document.createElement("button");
    closeBtn.className = "icon-button";
    closeBtn.innerHTML = '<i data-lucide="x" width="24" height="24"></i>';
    header.appendChild(h3);
    header.appendChild(closeBtn);

    // Content
    const content = document.createElement("div");
    content.className = "modal-content";
    if (contentNode) content.appendChild(contentNode);

    // Actions
    const actionsEl = document.createElement("div");
    actionsEl.className = "modal-actions";
    actions.forEach((btn) => actionsEl.appendChild(btn));

    modal.appendChild(header);
    modal.appendChild(content);
    modal.appendChild(actionsEl);
    overlay.appendChild(modal);

    const remove = () => {
      overlay.classList.remove("open");
      // allow transition end
      setTimeout(() => overlay.remove(), 200);
    };

    // Close on backdrop
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) remove();
    });
    // Close on header X
    closeBtn.addEventListener("click", remove);

    // Attach
    const container = document.querySelector('.app-container') || document.body;
    container.appendChild(overlay);
    if (window.lucide) {
      window.lucide.createIcons();
    }
    return { overlay, remove };
  }

  async showAlert(message, title = "Notice", okText = "OK") {
    return new Promise((resolve) => {
      const msg = document.createElement("p");
      msg.textContent = String(message || "");
      const okBtn = document.createElement("button");
      okBtn.className = "btn-primary";
      okBtn.textContent = okText;
      const { remove } = this._buildDynamicModal({
        title,
        contentNode: msg,
        actions: [okBtn],
      });
      okBtn.addEventListener("click", () => {
        remove();
        resolve();
      });
    });
  }

  async showConfirm(message, title = "Confirm", {
    confirmText = "OK",
    cancelText = "Cancel",
  } = {}) {
    return new Promise((resolve) => {
      const msg = document.createElement("p");
      msg.textContent = String(message || "");
      const cancelBtn = document.createElement("button");
      cancelBtn.className = "btn-secondary";
      cancelBtn.textContent = cancelText;
      const okBtn = document.createElement("button");
      okBtn.className = "btn-primary";
      okBtn.textContent = confirmText;
      const { remove } = this._buildDynamicModal({
        title,
        contentNode: msg,
        actions: [cancelBtn, okBtn],
      });
      cancelBtn.addEventListener("click", () => {
        remove();
        resolve(false);
      });
      okBtn.addEventListener("click", () => {
        remove();
        resolve(true);
      });
    });
  }

  async showPrompt(message, defaultValue = "", title = "Input", {
    confirmText = "OK",
    cancelText = "Cancel",
    placeholder = "",
  } = {}) {
    return new Promise((resolve) => {
      const wrapper = document.createElement("div");
      const label = document.createElement("div");
      label.className = "quiz-field-label";
      label.textContent = String(message || "");
      const field = document.createElement("div");
      field.className = "quiz-field";
      const input = document.createElement("input");
      input.type = "text";
      input.value = String(defaultValue || "");
      if (placeholder) input.placeholder = placeholder;
      field.appendChild(input);
      wrapper.appendChild(label);
      wrapper.appendChild(field);

      const cancelBtn = document.createElement("button");
      cancelBtn.className = "btn-secondary";
      cancelBtn.textContent = cancelText;
      const okBtn = document.createElement("button");
      okBtn.className = "btn-primary";
      okBtn.textContent = confirmText;
      const { overlay, remove } = this._buildDynamicModal({
        title,
        contentNode: wrapper,
        actions: [cancelBtn, okBtn],
      });

      const submit = () => {
        const val = String(input.value || "").trim();
        remove();
        resolve(val);
      };

      cancelBtn.addEventListener("click", () => {
        remove();
        resolve(null);
      });
      okBtn.addEventListener("click", submit);
      overlay.addEventListener("keydown", (e) => {
        if (e.key === "Enter") submit();
        if (e.key === "Escape") {
          remove();
          resolve(null);
        }
      });

      // focus input shortly after mount
      setTimeout(() => input.focus(), 0);
    });
  }

  // Settings: Theme
  applyTheme(theme) {
    const root = document.documentElement;
    const normalized = (theme || "dark").toLowerCase();
    if (normalized === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
    try {
      localStorage.setItem("theme", normalized);
    } catch (e) {}
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Settings: open specific modals from settings page
  openSettingsTheme() {
    // sync selector value before showing
    const current = (localStorage.getItem("theme") || "dark").toLowerCase();
    const select = document.getElementById("themeSelect");
    if (select) select.value = current;
    this.openModal("settingsThemeModal");
  }

  openSettingsAudio() {
    // sync audio controls before showing
    if (window.audioManager) {
      const muteBtn = document.getElementById('audioMuteToggle');
      const muteIcon = document.getElementById('audioMuteIcon');
      const muteText = document.getElementById('audioMuteText');
      const volumeSlider = document.getElementById('audioVolumeSlider');
      const volumeValue = document.getElementById('audioVolumeValue');
      
      if (muteBtn && muteIcon && muteText) {
        if (window.audioManager.isMuted) {
          muteIcon.setAttribute('data-lucide', 'volume-x');
          muteText.textContent = 'Muted';
        } else {
          muteIcon.setAttribute('data-lucide', 'volume-2');
          muteText.textContent = 'Unmuted';
        }
      }
      
      if (volumeSlider && volumeValue) {
        volumeSlider.value = Math.round(window.audioManager.volume * 100);
        volumeValue.textContent = Math.round(window.audioManager.volume * 100) + '%';
      }
      
      // Refresh icons
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
    this.openModal("settingsAudioModal");
  }

  openSettingsData() {
    this.openModal("settingsDataModal");
  }

  openSettingsDataHelp() {
    this.openModal("settingsDataHelpModal");
  }

  openSettingsDataHelp() {
    this.openModal("settingsDataHelpModal");
  }

  openSettingsDataHelp() {
    this.openModal("settingsDataHelpModal");
  }

  openSettingsHelp() {
    this.openModal("settingsHelpModal");
  }

  openSettingsAbout() {
    this.openModal("settingsAboutModal");
  }

  openSettingsUpdate() {
    this.openModal("settingsUpdateModal");
    this.updateUpdateModalInfo();
  }

  updateUpdateModalInfo() {
    // Update the modal with current service worker status
    const currentAppVersion = document.getElementById("currentAppVersion");
    const swStatus = document.getElementById("swStatus");
    const updateStatus = document.getElementById("updateStatus");
    const checkUpdateBtn = document.getElementById("checkUpdateBtn");
    
         if (currentAppVersion) {
       currentAppVersion.textContent = "1.5.0"; // This could be made dynamic
     }
    
    if (swStatus && window.swManager) {
      if (window.swManager.registration) {
        swStatus.textContent = "Active";
        swStatus.style.color = "var(--color-success)";
      } else {
        swStatus.textContent = "Not Available";
        swStatus.style.color = "var(--color-error)";
      }
    }
    
    // Hide any previous update status
    if (updateStatus) {
      updateStatus.style.display = "none";
    }
    
    // Enable the check update button
    if (checkUpdateBtn) {
      checkUpdateBtn.disabled = false;
      checkUpdateBtn.innerHTML = '<i data-lucide="refresh-cw" width="20" height="20"></i> Check for Updates';
    }
  }

  // Settings: Data Management
  async exportAllData() {
    const model = (this.quizController || window.quizController).model;
    const zip = new JSZip();
    // Root-level metadata
    const meta = {
      exportedAt: new Date().toISOString(),
      version: 1,
      counts: {
        quizzes: (model && model.quizzes) ? model.quizzes.size : 0,
        folders: (model && model.folders) ? model.folders.size : 0,
      }
    };
    zip.file("meta.json", JSON.stringify(meta, null, 2));

    // Folders
    const foldersArr = Array.from((model && model.folders) ? model.folders.entries() : []);
    zip.file("folders.json", JSON.stringify(foldersArr, null, 2));

    // Quizzes organized by type
    const byType = {
      "mc-quiz": zip.folder("quizzes/mc-quiz"),
      "ej-quiz": zip.folder("quizzes/ej-quiz"),
      "rd-quiz": zip.folder("quizzes/rd-quiz"),
      "ws-quiz": zip.folder("quizzes/ws-quiz"),
      "unknown": zip.folder("quizzes/unknown"),
    };
    const sanitize = (s) => String(s || "quiz").replace(/[^a-z0-9-_]+/gi, "_");
    const quizzesArr = Array.from((model && model.quizzes) ? model.quizzes.values() : []);

    // Read user-selected type filters from Data Management modal
    const typeFilters = {
      "mc-quiz": !!document.getElementById("exportTypeMc")?.checked,
      "ej-quiz": !!document.getElementById("exportTypeEj")?.checked,
      "rd-quiz": !!document.getElementById("exportTypeRd")?.checked,
      "ws-quiz": !!document.getElementById("exportTypeWs")?.checked,
    };
    const anyChecked = Object.values(typeFilters).some(Boolean);
    // Track used filenames to avoid duplicates
    const usedFilenames = new Set();
    
    quizzesArr.forEach((quiz) => {
      if (anyChecked) {
        // Only include selected types
        if (!typeFilters[quiz.type]) return;
      }
      const type = byType[quiz.type] ? quiz.type : "unknown";
      
      // Generate unique filename
      let filename = `${sanitize(quiz.name)}.json`;
      let counter = 1;
      while (usedFilenames.has(filename)) {
        filename = `${sanitize(quiz.name)}_${counter}.json`;
        counter++;
      }
      usedFilenames.add(filename);
      
      // Include folder information in the exported quiz data
      const quizData = { ...quiz };
      if (quiz.folderId) {
        quizData.folderId = quiz.folderId;
      }
      byType[type].file(filename, JSON.stringify(quizData, null, 2));
    });

    const blob = await zip.generateAsync({ type: "blob" });
    {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quiz-manager-export-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  }

  async importAllDataFromFiles(event) {
    const files = Array.from((event && event.target && event.target.files) || []);
    if (!files.length) return;

    const failedFiles = [];
    const importedQuizIds = [];
    const model = (this.quizController || window.quizController).model;
    const importController = window.importController || this.importController;

    const readFileAsText = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(String(e.target.result || ""));
      reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
      reader.readAsText(file);
    });

    const processJson = async (name, text) => {
      try {
        const data = JSON.parse(text);
        // If this is a legacy full-dump (quizzes/folders arrays)
        if (data && (data.quizzes || data.folders)) {
          if (Array.isArray(data.quizzes)) model.quizzes = new Map(data.quizzes);
          if (Array.isArray(data.folders)) model.folders = new Map(data.folders);
          if (typeof model.saveQuizzes === "function") await model.saveQuizzes();
          if (typeof model.saveFolders === "function") await model.saveFolders();
          return { ok: true, imported: 0 };
        }

        // Otherwise treat as individual quiz JSON
        const isFullQuiz = data && typeof data === "object" && Array.isArray(data.questions) && typeof data.type === "string";
        if (isFullQuiz) {
          const type = data.type;
          // Extract just the filename without path and extension
          const base = String(name || "").split('/').pop().replace(/\.[^/.]+$/, "");
          const quizName = (base && base.trim()) || data.name || "Imported Quiz";
          const quiz = model.createQuiz(quizName, type, null, "medium");
          quiz.questions = (Array.isArray(data.questions) ? data.questions : []).map((q) => importController.normalizeQuestion(q, type));
          
          // Restore folder assignment if it exists in the exported data
          if (data.folderId && typeof model.assignQuizToFolder === "function") {
            // Check if the folder still exists before assigning
            if (model.folders && model.folders.has(data.folderId)) {
              model.assignQuizToFolder(quiz.id, data.folderId);
            } else {
              console.warn(`Folder ${data.folderId} not found for quiz ${quizName}, quiz will be unassigned`);
            }
          }
          
          model.saveQuiz(quiz);
          importedQuizIds.push(quiz.id);
          return { ok: true, imported: 1 };
        }

        // Question-only
        const quizType = importController.detectQuizType(data);
        if (quizType) {
          // Extract just the filename without path and extension
          const base = String(name || "").split('/').pop().replace(/\.[^/.]+$/, "");
          const inferredName = (base && base.trim()) || "Imported Quiz";
          const quiz = model.createQuiz(inferredName, quizType, null, "medium");
          if (Array.isArray(data)) {
            quiz.questions = data.map((item) => importController.convertToQuestion(item, quizType));
          } else {
            quiz.questions = [importController.convertToQuestion(data, quizType)];
          }
          
          // Restore folder assignment if it exists in the exported data
          if (data.folderId && typeof model.assignQuizToFolder === "function") {
            // Check if the folder still exists before assigning
            if (model.folders && model.folders.has(data.folderId)) {
              model.assignQuizToFolder(quiz.id, data.folderId);
            } else {
              console.warn(`Folder ${data.folderId} not found for quiz ${inferredName}, quiz will be unassigned`);
            }
          }
          
          model.saveQuiz(quiz);
          importedQuizIds.push(quiz.id);
          return { ok: true, imported: 1 };
        }
      } catch (_e) {}
      return { ok: false };
    };

    // Handle .zip files using JSZip (lazy-loaded)
    const zipFiles = files.filter((f) => /\.zip$/i.test(f.name));
    const looseFiles = files.filter((f) => !/\.zip$/i.test(f.name));

    // Process loose JSON files first
    for (const file of looseFiles) {
      try {
        const text = await readFileAsText(file);
        const res = await processJson(file.name, text);
        if (!res.ok) failedFiles.push(file.name);
      } catch (_e) {
        failedFiles.push(file.name);
      }
    }

    // Process ZIP archives
    for (const file of zipFiles) {
      try {

        const arrayBuffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);
        
        // First, import folders to restore structure
        const foldersEntry = zip.file("folders.json");
        console.log('Folders entry found:', !!foldersEntry);
        if (foldersEntry) {
          try {
            const foldersText = await foldersEntry.async("text");
            const foldersData = JSON.parse(foldersText);
            console.log('Folders data:', foldersData);
            if (Array.isArray(foldersData)) {
              model.folders = new Map(foldersData);
              console.log('Imported folders:', model.folders.size);
              if (typeof model.saveFolders === "function") {
                await model.saveFolders();
              }
            }
          } catch (_e) {
            console.error('Error importing folders:', _e);
            failedFiles.push(`${file.name}::folders.json`);
          }
        }
        
        // Debug: Log all files in the ZIP to see the structure
        console.log('All files in ZIP:', Object.values(zip.files).map(f => ({ name: f.name, dir: f.dir, size: f._data.uncompressedSize })));
        
        // Then import quizzes - be more inclusive with the filter
        const quizEntries = Object.values(zip.files).filter((f) => 
          !f.dir && 
          /\.json$/i.test(f.name) && 
          !f.name.match(/^(meta|folders)\.json$/i) && // Skip root-level metadata files
          !f.name.endsWith('/') // Ensure it's not a directory marker
        );
        
        // Debug logging to see what files we're finding
        console.log('Found quiz entries:', quizEntries.map(f => f.name));
        console.log('Total quiz entries found:', quizEntries.length);
        
        for (const entry of quizEntries) {
          try {
            console.log(`Processing quiz entry: ${entry.name}`);
            const text = await entry.async("text");
            const res = await processJson(entry.name, text);
            console.log(`Process result for ${entry.name}:`, res);
            if (!res.ok) failedFiles.push(`${file.name}::${entry.name}`);
          } catch (_e) {
            console.error(`Error processing ${entry.name}:`, _e);
            failedFiles.push(`${file.name}::${entry.name}`);
          }
        }
        
        // Show import summary with folder info
        const metaEntry = zip.file("meta.json");
        if (metaEntry) {
          try {
            const metaText = await metaEntry.async("text");
            const metaData = JSON.parse(metaText);
            console.log(`Imported from export created at: ${metaData.exportedAt}`);
            console.log(`Original export contained: ${metaData.counts?.folders || 0} folders, ${metaData.counts?.quizzes || 0} quizzes`);
          } catch (_e) {
            // Meta file parsing failure is not critical
          }
        }
      } catch (_e) {
        failedFiles.push(file.name);
      }
    }

    // Persist changes and refresh UI
    if (typeof model.saveQuizzes === "function") await model.saveQuizzes();
    if (typeof model.saveFolders === "function") await model.saveFolders();
    if (this.folderController) {
      if (typeof this.folderController.loadFolders === "function") this.folderController.loadFolders();
      if (typeof this.folderController.loadRecentQuizzes === "function") this.folderController.loadRecentQuizzes();
    }

    // Show result modal
    const okCount = importedQuizIds.length;
    const failCount = failedFiles.length;
    const folderCount = model.folders ? model.folders.size : 0;
    const summary = document.getElementById("dataImportSummaryText");
    if (summary) {
      let summaryText = `Imported ${okCount} quiz${okCount === 1 ? "" : "zes"}`;
      if (folderCount > 0) {
        summaryText += ` and ${folderCount} folder${folderCount === 1 ? "" : "s"}`;
      }
      if (failCount > 0) {
        summaryText += `, ${failCount} failed`;
      }
      summaryText += ".";
      summary.textContent = summaryText;
    }
    const failedContainer = document.getElementById("dataImportFailedListContainer");
    const failedList = document.getElementById("dataImportFailedList");
    if (failedContainer && failedList) {
      if (failCount) {
        failedContainer.style.display = "block";
        failedList.innerHTML = failedFiles.map((n) => `<li>${n}</li>`).join("");
      } else {
        failedContainer.style.display = "none";
        failedList.innerHTML = "";
      }
    }
    this.openModal("dataImportResultModal");

    // reset input so same files can be selected again later
    if (event && event.target) event.target.value = "";
  }

  async clearAllData() {
    const ok = await this.showConfirm("This will erase all quizzes and folders. Continue?", "Confirm", { confirmText: "Yes, clear", cancelText: "Cancel" });
    if (!ok) return;
    const model = (this.quizController || window.quizController).model;
    if (model) {
      model.quizzes = new Map();
      model.folders = new Map();
      if (typeof model.saveQuizzes === "function") model.saveQuizzes();
      if (typeof model.saveFolders === "function") model.saveFolders();
    }
    if (this.quizController) {
      this.quizController.model.loadFromStorage();
      if (this.folderController) this.folderController.loadFolders();
    }
    this.showAlert("All data cleared");
  }

  closeModal(modalId) {
    document.getElementById(modalId).classList.remove("open");
  }

  openImportModal() {
    // Check if we're in play mode with an active session
    if (this.playController && this.playController.session && this.playController.session.currentIndex > 0 && !this.playController.isQuizCompleted) {
      if (typeof this.showAlert === "function") {
        this.showAlert(
          "Please finish or exit your current quiz before importing quizzes.",
          "Navigation Blocked"
        );
      } else {
        alert("Please finish or exit your current quiz before importing quizzes.");
      }
      return;
    }

    this.openModal("importModal");
  }

  openCreateModal() {
    // Check if we're in play mode with an active session
    if (this.playController && this.playController.session && this.playController.session.currentIndex > 0 && !this.playController.isQuizCompleted) {
      if (typeof this.showAlert === "function") {
        this.showAlert(
          "Please finish or exit your current quiz before creating a new one.",
          "Navigation Blocked"
        );
      } else {
        alert("Please finish or exit your current quiz before creating a new quiz.");
      }
      return;
    }

    if (this.folderController) this.folderController.loadFoldersToSelect();
    this.openModal("createModal");
  }

  openPlayModal() {
    // Check if we're in play mode with an active session
    if (this.playController && this.playController.session && this.playController.session.currentIndex > 0 && !this.playController.isQuizCompleted) {
      if (typeof this.showAlert === "function") {
        this.showAlert(
          "Please finish or exit your current quiz before starting a new one.",
          "Navigation Blocked"
        );
      } else {
        alert("Please finish or exit your current quiz before starting a new one.");
      }
      return;
    }

    if (this.playController) this.playController.loadFolders();
    // Reset quiz select display to show the placeholder each time
    const select = document.getElementById("playQuizSelect");
    if (select) {
      select.innerHTML = '<option value="">Select a quiz...</option>';
    }
    this.openModal("playModal");
  }

  openImportResultModal(quizId) {
    this.importedQuizId = quizId;
    if (this.folderController) {
      // Populate the folder selector in the import result modal
      this.folderController.loadFoldersToSelectById("importResultFolderSelect");
    }
    this.openModal("importResultModal");
  }

  openBatchImportResultModal(importedQuizIds = [], failedCount = 0) {
    this.importedQuizIdsBatch = Array.isArray(importedQuizIds) ? importedQuizIds : [];
    this.importFailedCount = Number(failedCount) || 0;
    // Populate summary text
    const summary = document.getElementById("batchImportSummaryText");
    if (summary) {
      const ok = this.importedQuizIdsBatch.length;
      const fail = this.importFailedCount;
      summary.textContent = `${ok} imported${fail ? `, ${fail} failed` : ""}.`;
    }
    // Populate folder selector
    if (this.folderController) {
      this.folderController.loadFoldersToSelectById("batchImportFolderSelect");
    }
    this.openModal("batchImportResultModal");
  }

  batchImportOpenCreateFolder() {
    // Ensure the created folder will be preselected in this select
    if (this.folderController) {
      this.folderController._afterCreateSelectId = "batchImportFolderSelect";
      this.folderController.openCreateFolderModal();
    }
  }

  confirmBatchImportAssign() {
    const model = (this.quizController || window.quizController).model;
    const select = document.getElementById("batchImportFolderSelect");
    const folderId = select ? select.value : "";
    if (model && typeof model.assignQuizToFolder === "function" && this.importedQuizIdsBatch && this.importedQuizIdsBatch.length) {
      for (const quizId of this.importedQuizIdsBatch) {
        model.assignQuizToFolder(quizId, folderId || null);
      }
    }
    if (this.folderController && typeof this.folderController.loadRecentQuizzes === "function") {
      this.folderController.loadRecentQuizzes();
      if (typeof this.folderController.loadFolders === "function") this.folderController.loadFolders();
    }
    this.closeModal("batchImportResultModal");
    this.importedQuizIdsBatch = [];
    this.importFailedCount = 0;
  }

  confirmImportCancel() {
    this.closeModal("importResultModal");
    this.importedQuizId = null;
  }

  confirmImportEdit() {
    const quizId = this.importedQuizId;
    if (!quizId) return;
    const select = document.getElementById("importResultFolderSelect");
    const folderId = select ? select.value : "";
    const model = (this.quizController || window.quizController).model;
    if (model && typeof model.assignQuizToFolder === "function") {
      model.assignQuizToFolder(quizId, folderId || null);
    }
    if (this.routerController) {
      this.routerController.goToQuizEditor(quizId);
    } else {
      const quiz = model.quizzes.get(quizId);
      if (quiz && this.quizController) {
        this.quizController.openEditor(quiz);
      }
    }
    this.closeModal("importResultModal");
    this.importedQuizId = null;
  }

  confirmImportPlay() {
    // Check if we're in play mode with an active session
    if (this.playController && this.playController.session && this.playController.session.currentIndex > 0 && !this.playController.isQuizCompleted) {
      if (typeof this.showAlert === "function") {
        this.showAlert(
          "Please finish or exit your current quiz before starting a new one.",
          "Navigation Blocked"
        );
      } else {
        alert("Please finish or exit your current quiz before starting a new one.");
      }
      return;
    }

    const quizId = this.importedQuizId;
    if (!quizId) return;
    const select = document.getElementById("importResultFolderSelect");
    const folderId = select ? select.value : "";
    const model = (this.quizController || window.quizController).model;
    if (model && typeof model.assignQuizToFolder === "function") {
      model.assignQuizToFolder(quizId, folderId || null);
    }
    if (this.routerController) {
      this.routerController.goToQuizPlay(quizId);
    } else if (this.playController && typeof this.playController.startQuizById === "function") {
      this.playController.startQuizById(quizId);
    }
    this.closeModal("importResultModal");
    this.importedQuizId = null;
  }

  openQuizOptions() {
    // Check if we're in play mode with an active session
    if (this.playController && this.playController.session && this.playController.session.currentIndex > 0 && !this.playController.isQuizCompleted) {
      if (typeof this.showAlert === "function") {
        this.showAlert(
          "Please finish or exit your current quiz before accessing quiz options.",
          "Navigation Blocked"
        );
      } else {
        alert("Please finish or exit your current quiz before accessing quiz options.");
      }
      return;
    }

    this.openModal("quizOptionsModal");
  }

  // Recent quiz options
  openRecentQuizOptions(event, quizId) {
    // Check if we're in play mode with an active session
    if (this.playController && this.playController.session && this.playController.session.currentIndex > 0 && !this.playController.isQuizCompleted) {
      if (typeof this.showAlert === "function") {
        this.showAlert(
          "Please finish or exit your current quiz before accessing quiz options.",
          "Navigation Blocked"
        );
      } else {
        alert("Please finish or exit your current quiz before accessing quiz options.");
      }
      return;
    }

    event.stopPropagation();
    this.activeRecentQuizId = quizId;
    this.openModal("recentQuizOptionsModal");
  }

  recentAddToFolder() {
    const model = (this.quizController || window.quizController).model;
    const quizId = this.activeRecentQuizId;
    if (!quizId) return;
    // Reuse create modal's folder select population
    if (this.folderController) this.folderController.loadFoldersToSelectById("recentFolderSelect");
    this.openModal("recentAddToFolderModal");
  }

  confirmRecentAddToFolder() {
    const model = (this.quizController || window.quizController).model;
    const select = document.getElementById("recentFolderSelect");
    const folderId = select ? select.value : "";
    if (model && typeof model.assignQuizToFolder === "function" && this.activeRecentQuizId) {
      model.assignQuizToFolder(this.activeRecentQuizId, folderId || null);
    }
    if (this.folderController && typeof this.folderController.loadRecentQuizzes === "function") {
      this.folderController.loadRecentQuizzes();
      this.folderController.loadFolders();
    }
    this.closeModal("recentAddToFolderModal");
  }

  async recentRename() {
    const model = (this.quizController || window.quizController).model;
    const quiz = model && this.activeRecentQuizId ? model.quizzes.get(this.activeRecentQuizId) : null;
    if (!quiz) return;
    const newName = await this.showPrompt("Enter new quiz name:", quiz.name, "Rename Quiz", { confirmText: "Rename", cancelText: "Cancel" });
    if (!newName) return;
    quiz.name = newName;
    model.saveQuiz(quiz);
    if (this.folderController && typeof this.folderController.loadRecentQuizzes === "function") {
      this.folderController.loadRecentQuizzes();
    }
    this.closeModal("recentQuizOptionsModal");
  }

  recentExport() {
    const model = (this.quizController || window.quizController).model;
    const quiz = model && this.activeRecentQuizId ? model.quizzes.get(this.activeRecentQuizId) : null;
    if (!quiz) return;
    const payload = { ...quiz };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${quiz.name.replace(/[^a-z0-9-_]+/gi, "_") || "quiz"}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    this.closeModal("recentQuizOptionsModal");
  }

  recentPlay() {
    // Check if we're in play mode with an active session
    if (this.playController && this.playController.session && this.playController.session.currentIndex > 0 && !this.playController.isQuizCompleted) {
      if (typeof this.showAlert === "function") {
        this.showAlert(
          "Please finish or exit your current quiz before starting a new one.",
          "Navigation Blocked"
        );
      } else {
        alert("Please finish or exit your current quiz before starting a new one.");
      }
      return;
    }

    const quizId = this.activeRecentQuizId;
    if (!quizId) return;
    if (this.routerController) {
      this.routerController.goToQuizPlay(quizId);
    } else if (this.playController && typeof this.playController.startQuizById === "function") {
      this.playController.startQuizById(quizId);
    }
    this.closeModal("recentQuizOptionsModal");
    this.hideSidebar();
  }

  async recentDelete() {
    const model = (this.quizController || window.quizController).model;
    const quiz = model && this.activeRecentQuizId ? model.quizzes.get(this.activeRecentQuizId) : null;
    if (!quiz) return;
    const ok = await this.showConfirm(`Delete quiz "${quiz.name}"?`, "Delete Quiz", { confirmText: "Delete", cancelText: "Cancel" });
    if (!ok) return;
    model.deleteQuiz(quiz.id);
    if (this.folderController && typeof this.folderController.loadRecentQuizzes === "function") {
      this.folderController.loadRecentQuizzes();
      this.folderController.loadFolders();
    }
    this.closeModal("recentQuizOptionsModal");
  }

  // Folder Quiz Options
  openFolderQuizOptions(event, quizId) {
    // Check if we're in play mode with an active session
    if (this.playController && this.playController.session && this.playController.session.currentIndex > 0 && !this.playController.isQuizCompleted) {
      if (typeof this.showAlert === "function") {
        this.showAlert(
          "Please finish or exit your current quiz before accessing quiz options.",
          "Navigation Blocked"
        );
      } else {
        alert("Please finish or exit your current quiz before accessing quiz options.");
      }
      return;
    }

    event.stopPropagation();
    this.activeFolderQuizId = quizId;
    this.openModal("folderQuizOptionsModal");
  }

  folderQuizPlay() {
    // Check if we're in play mode with an active session
    if (this.playController && this.playController.session && this.playController.session.currentIndex > 0 && !this.playController.isQuizCompleted) {
      if (typeof this.showAlert === "function") {
        this.showAlert(
          "Please finish or exit your current quiz before starting a new one.",
          "Navigation Blocked"
        );
      } else {
        alert("Please finish or exit your current quiz before starting a new one.");
      }
      return;
    }

    const quizId = this.activeFolderQuizId;
    if (!quizId) return;
    if (this.routerController) {
      this.routerController.goToQuizPlay(quizId);
    } else if (this.playController && typeof this.playController.startQuizById === "function") {
      this.playController.startQuizById(quizId);
    }
    this.closeModal("folderQuizOptionsModal");
    this.hideSidebar();
  }

  async folderQuizRename() {
    const model = (this.quizController || window.quizController).model;
    const quiz = model && this.activeFolderQuizId ? model.quizzes.get(this.activeFolderQuizId) : null;
    if (!quiz) return;
    const newName = await this.showPrompt("Enter new quiz name:", quiz.name, "Rename Quiz", { confirmText: "Rename", cancelText: "Cancel" });
    if (!newName) return;
    quiz.name = newName;
    model.saveQuiz(quiz);
    if (this.folderController && typeof this.folderController.renderFolderPage === "function") {
      this.folderController.renderFolderPage(this.folderController.activeFolderId);
    }
    this.closeModal("folderQuizOptionsModal");
  }

  folderQuizExport() {
    const model = (this.quizController || window.quizController).model;
    const quiz = model && this.activeFolderQuizId ? model.quizzes.get(this.activeFolderQuizId) : null;
    if (!quiz) return;
    const payload = { ...quiz };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${quiz.name.replace(/[^a-z0-9-_]+/gi, "_") || "quiz"}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    this.closeModal("folderQuizOptionsModal");
  }

  async folderQuizDelete() {
    const model = (this.quizController || window.quizController).model;
    const quiz = model && this.activeFolderQuizId ? model.quizzes.get(this.activeFolderQuizId) : null;
    if (!quiz) return;
    const ok = await this.showConfirm(`Delete quiz "${quiz.name}"?`, "Delete Quiz", { confirmText: "Delete", cancelText: "Cancel" });
    if (!ok) return;
    model.deleteQuiz(quiz.id);
    if (this.folderController && typeof this.folderController.renderFolderPage === "function") {
      this.folderController.renderFolderPage(this.folderController.activeFolderId);
    }
    this.closeModal("folderQuizOptionsModal");
  }

  async folderQuizRemoveFromFolder() {
    const model = (this.quizController || window.quizController).model;
    const quiz = model && this.activeFolderQuizId ? model.quizzes.get(this.activeFolderQuizId) : null;
    if (!quiz) return;
    const ok = await this.showConfirm(`Remove "${quiz.name}" from this folder?`, "Remove from Folder", { confirmText: "Remove", cancelText: "Cancel" });
    if (!ok) return;
    if (model && typeof model.assignQuizToFolder === "function") {
      model.assignQuizToFolder(this.activeFolderQuizId, null);
    }
    if (this.folderController && typeof this.folderController.renderFolderPage === "function") {
      this.folderController.renderFolderPage(this.folderController.activeFolderId);
    }
    this.closeModal("folderQuizOptionsModal");
  }

  // Quiz Options actions
  actionQuizJump() {
    // Check if we're in play mode with an active session
    if (this.playController && this.playController.session && this.playController.session.currentIndex > 0 && !this.playController.isQuizCompleted) {
      if (typeof this.showAlert === "function") {
        this.showAlert(
          "Please finish or exit your current quiz before jumping to questions.",
          "Navigation Blocked"
        );
      } else {
        alert("Please finish or exit your current quiz before jumping to questions.");
      }
      return;
    }

    // Prefill jump input with current index + 1 and set bounds
    const model = (this.quizController || window.quizController).model;
    const input = document.getElementById("jumpQuestionInput");
    if (model && model.currentQuiz && input) {
      const total = model.currentQuiz.questions.length || 1;
      input.min = 1;
      input.max = total;
      input.value = (model.currentQuestionIndex || 0) + 1;
    }
    this.closeModal("quizOptionsModal");
    this.openModal("jumpToQuestionModal");
    // Ensure the input is focused so the keyboard shows on mobile
    setTimeout(() => {
      const el = document.getElementById("jumpQuestionInput");
      if (el) {
        el.focus();
        if (typeof el.select === "function") el.select();
      }
    }, 0);
  }

  confirmJumpToQuestion() {
    // Check if we're in play mode with an active session
    if (this.playController && this.playController.session && this.playController.session.currentIndex > 0 && !this.playController.isQuizCompleted) {
      if (typeof this.showAlert === "function") {
        this.showAlert(
          "Please finish or exit your current quiz before jumping to questions.",
          "Navigation Blocked"
        );
      } else {
        alert("Please finish or exit your current quiz before jumping to questions.");
      }
      return;
    }

    const model = (this.quizController || window.quizController).model;
    const input = document.getElementById("jumpQuestionInput");
    if (!model || !model.currentQuiz || !input) return;
    const total = model.currentQuiz.questions.length || 1;
    let target = parseInt(input.value, 10);
    if (isNaN(target)) return;
    target = Math.max(1, Math.min(total, target));
    if (this.quizController) this.quizController.jumpToQuestion(target - 1);
    this.closeModal("jumpToQuestionModal");
  }

  actionQuizPlay() {
    // Check if we're in play mode with an active session
    if (this.playController && this.playController.session && this.playController.session.currentIndex > 0 && !this.playController.isQuizCompleted) {
      if (typeof this.showAlert === "function") {
        this.showAlert(
          "Please finish or exit your current quiz before starting a new one.",
          "Navigation Blocked"
        );
      } else {
        alert("Please finish or exit your current quiz before starting a new one.");
      }
      return;
    }

    const model = (this.quizController || window.quizController).model;
    const quiz = model ? model.currentQuiz : null;
    if (!quiz) return;
    if (this.routerController) {
      this.routerController.goToQuizPlay(quiz.id);
    } else if (this.playController && typeof this.playController.startQuizById === "function") {
      this.playController.startQuizById(quiz.id);
    }
    this.closeModal("quizOptionsModal");
    this.hideSidebar();
  }

  actionQuizLock() {
    // Check if we're in play mode with an active session
    if (this.playController && this.playController.session && this.playController.session.currentIndex > 0 && !this.playController.isQuizCompleted) {
      if (typeof this.showAlert === "function") {
        this.showAlert(
          "Please finish or exit your current quiz before changing quiz settings.",
          "Navigation Blocked"
        );
      } else {
        alert("Please finish or exit your current quiz before changing quiz settings.");
      }
      return;
    }

    if (!this.quizController || !this.quizController.model.currentQuiz) {
      this.closeModal("quizOptionsModal");
      return;
    }

    const quiz = this.quizController.model.currentQuiz;
    quiz.locked = !quiz.locked;
    
    // Save the quiz to persist the lock state
    this.quizController.model.saveQuiz(quiz);
    
    // Update the lock indicator and re-render content to enforce readonly
    this.updateLockIndicator();
    if (this.quizController && typeof this.quizController.renderQuizContent === 'function') {
      this.quizController.renderQuizContent();
    }
    
    // Update the lock button text
    const lockButton = document.querySelector('[onclick="uiController.actionQuizLock()"]');
    if (lockButton) {
      const lockIcon = lockButton.querySelector('i');
      const lockText = lockButton.querySelector('span');
      if (lockIcon) {
        lockIcon.setAttribute('data-lucide', quiz.locked ? 'unlock' : 'lock');
      }
      if (lockText) {
        lockText.textContent = quiz.locked ? 'Unlock Quiz' : 'Lock Quiz';
      }
    }
    
    this.closeModal("quizOptionsModal");
  }

  actionQuizDelete() {
    // Check if we're in play mode with an active session
    if (this.playController && this.playController.session && this.playController.session.currentIndex > 0 && !this.playController.isQuizCompleted) {
      if (typeof this.showAlert === "function") {
        this.showAlert(
          "Please finish or exit your current quiz before deleting quizzes.",
          "Navigation Blocked"
        );
      } else {
        alert("Please finish or exit your current quiz before deleting quizzes.");
      }
      return;
    }

    this.closeModal("quizOptionsModal");
    this.openModal("confirmDeleteModal");
  }

  cancelDeleteQuiz() {
    this.closeModal("confirmDeleteModal");
  }

  confirmDeleteQuiz() {
    if (this.quizController) this.quizController.deleteCurrentQuiz();
    this.closeModal("confirmDeleteModal");
  }

  // Unsaved Changes modal controls
  promptUnsavedExit() {
    this.openModal("unsavedChangesModal");
  }

  cancelUnsavedExit() {
    this.closeModal("unsavedChangesModal");
  }

  confirmSaveAndExit() {
    if (!this.quizController) {
      this.closeModal("unsavedChangesModal");
      return;
    }
    // Save current quiz then exit editor
    this.quizController.saveQuiz();
    this.closeModal("unsavedChangesModal");
    if (typeof this.quizController.exitEditorForce === "function") {
      this.quizController.exitEditorForce();
    } else {
      this.quizController.exitEditor();
    }
  }

  // Exit without saving, keep unsaved state so Home shows "Back to Unsaved Quiz"
  confirmExitWithoutSaving() {
    // Ensure the back-to-unsaved button will be visible on Home
    if (this.quizController && this.quizController.model && this.quizController.model.unsavedQuiz) {
      this.updateBackToUnsavedButton(true);
    }
    this.closeModal("unsavedChangesModal");
    if (this.quizController && typeof this.quizController.exitEditorForce === "function") {
      this.quizController.exitEditorForce();
    } else if (this.quizController) {
      this.quizController.exitEditor();
    }
  }

  showHomePage() {
    // Check if we're in play mode with an active session
    if (this.playController && this.playController.session && this.playController.session.currentIndex > 0 && !this.playController.isQuizCompleted) {
      if (typeof this.showAlert === "function") {
        this.showAlert(
          "Please finish or exit your current quiz before navigating to other pages.",
          "Navigation Blocked"
        );
      } else {
        alert("Please finish or exit your current quiz before navigating to other pages.");
      }
      return;
    }

    const home = document.getElementById("homePage");
    const folder = document.getElementById("folderPage");
    const editor = document.getElementById("quizEditor");
    const settings = document.getElementById("settingsPage");
    const search = document.getElementById("searchPage");
    const results = document.getElementById("quizResultsPage");
    if (home) home.classList.remove("hidden");
    if (folder) folder.classList.add("hidden");
    if (editor) editor.classList.remove("active");
    if (settings) settings.classList.add("hidden");
    if (search) search.classList.add("hidden");
    if (results) results.classList.add("hidden");
    
    // Update welcome message with a random motivational message
    this.updateWelcomeMessage();
  }

  showQuizEditor() {
    // Check if we're in play mode with an active session
    if (this.playController && this.playController.session && this.playController.session.currentIndex > 0 && !this.playController.isQuizCompleted) {
      if (typeof this.showAlert === "function") {
        this.showAlert(
          "Please finish or exit your current quiz before navigating to other pages.",
          "Navigation Blocked"
        );
      } else {
        alert("Please finish or exit your current quiz before navigating to other pages.");
      }
      return;
    }

    const home = document.getElementById("homePage");
    const folder = document.getElementById("folderPage");
    const editor = document.getElementById("quizEditor");
    const settings = document.getElementById("settingsPage");
    const search = document.getElementById("searchPage");
    if (home) home.classList.add("hidden");
    if (folder) folder.classList.add("hidden");
    if (settings) settings.classList.add("hidden");
    if (search) search.classList.add("hidden");
    if (editor) editor.classList.add("active");
  }

  enterPlayUI(scoreText = "Score: 0/0") {
    const score = document.getElementById("scoreBadge");
    const saveBtn = document.getElementById("saveBtn");
    const addBtn = document.getElementById("addBtn");
    const submitBtn = document.getElementById("submitBtn");
    if (score) {
      score.textContent = scoreText;
      score.classList.remove("hidden");
    }
    if (saveBtn) saveBtn.classList.add("hidden");
    if (addBtn) addBtn.classList.add("hidden");
    if (submitBtn) submitBtn.classList.remove("hidden");
  }

  exitPlayUI() {
    // Check if we're in play mode with an active session
    if (this.playController && this.playController.session && this.playController.session.currentIndex > 0 && !this.playController.isQuizCompleted) {
      if (typeof this.showAlert === "function") {
        this.showAlert(
          "Please finish or exit your current quiz before leaving play mode.",
          "Exit Blocked"
        );
      } else {
        alert("Please finish or exit your current quiz before leaving play mode.");
      }
      return;
    }

    const score = document.getElementById("scoreBadge");
    const saveBtn = document.getElementById("saveBtn");
    const addBtn = document.getElementById("addBtn");
    const submitBtn = document.getElementById("submitBtn");
    if (score) score.classList.add("hidden");
    if (saveBtn) saveBtn.classList.remove("hidden");
    if (addBtn) addBtn.classList.remove("hidden");
    if (submitBtn) submitBtn.classList.add("hidden");
  }

  showResultsPage() {
    // Check if we're in play mode with an active session
    if (this.playController && this.playController.session && this.playController.session.currentIndex > 0 && !this.playController.isQuizCompleted) {
      if (typeof this.showAlert === "function") {
        this.showAlert(
          "Please finish or exit your current quiz before navigating to other pages.",
          "Navigation Blocked"
        );
      } else {
        alert("Please finish or exit your current quiz before navigating to other pages.");
      }
      return;
    }

    const home = document.getElementById("homePage");
    const folder = document.getElementById("folderPage");
    const editor = document.getElementById("quizEditor");
    const settings = document.getElementById("settingsPage");
    const search = document.getElementById("searchPage");
    const results = document.getElementById("quizResultsPage");
    
    if (home) home.classList.add("hidden");
    if (folder) folder.classList.add("hidden");
    if (editor) editor.classList.remove("active");
    if (settings) settings.classList.add("hidden");
    if (search) search.classList.add("hidden");
    if (results) results.classList.remove("hidden");
    
    // Refresh icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  updateLockIndicator() {
    if (!this.quizController || !this.quizController.model.currentQuiz) return;
    
    const quiz = this.quizController.model.currentQuiz;
    const lockIndicator = document.getElementById('lockIndicator');
    
    if (lockIndicator) {
      if (quiz.locked) {
        lockIndicator.innerHTML = '<i data-lucide="lock" width="16" height="16"></i>';
        lockIndicator.classList.remove('hidden');
        lockIndicator.title = 'Quiz is locked - click to unlock';
        
        // Add click handler to unlock
        lockIndicator.onclick = () => this.toggleLock();
      } else {
        lockIndicator.classList.add('hidden');
        lockIndicator.onclick = null;
      }
      
      // Refresh icons
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  }

  toggleLock() {
    if (!this.quizController || !this.quizController.model.currentQuiz) return;
    
    const quiz = this.quizController.model.currentQuiz;
    quiz.locked = !quiz.locked;
    
    // Save the quiz to persist the lock state
    this.quizController.model.saveQuiz(quiz);
    
    // Update the lock indicator and re-render content to enforce readonly
    this.updateLockIndicator();
    if (this.quizController && typeof this.quizController.renderQuizContent === 'function') {
      this.quizController.renderQuizContent();
    }
    
    // Update the lock button text in options modal
    const lockButton = document.querySelector('[onclick="uiController.actionQuizLock()"]');
    if (lockButton) {
      const lockIcon = lockButton.querySelector('i');
      const lockText = lockButton.querySelector('span');
      if (lockIcon) {
        lockIcon.setAttribute('data-lucide', quiz.locked ? 'unlock' : 'lock');
      }
      if (lockText) {
        lockText.textContent = quiz.locked ? 'Unlock Quiz' : 'Lock Quiz';
      }
    }
  }

  updateBackToUnsavedButton(show) {
    const btn = document.getElementById("backToUnsavedBtn");
    if (show) {
      btn.classList.remove("hidden");
    } else {
      btn.classList.add("hidden");
    }
  }

  // Settings Page Navigation
  showSettingsPage() {
    // Check if we're in play mode with an active session
    if (this.playController && this.playController.session && this.playController.session.currentIndex > 0 && !this.playController.isQuizCompleted) {
      if (typeof this.showAlert === "function") {
        this.showAlert(
          "Please finish or exit your current quiz before navigating to other pages.",
          "Navigation Blocked"
        );
      } else {
        alert("Please finish or exit your current quiz before navigating to other pages.");
      }
      return;
    }

    const home = document.getElementById("homePage");
    const folder = document.getElementById("folderPage");
    const editor = document.getElementById("quizEditor");
    const settings = document.getElementById("settingsPage");
    const search = document.getElementById("searchPage");
    if (home) home.classList.add("hidden");
    if (folder) folder.classList.add("hidden");
    if (editor) editor.classList.remove("active");
    if (settings) settings.classList.remove("hidden");
    if (search) search.classList.add("hidden");
    
    // initialize theme select to current
    const current = (localStorage.getItem("theme") || "dark").toLowerCase();
    const select = document.getElementById("themeSelect");
    if (select) select.value = current;
    
    // Refresh icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  exitSettings() {
    // Check if we're in play mode with an active session
    if (this.playController && this.playController.session && this.playController.session.currentIndex > 0 && !this.playController.isQuizCompleted) {
      if (typeof this.showAlert === "function") {
        this.showAlert(
          "Please finish or exit your current quiz before navigating to other pages.",
          "Navigation Blocked"
        );
      } else {
        alert("Please finish or exit your current quiz before navigating to other pages.");
      }
      return;
    }

    // Use router to navigate to home and update URL
    if (this.routerController) {
      this.routerController.goToHome();
    } else {
      // Fallback to just showing home page if router is not available
      this.showHomePage();
    }
  }

  showFolderPage() {
    // Check if we're in play mode with an active session
    if (this.playController && this.playController.session && this.playController.session.currentIndex > 0 && !this.playController.isQuizCompleted) {
      if (typeof this.showAlert === "function") {
        this.showAlert(
          "Please finish or exit your current quiz before navigating to other pages.",
          "Navigation Blocked"
        );
      } else {
        alert("Please finish or exit your current quiz before navigating to other pages.");
      }
      return;
    }

    const home = document.getElementById("homePage");
    const folder = document.getElementById("folderPage");
    const editor = document.getElementById("quizEditor");
    const settings = document.getElementById("settingsPage");
    const search = document.getElementById("searchPage");
    if (home) home.classList.add("hidden");
    if (folder) folder.classList.remove("hidden");
    if (editor) editor.classList.remove("active");
    if (settings) settings.classList.add("hidden");
    if (search) search.classList.add("hidden");
    
    // refresh icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  showSearchPage(query = "", results = [], searchDetails = []) {
    // Check if we're in play mode with an active session
    if (this.playController && this.playController.session && this.playController.session.currentIndex > 0 && !this.playController.isQuizCompleted) {
      if (typeof this.showAlert === "function") {
        this.showAlert(
          "Please finish or exit your current quiz before navigating to other pages.",
          "Navigation Blocked"
        );
      } else {
        alert("Please finish or exit your current quiz before navigating to other pages.");
      }
      return;
    }

    const home = document.getElementById("homePage");
    const folder = document.getElementById("folderPage");
    const editor = document.getElementById("quizEditor");
    const settings = document.getElementById("settingsPage");
    const search = document.getElementById("searchPage");
    if (home) home.classList.add("hidden");
    if (folder) folder.classList.add("hidden");
    if (editor) editor.classList.remove("active");
    if (settings) settings.classList.add("hidden");
    if (search) search.classList.remove("hidden");

    // Update search page content
    const queryText = document.getElementById("searchQueryText");
    const resultsCount = document.getElementById("searchResultsCount");
    
    if (queryText) queryText.textContent = `"${query}"`;
    if (resultsCount) resultsCount.textContent = `${results.length} result${results.length !== 1 ? 's' : ''} found`;

    // Render search results
    if (window.searchController) {
      window.searchController.renderSearchResults(results, searchDetails);
    }

    // Refresh icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Search Result Options
  openSearchResultOptions(event, quizId) {
    // Check if we're in play mode with an active session
    if (this.playController && this.playController.session && this.playController.session.currentIndex > 0 && !this.playController.isQuizCompleted) {
      if (typeof this.showAlert === "function") {
        this.showAlert(
          "Please finish or exit your current quiz before accessing quiz options.",
          "Navigation Blocked"
        );
      } else {
        alert("Please finish or exit your current quiz before accessing quiz options.");
      }
      return;
    }

    event.stopPropagation();
    this.activeSearchResultId = quizId;
    this.openModal("searchResultOptionsModal");
  }

  searchResultPlay() {
    // Check if we're in play mode with an active session
    if (this.playController && this.playController.session && this.playController.session.currentIndex > 0 && !this.playController.isQuizCompleted) {
      if (typeof this.showAlert === "function") {
        this.showAlert(
          "Please finish or exit your current quiz before starting a new one.",
          "Navigation Blocked"
        );
      } else {
        alert("Please finish or exit your current quiz before starting a new one.");
      }
      return;
    }

    const quizId = this.activeSearchResultId;
    if (!quizId) return;
    if (this.routerController) {
      this.routerController.goToQuizPlay(quizId);
    } else if (this.playController && typeof this.playController.startQuizById === "function") {
      this.playController.startQuizById(quizId);
    }
    this.closeModal("searchResultOptionsModal");
  }

  searchResultEdit() {
    const model = (this.quizController || window.quizController).model;
    const quiz = model && this.activeSearchResultId ? model.quizzes.get(this.activeSearchResultId) : null;
    if (!quiz) return;
    if (this.routerController) {
      this.routerController.goToQuizEditor(this.activeSearchResultId);
    } else if (this.quizController) {
      this.quizController.openEditor(quiz);
    }
    this.closeModal("searchResultOptionsModal");
  }

  searchResultAddToFolder() {
    const model = (this.quizController || window.quizController).model;
    const quizId = this.activeSearchResultId;
    if (!quizId) return;
    // Reuse create modal's folder select population
    if (this.folderController) this.folderController.loadFoldersToSelectById("searchResultFolderSelect");
    this.openModal("searchResultAddToFolderModal");
  }

  confirmSearchResultAddToFolder() {
    const model = (this.quizController || window.quizController).model;
    const select = document.getElementById("searchResultFolderSelect");
    const folderId = select ? select.value : "";
    if (model && typeof model.assignQuizToFolder === "function" && this.activeSearchResultId) {
      model.assignQuizToFolder(this.activeSearchResultId, folderId || null);
    }
    this.closeModal("searchResultAddToFolderModal");
  }

  searchResultExport() {
    const model = (this.quizController || window.quizController).model;
    const quiz = model && this.activeSearchResultId ? model.quizzes.get(this.activeSearchResultId) : null;
    if (!quiz) return;
    const payload = { ...quiz };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${quiz.name.replace(/[^a-z0-9-_]+/gi, "_") || "quiz"}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    this.closeModal("searchResultOptionsModal");
  }

  async searchResultDelete() {
    const model = (this.quizController || window.quizController).model;
    const quiz = model && this.activeSearchResultId ? model.quizzes.get(this.activeSearchResultId) : null;
    if (!quiz) return;
    const ok = await this.showConfirm(`Delete quiz "${quiz.name}"?`, "Delete Quiz", { confirmText: "Delete", cancelText: "Cancel" });
    if (!ok) return;
    model.deleteQuiz(quiz.id);
    // Refresh search results
    if (window.searchController) {
      const query = document.getElementById("searchQueryText")?.textContent?.replace(/"/g, '') || '';
      if (query) {
        window.searchController.performSearch();
      }
    }
    this.closeModal("searchResultOptionsModal");
  }
}


