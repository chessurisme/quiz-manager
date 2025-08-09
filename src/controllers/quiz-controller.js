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

    const quiz = this.model.createQuiz(name, type, folderId);
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
    
    const newQuestion = this.model.createEmptyQuestion(quiz.type);
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
        if (this.routerController) {
          this.routerController.goToHome();
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
    if (this.routerController) {
      this.routerController.goToHome();
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


