# Portfolio — Product Requirements

## Overview

Product requirements for my portfolio website, a terminal-style single page.

- Reference product: https://terminal.satnaing.dev/. Study it only through the live site: using it and inspecting what the page delivers (DOM, CSS, shipped JS). Its GitHub repository is intentionally not used.
- **This PRD has higher priority than the reference product.** Where they differ, follow this document.
- Architecture and dev conventions live in `CLAUDE.md`, not here.
- Items marked `TODO(Han)` are open decisions. Agents must not resolve them on their own; ask Han.

### Out of scope

These reference-site features are intentionally **not** included:

- `echo` command
- `gui` command
- `socials` command (replaced by `connect`)

## Main layout and features

- **UI-LAYOUT-1** The whole screen is a terminal window. No desktop background; the page should feel immersive, like using a terminal. No visible frame or border. When output is taller than the screen, the whole page scrolls.
- **UI-LAYOUT-2** On first load, the terminal runs `welcome` automatically. Typing `welcome` later prints the same output again.
- **UI-LAYOUT-3** The input line stays below the latest output. When new output is added, the terminal scrolls to the bottom.
- **UI-PROMPT-1** Every input line and every past command line is prefixed with the prompt `visitor@han3zeng:~$`. At viewport width < 768px, the prompt is on its own line and the input (or past command) is on the next line, prefixed with `>`. The input stays a single line and scrolls horizontally inside itself.
- **UI-FONT-1** JetBrains Mono is used everywhere, with a 16px base size.

### Input behavior

- **INPUT-1** Enter submits the current input. The submitted line (prompt + text) is printed, followed by the command's output.
- **INPUT-2** Submitting an empty or whitespace-only input prints a new prompt line with no output and no error. Empty input is not recorded in history.
- **INPUT-3** Commands are trimmed of leading/trailing spaces before matching. Matching is case-sensitive, like a real shell (`HELP` → command not found). Arguments are separated by runs of whitespace (`connect  go 1` = `connect go 1`). History and `command not found: <input>` show the input exactly as typed.
- **INPUT-4** Commands that take no arguments print `Usage: <command>` when given arguments (e.g. `about foo`).
- **INPUT-5** Clicking anywhere on the page focuses the input.
- **INPUT-6** Commands with side effects (`email`, `resume`, `themes set`, `connect go`) perform the side effect **only once, at the moment the command is submitted**. Re-rendering or replaying output must never re-trigger it.
- **INPUT-7** Keyboard shortcuts (the Ctrl key on every platform, including macOS):
  - ↑ / ↓ cycle through previously submitted commands.
  - Tab autocompletes command names only (never arguments). One match: the input becomes the command plus a trailing space. Several matches: the input is extended to their longest common prefix and the matches are listed as hints below the input.
  - Ctrl+L clears the screen like `clear`, but keeps the current input text and is not recorded in history.
  - Ctrl+A moves the cursor to the start of the input.
  - Ctrl+K deletes everything from the cursor to the end of the input.
  - Each shortcut prevents the browser's default action for that key (e.g. Ctrl+A must not select the whole page).
  - Cmd/Meta combinations are not intercepted; they keep the browser's native behavior.
- **INPUT-8** The block cursor █ is drawn at the current caret position, not always at the end of the input, so it follows ←/→, Ctrl+A and Ctrl+K. When the input is not focused, the cursor is a hollow, non-blinking block.

## Commands

Available commands: `about`, `clear`, `connect`, `education`, `email`, `help`, `history`, `projects`, `pwd`, `resume`, `themes`, `welcome`, `whoami`.

### about — CMD-ABOUT

**Print**

```
Hi! I am Han from Taiwan, a front-end engineer with an insatiable curiosity.
I love to make impacts through coding.
```

### clear — CMD-CLEAR

**Action**

- Removes every entry (prompt lines and outputs) from the terminal. The input line remains.
- Like a real terminal, `clear` does **not** erase command history: `history` and ↑ / ↓ still show earlier commands.

### connect — CMD-CONNECT

**Action**

- `connect` prints the list below. Each URL is a clickable link that opens in a new tab.
- `connect go <n>` opens link n in a new tab and prints nothing else.
- `connect go <n>` with n outside 1–3, or any other argument, prints the two usage lines only.

**Print**

```
Let's connect!

1. Substack   - https://substack.com/@han3zeng
2. GitHub     - https://github.com/han3zeng
3. LinkedIn   - https://www.linkedin.com/in/han3zeng

Usage: connect go <social-no>
eg: connect go 1
```

### education — CMD-EDUCATION

**Print**

```
M.S. in Computer Science
Northwestern University | US | 2014 - 2015

B.E. in Electrical Engineering
National Chi Nan University | TW | 2009 - 2012
```

### email — CMD-EMAIL

**Action**

- On submit, navigate to `mailto:hanyutseng.hyt@gmail.com` (via `window.location.href`) to open the visitor's mail client.

