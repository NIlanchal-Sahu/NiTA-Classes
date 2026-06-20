# Module 2: Operating System (10 Hours)

**Course:** CCC / DCA Computer Fundamentals | **Module duration:** 10 hours

---

## Learning Objectives

After completing this module, you will be able to:

- Define an Operating System (OS) and explain why every computer or mobile device needs one.
- Describe major OS functions such as process management, memory management, file management, device management, security, and user interface management.
- Explain the historical evolution of operating systems from early batch systems to modern mobile, cloud, and AI-assisted systems.
- Navigate the Windows desktop, Start menu, taskbar, system tray, File Explorer, Settings, and Control Panel.
- Create, rename, copy, move, delete, restore, search, sort, and organize files and folders.
- Understand file paths, extensions, hidden files, permissions, and directory structure.
- Install, update, and uninstall software safely.
- Compare Windows, Linux, Ubuntu, macOS, Android, and iOS at a beginner level.
- Use built-in utilities such as Notepad, Calculator, Recycle Bin, Snipping Tool, Command Prompt, PowerShell, and Task Manager.
- Apply security practices such as strong passwords, updates, antivirus use, safe downloads, backups, and cyber hygiene.
- Use keyboard shortcuts for faster computer operation.
- Connect OS knowledge with careers such as computer operator, help desk executive, IT support technician, Linux administrator, cloud engineer, and cybersecurity analyst.

---

## Introduction

An **Operating System (OS)** is system software that acts as an intermediary between the user, application software, and computer hardware. It controls and coordinates hardware resources such as CPU, RAM, storage devices, keyboard, mouse, printer, monitor, network adapter, and speakers. It also provides a user interface so people can use the computer without writing machine-level instructions.

Without an operating system, using a computer would be extremely difficult. A user would need to directly control the CPU, memory addresses, disk sectors, and device signals. The OS hides this complexity and provides familiar tools such as desktop icons, folders, windows, menus, apps, settings, and security options.

### Real-Life Analogy: Computer as an Office

| Computer Concept | Office Analogy | Meaning |
|---|---|---|
| Computer system | Office | Complete working environment |
| CPU | Manager | Makes decisions and processes work |
| RAM | Work desk | Holds current work temporarily |
| Hard disk/SSD | Storage room | Stores records permanently |
| Operating System | Office administrator | Allocates resources and keeps order |
| Applications | Employees | Perform specific tasks |
| Files | Documents | Store information |
| Folders | File cabinets | Organize documents |
| Printer/scanner | Office machines | Produce or capture documents |

If there is no office administrator, employees may not know where to sit, where files are kept, or who should use which machine. Similarly, without an OS, programs cannot easily use hardware resources.

---

## Detailed Topic Explanations

### 1. What Is an Operating System?

An **Operating System** is the main system software that starts after a computer is switched on and remains active until the device is shut down. It provides a platform for application software such as browsers, word processors, spreadsheets, media players, and accounting software.

#### Why an OS Exists

The OS exists because hardware components are complex. Users and application programs need a simple and controlled way to use hardware. The OS provides this control, protection, and convenience.

#### Main Purposes of an OS

- Run and manage programs.
- Allocate CPU time to running tasks.
- Allocate RAM to applications.
- Organize files and folders on storage devices.
- Control devices using drivers.
- Provide GUI or CLI for user interaction.
- Protect user accounts and data.
- Manage network connections.
- Handle errors and system events.

#### What Happens If There Is No OS?

- Applications cannot run normally.
- Users cannot easily open files, print documents, or connect to Wi-Fi.
- Hardware resources may conflict with each other.
- There will be no desktop, Start menu, taskbar, folders, or settings.
- Security features such as user accounts and permissions will not be available.

#### Common Examples of Operating Systems

- Desktop/laptop OS: Windows 10, Windows 11, Ubuntu Linux, macOS.
- Mobile OS: Android, iOS.
- Server OS: Ubuntu Server, Red Hat Enterprise Linux, Windows Server.
- Embedded OS: OS used in ATMs, smart TVs, routers, cars, and industrial machines.

### 2. Functions of an Operating System

#### 2.1 Process Management

A **process** is a running program. For example, when you open Chrome, Notepad, and Calculator, each running application becomes a process.

The OS decides:

- Which process gets CPU time.
- Which process should wait.
- Which process is responding or frozen.
- How multiple programs can appear to run at the same time.

This is important for **multitasking**, where users can listen to music, type a document, browse the web, and download a file at the same time.

**Analogy:** A classroom teacher gives attention to different students one by one. Similarly, the OS schedules CPU attention among running programs.

#### 2.2 Memory Management

**Memory management** means allocating RAM to programs and freeing it when programs close. RAM is like a student's study table. The larger the table, the more books and notebooks can be opened at the same time.

When RAM is full, the system may become slow because it has to use storage as temporary memory, called virtual memory. The OS tries to prevent programs from interfering with each other's memory.

#### 2.3 File Management

File management means organizing data into files and folders. The OS allows users to create, save, rename, copy, move, delete, restore, search, and sort files.

**Analogy:** Folders are like physical file cabinets, and files are documents inside those cabinets.

#### 2.4 Device Management

The OS manages devices such as printer, scanner, keyboard, mouse, webcam, microphone, display, Bluetooth, and Wi-Fi adapter. It uses **device drivers**, which are special software programs that help the OS communicate with hardware.

Example: When you connect a printer, Windows may automatically install a driver so applications can print documents.

#### 2.5 User Interface Management

The OS provides a way for users to interact with the computer.

- **GUI (Graphical User Interface):** Uses icons, menus, windows, and mouse pointer.
- **CLI (Command Line Interface):** Uses typed commands.

Windows, Ubuntu, macOS, Android, and iOS mainly use GUI. Command Prompt, PowerShell, and Linux Terminal are CLI tools.

#### 2.6 Security Management

The OS protects the computer using user accounts, passwords, permissions, updates, firewall, antivirus integration, encryption, and lock screen features.

Security management is important because computers store personal photos, certificates, passwords, business data, banking details, and government documents.

