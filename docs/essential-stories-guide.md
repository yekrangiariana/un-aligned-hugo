# Essential Stories of the Week – Implementation Guide

This guide explains how the **Essential Stories of the Week** feature works end‑to‑end in this Hugo site: how posts are selected, how the homepage carousel works, and how the quiz and quotes pages are generated and wired together.

## 1. Content: how stories are selected

To be part of **Essential Stories of the Week**, a post must:

- Live under `content/posts/`
- Include the category `"Essential Stories of the Week"` in its front matter, for example:

```yaml
categories:
  - "Essential Stories of the Week"
  - "Politics"
```

The templates use this category name verbatim (case‑sensitive string in Hugo, but often compared via `lower`), so keep the spelling exactly the same.

### Weekly window ("current week")

Most logic that shows the *current* weekly set uses:

- All posts in `Section == "posts"`
- Filtered to those whose `.Params.categories` intersect with `slice "Essential Stories of the Week"`
- Then further filtered to dates in the last 7 days using:

```go
$sevenDaysAgo := now.AddDate 0 0 -7
$essentialStories = where $essentialStories ".Date" "ge" $sevenDaysAgo
```

This 7‑day filter is used in:

- Homepage: [layouts/index.html](layouts/index.html)
- Default post view (for the carousel on non‑essential posts and to decide if a story is "recent"): [layouts/_default/single.html](layouts/_default/single.html)
- Carousel partial itself: [layouts/partials/essential-stories.html](layouts/partials/essential-stories.html)
- Quotes navigation (to decide which stories count as "recent" in the quotes view): [layouts/partials/essential-stories-quotes.html](layouts/partials/essential-stories-quotes.html)

The **quiz and quotes content** themselves now also use **only this week's Essential Stories posts** (the same 7‑day window). The 7‑day window controls both which stories are treated as "this week" for carousels/navigation **and** which quiz questions / quotes are included.

This selection logic is centralised in a shared context partial:

- [layouts/partials/essential-stories-context.html](layouts/partials/essential-stories-context.html)

That partial computes and caches, per page:

- `All` – all Essential Stories posts, newest first
- `Recent` – the subset of `All` whose date is within the last 7 days
- `SevenDaysAgo` – the cutoff date used for the weekly window

Other templates reuse this context via:

```go
{{ partial "essential-stories-context.html" . }}
{{- $es := .Scratch.Get "EssentialStoriesContext" -}}
{{- $all := $es.All -}}
{{- $recent := $es.Recent -}}
{{- $sevenDaysAgo := $es.SevenDaysAgo -}}
```

Outside that 7‑day window, posts still *belong* to the Essential Stories category, but are treated as older/archived for navigation purposes.

## 2. Homepage carousel

### Where it is rendered

On the homepage, the Essential Stories carousel is injected into the "Recent" section:

- Template: [layouts/index.html](layouts/index.html)
- Partial: [layouts/partials/essential-stories.html](layouts/partials/essential-stories.html)
- Styles: [assets/css/essential-stories.css](assets/css/essential-stories.css)
- Carousel JS (horizontal scroll / buttons): [static/js/essential-stories-carousel.js](static/js/essential-stories-carousel.js)

Snippet from `index.html` (simplified):

```go
{{ partial "essential-stories-context.html" . }}
{{- $es := .Scratch.Get "EssentialStoriesContext" -}}
{{- $essentialStories := $es.Recent -}}
...
<div class="essential-stories-carousel-wrapper">
  {{ partial "essential-stories.html" . }}
</div>
```

### How the partial works

The partial [layouts/partials/essential-stories.html](layouts/partials/essential-stories.html) is the core of the feature:

1. **Select this week’s stories**
  - Uses `$es.Recent` from the shared context (already filtered to Essential Stories within the last 7 days)
  - Sorts by date descending (`.ByDate.Reverse`)

2. **Render the carousel header**
   - Shows the title "Essential stories of the week" linking to the first story of the week
   - Renders previous/next arrow buttons (`.essential-prev` / `.essential-next`)

3. **Render article cards**
   - Loops over the weekly stories and builds each card with image, title, and description.
   - Adds helper CSS classes based on categories (`has-gallery`, `has-culture`, `has-interview`, `has-comments`) to style cards differently.

