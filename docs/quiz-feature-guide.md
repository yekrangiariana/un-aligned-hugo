# Essential Stories Quiz Feature

## Overview
An interactive quiz game that appears as the final item in the Essential Stories carousel. The quiz collects questions from all essential stories' frontmatter and presents them in an engaging, game-like format.

## Files Created

### 1. Layouts
- `/layouts/partials/essential-stories-quiz.html` - Quiz page partial template
- `/layouts/_default/quiz.html` - Quiz page layout

### 2. Assets
- `/assets/css/quiz-game.css` - Complete quiz styling (light/dark mode support)
- `/static/js/quiz-game.js` - Interactive quiz game logic

### 3. Content
- `/content/pages/essential-stories-quiz.md` - Quiz page content file

### 4. Modified Files
- `/layouts/_default/single.html` - Updated to show quiz link on last story
- Sample essential stories posts - Added quiz data examples

## How to Use

### Adding Quiz Questions to Essential Stories

Add quiz questions to any post's frontmatter using this format:

```yaml
---
title: "Your Story Title"
categories:
  - "Essential Stories of the Week"
quiz:
  - "Question 1?"
  - "Answer to question 1"
  - "Question 2?"
  - "Answer to question 2"
  - "Question 3?"
  - "Answer to question 3"
---
```

**Important:** Questions and answers alternate in pairs:
- Odd-indexed items (1, 3, 5...) are questions
- Even-indexed items (2, 4, 6...) are the correct answers

### Quiz Features

1. **Start Screen**
   - Shows total number of questions
   - Clean, inviting interface
   - "Start Quiz" button to begin

2. **Question Screen**
   - Progress bar showing completion
   - Question display
   - Multiple choice options (4 options per question)
   - Immediate feedback (correct/incorrect)
   - "Next Question" button

3. **Results Screen**
   - Animated score circle
   - Percentage display
   - Performance-based messages
   - "Try Again" and "Back to Home" buttons

### Navigation Flow

1. Users read through essential stories
2. On the last story, they see "Up next: Weekly Quiz"
3. "Next" button shows "Quiz" instead of being disabled
4. Navigate back from quiz to the last story
5. Progress bar includes quiz as final segment

### Styling

The quiz matches the essential stories design:
- Same color scheme and typography
- Smooth animations and transitions
- Fully responsive (mobile and desktop)
- Dark mode support
- Accessible controls

### Quiz Logic

The JavaScript handles:
- Loading quiz data from frontmatter
- Generating multiple choice options
- Shuffling options randomly
- Tracking score and progress
- Animating transitions between screens
- Calculating and displaying results

### Customization

**Colors:** Edit `quiz-game.css` to change:
- Primary color: Look for `var(--color-primary)`
- Success/error colors: `#22c55e` and `#ef4444`
- Background colors: `var(--color-background)`

**Messages:** Edit `quiz-game.js` to customize:
- Feedback messages (line ~156)
- Results titles/subtitles (line ~171-189)

**Layout:** Edit `essential-stories-quiz.html` to change:
- Start screen information
- Question layout
- Results display

## Testing

Three sample posts have been updated with quiz questions:
1. `/content/posts/2026-02-14.md` - 2 questions
2. `/content/posts/2026-02-14 copy.md` - 2 questions
3. `/content/posts/2026-02-14 copy 2.md` - 2 questions

Total: 6 questions in the quiz

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design for all screen sizes

## Future Enhancements

Possible improvements:
1. Timer for each question
2. Question categories/difficulty levels
3. Leaderboard functionality
4. Share results on social media
5. More sophisticated answer generation
6. Question images/media support