---

### 3. Historical Evolution of Operating Systems

Operating systems developed gradually as computers became more powerful and more widely used.

| Period | OS Stage | Key Idea | Example/Use |
|---|---|---|---|
| 1940s-1950s | No OS era | Users operated hardware directly | Early research computers |
| 1950s-1960s | Batch processing | Jobs collected and processed in batches | Payroll, scientific calculations |
| 1960s-1970s | Multiprogramming | Multiple jobs kept in memory | Mainframe systems |
| 1970s-1980s | Time sharing | Many users share one computer | University terminals |
| 1980s-1990s | Personal computer OS | OS for individual users | MS-DOS, Windows, classic Mac OS |
| 1990s-2000s | GUI and networking | Internet, icons, multitasking | Windows 95/98/XP, Linux |
| 2000s-2010s | Mobile OS | Touchscreen and apps | Android, iOS |
| 2010s-present | Cloud and virtualization | Servers, containers, remote apps | Linux servers, Windows Server |
| Future | AI-powered OS | Smart assistance and automation | Predictive settings, AI help |

#### No Operating System Era

In early computers, users gave instructions directly using switches, punched cards, or machine-level methods. This was slow and required expert knowledge.

#### Batch Processing Systems

In batch systems, many jobs were collected and processed together without direct user interaction. This improved efficiency for repeated tasks such as payroll and scientific calculations.

#### Time Sharing Systems

Time sharing allowed many users to use one large computer at the same time through terminals. The OS divided CPU time among users quickly, making each user feel they had access to the machine.

#### Personal Computer Operating Systems

With microprocessors, computers became affordable for individuals. MS-DOS used commands, while Windows and macOS made computers easier through graphical interfaces.

#### Mobile Operating Systems

Android and iOS changed computing by making smartphones powerful pocket computers. They manage touch input, cameras, GPS, mobile networks, sensors, apps, and battery.

#### Cloud and Future OS Trends

Modern OS platforms support cloud services, virtualization, containers, remote desktops, and AI features. Future operating systems may automatically optimize performance, detect threats, organize files, and assist users using AI.

### Did You Know?

Android is built on the Linux kernel, and Linux powers a large share of internet servers worldwide.

---

### 4. Popular Operating Systems

#### Windows

Microsoft Windows is one of the most widely used desktop operating systems in schools, offices, computer labs, shops, and government training centers. It is known for its user-friendly GUI, broad hardware support, and compatibility with many applications.

##### Features of Windows

- User-friendly desktop, taskbar, Start menu, and Settings.
- Plug and Play support for many devices.
- Multitasking with multiple windows.
- File Explorer for file and folder management.
- Networking and internet connectivity.
- Built-in security such as Windows Security, firewall, updates, and user accounts.
- Support for printers, scanners, webcams, Bluetooth, and USB devices.
- Large software ecosystem for office work, education, design, and business.

##### Windows Versions and Key Improvements

| Version | Key Features/Improvements |
|---|---|
| Windows XP | Popular stable desktop OS, simple interface |
| Windows 7 | Improved taskbar, better performance, widely used in offices |
| Windows 10 | Modern Settings, security updates, Microsoft Store, virtual desktops |
| Windows 11 | New interface, centered Start menu, better window layouts, improved security requirements |

#### Linux

**Linux** is an open-source operating system kernel. A kernel is the core part of an OS that communicates with hardware. Linux is usually distributed as a complete operating system through **distributions** or **distros**.

#### Linux Distribution

A **Linux distribution** combines the Linux kernel with system tools, desktop environment, package manager, and applications.

Popular distributions:

- **Ubuntu:** Beginner-friendly, widely used for desktops and servers.
- **Fedora:** Modern Linux distribution with newer technologies.
- **Debian:** Stable and community-driven.
- **Linux Mint:** Beginner-friendly, Windows-like interface.
- **Red Hat Enterprise Linux (RHEL):** Enterprise server use, paid support.

#### Ubuntu

Ubuntu is a popular Linux distribution suitable for learners, developers, and servers. It has a GUI, file manager, browser, office suite options, software store, and Terminal.

#### Why Linux Dominates Servers

Linux is popular on servers because it is stable, secure, customizable, cost-effective, and efficient. Many cloud platforms, websites, databases, and data centers run on Linux.

#### Linux in Cloud Computing

Cloud servers commonly use Linux because it works well with automation, containers, web servers, databases, and DevOps tools.

#### Limitations of Linux for Beginners

- Some commercial software may not be available.
- Some hardware may need extra driver setup.
- CLI commands may feel difficult at first.
- Gaming and specialized Windows software may require alternatives.

---

### 5. Open Source and Closed Source Software

**Source code** is the human-readable program code written by developers.

#### Open Source Software

Open source software allows users to view, modify, and share source code under a license. It is often free to download and supported by communities, foundations, or companies.

Examples: Linux, Ubuntu, LibreOffice, Firefox, VLC Media Player, GIMP.

#### Closed Source Software

Closed source or proprietary software keeps source code private. Users can use the software according to the license, but cannot freely view or modify its internal code.

Examples: Microsoft Windows, Microsoft Office, Adobe Photoshop, macOS.

---

### 6. Windows Desktop and Taskbar

The **desktop** is the main workspace shown after login. It contains icons, wallpaper, taskbar, Start menu, and system tray.

#### Desktop Elements

- **Icons:** Small pictures representing apps, files, folders, or shortcuts.
- **Taskbar:** Bar usually at the bottom showing Start button, pinned apps, open apps, search, system tray, and clock.
- **Start Menu:** Main launcher for apps, power options, search, and settings.
- **System Tray:** Area showing network, volume, battery, date, time, and background app icons.
- **Wallpaper:** Desktop background image.
- **Recycle Bin:** Temporary location for deleted files.

#### Start Menu

The Start menu helps users search apps, open pinned programs, access settings, restart, sleep, or shut down the computer.

#### Taskbar Practical Uses

- Pin frequently used apps.
- Switch between open applications.
- Check Wi-Fi, sound, battery, date, and time.
- Open notifications and system settings.