4. **Compute quiz and quotes availability**
   - Iterates over the same `$essentialStories` collection and:
     - Sums up all `.Params.quiz` items across stories → `$totalQuizQuestions`
     - Sums all `.Params.quotes` items across stories → `$totalQuotes`

5. **Render quiz and quotes tiles (if available)**
   - If `$totalQuizQuestions >= 3`, shows a **Weekly Quiz** card linking to `/essential-stories-quiz/`.
   - If `$totalQuotes >= 1`, shows a **Weekly Quotes** card linking to `/essential-stories-quotes/`.

These tiles are treated as extra cards in the same grid, so they appear in the carousel alongside the articles.

## 3. Essential Story view (single article)

When you open an individual Essential Story article, the layout switches to a special view.

### Detecting an Essential Story

At the top of [layouts/_default/single.html](layouts/_default/single.html), the template checks whether the current post belongs to the category:

```go
$isEssentialStory := false
range .Params.categories
  if eq (lower .) "essential stories of the week"
    $isEssentialStory = true
  end
end

if $isEssentialStory
  ...essential-story-view...
else
  ...default post view...
end
```

### Building the weekly context

Inside the `if $isEssentialStory` branch, the template:

1. **Loads CSS for this layout**
   - essential-stories styling
   - reading features styling

2. **Builds the set of Essential Stories**
  - Uses the shared context partial to get:
    - `$allEssentialStories` (all Essential Stories)
    - `$sevenDaysAgo` (cutoff date)
  - Computes a boolean `$isRecentStory` for the current article by comparing its date to `$sevenDaysAgo`.

3. **Chooses which stories to use for navigation**
  - If the current article is *recent* (within 7 days), navigation uses only `$es.Recent`.
  - Otherwise, it uses the full `$allEssentialStories` list from the shared context.

4. **Finds the current index**
   - Loops through `$essentialStories` to find the current story’s position (`$currentIndex`).

5. **Counts quiz questions and quotes across the nav set**
   - `$totalQuizQuestions` and `$totalQuotes` are computed here too.
   - These determine `$hasQuiz` (>= 3 questions) and `$hasQuotes` (>= 1 quote).

6. **Calculates previous/next**
   - `$prevStory` and `$nextStory` are computed based on `$currentIndex`.
   - If there is no `nextStory`, the current story is considered the last one (`$isLastStory = true`).

### Page layout

Within the Essential Story view:

- Wrapper: `.essential-story-view` + `.story-content-wrapper`
- Top controls:
  - `story-jump-menu.html` partial for quick jumping between stories, quiz, and quotes
  - A counter showing the current story’s position out of the total **navigation sequence** (all stories in the current set **plus** the quiz and quotes terminals when they exist).
- Main content:
  - Category badge: links to the Essential Stories category archive
  - Title, date, image + credits, reading‑feature tools
  - Article body as usual (`.Content`)

### Bottom navigation bar (progress bar)

For recent Essential Stories, the bottom bar is shown:

- `div.story-progress-bar` contains:
  - Previous button (either link to previous story or disabled button)
  - A row of progress segments:
    - One segment per story in the current nav set
    - One extra segment for the quiz (if `$hasQuiz`)
    - One extra segment for quotes (if `$hasQuotes`)
  - Next button:
    - To the next story if it exists
    - If this is the last story and `$hasQuiz` is true → link to `/essential-stories-quiz/`
    - If this is the last story and `$hasQuotes` is true (but no quiz) → link to `/essential-stories-quotes/`

This matches the mental model: read through all stories, then end at quiz and quotes.

### Interaction and navigation JS

The file [static/js/essential-stories.js](static/js/essential-stories.js) manages interactive behavior on Essential Story views and on the quiz/quotes pages:

- Detects `.essential-story-view`
- Handles:
  - Keyboard navigation (left/right arrows or A/D) between stories
  - Touch swipe gestures to move between stories on mobile
  - Partial page loading with `fetch()` to avoid full page reloads when you navigate via the bottom bar or jump menu
- Keeps track of read stories in `localStorage` to mark cards as "read" in the carousel.

You don’t usually need to touch this file unless you want to change navigation behavior.

## 4. Weekly Quiz page

The **Weekly Quiz** is a dedicated page that aggregates questions from all Essential Stories of the Week.

