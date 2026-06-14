# Module 2: Operating System (10 Hours)

**Course:** CCC 90-Hour DCA | **Module duration:** 10 hours

## Learning Objectives

After this module you will be able to:
- Describe functions of an operating system
- Navigate Windows desktop, Start menu, taskbar, and Settings
- Create, rename, copy, move, and delete files and folders
- Use File Explorer effectively
- Install and remove (uninstall) programs safely
- Understand Linux/Ubuntu basics and open-source software
- Use built-in utilities (Notepad, Calculator, Paint, Snipping Tool)
- Apply basic security habits (lock screen, user accounts, updates)

---

## 1. Introduction to Operating System

**OS** = software that manages hardware and provides interface for users and applications.

### Functions of OS
1. **Process management** — runs and schedules programs
2. **Memory management** — allocates RAM to applications
3. **File management** — folders, permissions, storage
4. **Device management** — drivers for printer, keyboard, etc.
5. **User interface** — GUI (icons, mouse) or CLI (text commands)

### Popular Operating Systems
| OS | Type | Use |
|----|------|-----|
| Windows 10/11 | GUI | Most offices, institutes, CCC labs |
| Linux (Ubuntu) | GUI + CLI | Servers, developers, free PCs |
| macOS | GUI | Apple computers |
| Android / iOS | Mobile GUI | Smartphones and tablets |

This module focuses on **Windows GUI**, with **Linux/Ubuntu** and **open source** introduced for CCC syllabus coverage.

---

## 2. Open Source Software and Linux/Ubuntu

### Open Source
- **Source code** is publicly available — anyone can view, modify, and share (under a license)
- Usually **free to download** and use; community or foundation maintains it
- Examples: **Linux**, **LibreOffice**, **Firefox**, **VLC Media Player**

### Closed Source (Proprietary)
- Source code is private; only the vendor can modify
- Examples: Microsoft Windows, MS Office (commercial license)

### Linux — Introduction
- **Linux** = open-source OS kernel; many **distributions (distros)** package it with apps
- **Ubuntu** = popular beginner-friendly Linux distro with GUI (similar tasks to Windows)
- Used on servers worldwide; also runs on old PCs via dual-boot or live USB

### Windows vs Ubuntu (quick comparison)
| Task | Windows | Ubuntu (Linux) |
|------|---------|----------------|
| File manager | File Explorer | Files (Nautilus) |
| App store | Microsoft Store | Ubuntu Software / Snap Store |
| Settings | Settings (Win+I) | Settings app |
| Terminal | Command Prompt / PowerShell | Terminal (bash) |
| Install apps | .exe / Microsoft Store | .deb / Snap / apt |
| Office suite | MS Office | LibreOffice (pre-installed) |