---

### 7. File Explorer and File Management

**File Explorer** is the Windows tool used to browse drives, folders, and files. It can be opened using **Win + E** or the folder icon on the taskbar.

#### Parts of File Explorer

| Part | Purpose |
|---|---|
| Navigation Pane | Shows Quick Access, This PC, drives, and folders |
| Address Bar | Shows current path such as `C:\Users\Student\Documents` |
| Search Box | Searches files and folders inside the current location |
| File List | Shows files and folders with details |
| View Options | Changes display as icons, list, details, or tiles |
| Status Bar | Shows selected items and file information |

#### File

A **file** is a named collection of data stored on a storage device. Examples: `report.docx`, `photo.jpg`, `marks.xlsx`, `video.mp4`.

#### Folder

A **folder** is a container used to organize files and subfolders. Example: `Documents\CCC\Unit2`.

#### Directory Structure

A directory structure is the arrangement of drives, folders, subfolders, and files.

Example:

```text
C:
└── Users
    └── Student
        └── Documents
            └── CCC
                └── Unit2
                    ├── Notes
                    └── Labs
```

#### Path

A **path** shows the location of a file or folder.

- **Absolute path:** Full location from drive/root. Example: `C:\Users\Student\Documents\CCC\Unit2\Notes`.
- **Relative path:** Location compared to current folder. Example: if you are inside `CCC`, then `Unit2\Notes` is a relative path.

#### File Extensions

File extensions identify file type.

| Extension | File Type |
|---|---|
| `.txt` | Plain text |
| `.docx` | Word document |
| `.xlsx` | Spreadsheet |
| `.pptx` | Presentation |
| `.pdf` | Portable document |
| `.jpg`, `.png` | Image |
| `.mp4` | Video |
| `.exe`, `.msi` | Windows installer/program |

#### Hidden Files

Hidden files are normally not shown to prevent accidental changes. System files may be hidden because deleting or editing them can affect Windows.

#### File Permissions

Permissions decide who can read, write, modify, or delete files. Permissions are important in offices, schools, and shared computers.

#### File Operations

- **Create folder:** Right-click -> New -> Folder.
- **Rename:** Select item -> F2 -> type new name -> Enter.
- **Copy:** Ctrl + C then Ctrl + V. Original remains.
- **Move:** Ctrl + X then Ctrl + V. Original is moved.
- **Delete:** Delete key sends to Recycle Bin.
- **Permanent delete:** Shift + Delete bypasses Recycle Bin.
- **Restore:** Open Recycle Bin -> select file -> Restore.
- **Search:** Use File Explorer search box.
- **Sort:** Sort by name, date, type, or size.

#### File Naming Rules in Windows

Invalid characters: `\ / : * ? " < > |`

Good file names:

- `DCA_Module_2_Notes.docx`
- `Monthly_Attendance_June.xlsx`
- `Student_Project_Final.pdf`

Avoid:

- `New Document final final latest.docx`
- `marks/2026.xlsx`
- `assignment?.docx`

---

### 8. Software Installation and Removal

Software installation means copying program files to the computer and preparing the OS to run the application.

#### What Happens During Installation?

During installation, the setup program may:

- Copy files to the Program Files folder.
- Create Start menu entries.
- Create desktop shortcuts.
- Add registry entries in Windows.
- Install required libraries or drivers.
- Ask for user permission or administrator password.
- Configure updates, language, and settings.

#### Setup Wizard

A setup wizard is a step-by-step installer that asks the user to accept license terms, choose install location, select options, and finish installation.

#### Installing Software Safely in Windows

1. Download only from the official website or Microsoft Store.
2. Check the software name and publisher.
3. Avoid cracked or pirated software.
4. Read installation screens carefully.
5. Uncheck unwanted bundled apps or toolbars.
6. Restart if required.
7. Keep the software updated.

#### Microsoft Store Installation

Microsoft Store provides a safer way to install many apps because apps are checked and updates are easier.

#### Ubuntu Installation Methods

- Ubuntu Software or Snap Store.
- `.deb` packages.
- Terminal command such as `sudo apt install libreoffice`.

#### Removing or Uninstalling Software

Recommended Windows method:

1. Press Win + I.
2. Go to Apps -> Installed apps.
3. Search the program.
4. Click Uninstall.
5. Follow prompts and restart if needed.

Do not remove software by only deleting its folder from Program Files, because settings, registry entries, and shortcuts may remain.

#### Updates and Patches

Updates add features, fix bugs, and close security weaknesses. A **patch** is an update that fixes a specific issue.

#### Risks of Untrusted Software

- Malware infection.
- Data theft.
- Unwanted advertisements.
- Browser hijacking.
- Slow performance.
- Ransomware attack.

---

### 9. Control Panel and Settings

Windows provides two major places for configuration: **Settings** and **Control Panel**.

#### Settings

Settings is the modern configuration app opened with **Win + I**. It includes display, network, Bluetooth, personalization, apps, accounts, privacy, and Windows Update.

#### Control Panel

Control Panel is the classic configuration area. It is still used for some advanced settings such as devices, programs, user accounts, and network options.

| Task | Path |
|---|---|
| Change display | Settings -> System -> Display |
| Connect Bluetooth device | Settings -> Bluetooth & devices |
| Add printer | Settings -> Bluetooth & devices -> Printers |
| Uninstall program | Settings -> Apps -> Installed apps |
| Create user | Settings -> Accounts |
| Adjust date/time | Taskbar clock -> Adjust date/time |
| Windows Update | Settings -> Windows Update |
| Device Manager | Right-click Start -> Device Manager |

---

### 10. Built-In Utilities

#### Notepad

Notepad is a simple text editor used for plain text files. It is useful for quick notes, coding basics, configuration notes, and typing simple content without formatting.

Practical demonstration:

1. Open Start -> Notepad.
2. Type your name, course, and date.
3. Save as `my-info.txt`.

#### Calculator

Calculator supports standard, scientific, programmer, date calculation, and unit conversion modes. It is useful for arithmetic, conversions, and basic computer number practice.