### Page entry point

- Content file: [content/pages/essential-stories-quiz.md](content/pages/essential-stories-quiz.md) (defines URL `/essential-stories-quiz/`)
- Layout: [layouts/_default/quiz.html](layouts/_default/quiz.html)
- Partial: [layouts/partials/essential-stories-quiz-simple.html](layouts/partials/essential-stories-quiz-simple.html)
- Styles: [assets/css/essential-stories.css](assets/css/essential-stories.css) and [assets/css/quiz-simple.css](assets/css/quiz-simple.css)
- JS: [static/js/essential-stories.js](static/js/essential-stories.js) and [static/js/quiz-simple.js](static/js/quiz-simple.js)

`quiz.html` is very small: it just loads the two CSS files, renders the partial, and attaches the JS.

### Collecting quiz data from posts

In [layouts/partials/essential-stories-quiz-simple.html](layouts/partials/essential-stories-quiz-simple.html):

1. It collects only the **recent** Essential Stories posts (7‑day window) from the shared context.
2. For each story, it reads `.Params.quiz` and supports two formats:
   - An array of question/answer *pairs* (simple list)
   - An array of objects with explicit `question` and `answer` fields
3. As it loops, it builds a `$quizData` slice of dictionaries containing:
   - `question`
   - `answer`
   - `articleTitle`
   - `articleUrl`

This `$quizData` is then JSON‑encoded and placed into a `data-quiz` attribute on the top `.essential-story-view.quiz-view` element:

```go
<div
  class="essential-story-view quiz-view"
  data-quiz="{{ $quizData | jsonify }}"
>
  ...
</div>
```

### Page structure

The quiz view consists of:

- Top controls: `story-jump-menu` and a numeric `story-controls-count` label showing the quiz’s position in the same sequence as the stories and quotes (for example, `4 / 5` for 3 stories + quiz + quotes).
- `.quiz-container`:
  - Start screen ("Test your knowledge")
  - Question screen (one question at a time)
  - Results screen (score, message, and call‑to‑action)
- Bottom navigation bar: `div.story-progress-bar`
  - Prev button goes back to the **last story** of the week
  - Progress segments: past/active stories + terminal segments for quiz/quotes
  - Next button goes to the `/essential-stories-quotes/` page
- A smaller per‑question progress bar inside the question screen

### Quiz logic (JavaScript)

[static/js/quiz-simple.js](static/js/quiz-simple.js) powers the quiz behavior:

- Reads the `data-quiz` JSON from `.quiz-view`
- Normalizes questions and answers
- Manages state: current question index, score, selected answer, etc.
- Handles both free‑text and multiple‑choice answers.
- Updates the top sticky `.quiz-progress` bar and the in‑question progress bar.
- Saves weekly scores to `localStorage`.

You normally edit the quiz **content** via front matter in the Essential Stories posts; you rarely need to touch the JS unless changing interactions.

For more detail on the quiz mechanics themselves, see [docs/quiz-feature-guide.md](docs/quiz-feature-guide.md).

## 5. Weekly Quotes page

The **Weekly Quotes** page aggregates quotes blocks from all Essential Stories.

### Page entry point

- Content file: [content/pages/essential-stories-quotes.md](content/pages/essential-stories-quotes.md)
- Layout: [layouts/_default/quotes.html](layouts/_default/quotes.html)
- Partial: [layouts/partials/essential-stories-quotes.html](layouts/partials/essential-stories-quotes.html)
- Styles: [assets/css/essential-stories.css](assets/css/essential-stories.css)
- JS: [static/js/essential-stories.js](static/js/essential-stories.js)

### Collecting quotes from posts

In [layouts/partials/essential-stories-quotes.html](layouts/partials/essential-stories-quotes.html):

1. It finds only the **recent** Essential Stories posts (7‑day window) from the shared context.
2. For each story, it iterates over `.Params.quotes` and expects objects like:

```yaml
quotes:
  - sentence: "A key quote from the article."
    attribute: "Person / source, context"
  - sentence: "Another quote."
    attribute: "Another source"
```

3. Each quote is turned into a dictionary with:
   - `sentence`
   - `attribute`
   - `storyTitle`
   - `storyUrl`
4. All these are appended to `$quotesData`.

