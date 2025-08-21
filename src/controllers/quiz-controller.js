import { QuizModel } from "../models/quiz-model.js";
import { QuizView } from "../views/quiz-view.js";

export class QuizController {
  constructor(dependencies = {}) {
    this.model = dependencies.model || new QuizModel();
    this.view = dependencies.view || new QuizView();
    this.uiController = dependencies.uiController;
    this.folderController = dependencies.folderController;
    this.routerController = dependencies.routerController;
  }

  async initialize() {
    await this.model.loadFromStorage();
    if (this.folderController) this.folderController.loadFolders();
  }

  createNewQuiz() {
    const name = document.getElementById("quizName").value;
    const type = document.getElementById("quizType").value;
    const folderId = document.getElementById("folderSelect").value;

    if (!name) {
      if (this.uiController && typeof this.uiController.showAlert === "function") {
        this.uiController.showAlert("Please enter a quiz name", "Validation");
      } else {
        alert("Please enter a quiz name");
      }
      return;
    }

    const quiz = this.model.createQuiz(name, type, folderId, "medium");
    this.model.currentQuiz = quiz;
    this.model.currentQuestionIndex = 0;

    this.openEditor(quiz);
    if (this.uiController) this.uiController.closeModal("createModal");
    if (this.folderController && typeof this.folderController.loadRecentQuizzes === "function") {
      this.folderController.loadRecentQuizzes();
    }
  }

  openEditor(quiz, { playMode = false } = {}) {
    this.model.currentQuiz = quiz;
    this.model.currentQuestionIndex = 0;

    const title = document.getElementById("quizEditorTitle");
    if (title) title.textContent = playMode ? `Playing: ${quiz.name}` : quiz.name;

    // Toggle edit vs play controls visibility
    const saveBtn = document.getElementById("saveBtn");
    const addBtn = document.getElementById("addBtn");
    const submitBtn = document.getElementById("submitBtn");
    const scoreBadge = document.getElementById("scoreBadge");
    const optionsBtn = document.getElementById("optionsBtn");
    if (saveBtn) saveBtn.classList.toggle("hidden", playMode);
    if (addBtn) addBtn.classList.toggle("hidden", playMode);
    if (submitBtn) submitBtn.classList.toggle("hidden", !playMode);
    if (scoreBadge) scoreBadge.classList.toggle("hidden", !playMode);
    if (optionsBtn) optionsBtn.classList.toggle("hidden", playMode);

    // Update lock indicator
    if (this.uiController) {
      this.uiController.updateLockIndicator();
    }

    this.renderQuizContent(playMode);
    this.renderQuizIndex();
    this.updateNavigationButtons();

    if (this.uiController) this.uiController.showQuizEditor();
  }

  openEditorById(quizId) {
    const quiz = this.model.quizzes.get(quizId);
    if (quiz) {
      this.openEditor(quiz);
    }
  }

  openEditorByIdAtIndex(quizId, index) {
    const quiz = this.model.quizzes.get(quizId);
    if (!quiz) return;
    this.openEditor(quiz);
    const safeIndex = Math.max(0, Math.min(index | 0, (quiz.questions?.length || 1) - 1));
    this.jumpToQuestion(safeIndex);
  }