#### Recycle Bin

Recycle Bin temporarily stores deleted files. It helps recover accidentally deleted files.

Important: Shift + Delete bypasses Recycle Bin and deletes permanently.

#### Snipping Tool

Snipping Tool captures screenshots. It is useful for creating tutorials, recording errors, submitting practical proof, and saving online receipts.

#### Command Prompt

Command Prompt is a CLI tool used to run commands such as:

- `dir` - list files and folders.
- `cd` - change directory.
- `cls` - clear screen.
- `ipconfig` - view network configuration.
- `ping` - test network connectivity.

#### PowerShell

PowerShell is a more powerful command-line and scripting tool than Command Prompt. IT professionals use it for automation, system administration, and troubleshooting.

Basic examples:

- `Get-ChildItem` - list files.
- `Get-Process` - list running processes.
- `Get-Date` - show date and time.

#### Task Manager

Task Manager shows running apps, background processes, CPU usage, memory usage, disk usage, network usage, startup apps, and performance graphs.

Uses:

- Close frozen programs.
- Check why a computer is slow.
- Disable unnecessary startup programs.
- Observe CPU and RAM usage.

Open using **Ctrl + Shift + Esc**.

---

### 11. Compression and Shortcuts

#### Zip Compression

Compression reduces file size or combines multiple files into one archive. Windows can create compressed zipped folders.

Steps:

1. Right-click a file/folder.
2. Select Send to -> Compressed (zipped) folder.
3. Rename the zip file if required.

Uses:

- Sending assignments by email.
- Uploading multiple files together.
- Reducing storage size for text-based documents.

#### Desktop Shortcuts

A shortcut is a link to a program, file, or folder. Deleting a shortcut usually does not delete the original file or program.

---

### 12. Keyboard Shortcuts

Keyboard shortcuts improve speed and productivity.

#### File Operations

| Shortcut | Action |
|---|---|
| Ctrl + N | New window/document |
| Ctrl + O | Open |
| Ctrl + S | Save |
| Ctrl + C | Copy |
| Ctrl + X | Cut |
| Ctrl + V | Paste |
| Ctrl + Z | Undo |
| Ctrl + Y | Redo |
| F2 | Rename selected item |
| Delete | Send selected item to Recycle Bin |
| Shift + Delete | Permanently delete |

#### Window Management

| Shortcut | Action |
|---|---|
| Alt + Tab | Switch between open apps |
| Win + D | Show desktop |
| Win + Up Arrow | Maximize window |
| Win + Down Arrow | Minimize/restore window |
| Win + Left/Right Arrow | Snap window to side |
| Alt + F4 | Close active window |

#### System Functions

| Shortcut | Action |
|---|---|
| Win | Open Start menu |
| Win + E | Open File Explorer |
| Win + I | Open Settings |
| Win + L | Lock computer |
| Ctrl + Shift + Esc | Open Task Manager |
| PrtSc | Capture screen |
| Win + Shift + S | Open screenshot selection |

#### Editing

| Shortcut | Action |
|---|---|
| Ctrl + A | Select all |
| Ctrl + F | Find |
| Ctrl + H | Replace in supported apps |
| Ctrl + P | Print |
| Ctrl + B | Bold in supported apps |
| Ctrl + I | Italic in supported apps |
| Ctrl + U | Underline in supported apps |

#### Browser Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl + T | New tab |
| Ctrl + W | Close tab |
| Ctrl + L | Select address bar |
| Ctrl + R | Refresh page |
| Ctrl + D | Bookmark page |
| Ctrl + Shift + T | Reopen closed tab |

#### Practical Shortcut Exercise

Open File Explorer using Win + E, create a folder, rename it using F2, copy a file using Ctrl + C and Ctrl + V, lock the computer using Win + L, then reopen and switch between apps using Alt + Tab.

---

## Real-Life Examples

### Example 1: Online Class

A student joins an online class using a laptop. The OS manages the camera, microphone, speakers, Wi-Fi, browser, RAM, and screen display. Without the OS, the video meeting app could not easily access these devices.

### Example 2: Banking ATM

An ATM runs an operating system that controls the screen, keypad, card reader, cash dispenser, printer, and secure communication with the bank server.

### Example 3: Hospital Reception

A hospital computer uses an OS to run patient registration software, print receipts, store reports, and connect to hospital management systems.

### Example 4: Government Service Center

A Common Service Center operator uses Windows, browser, scanner, printer, PDF reader, and government portals to apply for certificates and print documents.

### Example 5: Slow Computer

If a computer becomes slow, Task Manager can show whether CPU, RAM, disk, or a specific app is causing the problem.

---

## Comparison Tables

### Windows vs Linux

| Basis | Windows | Linux |
|---|---|---|
| Definition | Proprietary desktop/server OS by Microsoft | Open-source OS kernel used in many distributions |
| Interface | User-friendly GUI | GUI + powerful CLI |
| Cost | Usually paid/license-based | Mostly free, enterprise support may be paid |
| Software | Wide commercial software support | Strong open-source software support |
| Security | Good with updates and antivirus | Strong permission model, widely used on servers |
| Customization | Limited compared to Linux | Highly customizable |
| Best Use | Offices, labs, general users, gaming | Servers, developers, cloud, security, old PCs |
| Examples | Windows 10, Windows 11 | Ubuntu, Debian, Fedora |

### Linux vs Ubuntu

| Basis | Linux | Ubuntu |
|---|---|---|
| Definition | OS kernel | Complete Linux distribution |
| Includes Apps? | Kernel alone does not include full desktop apps | Includes desktop, apps, package manager |
| User Level | Technical concept | Beginner-friendly usable OS |
| Maintained By | Global Linux community | Canonical + community |
| Example Use | Base for many OS distributions | Desktop, server, education, cloud |

### Open Source vs Closed Source Software

| Basis | Open Source | Closed Source |
|---|---|---|
| Source Code | Publicly available | Private |
| Modification | Allowed under license | Not allowed by users |
| Cost | Often free | Often paid |
| Transparency | High | Limited |
| Support | Community or paid enterprise support | Vendor support |
| Examples | Linux, LibreOffice, Firefox | Windows, MS Office, Photoshop |