**Print**

```
My favorite quote from the show How I Met Your Mother
Barney: "Ted, say 'I'm' your best friend."

Well, hey, you! Be my best friend!
Shoot me an email, let's chat: hanyutseng.hyt@gmail.com
```

The address is printed so visitors without a mail client can still copy it.

### help — CMD-HELP

The section headings (`ABOUT ME`, `UTILITIES`, `TERMINAL`) are in `primary`; every other line is `fg`.

**Print**

```
Available commands in this terminal

ABOUT ME
  about       Curious about me? Take a peek
  education   Where I earned my brainpower
  email       Shoot me an email
  projects    See what I've been cooking
  resume      My career highlights, minus all the embarrassing bits
  connect     Let's be internet friends
  themes      Change the vibe
  welcome     Back to square one

UTILITIES
  help        List all available commands

TERMINAL
  clear       Clear the terminal
  history     View command history
  pwd         Print current working directory
  whoami      A stranger, for now
```

### history — CMD-HISTORY

**Action**

- Prints the submitted commands, oldest first, one per line, including the `history` command itself.
- The automatic `welcome` on first load counts as the first history entry.

### projects — CMD-PROJECTS

**Action**

- Lists all projects. Each title line, including its number (e.g. `1. Yahoo News and E-commerce`), is rendered in the accent color. URLs are clickable links that open in a new tab; they are accent and underlined, so they stand apart from titles (which are not underlined). Descriptions are `fg`.

**Print**

```
1. Yahoo News and E-commerce
https://tw.yahoo.com
https://tw.buy.yahoo.com
Once, the most representative internet portal and index site in Taiwan.
Yup, I know, once.

2. Recall Election: Live Results and News
https://hanrecall.pts.org.tw/
Once upon a time, a master of corny jokes became a city mayor in Taiwan.
He was later recalled for making too many corny jokes.

3. PRO360
https://www.pro360.com.tw
What?! You've never heard of PRO360?
Well, there's a saying among us employees: Thumbtack is our Figma.

4. TW Reporter
https://www.twreporter.org/
The non-profit digital news outlet in Taiwan, renowned for long-form investigative journalism.
```

### pwd — CMD-PWD

**Print**

```
/home/han3zeng
```

### resume — CMD-RESUME

**Action**

- On submit, download `public/resume.pdf` (served as `<basePath>/resume.pdf`, see NFR-BUILD-2).

**Print**

```
I am looking forward to hearing from you.
(Come on! please! give me job.)
```

### themes — CMD-THEMES

**Action**

- `themes` lists all available themes and the usage below.
- `themes set <theme_name>` switches the page theme immediately and prints nothing.
- `themes set <unknown>` or any other argument prints only the `## How to use` block (its three lines), not the theme list.
- Theme names are case-sensitive: `themes set Ubuntu` prints the usage block.
- The default theme on first visit is `dark`. The OS light/dark setting is ignored.
- The chosen theme persists across page reloads.

**Print**

```
dark, light, matrix, ubuntu

## How to use
themes set [theme_name]
e.g. themes set matrix
```

### welcome — CMD-WELCOME

**Layout**

- Responsive breakpoint at 768px:
  - Desktop: viewport width ≥ 768px
  - Tablet and mobile: viewport width < 768px (the same breakpoint as the two-line prompt in UI-PROMPT-1)
- Desktop: a flex row with two children. The description is on the left and the graphic on the right. The graphic is scaled so that it is the same height as the description section. The scale is uniform (the same factor for width and height), so the graphic's shape never changes.
- Tablet and mobile: the graphic is hidden, and the description shows the narrow banner instead of the wide one.
- The ASCII art must never overflow the viewport horizontally.
- The banner (wide or narrow) is in `primary`; everything else is `fg`. Screen readers announce the banner as "Han Zeng"; the graphic is decorative and hidden from them.

**Description section prints** (desktop: wide banner)

```
 _   _    _    _   _   _____ _____ _   _  ____
| | | |  / \  | \ | | |__  /| ____| \ | |/ ___|
| |_| | / _ \ |  \| |   / / |  _| |  \| | |  _
|  _  |/ ___ \| |\  |  / /_ | |___| |\  | |_| |
|_| |_/_/   \_\_| \_| /____||_____|_| \_|\____|


Welcome to my terminal!
Want to get to know me better? Type `help` to see how you can explore here.
```

**Narrow banner** (tablet and mobile), replacing the wide banner above:

```
 _   _    _    _   _
| | | |  / \  | \ | |
| |_| | / _ \ |  \| |
|  _  |/ ___ \| |\  |
|_| |_/_/   \_\_| \_|

 _____ _____ _   _  ____
|__  /| ____| \ | |/ ___|
  / / |  _| |  \| | |  _
 / /_ | |___| |\  | |_| |
/____||_____|_| \_|\____|
```

