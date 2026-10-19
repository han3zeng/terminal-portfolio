# Portfolio — Product Requirements

## Overview
Product requirements for my portfolio website, a terminal-style single page.

- Reference product: https://terminal.satnaing.dev/ (source: https://github.com/satnaing/terminal-portfolio)
- **This PRD has higher priority than the reference product.** Where they differ, follow this document.
- Architecture and dev conventions live in `CLAUDE.md`, not here.
- Items marked `TODO(Han)` are open decisions. Agents must not resolve them on their own; record them as open questions.

### Out of scope
These reference-site features are intentionally **not** included:
- `echo` command
- `gui` command
- `socials` command (replaced by `connect`)


## Main layout and features

- **UI-LAYOUT-1** The whole screen is a terminal window. No desktop background; the page should feel immersive, like using a terminal.
- **UI-LAYOUT-2** On first load, the terminal runs `welcome` automatically. Typing `welcome` later prints the same output again.
- **UI-LAYOUT-3** The input line stays below the latest output. When new output is added, the terminal scrolls to the bottom.
- **UI-PROMPT-1** Every input line and every past command line is prefixed with the prompt.
  > TODO(Han): prompt text. Suggested: `visitor@han3zeng:~$`
- **UI-FONT-1** A single monospace font is used everywhere.
  > TODO(Han): font and base size. Suggested: IBM Plex Mono (same as the reference) or JetBrains Mono, 16px.

### Input behavior
- **INPUT-1** Enter submits the current input. The submitted line (prompt + text) is printed, followed by the command's output.
- **INPUT-2** Submitting an empty or whitespace-only input prints a new prompt line with no output and no error.
- **INPUT-3** Commands are trimmed of leading/trailing spaces before matching.
  > TODO(Han): case sensitivity. Suggested: case-sensitive, like a real shell (`HELP` → command not found).
- **INPUT-4** Commands that take no arguments print `Usage: <command>` when given arguments (e.g. `about foo`).
- **INPUT-5** Clicking anywhere on the page focuses the input.
- **INPUT-6** Commands with side effects (`email`, `resume`, `themes set`) perform the side effect **only once, at the moment the command is submitted**. Re-rendering or replaying output must never re-trigger it.
- **INPUT-7** Keyboard shortcuts:
  > TODO(Han): mark each as in or out of scope. Suggested: all in.
  > - ↑ / ↓ cycle through previously submitted commands
  > - Tab autocompletes a command; if several match, list the matches as hints below the input
  > - Ctrl+L behaves like `clear`


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
  > TODO(Han): does `clear` also wipe the list shown by `history`? The reference wipes it; a real terminal does not. Suggested: keep history.

### connect — CMD-CONNECT
> TODO(Han): this command is undefined. Needed:
> - the list of accounts and URLs (e.g. GitHub, LinkedIn)
> - how a link is opened. Suggested: each URL is a clickable link opening in a new tab. Optionally, `connect go <n>` opens link n in a new tab, like the reference's `socials go <n>`.

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
- On submit, navigate to `mailto:<address>` (via `window.location.href`) to open the visitor's mail client.
  > TODO(Han): email address.

**Print**
```
My favorite quote from the show How I Met Your Mother
Barney: "Ted, say 'I'm' your best friend."

Well, hey, you! Be my best friend!
Shoot me an email, let's chat: <address>
```
The address is printed so visitors without a mail client can still copy it.

### help — CMD-HELP
**Print**
```
These are all available commands in this terminal.

About me
- about: want to know more about me?
- education: my education background
- email: send an email to me
- projects: view all work that I have participated in
- resume: download my resume
- connect: check out my social accounts
- themes: check available themes
- welcome: display hero section

Utilities
- help: list all available commands

Typical terminal commands
- clear: clear the terminal
- history: view command history
- pwd: print current working directory
- whoami: people who want to be my friend
```

### history — CMD-HISTORY
**Action**
- Prints the submitted commands, oldest first, one per line, including the `history` command itself.
  > TODO(Han): does the automatic `welcome` on first load count as a history entry? Suggested: yes (the reference does this).

### projects — CMD-PROJECTS
**Action**
- Lists all projects. Each title is rendered in the accent color. URLs are clickable links that open in a new tab.

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
Well, there's a saying here: Thumbtack is our Figma.