### GUI vs CLI

| Basis | GUI | CLI |
|---|---|---|
| Full Form | Graphical User Interface | Command Line Interface |
| Interaction | Icons, menus, windows, mouse | Typed commands |
| Ease for Beginners | Easier | Requires command knowledge |
| Speed for Experts | Slower for repeated admin tasks | Faster for automation |
| Examples | Windows desktop, Ubuntu desktop | Command Prompt, PowerShell, Terminal |

### Administrator vs Standard User

| Basis | Administrator | Standard User |
|---|---|---|
| Permission Level | Full control | Limited control |
| Can Install Software? | Yes | Usually needs admin permission |
| Can Change System Settings? | Yes | Limited |
| Daily Use Safety | More risky if misused | Safer |
| Best Use | IT support, setup, maintenance | Normal daily work |

### Desktop OS vs Mobile OS

| Basis | Desktop OS | Mobile OS |
|---|---|---|
| Device | Desktop/laptop | Smartphone/tablet |
| Input | Keyboard, mouse, touchpad | Touchscreen, sensors, voice |
| Apps | Desktop applications | Mobile apps |
| Power Use | More power | Battery optimized |
| Examples | Windows, Ubuntu, macOS | Android, iOS |

---

## Industry Applications

### Education

Operating systems run smart classrooms, LMS platforms, online classes, exam software, digital labs, projectors, and student computers.

### Banking

Banks use OS platforms for ATMs, teller systems, servers, transaction processing, cybersecurity tools, and customer service terminals.

### Healthcare

Hospitals use OS-based systems for patient registration, lab reports, billing, imaging systems, pharmacy systems, and telemedicine.

### Government

Digital India services, CSC centers, e-governance portals, Aadhaar services, certificates, and digital payments depend on stable operating systems.

### Business

Businesses use operating systems to run ERP software, accounting, payroll, email, office automation, customer records, and billing systems.

### IT Industry

The IT industry uses operating systems for programming, testing, servers, cloud platforms, virtualization, containers, cybersecurity, and DevOps automation.

### Manufacturing

Manufacturing units use OS-based systems in production planning, inventory, CNC machines, quality checks, and industrial automation.

---

## Security Awareness

### Strong Password Creation

A strong password should be long, hard to guess, and different for different accounts.

Good password habits:

- Use at least 12 characters where possible.
- Mix uppercase, lowercase, numbers, and symbols.
- Avoid names, birthdays, phone numbers, and simple words.
- Do not share passwords.
- Use a password manager if available.

### Two-Factor Authentication

**Two-Factor Authentication (2FA)** adds an extra verification step, such as OTP, authenticator app, or biometric approval. Even if the password is leaked, 2FA can protect the account.

### Antivirus Software

Antivirus software detects and blocks malware. Windows includes Windows Security/Microsoft Defender.

### Malware Types

| Malware | Meaning | Harm |
|---|---|---|
| Virus | Attaches to files and spreads | Corrupts files/programs |
| Worm | Spreads automatically across networks | Slows or infects systems |
| Trojan | Pretends to be useful software | Steals data or opens backdoor |
| Ransomware | Locks/encrypts files | Demands payment |
| Spyware | Secretly monitors user activity | Steals passwords/data |
| Adware | Shows unwanted ads | Slows system and tracks behavior |

### Safe Download Practices

- Download from official websites only.
- Avoid cracked software.
- Check file extension before opening.
- Do not open unknown email attachments.
- Scan pen drives when inserted.
- Read installer screens carefully.

### Importance of Updates

Updates fix security weaknesses, improve stability, and add features. Ignoring updates can leave the system vulnerable to attacks.

### Backup Strategies

- Keep important files in more than one place.
- Use external drive, pen drive, or cloud storage.
- Follow the 3-2-1 rule if possible: 3 copies, 2 storage types, 1 offsite/cloud copy.
- Test backups occasionally.

### Cyber Hygiene

Cyber hygiene means regular safe habits:

- Lock computer with Win + L when away.
- Log out from shared computers.
- Do not share OTP or passwords.
- Keep software updated.
- Use antivirus and firewall.
- Back up important data.

---

## Practical Activities

### Lab 1: OS Navigation

- **Beginner Exercise:** Identify desktop, taskbar, Start menu, system tray, Recycle Bin, and Settings.
- **Intermediate Exercise:** Pin Notepad and Calculator to taskbar, then unpin one app.
- **Challenge Exercise:** Change wallpaper and adjust display scale.
- **Troubleshooting Exercise:** If Wi-Fi icon is missing, check system tray and network settings.

### Lab 2: File Explorer

- **Beginner Exercise:** Open File Explorer using Win + E and identify Navigation Pane, Address Bar, Search Box, and File List.
- **Intermediate Exercise:** Create `Documents\CCC\Unit2\Notes` and `Documents\CCC\Unit2\Labs`.
- **Challenge Exercise:** Sort files by type and size, then search for `.txt` files.
- **Troubleshooting Exercise:** Find a missing file using search and check Recycle Bin.

### Lab 3: File Operations

- **Beginner Exercise:** Create `my-info.txt` with name, course, and date.
- **Intermediate Exercise:** Copy it to Labs and rename the copy as `my-info-backup.txt`.
- **Challenge Exercise:** Create a zip file of the Labs folder and compare size.
- **Troubleshooting Exercise:** Delete a test file and restore it from Recycle Bin.

### Lab 4: Software Installation

- **Beginner Exercise:** Open Microsoft Store and search for a free educational app.
- **Intermediate Exercise:** Install LibreOffice, Firefox, or VLC from an official source with teacher permission.
- **Challenge Exercise:** Identify installation folder and Start menu shortcut.
- **Troubleshooting Exercise:** Uninstall a teacher-approved practice app from Settings -> Apps.

### Lab 5: Utilities