**Graphic section prints** (desktop only)

```
                           __
                         _/  \_
                        /      \__
                   ____/          \_
                 _/                 \_
                /                    )
               /                    /
              /                    (
             /                      \
            /                        |
           /                         /
          /                         (
         /                           \
        /                            /
       /                            /
      /                            (
     /                              |
    /                              /
   /                              /
  /                              /
 /                              _/
|                              /
|                             /
 \                           /
  |                         /
  /                        /
  \                       /
   \                     /
    \                   /
     \                 /
      \               /
       \             /
        \           /
         \         /
          \       /
           \     /
            \   /
             | |
             | |
              \/
```

### whoami — CMD-WHOAMI

**Print**

```
A curious soul with root access to absolutely nothing
```

### Invalid commands — CMD-NOT-FOUND

When the input matches no command, print:

```
command not found: <input>
```

## Style

### Theme colors

Four themes: dark, light, matrix, ubuntu. Each defines the same semantic tokens.

| Token           | Usage                             |
| --------------- | --------------------------------- |
| `bg`            | Page background, terminal surface |
| `bg-alt`        | Alternate panels                  |
| `fg`            | Body text and long descriptions   |
| `primary`       | Prompt, headings, cursor          |
| `accent`        | Terminal borders and active links |
| `muted`         | Secondary information             |
| `border-subtle` | Dividers and inactive elements    |

| Token           | Dark    | Light (Solarized Light) | Matrix (Classic Green) | Ubuntu (Classic Terminal) |
| --------------- | ------- | ----------------------- | ---------------------- | ------------------------- |
| `bg`            | #091321 | #FDF6E3                 | #050B06                | #300A24                   |
| `bg-alt`        | #101E30 | #EEE8D5                 | #0C1A0F                | #40142F                   |
| `fg`            | #D3E9E6 | #586E75                 | #B6F5C5                | #F2EDEB                   |
| `primary`       | #8FFFE0 | #2074AF                 | #00FF41                | #8AE234                   |
| `accent`        | #54DCC0 | #207B74                 | #39D65A                | #E95420                   |
| `muted`         | #91ADA9 | #5E737A                 | #75A982                | #B9A9B4                   |
| `border-subtle` | #244353 | #D6CEBA                 | #244B30                | #69465E                   |

The light theme's `primary`, `accent` and `muted` are the Solarized hues darkened just enough to meet NFR-A11Y-3 (the original Solarized values `#268BD2`, `#2AA198`, `#657B83` are below 4.5:1 on `#FDF6E3`).

Which part of the terminal uses which token:

| Part                                                   | Token                    |
| ------------------------------------------------------ | ------------------------ |
| Page background                                        | `bg`                     |
| Prompt `visitor@han3zeng:~$` and the narrow `>` marker | `primary`                |
| Block cursor (solid and hollow)                        | `primary`                |
| Past command text and command output                   | `fg`                     |
| Tab hints                                              | `muted`                  |
| Headings inside outputs (e.g. `## How to use`)         | `primary`                |
| Links inside outputs                                   | `accent`                 |
| Browser `theme-color` meta                             | the current theme's `bg` |

Switching themes is instant (no color transition). On load, the saved theme is applied before the first paint, with no flash of another theme.

### Design guide

- Square corners everywhere. No rounded cards, pill buttons, or glassmorphism.
- Flat backgrounds. No gradients, shadows, or background imagery.
- Block cursor. Use █ instead of the browser's thin caret.
- Character-grid spacing. Build the interface around consistent rows and columns.
- Minimal animation. A blinking cursor is enough; CRT effects are optional.

### Visual references

- https://terminal.satnaing.dev/
- https://www.vice.com/en/article/how-the-matrix-inspired-a-new-generation-of-hackers/

## Non-functional requirements

- **NFR-A11Y-1** The input has an accessible label. New command output is announced to screen readers (`aria-live="polite"`).
- **NFR-A11Y-2** With `prefers-reduced-motion: reduce`, the cursor does not blink.
- **NFR-A11Y-3** In every theme, `fg`, `primary` and `muted` on `bg` meet WCAG AA contrast (4.5:1).
- **NFR-MOBILE-1** Tapping the terminal opens the on-screen keyboard. No horizontal page scroll at 375px width.
- **NFR-SEO-1** The page has a title (`Han Zeng — Terminal Portfolio`), meta description (`Terminal-style portfolio of Han Zeng, front-end engineer.`), Open Graph image, and favicon. The OG image (1200×630) and the icons are generated at build time in the dark theme.
- **NFR-BUILD-1** The site is fully statically generated (no server runtime).
- **NFR-BUILD-2** The site is deployed to GitHub Pages at https://han3zeng.github.io/terminal-portfolio/ by a GitHub Actions workflow on push to `main`. Because of that sub-path, the `basePath` is `/terminal-portfolio`, and every asset and file link (including `/resume.pdf`) must include it.
