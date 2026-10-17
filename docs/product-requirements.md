
# Portfolio
## Overview
This is product requirements and development requirements for building my portfolio.
My website is model from the site: https://terminal.satnaing.dev/


## Main Layout and features
- The whole screen is a terminal window. There is no desktop background, the page should offer this immersive feel that you are using a terminal
- The landing UI should be at welcome page i.e., `welcome` command will print the same thing again.
- The terminal should have preset commands like
    - about
    - clear
    - education
    - email
    - help
    - history
    - projects
    - pwd
    - resume
    - connect
    - themes
    - welcome
    - whoami


## commands
### about
**Print**
```
Hi! I am Han from Taiwan, a front-end engineer with an insatiable curiosity. 
I love to make impacts through coding.
```


### clear
**Action**
Just clear the terminal

### education

**Print**
```
M.S. in Computer Science
Northwestern University | US | 2014 - 2015

B.E. in Electrical Engineering 
National Chi Nan University | TW | 2009 - 2012
```


### email
**Action***
- Use ` window.location.href` to open the internal mail service with `mailto:${emailTo}?`


**Print**
```
My favorite quote form the show How I met your mother
Brney: "Ted, say 'I'm' your best friend."

Well, Hey, you! Be my best friend!
Shoot me an email, let's chat.
```

### help
**Action**
- List all commands in terminal style

**Print**
```
These are all available commands in this terminal.

About me
- about: want to know more about me?
- education: 
- email: send an email to me
- projects: view all work that I have participated with
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

### history
**Action**
- view command history just like terminal


### projects
**Action**
- List all project

**Print**
```
<br>1. Yahoo News and E-commerce</br>
https://tw.yahoo.com
https://tw.buy.yahoo.com
Once, the most representative internet portal and index site in Taiwan.
Yup, I know, once.

<br>2. Recall Election: Live Results and News</br>
https://hanrecall.pts.org.tw/
Once upon a time, a master of corny jokes became a city mayor in Taiwan. 
He was later recalled for making too many corny jokes.

<br>2. Recall Election: Live Results and News</br>
https://hanrecall.pts.org.tw/
Once upon a time, a master of corny jokes became a city mayor in Taiwan. 
He was later recalled for making too many corny jokes.

<br>3. PRO360</br>
https://www.pro360.com.tw
What?! You’ve never heard of PRO360?
Well, there’s a saying here: Thumbtack is our Figma.

<br>4. TW Reporter</br>
https://www.twreporter.org/
The non-profit digital news outlet in Taiwan, renowned for long-form investigative journalism.
```


### pwd

**Print**
```
/home/han3zeng
```

### resume

**Action**
- download my resume from the assets folder

**Print**
```
I am looking forward to hearing from you.
(Come on! please! give me job.)
```


### connect


### themes
**action**
- List all available themes: 
- type `themes set [theme name]`, then the page should switch theme


**print**
```
dark, light, matrix, ubuntu

## How to use
themes set [theme_name]
e.g. themes set matrix
```


### welcome
**Description**
- Responsive
    - breaking point is 768px
        - Larger then 768px is desktop
        - Less then or equal 768px are tablet and mobile
- Container
    - a flex box
    - desktop: flex-direction is row
    - tablet and below: flex-direction is column reverse
    - 2 sub clements, 1 for description another for graphic
    - 

- Description section prints the following

``` _   _    _    _   _   _____ _____ _   _  ____
| | | |  / \  | \ | | |__  /| ____| \ | |/ ___|
| |_| | / _ \ |  \| |   / / |  _| |  \| | |  _ 
|  _  |/ ___ \| |\  |  / /_ | |___| |\  | |_| |
|_| |_/_/   \_\_| \_| /____||_____|_| \_|\____|


Welcome to my terminal! 
Want to get to know me better? Type `help` to see how you can explore here.
```

- Graphic section
Just print the following pattern but you can scale it to proper size which should be h
```
<pre>
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
</pre>

