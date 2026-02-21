/**
 * Essential Stories Quiz Game
 * Interactive quiz based on weekly essential stories
 */

(function () {
  "use strict";

  const quizView = document.querySelector(".quiz-view");
  if (!quizView) return;

  // Get quiz data from the data attribute
  let quizData = [];
  try {
    quizData = JSON.parse(quizView.dataset.quiz || "[]");
  } catch (e) {
    console.error("Failed to parse quiz data:", e);
    return;
  }

  if (quizData.length === 0) {
    console.warn("No quiz questions available");
    return;
  }

  // Helper function to shuffle array
  function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Parse quiz data into questions with options and article metadata
  const questions = [];
  const usesObjectFormat =
    quizData.length > 0 &&
    typeof quizData[0] === "object" &&
    quizData[0] !== null &&
    "question" in quizData[0];

  if (usesObjectFormat) {
    quizData.forEach((item) => {
      if (!item || typeof item !== "object") return;

      const questionText =
        typeof item.question === "string"
          ? item.question
          : item.question && item.question.text
            ? item.question.text
            : item.question && item.question.value
              ? item.question.value
              : "";

      let correctAnswer = "";
      let isMultipleChoice = false;
      let options = [];

      // Handle answer - can be string or array
      if (Array.isArray(item.answer)) {
        if (item.answer.length === 0) return; // Skip if empty array
        correctAnswer = item.answer[0]; // First item is correct answer
        if (item.answer.length > 1) {
          isMultipleChoice = true;
          options = shuffleArray(item.answer); // Shuffle all options
        }
      } else if (typeof item.answer === "string") {
        correctAnswer = item.answer;
      } else if (item.answer && item.answer.text) {
        correctAnswer = item.answer.text;
      } else if (item.answer && item.answer.value) {
        correctAnswer = item.answer.value;
      }

      if (!questionText || !correctAnswer) return;

      questions.push({
        question: questionText,
        correctAnswer: correctAnswer,
        options: options,
        isMultipleChoice: isMultipleChoice,
        articleTitle: item.articleTitle || null,
        articleUrl: item.articleUrl || null,
      });
    });
  } else {
    for (let i = 0; i < quizData.length; i += 2) {
      if (i + 1 < quizData.length) {
        const question = quizData[i];
        const answerData = quizData[i + 1];

        // Handle both old format (string) and new format (object with metadata)
        let answer, articleTitle, articleUrl;
        if (typeof answerData === "object" && answerData.answer) {
          answer = answerData.answer;
          articleTitle = answerData.articleTitle;
          articleUrl = answerData.articleUrl;
        } else {
          answer = answerData;
          articleTitle = null;
          articleUrl = null;
        }

        if (typeof question !== "string" || typeof answer !== "string") {
          continue;
        }

        questions.push({
          question: question,
          correctAnswer: answer,
          options: [],
          isMultipleChoice: false,
          articleTitle: articleTitle,
          articleUrl: articleUrl,
        });
      }
    }
  }

  // Game state
  let currentQuestionIndex = 0;
  let score = 0;
  let selectedAnswer = null;
  let answerSubmitted = false;

  // DOM elements
  const startScreen = document.querySelector(".quiz-start-screen");
  const questionScreen = document.querySelector(".quiz-question-screen");
  const resultsScreen = document.querySelector(".quiz-results-screen");

  const startBtn = document.getElementById("start-quiz");
  const totalQuestionsEl = document.getElementById("total-questions");

  const quizProgress = document.querySelector(".quiz-progress");
  const progressFill = document.getElementById("quiz-progress-fill");
  const progressText = document.getElementById("quiz-progress-text");
  const questionEl = document.getElementById("quiz-question");
  const questionWrapper = document.querySelector(".quiz-question-wrapper");
  const answerInput = document.getElementById("quiz-answer-input");
  const submitBtn = document.getElementById("quiz-submit-btn");
  const quizAnswerContainer = document.getElementById("quiz-answer");
  const quizMultipleChoiceContainer = document.getElementById(
    "quiz-multiple-choice",
  );
  const quizOptionsListContainer = document.getElementById("quiz-options-list");
  const feedbackEl = document.getElementById("quiz-feedback");

  // Auto-advance timer
  let autoAdvanceTimer = null;

  // Question progress bar elements
  const questionProgressFill = document.getElementById(
    "question-progress-fill",
  );
  const questionCurrentEl = document.getElementById("question-current");
  const questionTotalEl = document.getElementById("question-total");

  const resultsTitle = document.getElementById("results-title");
  const resultsSubtitle = document.getElementById("results-subtitle");
  const scoreNumber = document.getElementById("score-number");
  const scoreTotal = document.getElementById("score-total");
  const scorePercentage = document.getElementById("score-percentage");
  const scoreMessage = document.getElementById("score-message");
  const scoreFill = document.getElementById("quiz-score-fill");
  const scoreText = document.getElementById("quiz-score-text");
  const restartBtn = document.getElementById("restart-quiz");

  // Event listeners
  if (startBtn) {
    startBtn.addEventListener("click", startQuiz);
  }

  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      if (answerSubmitted) {
        // Clear auto-advance timer and move to next question immediately
        if (autoAdvanceTimer) {
          clearTimeout(autoAdvanceTimer);
          autoAdvanceTimer = null;
        }
        nextQuestion();
      } else {
        checkAnswer();
      }
    });
  }

  if (answerInput) {
    answerInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (!answerSubmitted && submitBtn && !submitBtn.disabled) {
          checkAnswer();
        }
      }
    });

    // Enable/disable button based on input
    answerInput.addEventListener("input", () => {
      if (submitBtn) {
        submitBtn.disabled = !answerInput.value.trim();
      }
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener("click", restartQuiz);
  }

  // Swipe gesture detection for touch devices
  let touchStartX = 0;
  let touchStartY = 0;
  const swipeThreshold = 50; // Minimum swipe distance in pixels

  function handleSwipe(endX, endY) {
    const diffX = touchStartX - endX;
    const diffY = Math.abs(touchStartY - endY);

    // Swipe left (or right towards previous)
    if (diffX > swipeThreshold && diffY < swipeThreshold) {
      // Left swipe: move to next question/screen (only if answer is already submitted)
      if (answerSubmitted && questionScreen.classList.contains("active")) {
        nextQuestion();
      }
    }
  }

  const quizContainer = document.querySelector(".quiz-container");
  if (quizContainer) {
    quizContainer.addEventListener("touchstart", (event) => {
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    });

    quizContainer.addEventListener("touchend", (event) => {
      const touchEndX = event.changedTouches[0].clientX;
      const touchEndY = event.changedTouches[0].clientY;
      handleSwipe(touchEndX, touchEndY);
    });
  }

  // Functions
  function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    selectedAnswer = null;
    answerSubmitted = false;

    startScreen.classList.remove("active");
    questionScreen.classList.add("active");

    // Show quiz progress bar
    if (quizProgress) {
      quizProgress.classList.add("show");
    }

    // Initialize question total
    if (questionTotalEl) {
      questionTotalEl.textContent = questions.length;
    }

    loadQuestion();
  }

  function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
      showResults();
      return;
    }

    const question = questions[currentQuestionIndex];
    selectedAnswer = null;
    answerSubmitted = false;

    // Set data attribute for pastel background
    if (questionWrapper) {
      questionWrapper.setAttribute("data-question", currentQuestionIndex);
    }

    // Update progress
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressFill.style.width = progress + "%";
    progressText.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;

    // Update question progress bar
    if (questionProgressFill) {
      questionProgressFill.style.width = progress + "%";
    }
    if (questionCurrentEl) {
      questionCurrentEl.textContent = currentQuestionIndex + 1;
    }

    // Display question
    questionEl.textContent = question.question;

    // Show appropriate answer format (text input or multiple choice)
    if (question.isMultipleChoice) {
      // Hide text input, show multiple choice
      if (quizAnswerContainer) {
        quizAnswerContainer.style.display = "none";
      }
      if (quizMultipleChoiceContainer) {
        quizMultipleChoiceContainer.style.display = "flex";
        renderMultipleChoiceOptions(question);
      }
      // For multiple choice, button starts enabled (user can select and check)
      if (submitBtn) {
        submitBtn.disabled = true; // Disabled until option selected
        submitBtn.textContent = "Check Answer";
      }
    } else {
      // Show text input, hide multiple choice
      if (quizAnswerContainer) {
        quizAnswerContainer.style.display = "block";
      }
      if (quizMultipleChoiceContainer) {
        quizMultipleChoiceContainer.style.display = "none";
      }
      if (answerInput) {
        answerInput.value = "";
        answerInput.disabled = false;
        answerInput.focus();
      }
      // For free text, button is disabled until user types
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Check";
      }
    }

    // Hide feedback
    feedbackEl.classList.remove("show", "correct", "incorrect");

    // Clear any existing auto-advance timer
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }
  }

  function renderMultipleChoiceOptions(question) {
    if (!quizOptionsListContainer) return;

    // Clear previous options
    quizOptionsListContainer.innerHTML = "";

    // Create option buttons
    question.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.className = "quiz-option-btn";
      button.dataset.optionValue = option;
      button.textContent = option;
      button.addEventListener("click", () => selectOption(button, option));
      quizOptionsListContainer.appendChild(button);
    });
  }

  function selectOption(button, value) {
    // Remove active class from all buttons
    document.querySelectorAll(".quiz-option-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    // Add active class to clicked button
    button.classList.add("active");
    // Store selected answer (but don't mark as submitted yet)
    selectedAnswer = value;
    // Enable the submit button when option is selected
    if (submitBtn) {
      submitBtn.disabled = false;
    }
  }

  function checkAnswer() {
    if (answerSubmitted) return; // Already submitted answer for this question

    const question = questions[currentQuestionIndex];

    if (question.isMultipleChoice) {
      // Multiple choice: check if an option is selected
      const selectedButton = document.querySelector(".quiz-option-btn.active");
      if (!selectedButton) {
        return; // No option selected
      }
      // Normalize the selected answer for comparison
      selectedAnswer = normalizeAnswer(selectedAnswer);
    } else {
      // Free text: get input value
      if (!answerInput) return;

      const userAnswer = normalizeAnswer(answerInput.value);
      if (!userAnswer) {
        answerInput.focus();
        return;
      }
      selectedAnswer = userAnswer;
    }

    const correctAnswer = normalizeAnswer(question.correctAnswer);
    const isCorrect = selectedAnswer === correctAnswer;

    if (isCorrect) {
      score++;
    }

    answerSubmitted = true;

    if (answerInput) {
      answerInput.disabled = true;
    }

    // Disable all option buttons if multiple choice
    if (question.isMultipleChoice) {
      document.querySelectorAll(".quiz-option-btn").forEach((btn) => {
        btn.disabled = true;
      });
    }

    if (submitBtn) {
      submitBtn.disabled = true;
    }

    // Show feedback
    showFeedback(isCorrect);

    // Update button to advance to next question
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent =
        currentQuestionIndex === questions.length - 1
          ? "View Results"
          : "Next Question";
    }

    // Auto-advance to next question after 2 seconds
    autoAdvanceTimer = setTimeout(() => {
      nextQuestion();
    }, 2000);
  }

  function normalizeAnswer(value) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[\s\-_.]+/g, "");
  }

  function showFeedback(isCorrect) {
    const feedbackText = feedbackEl.querySelector(".quiz-feedback-text");
    const currentQuestion = questions[currentQuestionIndex];

    if (isCorrect) {
      feedbackEl.classList.add("show", "correct");
      feedbackText.innerHTML = "Correct! Well done.";
    } else {
      feedbackEl.classList.add("show", "incorrect");
      feedbackText.innerHTML = `Incorrect. The correct answer is: "${currentQuestion.correctAnswer}"`;
    }

    // Add article link if available
    if (currentQuestion.articleUrl && currentQuestion.articleTitle) {
      const existingLink = feedbackEl.querySelector(".quiz-article-link");
      if (existingLink) {
        existingLink.remove();
      }

      const articleLink = document.createElement("a");
      articleLink.href = currentQuestion.articleUrl;
      articleLink.className = "quiz-article-link";
      articleLink.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
        Read: ${truncateText(currentQuestion.articleTitle, 40)}
      `;
      feedbackEl.appendChild(articleLink);
    }
  }

  // Helper function to truncate text
  function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }

  function nextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
  }

  function showResults() {
    questionScreen.classList.remove("active");
    resultsScreen.classList.add("active");

    // Hide quiz progress bar
    if (quizProgress) {
      quizProgress.classList.remove("show");
    }

    const percentage = Math.round((score / questions.length) * 100);

    // Update score display
    if (scoreNumber) {
      scoreNumber.textContent = score;
    }
    if (scoreTotal) {
      scoreTotal.textContent = questions.length;
    }
    if (scorePercentage) {
      scorePercentage.textContent = percentage + "%";
    }

    if (scoreFill) {
      scoreFill.style.width =
        ((score / questions.length) * 100).toFixed(0) + "%";
    }
    if (scoreText) {
      scoreText.textContent = score + "/" + questions.length;
    }

    // Update results message based on score
    let titleText = "Quiz Complete!";
    let subtitleText = "Here's how you did";
    let messageText = "Great effort!";

    if (percentage === 100) {
      titleText = "Perfect Score!";
      subtitleText = "You aced every question!";
      messageText = "You're a true expert on this week's essential stories!";
    } else if (percentage >= 80) {
      titleText = "Excellent Work!";
      subtitleText = "You really know your stuff";
      messageText = "You've shown great knowledge of the essential stories.";
    } else if (percentage >= 60) {
      titleText = "Good Job!";
      subtitleText = "Solid performance";
      messageText = "You have a good understanding of the essential stories.";
    } else if (percentage >= 40) {
      titleText = "Not Bad!";
      subtitleText = "Room for improvement";
      messageText = "Keep reading to improve your knowledge.";
    } else {
      titleText = "Keep Learning!";
      subtitleText = "Practice makes perfect";
      messageText = "Try reading the stories again to improve your score.";
    }

    if (resultsTitle) {
      resultsTitle.textContent = titleText;
    }
    if (resultsSubtitle) {
      resultsSubtitle.textContent = subtitleText;
    }
    if (scoreMessage) {
      scoreMessage.textContent = messageText;
    }

    // Save score to localStorage
    saveScore(score, questions.length, percentage);
  }

  function saveScore(score, total, percentage) {
    try {
      const today = new Date();
      const weekNumber = getWeekNumber(today);
      const year = today.getFullYear();
      const key = `quiz-score-${year}-W${weekNumber}`;

      const scoreData = {
        score: score,
        total: total,
        percentage: percentage,
        date: today.toISOString(),
      };

      // Check if there's an existing score for this week
      const existingData = localStorage.getItem(key);
      if (existingData) {
        const existing = JSON.parse(existingData);
        // Keep best score only
        if (percentage > existing.percentage) {
          localStorage.setItem(key, JSON.stringify(scoreData));
        }
      } else {
        localStorage.setItem(key, JSON.stringify(scoreData));
      }
    } catch (e) {
      console.warn("Could not save score to localStorage:", e);
    }
  }

  function getWeekNumber(date) {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  function restartQuiz() {
    resultsScreen.classList.remove("active");
    startScreen.classList.add("active");
  }

  // Helper function to generate wrong answers
  function generateWrongAnswers(correctAnswer, allAnswers) {
    // Simple approach: pick 3 random answers from the quiz data
    const wrongAnswers = [];
    const availableAnswers = allAnswers
      .filter((a, i) => {
        if (typeof a === "object" && a !== null && a.answer) {
          return a.answer !== correctAnswer;
        }

        if (i % 2 !== 1) return false; // Only pick answers (odd indices)

        const answerText = typeof a === "object" && a.answer ? a.answer : a;
        return answerText !== correctAnswer && typeof answerText === "string";
      })
      .map((a) => (typeof a === "object" && a.answer ? a.answer : a));

    // Shuffle and take up to 3
    const shuffled = shuffleArray([...availableAnswers]);

    for (let i = 0; i < Math.min(3, shuffled.length); i++) {
      wrongAnswers.push(shuffled[i]);
    }

    // If we don't have enough wrong answers, create generic ones
    while (wrongAnswers.length < 3) {
      wrongAnswers.push(
        generateGenericWrongAnswer(correctAnswer, wrongAnswers.length),
      );
    }

    return wrongAnswers;
  }

  function generateGenericWrongAnswer(correctAnswer, index) {
    // This is a fallback - ideally all questions should have enough options
    const genericAnswers = [
      "None of the above",
      "All of the above",
      "Not mentioned in the story",
      "Further research is needed",
    ];
    return genericAnswers[index] || "Option " + (index + 2);
  }

  // Shuffle array using Fisher-Yates algorithm
  function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
})();