4. TW Reporter
https://www.twreporter.org/
The non-profit digital news outlet in Taiwan, renowned for long-form investigative journalism.
```
> TODO(Han): confirm the PRO360 joke. Did you mean "PRO360 is our Thumbtack"?

### pwd — CMD-PWD
**Print**
```
/home/han3zeng
```

### resume — CMD-RESUME
**Action**
- On submit, download the resume file.
  > TODO(Han): file name. Suggested: `public/resume.pdf`, served as `/resume.pdf`.

**Print**
```
I am looking forward to hearing from you.
(Come on! please! give me job.)
```

### themes — CMD-THEMES
**Action**
- `themes` lists all available themes and the usage below.
- `themes set <theme_name>` switches the page theme immediately.
- `themes set <unknown>` or any other argument prints the usage below.
- The chosen theme persists across page reloads.
  > TODO(Han): default theme on first visit. Suggested: `dark` (not the OS setting).
  > TODO(Han): output after a successful `themes set`. Suggested: none.

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
  - Desktop: viewport width > 768px
  - Tablet and mobile: viewport width ≤ 768px
- Container is a flex box with two children: description and graphic.
  - Desktop: `flex-direction: row` (description left, graphic right)
  - Tablet and mobile: `flex-direction: column-reverse` (graphic above description)
- The ASCII art must not overflow the viewport horizontally.
  > TODO(Han): the banner is about 47 characters wide and will not fit a 375px phone at 16px. Pick one: (a) scale the font size down, (b) show a narrower banner on mobile, (c) hide the graphic on mobile. The reference hides both below 550px and shows a narrower banner.

**Description section prints**
```
 _   _    _    _   _   _____ _____ _   _  ____
| | | |  / \  | \ | | |__  /| ____| \ | |/ ___|
| |_| | / _ \ |  \| |   / / |  _| |  \| | |  _
|  _  |/ ___ \| |\  |  / /_ | |___| |\  | |_| |
|_| |_/_/   \_\_| \_| /____||_____|_| \_|\____|


Welcome to my terminal!
Want to get to know me better? Type `help` to see how you can explore here.
```

**Graphic section prints** the pattern below, scaled to fit beside the description on desktop.
> TODO(Han): the original sentence was cut off ("which should be h…"). Suggested: on desktop, the graphic is no taller than the description section.
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
visitor
```

### Invalid commands — CMD-NOT-FOUND
When the input matches no command, print:
```
command not found: <input>
```


## Style

### Theme colors
Four themes: dark, light, matrix, ubuntu. Each defines the same semantic tokens.

| Token | Usage |
| --- | --- |
| `bg` | Page background, terminal surface |
| `bg-alt` | Alternate panels |
| `fg` | Body text and long descriptions |
| `primary` | Prompt, headings, cursor |
| `accent` | Terminal borders and active links |
| `muted` | Secondary information |
| `border-subtle` | Dividers and inactive elements |

| Token | Dark | Light (Solarized Light) | Matrix (Classic Green) | Ubuntu (Classic Terminal) |
| --- | --- | --- | --- | --- |
| `bg` | #091321 | #FDF6E3 | #050B06 | #300A24 |
| `bg-alt` | #101E30 | #EEE8D5 | #0C1A0F | #40142F |
| `fg` | #D3E9E6 | #586E75 | #B6F5C5 | #F2EDEB |
| `primary` | #8FFFE0 | #268BD2 | #00FF41 | #8AE234 |
| `accent` | #54DCC0 | #2AA198 | #39D65A | #E95420 |
| `muted` | #91ADA9 | #657B83 | #75A982 | #B9A9B4 |
| `border-subtle` | #244353 | #D6CEBA | #244B30 | #69465E |

### Design guide
- Square corners everywhere. No rounded cards, pill buttons, or glassmorphism.
- Flat backgrounds. No gradients, shadows, or background imagery.
- Block cursor. Use █ instead of the browser's thin caret.
- Character-grid spacing. Build the interface around consistent rows and columns.
- Minimal animation. A blinking cursor is enough; CRT effects are optional.

### Visual references
- https://terminal.satnaing.dev/
- https://www.vice.com/en/article/how-the-matrix-inspired-a-new-generation-of-hackers/
- `docs/assets/screen-sample.png`


## Non-functional requirements
- **NFR-A11Y-1** The input has an accessible label. New command output is announced to screen readers (`aria-live="polite"`).
- **NFR-A11Y-2** With `prefers-reduced-motion: reduce`, the cursor does not blink.
- **NFR-A11Y-3** In every theme, `fg`, `primary` and `muted` on `bg` meet WCAG AA contrast (4.5:1).
- **NFR-MOBILE-1** Tapping the terminal opens the on-screen keyboard. No horizontal page scroll at 375px width.
- **NFR-SEO-1** The page has a title, meta description, Open Graph image, and favicon.
- **NFR-BUILD-1** The site is fully statically generated (no server runtime).
  > TODO(Han): deploy target (Vercel or GitHub Pages). GitHub Pages needs a `basePath`.