- **Beginner Exercise:** Open Notepad, Calculator, Paint, and Snipping Tool.
- **Intermediate Exercise:** Take a screenshot using Snipping Tool and save it as PNG.
- **Challenge Exercise:** Open Task Manager and note CPU, memory, disk, and network usage.
- **Troubleshooting Exercise:** End a frozen practice app using Task Manager under teacher supervision.

### Lab 6: Linux/Ubuntu Demo

- **Beginner Exercise:** Watch or demonstrate Ubuntu desktop, Files app, Firefox, LibreOffice, and Terminal.
- **Intermediate Exercise:** Compare Ubuntu Files with Windows File Explorer.
- **Challenge Exercise:** Run basic Terminal commands such as `pwd`, `ls`, and `date`.
- **Troubleshooting Exercise:** Identify equivalent apps: File Explorer vs Files, Store vs Ubuntu Software.

### Lab 7: Security Practice

- **Beginner Exercise:** Lock computer using Win + L.
- **Intermediate Exercise:** Check Windows Update status.
- **Challenge Exercise:** Create a strong password pattern without writing actual personal passwords.
- **Troubleshooting Exercise:** Identify whether a download link looks official or suspicious.

---

## Case Studies

### Case Study 1: Deleted Assignment

A student accidentally deletes an assignment file from the Documents folder.

Questions:

1. Where should the student check first?
2. Which delete method may bypass Recycle Bin?
3. Why is backup important?
4. What file name practice can help avoid confusion?

### Case Study 2: Slow Computer

A computer becomes very slow during online class. The fan is noisy and apps are not responding.

Questions:

1. Which utility should be opened?
2. Which resource usage should be checked?
3. What can be done if one app is frozen?
4. Why can too many startup programs slow a computer?

### Case Study 3: Software Installation in Office

An office employee needs to install a PDF editor, but the computer asks for administrator permission.

Questions:

1. Which account type is required?
2. Why are standard users restricted?
3. Why should software be downloaded from the official website?
4. What security risk exists in cracked software?

### Case Study 4: Government Service Center

A CSC operator scans documents, uploads them to a portal, prints receipts, and stores copies in folders.

Questions:

1. Identify two input devices.
2. Identify two output devices.
3. Which OS function organizes files?
4. Why should customer documents be protected?

### Case Study 5: Ubuntu Server

A small company hosts its website on an Ubuntu server.

Questions:

1. Why is Linux popular for servers?
2. What is the difference between Linux and Ubuntu?
3. Which interface is commonly used by server administrators?
4. Why are updates important on a server?

---

## Interview Questions

### 1. What is an operating system?

An operating system is system software that manages computer hardware and software resources and provides an interface for users and applications.

### 2. What is multitasking?

Multitasking is the ability of an OS to run or manage multiple programs at the same time by sharing CPU, memory, and other resources.

### 3. What is the difference between Windows and Linux?

Windows is a proprietary OS developed by Microsoft, widely used on desktops. Linux is an open-source kernel used in many distributions such as Ubuntu, Debian, and Fedora, and is widely used on servers and cloud systems.

### 4. What is open-source software?

Open-source software provides access to its source code so users can study, modify, and share it according to its license.

### 5. What is Task Manager used for?

Task Manager is used to view running programs, check CPU/RAM/disk/network usage, end frozen programs, and manage startup apps.

### 6. What is a device driver?

A device driver is software that helps the operating system communicate with hardware such as printers, scanners, graphics cards, and network adapters.

### 7. What is the difference between GUI and CLI?

GUI uses graphical elements such as icons and menus, while CLI uses typed commands.

### 8. Why are updates important?

Updates fix security issues, improve stability, remove bugs, and sometimes add new features.

### 9. What is the difference between file and folder?

A file stores data, while a folder organizes files and subfolders.

### 10. What is Ubuntu?

Ubuntu is a popular beginner-friendly Linux distribution used on desktops, servers, and cloud platforms.

---

## Exam Questions

### Very Short Questions

1. What is an operating system?
2. Write two examples of operating systems.
3. What is GUI?
4. What is CLI?
5. What is a file?
6. What is a folder?
7. What is a device driver?
8. What is Recycle Bin?
9. What is Task Manager?
10. What is open-source software?

### Short Questions

1. Write any five functions of an operating system.
2. Differentiate between GUI and CLI.
3. Explain open-source software with examples.
4. Write steps to create a folder in Windows.
5. Write steps to uninstall a program safely.
6. Explain file extension with examples.
7. Write any five keyboard shortcuts.
8. Explain why updates are important.

### Long Questions

1. Explain the functions of an operating system in detail.
2. Describe the evolution of operating systems.
3. Explain Windows desktop, Start menu, taskbar, and system tray.
4. Explain File Explorer and file/folder operations.
5. Compare Windows and Linux.
6. Explain software installation and risks of untrusted software.
7. Explain malware types and safe computer habits.

### Viva Questions

1. Which shortcut opens File Explorer?
2. Which shortcut locks the computer?
3. What happens when you press Shift + Delete?
4. Why should we not delete Program Files manually?
5. What is the purpose of the Start menu?
6. What is the use of Snipping Tool?
7. Why is Linux used on servers?
8. What is the difference between administrator and standard user?
9. What is the purpose of a backup?
10. What does Ctrl + Shift + Esc open?

### Practical Questions

1. Create a folder structure for a CCC practical file.
2. Create and save a Notepad file.
3. Rename a file using F2.
4. Copy and move files using keyboard shortcuts.
5. Restore a deleted file from Recycle Bin.
6. Take a screenshot with Snipping Tool.
7. Open Task Manager and note CPU/RAM usage.
8. Create a zip folder.
9. Check Windows Update status.
10. Open Settings using keyboard shortcut.

### HOTS Questions

1. If two programs need the CPU at the same time, how does the OS help?
2. Why is a standard user account safer for daily work than an administrator account?
3. Why is deleting a program folder not the same as uninstalling it?
4. Why might a computer with large storage still run slowly?
5. How can file permissions protect data in an office?

---

## Chapter Summary

### Key Takeaways