### Trying Ubuntu (lab option)
1. Download Ubuntu ISO from [ubuntu.com](https://ubuntu.com)
2. Create bootable USB (Rufus) **or** use virtual machine (VirtualBox)
3. Explore desktop, Files app, Firefox, LibreOffice, Terminal

---

## 3. Desktop and Taskbar (Windows)

### Desktop elements
- **Icons:** Shortcuts to programs/files
- **Taskbar:** Bottom bar — Start, pinned apps, system tray, clock
- **System tray:** Network, volume, battery, date/time
- **Wallpaper:** Background image (right-click desktop → Personalize)

### Start Menu
- Search box — type app name
- Pinned apps — Word, Excel, Settings
- Power button — Shut down, Restart, Sleep

### Keyboard shortcuts (must know)
| Shortcut | Action |
|----------|--------|
| Win | Open Start menu |
| Win + E | File Explorer |
| Win + D | Show desktop |
| Win + L | Lock computer |
| Win + I | Settings |
| Alt + Tab | Switch between open windows |
| Alt + F4 | Close active window |
| Ctrl + C / V / X | Copy / Paste / Cut |
| Ctrl + Z | Undo |
| Ctrl + S | Save |
| F2 | Rename selected item |
| Delete | Send to Recycle Bin |
| Shift + Delete | Permanent delete |

---

## 4. File Explorer

**Open:** Win + E or taskbar folder icon

### Parts of File Explorer
- **Navigation pane** (left): Quick access, This PC, drives
- **Address bar:** Current path e.g. `C:\Users\Student\Documents`
- **Ribbon:** Home, Share, View tabs
- **File list:** Name, Date modified, Type, Size

### Views
- **Icons / List / Details / Tiles** — View tab
- **Sort** by name, date, size, type
- **Search box** — find files by name inside folder

### Drives
- **C:** — Usually Windows and programs
- **D:** or others — Data, DVD, USB when connected

---

## 5. File and Folder Operations

### Create folder
1. Open desired location in File Explorer
2. Right-click → New → Folder
3. Type name → Enter

### Copy / Move
- **Copy:** Ctrl+C → go to destination → Ctrl+V (original stays)
- **Move (Cut):** Ctrl+X → destination → Ctrl+V
- **Drag-drop:** Drag with left mouse; hold **Shift** to move, **Ctrl** to copy

### Rename
- Select item → F2 → type new name → Enter  
- Do not change file extension (.docx) unless you know the type

### Delete and Restore
- Delete → Recycle Bin (can restore)
- Empty Recycle Bin → permanent delete
- Shift + Delete → skip Recycle Bin

### File naming rules (Windows)
- Invalid characters: `\ / : * ? " < > |`
- Extensions identify type: `report.docx`, `data.xlsx`
- Case usually not sensitive: `File.txt` = `file.txt`

---

## 6. Installing and Removing Programs

### Installing software (Windows)

**Method 1 — Installer (.exe / .msi)**
1. Download from official website only (avoid unknown links)
2. Double-click installer → follow wizard (Next → I Agree → Install)
3. Choose install location if asked (default is usually fine)
4. Finish → launch from Start menu

**Method 2 — Microsoft Store**
1. Open Microsoft Store from Start
2. Search app → Get / Install
3. Updates often automatic

**Method 3 — Open-source on Windows**
- Download LibreOffice, Firefox, VLC from official sites — same wizard install

**Ubuntu equivalent:** Ubuntu Software → search → Install, or Terminal: `sudo apt install libreoffice`

### Removing / Uninstalling software (Windows)

**Settings method (recommended)**
1. Win + I → **Apps** → **Installed apps** (or Apps & features)
2. Search program name → **⋯** → **Uninstall**
3. Follow prompts; restart if asked

**Control Panel method (classic)**
1. Control Panel → Programs → Uninstall a program
2. Select program → Uninstall

**Ubuntu equivalent:** Ubuntu Software → Installed → Remove, or `sudo apt remove packagename`

### Safe installation habits
- Install only needed software; avoid pirated/cracked copies
- Uncheck bundled extra toolbars or unwanted apps during setup
- Keep Windows Update enabled for security patches
- Remove unused programs to free disk space

---

## 7. Control Panel and Settings

**Settings (Win + I):** Modern — System, Devices, Network, Personalization, Accounts, Update

**Control Panel:** Classic — Programs, Devices and Printers, User Accounts

### Common tasks
| Task | Path |
|------|------|
| Change display | Settings → System → Display |
| Add printer | Settings → Bluetooth & devices → Printers |
| Uninstall program | Settings → Apps → Installed apps |
| Create user | Settings → Accounts → Family & other users |
| Date/time | Taskbar clock → Adjust date/time |
| Windows Update | Settings → Windows Update |

---

## 8. Built-in Utilities

| Program | Use | Open |
|---------|-----|------|
| Notepad | Plain text | Start → Notepad |
| WordPad | Rich text | Start → WordPad |
| Calculator | Standard / Scientific | Start → Calculator |
| Paint | Simple drawing | Start → Paint |
| Snipping Tool | Screenshot | Start → Snipping Tool |
| Command Prompt | Text commands | Start → cmd |
| Task Manager | Running programs, performance | Ctrl+Shift+Esc |

### Task Manager uses
- End frozen program (End task)
- Check CPU/RAM usage (Performance tab)
- Startup programs (Startup tab)

---

## 9. User Accounts and Security

- **Administrator:** Full control — install software, change settings
- **Standard user:** Limited — safer for daily use
- **Password / PIN:** Lock screen protection
- **Windows Update:** Keep OS patched — Settings → Windows Update

### Good habits
- Lock PC when away (Win + L)
- Do not share password
- Regular backup to USB or cloud
- Use antivirus (Windows Defender built-in)

---

## 10. Compression and Shortcuts

### Zip (compress)
- Right-click folder → Send to → Compressed (zipped) folder
- Reduces size for email/upload

### Desktop shortcut
- Right-click program → Send to → Desktop (create shortcut)
- Or right-click desktop → New → Shortcut → browse to .exe

---

## Lab Tasks

1. Create folder structure: `Documents\CCC\Unit2\Notes` and `Documents\CCC\Unit2\Labs`
2. Create `my-info.txt` in Notes with your name, course, date
3. Copy to Labs; rename copy to `my-info-backup.txt`
4. Practice shortcuts: Win+E, Win+D, Win+L, Alt+Tab, F2, Ctrl+C/V/X
5. Take screenshot with Snipping Tool; save as PNG in Labs
6. Open Task Manager — note CPU and memory usage %
7. Create zip of Labs folder; compare size with original folder
8. **Install:** Install LibreOffice or Firefox from official site (or use Store); note install steps
9. **Uninstall:** Remove a practice app via Settings → Apps → Uninstall (teacher-approved app only)
10. **Linux demo:** Boot Ubuntu live USB or VM — open Files, Firefox, and LibreOffice Writer; compare with Windows

---

## Summary Checklist

- [ ] I can explain five functions of an OS
- [ ] I know open source vs closed source with examples
- [ ] I can name basic Ubuntu apps equivalent to Windows tools
- [ ] I can navigate File Explorer and manage files/folders
- [ ] I can install and uninstall a program safely
- [ ] I know 10+ keyboard shortcuts
- [ ] I can use Notepad, Calculator, Snipping Tool, Task Manager

---

## Quick MCQs (10 Questions)

**1.** Which is an open-source operating system?
- a) Windows 11  
- b) macOS  
- c) Ubuntu Linux  
- d) iOS  

