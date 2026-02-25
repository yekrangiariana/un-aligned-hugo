/**
 * Simplified Essential Stories Quiz
 * Minimal JS for reveal functionality only
 */

(function () {
  "use strict";

  const quizView = document.querySelector(".quiz-simple-view");
  if (!quizView) return;

  // Handle reveal button clicks
  const revealButtons = quizView.querySelectorAll(".quiz-reveal-btn");

  revealButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const questionBlock = this.closest(".quiz-simple-question");
      if (!questionBlock) return;

      const correctAnswer = questionBlock.dataset.correct;
      const options = questionBlock.querySelectorAll(".quiz-option");
      const singleAnswerText = questionBlock.querySelector(".quiz-answer-text");

      // Mark button as revealed
      this.classList.add("revealed");
      this.textContent = "Revealed";
      this.disabled = true;

      // For single answer questions, show the answer
      if (singleAnswerText) {
        singleAnswerText.hidden = false;
      }

      // For multiple choice, mark correct/incorrect
      if (options.length > 0) {
        let userSelectedCorrect = false;

        // First pass: check if user selected the correct answer
        options.forEach((option) => {
          const input = option.querySelector('input[type="radio"]');
          const optionValue = input?.value;
          if (input?.checked && optionValue === correctAnswer) {
            userSelectedCorrect = true;
          }
        });

        // Second pass: apply styling
        options.forEach((option) => {
          const input = option.querySelector('input[type="radio"]');
          const optionValue = input?.value;
          const iconEl = option.querySelector(".quiz-result-icon");

          // Disable further selection
          option.classList.add("disabled");
          option.classList.remove("selected");
          if (input) input.disabled = true;

          if (userSelectedCorrect) {
            // User got it right - only mark their correct answer
            if (input?.checked && optionValue === correctAnswer) {
              option.classList.add("correct");
              if (iconEl) iconEl.textContent = "✓";
            }
          } else {
            // User got it wrong
            // Mark user's incorrect selection with X
            if (input?.checked && optionValue !== correctAnswer) {
              option.classList.add("incorrect");
              if (iconEl) iconEl.textContent = "✗";
            }
            // Highlight the correct answer with tick
            if (optionValue === correctAnswer) {
              option.classList.add("correct-highlight");
              if (iconEl) iconEl.textContent = "✓";
            }
          }
        });
      }
    });
  });

  // Track selected option for visual feedback
  const radioInputs = quizView.querySelectorAll(
    '.quiz-option input[type="radio"]',
  );
  radioInputs.forEach((input) => {
    input.addEventListener("change", function () {
      const questionBlock = this.closest(".quiz-simple-question");
      if (!questionBlock) return;

      // Remove selected class from all options in this question
      const options = questionBlock.querySelectorAll(".quiz-option");
      options.forEach((opt) => opt.classList.remove("selected"));

      // Add selected class to current option
      const parentOption = this.closest(".quiz-option");
      if (parentOption) {
        parentOption.classList.add("selected");
      }
    });
  });
})();