  renderQuizContent(isPlayModeParam = undefined) {
    const quiz = this.model.currentQuiz;
    const question = quiz.questions[this.model.currentQuestionIndex];
    const container = document.getElementById("quizContent");
    const isPlayMode = typeof isPlayModeParam === "boolean" ? isPlayModeParam : this._isPlayActive();
    const isLocked = !!quiz.locked;

    let content = "";
    switch (quiz.type) {
      case "mc-quiz":
        content = this.view.renderMultipleChoice(
          question,
          this.model.currentQuestionIndex,
          isPlayMode,
          isLocked
        );
        break;
      case "ej-quiz":
        content = this.view.renderEmoji(
          question,
          this.model.currentQuestionIndex,
          isPlayMode,
          isLocked
        );
        break;
      case "rd-quiz":
        content = this.view.renderRiddle(
          question,
          this.model.currentQuestionIndex,
          isPlayMode,
          isLocked
        );
        break;
      case "ws-quiz":
        content = this.view.renderWordScramble(
          question,
          this.model.currentQuestionIndex,
          isPlayMode,
          isLocked
        );
        break;
    }

    container.innerHTML = content;
    // Ensure newly rendered textareas auto-size to their content
    const renderedTextareas = container.querySelectorAll('textarea');
    renderedTextareas.forEach((textarea) => {
      textarea.style.height = '';
      textarea.style.height = textarea.scrollHeight + 'px';
      textarea.addEventListener('input', function () {
        this.style.height = '';
        this.style.height = textarea.scrollHeight + 'px';
      });
    });
    
    // Re-initialize Lucide icons for newly rendered content
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
    
    this.updateProgressBadge();
  }

  renderQuizIndex() {
    const quiz = this.model.currentQuiz;
    const container = document.getElementById("quizIndex");
    const progressBtn = document.getElementById("questionProgressBtn");

    if (!container) return;
    // Remove index buttons; only show the progress button at the end
    container.innerHTML = "";
    if (progressBtn) {
      container.append(progressBtn);
    }
  }

  jumpToQuestion(index) {
    // Ensure human-friendly input (if passed 1-based) is handled: callers pass 0-based, but guard anyway
    const quiz = this.model.currentQuiz;
    const maxIndex = Math.max(0, (quiz?.questions?.length || 1) - 1);
    const safeIndex = Math.max(0, Math.min(index | 0, maxIndex));
    this.model.currentQuestionIndex = safeIndex;
    this.renderQuizContent();
    this.renderQuizIndex();
    this.updateNavigationButtons();
    this.updateProgressBadge();
    // If play session is active, sync current index
    const pc = window.playController;
    if (pc && pc.session && this.model.currentQuiz && pc.session.quizId === this.model.currentQuiz.id) {
      pc.session.currentIndex = this.model.currentQuestionIndex;
    }
  }

  previousQuestion() {
    if (this.model.currentQuestionIndex > 0) {
      this.model.currentQuestionIndex--;
      this.renderQuizContent();
      this.renderQuizIndex();
      this.updateNavigationButtons();
      this.updateProgressBadge();
      const pc = window.playController;
      if (pc && pc.session && this.model.currentQuiz && pc.session.quizId === this.model.currentQuiz.id) {
        pc.session.currentIndex = this.model.currentQuestionIndex;
      }
    }
  }

  nextQuestion() {
    const quiz = this.model.currentQuiz;
    if (this.model.currentQuestionIndex < quiz.questions.length - 1) {
      this.model.currentQuestionIndex++;
      this.renderQuizContent();
      this.renderQuizIndex();
      this.updateNavigationButtons();
      this.updateProgressBadge();
      const pc = window.playController;
      if (pc && pc.session && this.model.currentQuiz && pc.session.quizId === this.model.currentQuiz.id) {
        pc.session.currentIndex = this.model.currentQuestionIndex;
      }
    }
  }

  _isPlayActive() {
    const pc = window.playController;
    return !!(pc && pc.session && this.model.currentQuiz && pc.session.quizId === this.model.currentQuiz.id);
  }

  addQuestion() {
    const quiz = this.model.currentQuiz;
    if (!quiz) return;
    
    // Check if quiz is locked
    if (quiz.locked) {
      if (this.uiController && typeof this.uiController.showAlert === "function") {
        this.uiController.showAlert("Quiz is locked. Unlock it first to make changes.");
      } else {
        alert("Quiz is locked. Unlock it first to make changes.");
      }
      return;
    }
    
    const newQuestion = this.model.createEmptyQuestion(quiz.type, "medium");
    quiz.questions.push(newQuestion);
    this.model.currentQuestionIndex = quiz.questions.length - 1;

    this.renderQuizContent();
    this.renderQuizIndex();
    this.updateNavigationButtons();
  }

