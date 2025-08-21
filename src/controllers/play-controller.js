export class PlayController {
  constructor(dependencies = {}) {
    this.currentScore = 0;
    this.totalQuestions = 0;
    this.quizController = dependencies.quizController;
    this.uiController = dependencies.uiController;
    this.routerController = dependencies.routerController;
    // Session state
    this.session = null;
    this.isQuizCompleted = false; // Track if quiz is completed
    
    // Set up navigation protection
    this._setupNavigationProtection();
  }

  _setupNavigationProtection() {
    // Protect against browser back/forward and page refresh
    if (typeof window !== 'undefined') {
      // Handle beforeunload (page refresh/close)
      window.addEventListener('beforeunload', (e) => {
        if (this._shouldPreventNavigation()) {
          e.preventDefault();
          e.returnValue = 'You have an active quiz session. Are you sure you want to leave?';
          return e.returnValue;
        }
      });

      // Handle popstate (browser back/forward)
      window.addEventListener('popstate', (e) => {
        if (this._shouldPreventNavigation()) {
          // Prevent the navigation by pushing the current state back
          if (this.routerController && typeof this.routerController.getCurrentRoute === 'function') {
            const currentRoute = this.routerController.getCurrentRoute();
            if (currentRoute && currentRoute.pathname) {
              history.pushState(null, '', currentRoute.pathname);
              // Show confirmation dialog
              this._showNavigationWarning();
            }
          }
        }
      });
    }
  }

  _shouldPreventNavigation() {
    // Only prevent navigation if we have an active session with progress AND quiz is not completed
    return this.session && this.session.currentIndex > 0 && !this.isQuizCompleted;
  }

  _showNavigationWarning() {
    if (this.uiController && typeof this.uiController.showAlert === "function") {
      this.uiController.showAlert(
        "Please use the Exit button to leave the quiz, or continue playing to save your progress.",
        "Navigation Blocked"
      );
    } else {
      alert("Please use the Exit button to leave the quiz, or continue playing to save your progress.");
    }
  }

  loadFolders() {
    const select = document.getElementById("playFolderSelect");
    const model = (this.quizController || window.quizController).model;
    const folders = Array.from(model.folders.values());

    select.innerHTML =
      '<option value="">Select a folder...</option>' +
      folders
        .map((folder) => `<option value="${folder.id}">${folder.name}</option>`) 
        .join("");
  }

  loadQuizzes() {
    const folderId = document.getElementById("playFolderSelect").value;
    const select = document.getElementById("playQuizSelect");

    if (!folderId) {
      select.innerHTML = '<option value="">Select a quiz...</option>';
      return;
    }

    const model = (this.quizController || window.quizController).model;
    const folder = model.folders.get(folderId);
    const quizzes = folder.quizzes
      .map((id) => model.quizzes.get(id))
      .filter((q) => q);

    select.innerHTML =
      '<option value="">Select a quiz...</option>' +
      quizzes
        .map((quiz) => `<option value="${quiz.id}">${this._labelForQuiz(quiz)}</option>`) 
        .join("");
  }

  startQuiz() {
    const quizId = document.getElementById("playQuizSelect").value;
    if (!quizId) {
      if (this.uiController && typeof this.uiController.showAlert === "function") {
        this.uiController.showAlert("Please select a quiz", "Play Quiz");
      } else {
        alert("Please select a quiz");
      }
      return;
    }

    const model = (this.quizController || window.quizController).model;
    const quiz = model.quizzes.get(quizId);
    if (!quiz) {
      if (this.uiController && typeof this.uiController.showAlert === "function") {
        this.uiController.showAlert("Quiz not found", "Play Quiz");
      } else {
        alert("Quiz not found");
      }
      return;
    }

    this._startSession(quiz);
    if (this.uiController) this.uiController.closeModal("playModal");
  }

  startQuizById(quizId) {
    const model = (this.quizController || window.quizController).model;
    const quiz = model.quizzes.get(quizId);
    if (!quiz) {
      if (this.uiController && typeof this.uiController.showAlert === "function") {
        this.uiController.showAlert("Quiz not found", "Play Quiz");
      } else {
        alert("Quiz not found");
      }
      return;
    }
    this._startSession(quiz);
  }

  _typeLabel(type) {
    const map = {
      "mc-quiz": "Multiple Choice",
      "ej-quiz": "Emoji",
      "rd-quiz": "Riddle",
      "ws-quiz": "Word Scramble",
    };
    return map[type] || type || "Unknown";
  }

  _labelForQuiz(quiz) {
    const name = quiz && quiz.name ? String(quiz.name) : "Untitled";
    const typeText = this._typeLabel(quiz && quiz.type);
    return `${name} — ${typeText}`;
  }

  randomPlay() {
    const model = (this.quizController || window.quizController).model;
    if (!model) return;

    const folderSelect = document.getElementById("playFolderSelect");
    const folderId = folderSelect ? folderSelect.value : "";

    let candidateQuizzes = [];
    if (folderId) {
      const folder = model.folders.get(folderId);
      const ids = (folder && Array.isArray(folder.quizzes)) ? folder.quizzes : [];
      candidateQuizzes = ids.map((id) => model.quizzes.get(id)).filter(Boolean);
    } else {
      candidateQuizzes = Array.from(model.quizzes.values());
    }

    if (!candidateQuizzes.length) {
      if (this.uiController && typeof this.uiController.showAlert === "function") {
        this.uiController.showAlert("No quizzes available to play", "Random Play");
      } else {
        alert("No quizzes available to play");
      }
      return;
    }

    const randomIndex = Math.floor(Math.random() * candidateQuizzes.length);
    const quiz = candidateQuizzes[randomIndex];
    this._startSession(quiz);
    if (this.uiController) this.uiController.closeModal("playModal");
  }

  _startSession(quiz) {
    this.currentScore = 0;
    this.totalQuestions = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
    this.isQuizCompleted = false; // Reset completion flag when starting new quiz
    this.session = {
      quizId: quiz.id,
      currentIndex: 0,
      score: 0,
      answers: {}, // index -> user answer or choice index
      results: {}, // index -> true/false
      mcShuffles: this._buildMcShuffles(quiz),
      startedAt: Date.now(),
      endedAt: null,
      isSubmitting: false, // Prevent multiple submissions
    };
    (this.quizController || window.quizController).openEditor(quiz, { playMode: true });
    if (this.uiController && typeof this.uiController.enterPlayUI === "function") {
      this.uiController.enterPlayUI(this._scoreText());
    }
    this.renderCurrentQuestion();
  }

  _buildMcShuffles(quiz) {
    if (!quiz || quiz.type !== "mc-quiz") return null;
    const shuffles = [];
    const total = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
    for (let i = 0; i < total; i++) {
      // No randomization - keep original order [0, 1, 2, 3]
      shuffles[i] = [0, 1, 2, 3];
    }
    return shuffles;
  }

  renderCurrentQuestion() {
    const qc = this.quizController || window.quizController;
    const model = qc.model;
    const quiz = model.currentQuiz;
    if (!quiz || !this.session) return;
    // Re-render via QuizController which will pass isPlayMode to the view
    qc.renderQuizContent();
    qc.renderQuizIndex();
    qc.updateNavigationButtons();
    this._refreshScoreBadge();
    const showSubmit = quiz.type !== "mc-quiz"; // hide submit for MC; text-based need submit
    this._syncSubmitVisibility(showSubmit);
    
    // Set up enhanced input handling for play mode
    if (quiz.type !== "mc-quiz") {
      // Use setTimeout to ensure DOM is rendered
      setTimeout(() => {
        this.setupPlayModeInputs();
      }, 100);
    }
  }

  _scoreText() {
    return `Score: ${this.session ? this.session.score : 0}/${this.totalQuestions || 0}`;
  }

  _refreshScoreBadge() {
    const badge = document.getElementById("scoreBadge");
    if (badge && this.session) badge.textContent = this._scoreText();
  }

  _syncSubmitVisibility(show) {
    const submit = document.getElementById("submitBtn");
    if (submit) submit.classList.toggle("hidden", !show);
  }

  selectChoice(displayedChoiceIndex) {
    if (!this.session) return;
    const idx = this.session.currentIndex;
    const qc = this.quizController || window.quizController;
    const model = qc.model;
    const quiz = model.currentQuiz;
    if (!quiz || quiz.type !== "mc-quiz") return;

    const question = quiz.questions[idx];
    const alreadyAnswered = Object.prototype.hasOwnProperty.call(this.session.results, idx);
    this.session.answers[idx] = { type: "mc", choice: displayedChoiceIndex };

    // First choice (index 0) is the correct answer
    const correct = displayedChoiceIndex === 0;
    
    // Debug logging
    console.log('selectChoice debug:', {
      displayedChoiceIndex,
      correct,
      question: question.question,
      choices: question.choices
    });

    // Play sound effect based on answer correctness
    if (window.audioManager) {
      if (correct) {
        window.audioManager.playCorrect();
      } else {
        window.audioManager.playWrong();
      }
    }

    // Record result and update score only once per question
    this.session.results[idx] = !!correct;
    if (!alreadyAnswered && correct) {
      this.session.score += 1;
    }
    this._refreshScoreBadge();

    // Re-render to reflect selection highlighting
    this.renderCurrentQuestion();

    // Show feedback modal immediately
    this._showFeedbackModal(question, correct, "mc-quiz", this.session.answers[idx]);
  }

  captureTextAnswer(text) {
    if (!this.session) return;
    const idx = this.session.currentIndex;
    // Convert to uppercase for better user experience
    const upperValue = String(text || "").toUpperCase().trim();
    this.session.answers[idx] = { type: "text", value: upperValue };
    
    // Update the input field to show uppercase
    // Note: This method is called from the input event listener, so we don't need to update the field here
    // The input event listener already handles the uppercase conversion
  }

  // Enhanced method for real-time input handling
  setupPlayModeInputs() {
    // Set up real-time uppercase conversion and Enter key handling
    const textInputs = document.querySelectorAll('.quiz-play-text-input');
    textInputs.forEach(input => {
      // Convert to uppercase as user types
      input.addEventListener('input', (e) => {
        const value = e.target.value;
        const upperValue = value.toUpperCase();
        if (value !== upperValue) {
          e.target.value = upperValue;
        }
        this.captureTextAnswer(upperValue);
      });

      // Handle Enter key submission
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          
          // Check if question is already answered
          const qIndex = this.session ? this.session.currentIndex : -1;
          if (qIndex >= 0 && this.session && Object.prototype.hasOwnProperty.call(this.session.results, qIndex)) {
            return; // Question already answered
          }
          
          // Prevent multiple rapid submissions
          if (input.disabled) return;
          
          // Disable input temporarily to prevent multiple submissions
          input.disabled = true;
          
          this.submitAnswer();
          
          // Re-enable input after a short delay
          setTimeout(() => {
            input.disabled = false;
          }, 500);
        }
      });

      // Focus the input for immediate typing
      input.focus();
    });
  }

  submitAnswer() {
    const qc = this.quizController || window.quizController;
    const model = qc.model;
    const quiz = model.currentQuiz;
    if (!quiz || !this.session) return;

    // Prevent multiple simultaneous submissions
    if (this.session.isSubmitting) {
      return;
    }

    const qIndex = this.session.currentIndex;
    
    // Prevent multiple submissions for the same question
    if (Object.prototype.hasOwnProperty.call(this.session.results, qIndex)) {
      return; // Question already answered
    }

    const question = quiz.questions[qIndex];
    const answer = this.session.answers[qIndex];

    // Validate that we have an answer
    if (!answer || (answer.type === "text" && (!answer.value || answer.value.trim() === ""))) {
      return; // No answer provided
    }

    // Set submission flag to prevent multiple submissions
    this.session.isSubmitting = true;

    let correct = false;
    if (quiz.type === "mc-quiz") {
      if (answer && answer.type === "mc") {
        correct = answer.choice === 0; // First choice (index 0) is correct
      }
    } else if (quiz.type === "ej-quiz" || quiz.type === "rd-quiz") {
      const user = this._normalize(String(answer && answer.value ? answer.value : ""));
      const answers = Array.isArray(question.answers) ? question.answers : [];
      correct = answers.some((a) => this._normalize(String(a || "")) === user);
    } else if (quiz.type === "ws-quiz") {
      const user = this._normalize(String(answer && answer.value ? answer.value : ""));
      const target = this._normalize(String(question.word || ""));
      correct = user.length > 0 && user === target;
    }

    // Play sound effect based on answer correctness
    if (window.audioManager) {
      if (correct) {
        window.audioManager.playCorrect();
      } else {
        window.audioManager.playWrong();
      }
    }

    // Record result and update score (only once per question)
    this.session.results[qIndex] = !!correct;
    if (correct) {
      this.session.score += 1;
    }
    this._refreshScoreBadge();

    // Disable the input field to show question is answered
    const inputField = document.querySelector('.quiz-play-text-input');
    if (inputField) {
      inputField.disabled = true;
      inputField.placeholder = 'Question answered ✓';
    }

    // Show feedback modal
    this._showFeedbackModal(question, correct, quiz.type, answer);
    
    // Reset submission flag after a short delay to allow for modal display
    setTimeout(() => {
      if (this.session) {
        this.session.isSubmitting = false;
      }
    }, 100);
  }

  _showFeedbackModal(question, correct, quizType, userAnswer) {
    const verdictText = document.getElementById("feedbackVerdictText");
    const answerText = document.getElementById("feedbackAnswerText");
    const referencesText = document.getElementById("feedbackReferencesText");
    const referencesContainer = document.getElementById("feedbackReferencesContainer");

    // Set correct answer text based on quiz type
    if (quizType === "mc-quiz") {
      const choices = question.choices || ["", "", "", ""];
      if (answerText) answerText.textContent = choices[0] || "";
    } else if (quizType === "ej-quiz" || quizType === "rd-quiz") {
      const answers = Array.isArray(question.answers) ? question.answers : [];
      if (answerText) answerText.textContent = answers.join(", ") || "";
    } else if (quizType === "ws-quiz") {
      if (answerText) answerText.textContent = question.word || "";
    }

    // Human-friendly verdict with emoji + visual indicator classes
    if (verdictText) {
      verdictText.classList.remove("feedback-result", "correct", "incorrect");
      verdictText.classList.add("feedback-result", correct ? "correct" : "incorrect");
      verdictText.textContent = correct ? "Nice! You're right ✅" : "Not quite ❌";
    }

    // Prefix the answer line to make intent obvious but simple
    if (answerText) {
      const answerContent = answerText.textContent || "";
      if (quizType === "mc-quiz") {
        // For multiple choice, just show what was selected
        answerText.textContent = answerContent;
      } else {
        // For other quiz types, show correct/incorrect feedback
        answerText.textContent = correct
          ? (answerContent ? `You got it: ${answerContent}` : "You got it!")
          : (answerContent ? `The correct answer is: ${answerContent}` : "");
      }
    }

    // Set references (only if they exist)
    if (referencesText && referencesContainer) {
      const hasReferences = question.references && question.references.trim();
      referencesText.textContent = hasReferences || "";
      referencesContainer.style.display = hasReferences ? "block" : "none";
    }

    // Show modal
    if (this.uiController) this.uiController.openModal("questionFeedbackModal");
    
    // Add backdrop click handler to advance
    const modal = document.getElementById("questionFeedbackModal");
    if (modal) {
      const backdropHandler = (e) => {
        if (e.target === modal) {
          this.nextAfterFeedback();
          modal.removeEventListener("click", backdropHandler);
        }
      };
      modal.addEventListener("click", backdropHandler);
    }
  }

  nextAfterFeedback() {
    if (this.uiController) this.uiController.closeModal("questionFeedbackModal");
    
    // Move to next or finish
    if (this.session.currentIndex < this.totalQuestions - 1) {
      this.next();
    } else {
      this.endQuiz();
    }
  }

  next() {
    if (!this.session) return;
    const qc = this.quizController || window.quizController;
    const model = qc.model;
    const quiz = model.currentQuiz;
    if (!quiz) return;
    if (this.session.currentIndex < quiz.questions.length - 1) {
      this.session.currentIndex += 1;
      model.currentQuestionIndex = this.session.currentIndex;
      this._updateQuestionContent();
    }
  }

  prev() {
    if (!this.session) return;
    const qc = this.quizController || window.quizController;
    const model = qc.model;
    if (this.session.currentIndex > 0) {
      this.session.currentIndex -= 1;
      model.currentQuestionIndex = this.session.currentIndex;
      this._updateQuestionContent();
    }
  }

  _updateQuestionContent() {
    const qc = this.quizController || window.quizController;
    const model = qc.model;
    const quiz = model.currentQuiz;
    if (!quiz || !this.session) return;
    
    // Only update the question content, not the entire quiz
    qc.renderQuizContent();
    qc.renderQuizIndex();
    qc.updateNavigationButtons();
    this._refreshScoreBadge();
    
    // Don't re-render everything for multiple choice
    if (quiz.type !== "mc-quiz") {
      // Set up enhanced input handling for play mode
      setTimeout(() => {
        this.setupPlayModeInputs();
      }, 100);
    }
  }

  endQuiz() {
    if (!this.session) return;
    this.session.endedAt = Date.now();
    this.isQuizCompleted = true; // Mark quiz as completed
    
    // Play game completion sound
    if (window.audioManager) {
      window.audioManager.playGameComplete();
    }
    
    // Store session data before cleanup
    this._storedSessionData = { ...this.session };
    
    if (this.routerController) {
      this.routerController.goToQuizResults(this.session.quizId);
    } else {
      this._showResultsPage();
    }
    
    // Clean up navigation protection after results are handled
    this._cleanupNavigationProtection();
  }

  _cleanupNavigationProtection() {
    // Remove navigation protection when quiz is complete or session ends
    if (typeof window !== 'undefined') {
      // Note: We can't easily remove the event listeners, but we can track that the session is complete
      // The _shouldPreventNavigation method will return false when session is null or quiz is completed
    }
  }

  _showResultsPage() {
    // Use stored session data if available, otherwise fall back to current session
    const sessionData = this.session || this._storedSessionData;
    if (!sessionData) {
      console.warn("No session data available for results page");
      return;
    }
    
    const correctCount = sessionData.score;
    const incorrectCount = this.totalQuestions - sessionData.score;
    
    // Update results page elements
    const finalScore = document.getElementById("finalScore");
    const correctCountEl = document.getElementById("correctCount");
    const incorrectCountEl = document.getElementById("incorrectCount");
    
    if (finalScore) finalScore.textContent = `Score: ${correctCount}/${this.totalQuestions}`;
    if (correctCountEl) correctCountEl.textContent = correctCount;
    if (incorrectCountEl) incorrectCountEl.textContent = incorrectCount;
    
    // Show results page
    if (this.uiController && typeof this.uiController.showResultsPage === "function") {
      this.uiController.showResultsPage();
    }
  }

  retakeQuiz() {
    if (!this.session) return;
    const quizId = this.session.quizId;
    
    // Clean up current session and navigation protection
    this._cleanupNavigationProtection();
    this.session = null;
    this.isQuizCompleted = false; // Reset completion flag
    
    if (this.routerController) {
      this.routerController.goToQuizPlay(quizId);
    } else {
      this.startQuizById(quizId);
    }
  }

  async exitToHome() {
    // Check if we're in an active session and have progress
    if (this.session && this.session.currentIndex > 0 && !this.isQuizCompleted) {
      // Show confirmation dialog to prevent accidental exit
      if (this.uiController && typeof this.uiController.showConfirm === "function") {
        const confirmed = await this.uiController.showConfirm(
          "You're currently in the middle of a quiz. If you exit now, you'll lose your progress. Are you sure you want to exit?",
          "Exit Quiz?",
          { confirmText: "Exit", cancelText: "Continue Quiz" }
        );
        
        if (!confirmed) {
          return; // User chose to continue, don't exit
        }
      } else {
        // Fallback to browser confirm if UI controller not available
        if (!confirm("You're currently in the middle of a quiz. If you exit now, you'll lose your progress. Are you sure you want to exit?")) {
          return; // User chose to continue, don't exit
        }
      }
    }
    
    // User confirmed exit or no active session, proceed with exit
    this._cleanupNavigationProtection();
    this.session = null;
    this.isQuizCompleted = false; // Reset completion flag
    if (this.routerController && typeof this.routerController.goBackOrHome === 'function') {
      this.routerController.goBackOrHome();
    } else if (this.uiController && typeof this.uiController.showHomePage === "function") {
      this.uiController.showHomePage();
    }
  }

  _normalize(str) {
    return String(str || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "")
      .trim();
  }
}


