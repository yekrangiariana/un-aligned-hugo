# Essential Stories Quiz Feature

## Overview
A simple, inline quiz that displays all questions from the Essential Stories of the Week on a single page. Questions are displayed in a numbered list with multiple choice options and a "Reveal" button for each.

## Files

### Layouts
- `/layouts/partials/essential-stories-quiz-simple.html` - Quiz page partial template
- `/layouts/_default/quiz.html` - Quiz page layout

### Assets
- `/assets/css/quiz-simple.css` - Quiz styling (light/dark mode support)
- `/static/js/quiz-simple.js` - Minimal reveal button functionality

### Content
- `/content/pages/essential-stories-quiz.md` - Quiz page content file

## How to Use

### Adding Quiz Questions to Essential Stories

Add quiz questions to any post's frontmatter using this format:

**For single-answer questions:**
```yaml
quiz:
  - question: "What is the capital of France?"
    answer: "Paris"
```

**For multiple-choice questions:**
```yaml
quiz:
  - question: "How long can crocodiles stay underwater?"
    answer:
      - "Two hours"          # First item is the correct answer
      - "Only about three minutes"
      - "30 minutes"
      - "Eight hours or more"
```

**Important:** For multiple choice questions, the first item in the answer array is always the correct answer.

### Quiz Display

- Questions are displayed in a numbered list
- Multiple choice shows radio buttons for each option
- Single-answer questions show the answer after clicking "Reveal"
- Each question has a "Reveal" button to show the answer
- After reveal, shows which article the question came from

### Navigation

- The quiz appears as part of the Essential Stories navigation
- Users can navigate between stories and the quiz using the jump menu
- Quiz shows the position in the story sequence (e.g., "8 / 9")

### Styling

- Matches the Essential Stories page design
- Clean, minimal interface
- Full dark mode support
- Responsive for mobile devices

### Customization

**Styling:** Edit `quiz-simple.css` to change:
- Colors, spacing, and typography
- Reveal button appearance
- Option styling (selected, correct, incorrect states)

**Behavior:** Edit `quiz-simple.js` to customize:
- Reveal animation
- Feedback display

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design for all screen sizes
3. Leaderboard functionality
4. Share results on social media
5. More sophisticated answer generation
6. Question images/media support