  updateQuestion(index, field, value) {
    const quiz = this.model.currentQuiz;
    const question = quiz.questions[index];

    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      question[parent][parseInt(child)] = value;
    } else {
      question[field] = value;
    }

    this.model.unsavedQuiz = quiz;
    if (this.uiController) this.uiController.updateBackToUnsavedButton(true);
  }

  toggleDifficulty(index) {
    const quiz = this.model.currentQuiz;
    const question = quiz.questions[index];
    
    if (!question || quiz.locked) return;
    
    // Cycle through difficulty levels: easy -> medium -> hard -> easy
    const difficulties = ['easy', 'medium', 'hard'];
    const currentIndex = difficulties.indexOf(question.difficulty || 'medium');
    const nextIndex = (currentIndex + 1) % difficulties.length;
    const newDifficulty = difficulties[nextIndex];
    
    this.updateQuestion(index, 'difficulty', newDifficulty);
    this.renderQuizContent(); // Re-render to update the active icon
  }

  generateScrambledWord(index) {
    const quiz = this.model.currentQuiz;
    const question = quiz.questions[index];
    
    if (!question.word || question.word.trim() === "") {
      if (this.uiController && typeof this.uiController.showAlert === "function") {
        this.uiController.showAlert("Please enter a word first before generating a scrambled version.", "Validation");
      } else {
        alert("Please enter a word first before generating a scrambled version.");
      }
      return;
    }

    const originalWord = question.word.trim();
    let scrambledWord = originalWord;
    
    // Keep generating scrambled words until we get one that's different from the original
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loops for very short words
    
    while (scrambledWord === originalWord && attempts < maxAttempts) {
      // Convert word to array of characters and shuffle
      const wordArray = originalWord.split('');
      const scrambledArray = this.shuffleArray(wordArray);
      scrambledWord = scrambledArray.join('');
      attempts++;
    }
    
    // If we still have the same word after max attempts, manually swap first two characters
    if (scrambledWord === originalWord && originalWord.length > 1) {
      const chars = originalWord.split('');
      // Try different swapping strategies
      if (chars.length === 2) {
        // For 2-letter words, just swap them
        [chars[0], chars[1]] = [chars[1], chars[0]];
      } else if (chars.length > 2) {
        // For longer words, try swapping characters at different positions
        const firstChar = chars[0];
        const lastChar = chars[chars.length - 1];
        if (firstChar !== lastChar) {
          // Swap first and last characters
          chars[0] = lastChar;
          chars[chars.length - 1] = firstChar;
        } else {
          // If first and last are same, swap first with middle character
          const midIndex = Math.floor(chars.length / 2);
          [chars[0], chars[midIndex]] = [chars[midIndex], chars[0]];
        }
      }
      scrambledWord = chars.join('');
      
      // Final check: if still the same (e.g., "AAA"), add a suffix to make it different
      if (scrambledWord === originalWord) {
        scrambledWord = originalWord + "!";
      }
    }

    // Update the scrambled word field
    this.updateQuestion(index, 'scrambledWord', scrambledWord);
    
    // Re-render the content to show the updated scrambled word
    this.renderQuizContent();
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  updateNavigationButtons() {
    const quiz = this.model.currentQuiz;
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (this.model.currentQuestionIndex === 0) {
      prevBtn.classList.add("disabled");
    } else {
      prevBtn.classList.remove("disabled");
    }

    if (this.model.currentQuestionIndex === quiz.questions.length - 1) {
      nextBtn.classList.add("disabled");
    } else {
      nextBtn.classList.remove("disabled");
    }
    this.updateProgressBadge();
  }

  updateProgressBadge() {
    const quiz = this.model.currentQuiz;
    if (!quiz) return;
    const total = quiz.questions.length || 0;
    const current = (this.model.currentQuestionIndex || 0) + 1;
    const btn = document.getElementById("questionProgressBtn");
    if (btn) {
      btn.textContent = `${current} of ${total}`;
    }
  }

  saveQuiz() {
    const quiz = this.model.currentQuiz;
    if (!quiz) {
      if (this.uiController && typeof this.uiController.showAlert === "function") {
        this.uiController.showAlert("No quiz is open to save.", "Validation");
      } else {
        alert("No quiz is open to save.");
      }
      return;
    }
    const savedQuiz = this.model.saveQuiz(quiz);
    if (!savedQuiz) return;
    this.model.unsavedQuiz = null;
    if (this.uiController) this.uiController.updateBackToUnsavedButton(false);
    if (this.uiController && typeof this.uiController.showAlert === "function") {
      this.uiController.showAlert("Quiz saved successfully!");
    } else {
      alert("Quiz saved successfully!");
    }
    if (this.folderController && typeof this.folderController.loadRecentQuizzes === "function") {
      this.folderController.loadRecentQuizzes();
    }
  }

  exitEditor() {
    // If currently in play mode, exit play immediately without unsaved-changes prompt
    if (this._isPlayActive()) {
      if (window.playController && typeof window.playController.exitToHome === "function") {
        window.playController.exitToHome();
      } else {
        // Fallback if playController isn't available
        if (this.uiController && typeof this.uiController.exitPlayUI === "function") {
          this.uiController.exitPlayUI();
        }
        if (this.routerController && typeof this.routerController.goBackOrHome === 'function') {
          this.routerController.goBackOrHome();
        } else if (this.uiController && typeof this.uiController.showSearchPage === 'function') {
          // fall back to home if search page cannot be shown
          this.uiController.showHomePage();
        } else if (this.uiController) {
          this.uiController.showHomePage();
        }
      }
      return;
    }

    if (this.model.unsavedQuiz) {
      if (this.uiController && typeof this.uiController.promptUnsavedExit === "function") {
        this.uiController.promptUnsavedExit();
        return;
      } else {
        if (!confirm("You have unsaved changes. Are you sure you want to exit?")) {
          return;
        }
      }
    }

    this.exitEditorForce();
  }

  exitEditorForce() {
    this.model.currentQuiz = null;
    this.model.currentQuestionIndex = 0;
    if (this.routerController && typeof this.routerController.goBackOrHome === 'function') {
      this.routerController.goBackOrHome();
    } else if (this.uiController) {
      this.uiController.showHomePage();
    }
  }

  backToUnsaved() {
    if (this.model.unsavedQuiz) {
      this.openEditor(this.model.unsavedQuiz);
      if (this.uiController) this.uiController.updateBackToUnsavedButton(false);
    }
  }

  deleteCurrentQuiz() {
    const quiz = this.model.currentQuiz;
    if (!quiz) {
      if (this.uiController && typeof this.uiController.showAlert === "function") {
        this.uiController.showAlert("No quiz to delete!");
      } else {
        alert("No quiz to delete!");
      }
      return;
    }
    
    console.log("Deleting quiz:", quiz.id, quiz.name);
    
    if (this.model.deleteQuiz(quiz.id)) {
      if (this.uiController && typeof this.uiController.showAlert === "function") {
        this.uiController.showAlert("Quiz deleted successfully!");
      } else {
        alert("Quiz deleted successfully!");
      }
      this.exitEditor();
      if (this.folderController && typeof this.folderController.loadRecentQuizzes === "function") {
        this.folderController.loadRecentQuizzes();
      }
    } else {
      if (this.uiController && typeof this.uiController.showAlert === "function") {
        this.uiController.showAlert("Failed to delete quiz!");
      } else {
        alert("Failed to delete quiz!");
      }
    }
  }
}