If there are no valid quotes, the template falls back to a simple message ("No quotes have been added for this week yet.").

### Page layout

The quotes page is built as an `.essential-story-view.quotes-view`:

- Top controls: `story-jump-menu` with `CurrentPage` set to `"quotes"`, plus a `story-controls-count` label that always shows the **last** position in the weekly navigation sequence (quotes is the terminal page).
- Badge, title, and current date.
- Main content: a series of `<blockquote>`s, each with the quote text and attribution.
- Bottom navigation bar: `div.story-progress-bar`:
  - Previous button goes back to the quiz (if available) or to the last recent story.
  - Progress segments: past stories, optional quiz segment, and active quotes segment.
  - Next button is disabled (quotes is the terminal page).

## 6. Story jump menu

The top‑right **jump menu** lets users quickly move between:

- Each Essential Story
- The Weekly Quiz
- The Weekly Quotes

It is implemented in:

- [layouts/partials/story-jump-menu.html](layouts/partials/story-jump-menu.html)

This partial receives a dictionary including:

- `Stories` – the list of recent Essential Stories used for navigation
- `HasQuiz` – whether a quiz terminal page exists
- `HasQuotes` – whether a quotes terminal page exists
- `CurrentPath` – the current story path (for highlighting, when on a story)
- `CurrentPage` – empty for stories, or `"quiz"`/`"quotes"` for the terminal pages

The partial renders a dropdown list of story links, plus extra links for **Weekly Quiz** and **Weekly Quotes** when those pages are available. It uses `is-current` classes to highlight the current location.

## 7. File overview

Here’s a quick map of the key files involved:

- **Core selection & carousel**
  - [layouts/partials/essential-stories-context.html](layouts/partials/essential-stories-context.html)
  - [layouts/partials/essential-stories.html](layouts/partials/essential-stories.html)
  - [layouts/index.html](layouts/index.html)
  - [layouts/_default/single.html](layouts/_default/single.html) (for Essential Story view and default posts)
  - [static/js/essential-stories-carousel.js](static/js/essential-stories-carousel.js)
  - [assets/css/essential-stories.css](assets/css/essential-stories.css)

- **Essential Story navigation & interactions**
  - [static/js/essential-stories.js](static/js/essential-stories.js)
  - [layouts/partials/story-jump-menu.html](layouts/partials/story-jump-menu.html)

- **Weekly Quiz**
  - [content/pages/essential-stories-quiz.md](content/pages/essential-stories-quiz.md)
  - [layouts/_default/quiz.html](layouts/_default/quiz.html)
  - [layouts/partials/essential-stories-quiz-simple.html](layouts/partials/essential-stories-quiz-simple.html)
  - [static/js/quiz-simple.js](static/js/quiz-simple.js)
  - [assets/css/quiz-simple.css](assets/css/quiz-simple.css)

- **Weekly Quotes**
  - [content/pages/essential-stories-quotes.md](content/pages/essential-stories-quotes.md)
  - [layouts/_default/quotes.html](layouts/_default/quotes.html)
  - [layouts/partials/essential-stories-quotes.html](layouts/partials/essential-stories-quotes.html)

- **Documentation (this file and related guides)**
  - [docs/essential-stories-guide.md](docs/essential-stories-guide.md)
  - [docs/quiz-feature-guide.md](docs/quiz-feature-guide.md)
  - [docs/carousel-feature-guide.md](docs/carousel-feature-guide.md)

## 8. How to add or update a weekly set

1. **Create or edit posts** under `content/posts/`.
2. Make sure each story that should appear this week has the category `"Essential Stories of the Week"` and a recent `.Date` (within the last 7 days).
3. Optionally add quiz and quotes data in front matter:
   - `quiz:` section with either Q/A pairs or objects
   - `quotes:` list with `sentence` and `attribute` fields
4. Hugo will automatically:
   - Include the stories in the homepage Essential Stories carousel
   - Wire up the Essential Story single views with bottom navigation and jump menu
   - Aggregate quiz questions for `/essential-stories-quiz/`
   - Aggregate quotes for `/essential-stories-quotes/`

You can adjust behavior (like how many days are considered a "week" or when to show quiz/quotes) by tweaking the filters and thresholds in the templates noted above.