- An operating system manages hardware, software, files, memory, processes, devices, security, and user interface.
- Windows is widely used in offices, schools, labs, and homes because of its user-friendly GUI and software support.
- Linux is open-source and widely used on servers, cloud platforms, and development systems.
- Ubuntu is a beginner-friendly Linux distribution.
- File Explorer helps users organize files and folders.
- Safe software installation requires official sources, updates, and avoiding pirated software.
- Task Manager is useful for performance monitoring and troubleshooting.
- Strong passwords, 2FA, updates, antivirus, backups, and safe downloads are essential cyber hygiene habits.

### Important Definitions

| Term | Definition |
|---|---|
| Operating System | System software that manages hardware and provides user interface |
| Process | A running program |
| Multitasking | Managing multiple programs at the same time |
| Memory Management | Allocating RAM to programs |
| File Management | Creating, organizing, storing, and deleting files/folders |
| Device Driver | Software that helps OS communicate with hardware |
| GUI | Interface using icons, windows, menus, and pointer |
| CLI | Interface using typed commands |
| Open Source | Software whose source code is publicly available under license |
| File Extension | Suffix showing file type, such as `.txt` or `.pdf` |
| Backup | Extra copy of data for safety |

---

## Quick Revision Notes

### One-Line Definitions

- OS: System software that manages computer resources.
- GUI: Graphical interface using icons and windows.
- CLI: Text-based command interface.
- File: Named collection of data.
- Folder: Container for files and subfolders.
- Driver: Software that controls hardware communication.
- Process: Program currently running.
- Malware: Harmful software.
- Backup: Extra copy of important data.

### Shortcut Cheat Sheet

| Shortcut | Use |
|---|---|
| Win + E | File Explorer |
| Win + I | Settings |
| Win + L | Lock computer |
| Win + D | Show desktop |
| Alt + Tab | Switch apps |
| Alt + F4 | Close window |
| Ctrl + C | Copy |
| Ctrl + X | Cut |
| Ctrl + V | Paste |
| Ctrl + Z | Undo |
| Ctrl + S | Save |
| F2 | Rename |
| Ctrl + Shift + Esc | Task Manager |
| Win + Shift + S | Screenshot selection |

### Important Commands

| Command | Use |
|---|---|
| `dir` | List files in Command Prompt |
| `cd` | Change directory |
| `cls` | Clear Command Prompt screen |
| `ipconfig` | Show network details |
| `ping` | Test network connection |
| `Get-Process` | List processes in PowerShell |
| `Get-Date` | Show date in PowerShell |

### Exam Facts

- Windows is closed source/proprietary.
- Linux is open source.
- Ubuntu is a Linux distribution.
- Android is based on Linux kernel.
- Ctrl + Shift + Esc opens Task Manager.
- Win + E opens File Explorer.
- Shift + Delete permanently deletes without Recycle Bin.
- Administrator account has full control.
- Standard account is safer for daily work.

### Memory Tricks

- OS functions: **PMFDSU**  
  Process, Memory, File, Device, Security, User interface
- File operations: **Create, Copy, Cut, Rename, Delete, Restore**
- Security habits: **Password, Patch, Protect, Preserve**  
  Strong password, updates, antivirus, backup

---

## MCQs and Assessments

### A. Multiple Choice Questions (25)

**1.** The main purpose of an operating system is to:
- a) Only play videos
- b) Manage hardware and provide user interface
- c) Replace application software
- d) Increase monitor size

**2.** Which is an example of an operating system?
- a) Keyboard
- b) Windows 11
- c) Printer
- d) Mouse

**3.** Ubuntu is:
- a) A Linux distribution
- b) A printer driver only
- c) A virus
- d) A spreadsheet

**4.** GUI stands for:
- a) General User Internet
- b) Graphical User Interface
- c) Global Utility Input
- d) Graphical Unit Instruction

**5.** CLI uses:
- a) Only touch gestures
- b) Typed commands
- c) Only pictures
- d) Printer output

**6.** Shortcut to open File Explorer is:
- a) Win + E
- b) Win + P
- c) Ctrl + E
- d) Alt + E

**7.** Shortcut to lock Windows is:
- a) Win + L
- b) Ctrl + L
- c) Alt + L
- d) Shift + L

**8.** Task Manager can be opened by:
- a) Ctrl + Shift + Esc
- b) Ctrl + P
- c) Win + B
- d) F12

**9.** Shift + Delete:
- a) Sends file to Recycle Bin
- b) Permanently deletes without Recycle Bin
- c) Renames a file
- d) Opens Settings

**10.** Open-source software example:
- a) Ubuntu
- b) Windows 11
- c) Microsoft Office only
- d) Adobe Photoshop

**11.** Which account has full control of a Windows computer?
- a) Guest
- b) Administrator
- c) Standard user
- d) Temporary user

**12.** Which utility captures screenshots?
- a) Calculator
- b) Snipping Tool
- c) Recycle Bin
- d) Disk folder

**13.** A file extension for a text file is:
- a) `.txt`
- b) `.mp4`
- c) `.jpg`
- d) `.exe`

**14.** Which OS is commonly used on Apple computers?
- a) macOS
- b) Ubuntu only
- c) Android
- d) DOS only

**15.** Android is mainly used on:
- a) Smartphones and tablets
- b) Printers only
- c) Speakers only
- d) Projectors only

**16.** Device drivers help the OS communicate with:
- a) Hardware devices
- b) Wallpapers only
- c) Documents only
- d) Fonts only

**17.** Which is a mobile operating system?
- a) iOS
- b) Notepad
- c) Calculator
- d) PowerPoint

**18.** The Windows modern configuration app is:
- a) Settings
- b) Paint
- c) WordPad
- d) Recycle Bin

**19.** Which malware encrypts files and demands payment?
- a) Ransomware
- b) Calculator
- c) Wallpaper
- d) Notepad

**20.** A backup is:
- a) Extra copy of data
- b) Deleted virus only
- c) Shortcut icon only
- d) Temporary wallpaper

**21.** Linux is popular on servers because it is:
- a) Stable, secure, and customizable
- b) Only for games
- c) Not connected to networks
- d) A mobile-only OS