**2.** Primary function of an operating system is:
- a) Only playing games  
- b) Managing hardware and providing user interface  
- c) Replacing the CPU  
- d) Storing data permanently without software  

**3.** Shortcut to open File Explorer in Windows:
- a) Win + E  
- b) Win + P  
- c) Ctrl + E  
- d) Alt + E  

**4.** To move a file (not copy) using keyboard:
- a) Ctrl+C then Ctrl+V  
- b) Ctrl+X then Ctrl+V  
- c) Shift+Delete  
- d) F2  

**5.** Recommended way to uninstall a program in Windows 10/11:
- a) Delete folder from Program Files only  
- b) Settings → Apps → Installed apps → Uninstall  
- c) Rename the .exe file  
- d) Empty Recycle Bin  

**6.** LibreOffice is an example of:
- a) Hardware  
- b) Open-source application suite  
- c) Virus  
- d) CPU type  

**7.** Shift + Delete does what?
- a) Sends file to Recycle Bin  
- b) Permanently deletes without Recycle Bin  
- c) Renames file  
- d) Copies file  

**8.** Win + L is used to:
- a) Open LibreOffice  
- b) Lock the computer  
- c) Log off permanently  
- d) Open Linux terminal  

**9.** Ubuntu's graphical file manager is commonly called:
- a) File Explorer  
- b) Finder  
- c) Files (Nautilus)  
- d) Notepad  

**10.** Task Manager is opened by:
- a) Ctrl+Alt+Del only  
- b) Ctrl+Shift+Esc  
- c) Win+T  
- d) F12  

---

### MCQ Answers
1-c | 2-b | 3-a | 4-b | 5-b | 6-b | 7-b | 8-b | 9-c | 10-b