```

**Print**
Text



### whoami
**Print**
```
visitor
```



### Invalid commands
**Description**
User types in any unrecognizable commands

**Print**
```
command not found
```



## Style

### Theme color
We have 4 different themes: dark, light, matrix, ubuntu

**Dark**
| Element | Usage | Color |
| --- | --- | --- |
| Terminal surface aka. page background | Panels and terminal windows | #091321 |
| Secondary background | N/A | #101E30 |
| Primary text | Body text and long descriptions | #D3E9E6 |
| Phosphor cyan | Prompt, headings, and cursor | #8FFFE0 |
| Border / accent | Terminal borders and active links | #54DCC0 |
| Muted text | Secondary information | #91ADA9 |
| Subtle border | Dividers and inactive elements | #244353 |


**Light Theme — Solarized Light**
| Element | Usage | Color |
| --- | --- | --- |
| Terminal surface aka. page background | Panels and terminal windows | #FDF6E3 |
| Secondary background | Alternate panels | #EEE8D5 |
| Primary text | Body text and long descriptions | #586E75 |
| Phosphor cyan | Prompt, headings, and cursor | #268BD2 |
| Border / accent | Terminal borders and active links | #2AA198 |
| Muted text | Secondary information | #657B83 |
| Subtle border | Dividers and inactive elements | #D6CEBA |



**Matrix Theme — Classic Green Terminal**

| Element | Usage | Color |
| --- | --- | --- |
| Terminal surface aka. page background | Panels and terminal windows | #050B06 |
| Secondary background | Alternate panels | #0C1A0F |
| Primary text | Body text and long descriptions | #B6F5C5 |
| Phosphor cyan | Prompt, headings, and cursor | #00FF41 |
| Border / accent | Terminal borders and active links | #39D65A |
| Muted text | Secondary information | #75A982 |
| Subtle border | Dividers and inactive elements | #244B30 |



**Ubuntu**

## Ubuntu Theme — Classic Ubuntu Terminal

| Element | Usage | Color |
| --- | --- | --- |
| Terminal surface aka. page background | Panels and terminal windows | #300A24 |
| Secondary background | Alternate panels | #40142F |
| Primary text | Body text and long descriptions | #F2EDEB |
| Phosphor cyan | Prompt, headings, and cursor | #8AE234 |
| Border / accent | Terminal borders and active links | #E95420 |
| Muted text | Secondary information | #B9A9B4 |
| Subtle border | Dividers and inactive elements | #69465E |


### Design Guide
- Square corners everywhere. No rounded cards, pill buttons, or glassmorphism.
- Flat backgrounds. No gradients, shadows, or background imagery.
- Block cursor. Prefer █ over a modern thin caret.
- Character-grid spacing. Build the interface around consistent rows and columns.
- Minimal animation. A blinking cursor is sufficient; CRT effects should be optional.

## Visual Style
- https://terminal.satnaing.dev/
- https://www.vice.com/en/article/how-the-matrix-inspired-a-new-generation-of-hackers/


## Dev Description 

### Overview
- I want to heavily rely on AI and agents to create this portfolio website as an practice
- I am using vscode with claude code agent
- Please tell me how to setup claude code dev env with possible use of SKILL, subagents, hooks, CLAUDE.md, rules
- I want the agent can refer to react.js, next.js, tailwind, eslint, vitest, storybook docs. 
- The architecture of this project
    - Vitest
        - Unit test for function
    - Storybook
        - Component test for each command section say `help`, `about`, `education`, etc. They should appear on the story book for each section in tab sections
        - Stroybook should also test the behavior of creating section or `clear` that remove all section dom nodes for terminal
    - Eslint / Prettier
        - typical typescript, css, linting
- The whole site should be static generated by next.js
- README.md includes the basic description of the project and dev/build commands

### Architecture
- next.js
- react
- tailwind css v4
- Eslint/vitest/storybook
- next-theme: handle theme



### Implementation
- Each section of the command should be a independent functional component in next.js project
- Beneath react, each command should attach a dom node inside terminal content dom node. 