**22.** The Recycle Bin is used to:
- a) Restore many normally deleted files
- b) Increase RAM
- c) Install CPU
- d) Format monitor

**23.** Which shortcut saves a file in many applications?
- a) Ctrl + S
- b) Ctrl + D
- c) Alt + S
- d) Win + S

**24.** Which is the correct path example?
- a) `C:\Users\Student\Documents`
- b) `printer mouse keyboard`
- c) `CPU/RAM/Monitor?`
- d) `No path`

**25.** A standard user account is generally:
- a) Safer for daily use
- b) More powerful than administrator
- c) Used to replace OS
- d) Required to delete Windows folder

### B. True/False (15)

1. An OS manages hardware and software resources.
2. Windows is an example of open-source software.
3. Linux is used widely on servers.
4. Ubuntu is a Linux distribution.
5. GUI uses only typed commands.
6. CLI is useful for command-based work.
7. Shift + Delete sends files to Recycle Bin.
8. Win + L locks the computer.
9. Task Manager can show CPU and RAM usage.
10. Antivirus helps protect against malware.
11. A folder is used to organize files.
12. Deleting a shortcut always deletes the original program.
13. Updates can improve security.
14. Standard users usually have fewer permissions than administrators.
15. Ransomware is harmless software.

### C. Fill in the Blanks (15)

1. OS stands for __________.
2. GUI stands for __________.
3. CLI stands for __________.
4. Ubuntu is a __________ distribution.
5. The shortcut to open File Explorer is __________.
6. The shortcut to lock Windows is __________.
7. The utility used to view running programs is __________.
8. A deleted file usually goes to __________.
9. A file extension for PDF is __________.
10. The command `ipconfig` shows __________ details.
11. Software that controls hardware communication is called a __________.
12. The account with full control is __________.
13. A compressed folder is commonly called a __________ file.
14. Harmful software is called __________.
15. An extra copy of data is called a __________.

### D. Match the Following (10)

| Column A | Column B |
|---|---|
| 1. Win + E | a. Screenshot tool |
| 2. Ctrl + Shift + Esc | b. Open File Explorer |
| 3. Snipping Tool | c. Linux distribution |
| 4. Ubuntu | d. Task Manager |
| 5. Recycle Bin | e. Restore deleted files |
| 6. GUI | f. Graphical interface |
| 7. CLI | g. Command interface |
| 8. Administrator | h. Full control account |
| 9. `.txt` | i. Text file |
| 10. Antivirus | j. Malware protection |

### E. Practical Tasks (10)

1. Open File Explorer using a keyboard shortcut.
2. Create `Documents\CCC\Unit2\Notes`.
3. Create a text file in Notepad and save it.
4. Rename the file using F2.
5. Copy the file to another folder.
6. Delete a test file and restore it from Recycle Bin.
7. Take a screenshot using Snipping Tool.
8. Open Task Manager and record CPU/RAM usage.
9. Create a zipped folder.
10. Open Settings and check Windows Update.

### F. Viva Questions (10)

1. What is an operating system?
2. What is the difference between GUI and CLI?
3. Why is Linux called open source?
4. What is the use of Task Manager?
5. What is the use of Recycle Bin?
6. Why should software be installed from official websites?
7. What is a device driver?
8. What is the difference between copy and move?
9. What is the use of Win + L?
10. Why are backups important?

### G. Case Studies (5)

1. A student deletes an assignment by mistake. Explain how to restore it and how to avoid future loss.
2. A computer is slow after startup. Explain how Task Manager can help identify the problem.
3. An employee cannot install software using a standard account. Explain why and what should be done.
4. A user downloads cracked software and the computer starts showing unwanted popups. Identify the risk and prevention steps.
5. A school wants to use old computers for basic learning. Explain why Ubuntu or Linux Mint may be useful.

---

## Answer Keys

### MCQ Answers

1-b | 2-b | 3-a | 4-b | 5-b | 6-a | 7-a | 8-a | 9-b | 10-a | 11-b | 12-b | 13-a | 14-a | 15-a | 16-a | 17-a | 18-a | 19-a | 20-a | 21-a | 22-a | 23-a | 24-a | 25-a

### True/False Answers

1-True | 2-False | 3-True | 4-True | 5-False | 6-True | 7-False | 8-True | 9-True | 10-True | 11-True | 12-False | 13-True | 14-True | 15-False

### Fill in the Blanks Answers

1. Operating System
2. Graphical User Interface
3. Command Line Interface
4. Linux
5. Win + E
6. Win + L
7. Task Manager
8. Recycle Bin
9. `.pdf`
10. network/IP configuration
11. device driver
12. Administrator
13. zip
14. malware
15. backup

### Match the Following Answers

1-b | 2-d | 3-a | 4-c | 5-e | 6-f | 7-g | 8-h | 9-i | 10-j

### Case Study Model Answers

1. The student should check Recycle Bin, select the file, and click Restore. Future loss can be avoided by keeping backups and using clear file names.
2. Open Task Manager with Ctrl + Shift + Esc. Check CPU, Memory, Disk, and Startup apps. End only the frozen app if needed.
3. Installation often needs Administrator permission because it changes system files. The employee should contact IT/admin and install only approved software.
4. Cracked software may contain malware, adware, spyware, or ransomware. Prevention: uninstall suspicious apps, scan with antivirus, update Windows, and use official sources.
5. Ubuntu or Linux Mint can run well on many older computers, are free/open source, include useful apps, and are suitable for basic learning and internet use.

### Final Self-Check

- [ ] I can define an operating system.
- [ ] I can explain OS functions with examples.
- [ ] I can compare Windows and Linux.
- [ ] I can explain Linux and Ubuntu.
- [ ] I can use File Explorer for file operations.
- [ ] I can use common keyboard shortcuts.
- [ ] I can install and uninstall software safely.
- [ ] I can use Notepad, Calculator, Recycle Bin, Snipping Tool, Command Prompt, PowerShell, and Task Manager.
- [ ] I can explain malware, updates, backups, and cyber hygiene.
- [ ] I can answer OS viva and practical questions confidently.
