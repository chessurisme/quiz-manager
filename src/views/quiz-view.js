export class QuizView {
  renderMultipleChoice(question, index, isPlayMode = false, isLocked = false) {
    const isReadOnly = isPlayMode || isLocked;
    
    if (isPlayMode) {
      // Immersive play mode layout
      return `
        <div class="quiz-play-container">
          <div class="quiz-play-question">
            <h2>${question.question || "Multiple Choice Question"}</h2>
          </div>
          <div class="quiz-play-choices">
            ${(question.choices || []).map((choice, choiceIndex) => `
              <div class="quiz-play-choice" onclick="playController.selectChoice(${choiceIndex})">
                <div class="choice-text">${choice || "Choice " + (choiceIndex + 1)}</div>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }

    // Regular edit mode layout
    return `
      <div class="quiz-grid quiz-grid-mc">
        <div class="quiz-field question">
          <div class="quiz-field-label">Question</div>
          <textarea placeholder="Enter question..." ${isReadOnly ? "readonly" : ""}
            onchange="quizController.updateQuestion(${index}, 'question', this.value)">${
              question.question || ""
            }</textarea>
        </div>
        <div class="quiz-field choice-1">
          <div class="quiz-field-label">Choice 1</div>
          <textarea placeholder="Enter choice 1..." ${isReadOnly ? "readonly" : ""}
            onchange="quizController.updateQuestion(${index}, 'choices.0', this.value)">${
              (question.choices && question.choices[0]) || ""
            }</textarea>
        </div>
        <div class="quiz-field choice-2">
          <div class="quiz-field-label">Choice 2</div>
          <textarea placeholder="Enter choice 2..." ${isReadOnly ? "readonly" : ""}
            onchange="quizController.updateQuestion(${index}, 'choices.1', this.value)">${
              (question.choices && question.choices[1]) || ""
            }</textarea>
        </div>
        <div class="quiz-field choice-3">
          <div class="quiz-field-label">Choice 3</div>
          <textarea placeholder="Enter choice 3..." ${isReadOnly ? "readonly" : ""}
            onchange="quizController.updateQuestion(${index}, 'choices.2', this.value)">${
              (question.choices && question.choices[2]) || ""
            }</textarea>
        </div>
        <div class="quiz-field choice-4">
          <div class="quiz-field-label">Choice 4</div>
          <textarea placeholder="Enter choice 4..." ${isReadOnly ? "readonly" : ""}
            onchange="quizController.updateQuestion(${index}, 'choices.3', this.value)">${
              (question.choices && question.choices[3]) || ""
            }</textarea>
        </div>

        ${!isPlayMode ? `
        <div class="quiz-field references-section">
          <div class="quiz-field-label">References</div>
          <textarea placeholder="Enter references..." 
            ${isLocked ? "readonly" : ""}
            onchange="quizController.updateQuestion(${index}, 'references', this.value)"
            oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'">${question.references || ""}</textarea>
        </div>
        <div class="quiz-field difficulty-section">
          <div class="difficulty-icons" ondblclick="quizController.toggleDifficulty(${index})">
            <i class="difficulty-icon difficulty-easy ${(question.difficulty || 'medium') === 'easy' ? 'active' : 'hidden'}" data-lucide="smile"></i>
            <i class="difficulty-icon difficulty-medium ${(question.difficulty || 'medium') === 'medium' ? 'active' : 'hidden'}" data-lucide="meh"></i>
            <i class="difficulty-icon difficulty-hard ${(question.difficulty || 'medium') === 'hard' ? 'active' : 'hidden'}" data-lucide="frown"></i>
          </div>
        </div>` : ""}
      </div>
    `;
  }

  renderRiddle(question, index, isPlayMode = false, isLocked = false) {
    const isReadOnly = isPlayMode || isLocked;
    
    if (isPlayMode) {
      // Immersive play mode layout
      return `
        <div class="quiz-play-container">
          <div class="quiz-play-question">
            <h2>${question.question || "Riddle"}</h2>
          </div>
          <div class="quiz-play-answer-input">
            <input type="text" 
                   placeholder="Type your answer..." 
                   class="quiz-play-text-input">
          </div>
        </div>
      `;
    }

    // Regular edit mode layout
    return `
      <div class="quiz-grid quiz-grid-riddle">
        <div class="quiz-field">
          <div class="quiz-field-label">Question</div>
          <textarea placeholder="Enter riddle question..." ${isReadOnly ? "readonly" : ""}
            onchange="quizController.updateQuestion(${index}, 'question', this.value)">${
              question.question || ""
            }</textarea>
        </div>
        ${!isPlayMode ? `
        <div class="quiz-field">
          <div class="quiz-field-label">Answers</div>
          <textarea placeholder="Enter answers (one per line)..." 
            ${isLocked ? "readonly" : ""}
            onchange="quizController.updateQuestion(${index}, 'answers', this.value.split('\\n'))">${(
              question.answers || []
            ).join("\n")}</textarea>
        </div>
        <div class="quiz-field references-section">
          <div class="quiz-field-label">References</div>
          <textarea placeholder="Enter references..." 
            ${isLocked ? "readonly" : ""}
            onchange="quizController.updateQuestion(${index}, 'references', this.value)">${
              question.references || ""
            }</textarea>
        </div>
        <div class="quiz-field difficulty-section">
          <div class="difficulty-icons" ondblclick="quizController.toggleDifficulty(${index})">
            <i class="difficulty-icon difficulty-easy ${(question.difficulty || 'medium') === 'easy' ? 'active' : 'hidden'}" data-lucide="smile"></i>
            <i class="difficulty-icon difficulty-medium ${(question.difficulty || 'medium') === 'medium' ? 'active' : 'hidden'}" data-lucide="meh"></i>
            <i class="difficulty-icon difficulty-hard ${(question.difficulty || 'medium') === 'hard' ? 'active' : 'hidden'}" data-lucide="frown"></i>
          </div>
        </div>` : ""}
        ${isPlayMode ? `
        <div class="quiz-field">
          <div class="quiz-field-label">Your Answer</div>
          <input type="text" placeholder="Type your answer...">
        </div>` : ""}
      </div>
    `;
  }

  renderWordScramble(question, index, isPlayMode = false, isLocked = false) {
    const isReadOnly = isPlayMode || isLocked;
    
    if (isPlayMode) {
      // Immersive play mode layout
      return `
        <div class="quiz-play-container">
          <div class="quiz-play-question">
            <h2>Unscramble this word:</h2>
          </div>
          <div class="quiz-play-scrambled">
            <h1 class="scrambled-word">${question.scrambledWord || "SCRAMBLED"}</h1>
          </div>
          <div class="quiz-play-answer-input">
            <input type="text" 
                   placeholder="Type the unscrambled word..." 
                   class="quiz-play-text-input">
          </div>
        </div>
      `;
    }

    // Regular edit mode layout
    return `
      <div class="quiz-grid quiz-grid-scramble">
        ${!isPlayMode ? `
        <div class="quiz-field">
          <div class="quiz-field-label">Word</div>
          <input type="text" value="${question.word || ""}" placeholder="Enter word..." 
            ${isLocked ? "readonly" : ""}
            onchange="quizController.updateQuestion(${index}, 'word', this.value)"
            oninput="this.value = this.value.toUpperCase(); this.style.height = ''; this.style.height = this.scrollHeight + 'px'">
        </div>
        <div class="quiz-field">
          <div class="quiz-field-label">Scrambled Word</div>
          <div class="scrambled-word-input-container">
            <input type="text" value="${question.scrambledWord || ""}" placeholder="Enter scrambled word..." 
              ${isReadOnly ? "readonly" : ""}
              onchange="quizController.updateQuestion(${index}, 'scrambledWord', this.value)"
              oninput="this.value = this.value.toUpperCase(); this.style.height = ''; this.style.height = this.scrollHeight + 'px'">
            ${!isPlayMode && !isLocked ? `
            <button class="dice-button" title="Generate random scrambled word" onclick="quizController.generateScrambledWord(${index})">
              <i data-lucide="dice-6" width="20" height="20"></i>
            </button>` : ""}
          </div>
        </div>
        <div class="quiz-field references-section">
          <div class="quiz-field-label">References</div>
          <input type="text" value="${question.references || ""}" placeholder="Enter references..." 
            ${isLocked ? "readonly" : ""}
            onchange="quizController.updateQuestion(${index}, 'references', this.value)">
        </div>
        <div class="quiz-field difficulty-section">
          <div class="difficulty-icons" ondblclick="quizController.toggleDifficulty(${index})">
            <i class="difficulty-icon difficulty-easy ${(question.difficulty || 'medium') === 'easy' ? 'active' : 'hidden'}" data-lucide="smile"></i>
            <i class="difficulty-icon difficulty-medium ${(question.difficulty || 'medium') === 'medium' ? 'active' : 'hidden'}" data-lucide="meh"></i>
            <i class="difficulty-icon difficulty-hard ${(question.difficulty || 'medium') === 'hard' ? 'active' : 'hidden'}" data-lucide="frown"></i>
          </div>
        </div>` : ""}
        ${isPlayMode ? `
        <div class="quiz-field">
          <div class="quiz-field-label">Your Answer</div>
          <input type="text" placeholder="Unscramble and type the word...">
        </div>` : ""}
      </div>
    `;
  }

  renderEmoji(question, index, isPlayMode = false, isLocked = false) {
    const isReadOnly = isPlayMode || isLocked;
    
    if (isPlayMode) {
      // Immersive play mode layout
      return `
        <div class="quiz-play-container">
          <div class="quiz-play-question">
            <h2>${question.question || "What does this emoji represent?"}</h2>
          </div>
          <div class="quiz-play-emoji">
            <span class="emoji-display">${question.emoji || "😊"}</span>
          </div>
          <div class="quiz-play-answer-input">
            <input type="text" 
                   placeholder="Type your answer..." 
                   class="quiz-play-text-input">
          </div>
        </div>
      `;
    }

    // Regular edit mode layout
    return `
      <div class="quiz-grid quiz-grid-emoji">
        <div class="quiz-field">
          <div class="quiz-field-label">Question</div>
          <textarea placeholder="Enter question..." ${isReadOnly ? "readonly" : ""}
            onchange="quizController.updateQuestion(${index}, 'question', this.value)">${
              question.question || ""
            }</textarea>
        </div>
        <div class="quiz-field">
          <div class="quiz-field-label">Emoji</div>
          <input type="text" value="${question.emoji || ""}" placeholder="Enter emoji..." 
            ${isReadOnly ? "readonly" : ""}
            onchange="quizController.updateQuestion(${index}, 'emoji', this.value)">
        </div>
        ${!isPlayMode ? `
        <div class="quiz-field">
          <div class="quiz-field-label">Answers</div>
          <textarea placeholder="Enter answers (one per line)..." 
            ${isLocked ? "readonly" : ""}
            onchange="quizController.updateQuestion(${index}, 'answers', this.value.split('\\n'))">${(
              question.answers || []
            ).join("\n")}</textarea>
        </div>
        <div class="quiz-field references-section">
          <div class="quiz-field-label">References</div>
          <input type="text" value="${question.references || ""}" placeholder="Enter references..." 
            ${isLocked ? "readonly" : ""}
            onchange="quizController.updateQuestion(${index}, 'references', this.value)">
        </div>
        <div class="quiz-field difficulty-section">
          <div class="difficulty-icons" ondblclick="quizController.toggleDifficulty(${index})">
            <i class="difficulty-icon difficulty-easy ${(question.difficulty || 'medium') === 'easy' ? 'active' : 'hidden'}" data-lucide="smile"></i>
            <i class="difficulty-icon difficulty-medium ${(question.difficulty || 'medium') === 'medium' ? 'active' : 'hidden'}" data-lucide="meh"></i>
            <i class="difficulty-icon difficulty-hard ${(question.difficulty || 'medium') === 'hard' ? 'active' : 'hidden'}" data-lucide="frown"></i>
          </div>
        </div>` : ""}
        ${isPlayMode ? `
        <div class="quiz-field">
          <div class="quiz-field-label">Your Answer</div>
          <input type="text" placeholder="Type your answer...">
        </div>` : ""}
      </div>
    `;
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}