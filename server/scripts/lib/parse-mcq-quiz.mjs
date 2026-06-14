/**
 * Build clear, educational MCQ explanations (no "check study notes" meta text).
 */

function wrongHint(options, correctIndex, labels) {
  const wrong = options
    .map((o, i) => ({ text: o.text, i }))
    .filter((o) => o.i !== correctIndex)
    .slice(0, 2)
  if (!wrong.length) return ''
  const parts = wrong.map((w) => {
    const label = labels?.[w.i] || w.text
    return label
  })
  return parts.length === 1
    ? `${parts[0]} is not the right choice here.`
    : `${parts[0]} and ${parts[1]} are not the right choices here.`
}

/** Rich one-line explanations keyed on the correct answer text. */
function explainByCorrectAnswer(q, correct) {
  const c = correct.toLowerCase()

  const map = [
    [/bhim|npci|government initiative/i, 'BHIM (Bharat Interface for Money) is a UPI app launched with support from NPCI — the organisation that runs UPI payment infrastructure in India.'],
    [/banking via internet|net banking/i, 'Net banking (online banking) lets you check balance, transfer money, and pay bills through your bank\'s official website or app — without visiting a branch.'],
    [/paytm|phonepe|digital wallet/i, 'Paytm and PhonePe are digital wallets/UPI apps used for cashless payments, recharges, and bill pay from your phone.'],
    [/aadhaar authentication|aeps/i, 'AEPS (Aadhaar Enabled Payment System) uses Aadhaar-based authentication so people can do banking with fingerprint verification.'],
    [/merchant qr|scan/i, 'Scan & Pay reads a merchant\'s QR code with your phone camera and pays via UPI — no cash or card swipe needed.'],
    [/one time password/i, 'OTP is a short code sent to your phone for one transaction or login — valid only for a few minutes. Never share it.'],
    [/immediate payment|imps/i, 'IMPS (Immediate Payment Service) transfers money between bank accounts instantly, 24×7.'],
    [/electronic fund transfer|neft/i, 'NEFT (National Electronic Funds Transfer) moves money between bank accounts — used for regular bank transfers.'],
    [/large value real-time|rtgs/i, 'RTGS (Real Time Gross Settlement) is for high-value bank transfers that settle in real time during banking hours.'],
    [/your bank account/i, 'A debit card deducts money directly from your savings/current account when you pay or withdraw.'],
    [/borrowed credit|credit line/i, 'A credit card lets you spend on borrowed credit from the bank — you pay the bill later with interest if delayed.'],
    [/unified payments interface/i, 'UPI connects your bank account to apps like BHIM/PhonePe so you can pay anyone using a UPI ID or QR code.'],
    [/electronic mail/i, 'Email (Electronic Mail) sends messages over the Internet to addresses like name@domain.com.'],
    [/user@domain|email format/i, 'A valid email has a username, @ symbol, and domain — e.g. student@gmail.com.'],
    [/carbon copy visible|carbon copy/i, 'CC (Carbon Copy) sends a copy of the email to others — all recipients can see who received it.'],
    [/blind carbon copy/i, 'BCC (Blind Carbon Copy) sends copies without showing other recipients\' addresses — useful for privacy.'],
    [/google drive|cloud storage|cloud file/i, 'Cloud storage (Google Drive, OneDrive, Dropbox) saves files online so you can access them from any device.'],
    [/video meeting|video conferencing|collaboration and meeting/i, 'Tools like Google Meet, Zoom, and Teams let people join video calls and share screens for online classes and meetings.'],
    [/global network of computers/i, 'The Internet is a worldwide network linking computers so they can share information and services.'],
    [/world wide web/i, 'WWW (World Wide Web) is the system of linked web pages you browse using Chrome, Edge, or Firefox.'],
    [/uniform resource locator/i, 'A URL (Uniform Resource Locator) is the web address you type in the browser — e.g. https://www.google.com.'],
    [/hyper text transfer protocol/i, 'HTTP/HTTPS are protocols browsers use to load web pages — HTTPS adds encryption for security.'],
    [/search engine/i, 'Google and Bing are search engines — they find web pages matching your search words. They are not operating systems.'],
    [/save from internet to pc|download/i, 'Downloading copies a file from the Internet to your computer (e.g. saving a PDF or photo).'],
    [/send from pc to internet|upload/i, 'Uploading sends a file from your computer to the Internet (e.g. attaching a photo to email or cloud).'],
    [/markup language for web/i, 'HTML (HyperText Markup Language) is the code used to structure web pages displayed in browsers.'],
    [/domain name to ip/i, 'DNS (Domain Name System) converts website names like google.com into numeric IP addresses computers use.'],
    [/malicious software/i, 'Malware (including viruses) is harmful software designed to damage systems, steal data, or spread to other devices.'],
    [/fraudulent data theft|phishing/i, 'Phishing tricks users with fake emails, links, or messages to steal passwords, OTP, or bank details.'],
    [/block unauthorized access/i, 'A firewall monitors network traffic and blocks suspicious connections to protect your computer or network.'],
    [/encrypts data demands payment|ransomware/i, 'Ransomware locks or encrypts your files and demands payment — regular backups help you recover without paying.'],
    [/password plus second verify|two-factor|2fa|extra login security/i, 'Two-factor authentication (2FA) adds a second step (OTP, app code, fingerprint) after your password for stronger security.'],
    [/artificial intelligence/i, 'AI (Artificial Intelligence) enables computers to perform tasks like recognition, recommendations, and language understanding.'],
    [/internet of things/i, 'IoT (Internet of Things) connects everyday devices (sensors, cameras, appliances) to the Internet for smart control.'],
    [/services over internet/i, 'Cloud computing delivers storage, software, and processing over the Internet instead of only on your local PC.'],
    [/government services via ict|e-governance/i, 'E-governance uses technology to deliver government services online — certificates, tax, schemes — to citizens.'],
    [/government services unified|umang/i, 'UMANG app provides many government services in one place — PAN, EPFO, utility bills, and more.'],
    [/identity authentication/i, 'Aadhaar is a 12-digit identity number used for verification (eKYC) in banking and government services.'],
    [/national portal|india\.gov/i, 'India.gov.in is the official national portal linking to government websites and services.'],
    [/\.gov\.in domain/i, 'Official Indian government sites use .gov.in — always verify the domain and HTTPS before entering personal data.'],
    [/digital empowerment|digital india/i, 'Digital India aims to make citizens digitally empowered through online services, connectivity, and digital literacy.'],
    [/machines learn from data|machine learning/i, 'Machine learning lets computers improve from data examples without being explicitly programmed for every rule.'],
    [/generative ai/i, 'Generative AI tools (like ChatGPT) create text, answers, or content based on your prompts — always verify important facts.'],
    [/use technology effectively|digital literacy/i, 'Digital literacy means using computers, Internet, and mobile apps safely and effectively in daily life.'],
    [/programming ai data|python/i, 'Python is a popular programming language used for AI, data analysis, automation, and web development.'],
  ]

  for (const [pattern, text] of map) {
    if (pattern.test(c) || pattern.test(q)) return text
  }

  // Question-stem based extras
  if (/cc means|bcc means|reply sends|forward sends|attachment icon|spam is|mute in meeting|screen share|netiquette/i.test(q)) {
    return `${correct} — this is the standard meaning or action in email and online communication for CCC.`
  }
  if (/browser example|ctrl\+t in browser|bookmark saves|history shows|cookies store|pop-up blocker|wi-fi is|broadband is|lan connects|streaming plays/i.test(q)) {
    return `${correct} — this is how browsers and Internet connectivity work in everyday use.`
  }
  if (/mail merge|italic shortcut|underline shortcut|page break|justify alignment|pie chart|column chart|line chart|transition applies|animation applies|freeze panes|conditional formatting/i.test(q)) {
    return `${correct} — this is the correct Office feature, shortcut, or chart type for the task described.`
  }
  if (/never share otp|secure banking|secure upi|bank helpline|transaction dispute|wallet kyc|cashless economy/i.test(q)) {
    return `${correct} — safe digital payment practice: use official apps, protect PIN/OTP, and verify before you pay.`
  }

  return ''
}

/** @param {string} question @param {number} correctIndex @param {{text:string}[]} options @param {string} answerText */
export function buildExplanation(question, correctIndex, options, answerText) {
  const correct = (answerText || options[correctIndex]?.text || '').trim()
  const q = question.trim().toLowerCase()
  const opts = options.map((o) => o.text)
  const hint = wrongHint(options, correctIndex, opts)

  // —— Computer fundamentals ——
  if (/which memory is temporary/.test(q)) {
    return `RAM (Random Access Memory) is temporary (volatile) memory — it holds data only while the computer is on and clears when power is off. ROM, hard disk, and DVD keep data permanently.`
  }
  if (/which memory stores boot|boot instructions/.test(q)) {
    return `ROM (Read Only Memory) stores permanent boot instructions that start the computer. RAM is temporary; cache and registers are too small for full boot code.`
  }
  if (/brain of the computer/.test(q)) {
    return `The CPU (Central Processing Unit) is called the brain of the computer because it executes instructions and controls all processing. Monitor, keyboard, and printer are separate devices.`
  }
  if (/full form of cpu/.test(q)) {
    return `CPU stands for Central Processing Unit — the main processor chip that runs programs and calculations.`
  }
  if (/full form of ram/.test(q)) {
    return `RAM stands for Random Access Memory — fast temporary memory used while programs are running.`
  }
  if (/full form of rom/.test(q)) {
    return `ROM stands for Read Only Memory — non-volatile memory that stores firmware and boot instructions.`
  }
  if (/input device\?/.test(q) && !/output|both|enters/.test(q)) {
    return `A keyboard sends data into the computer, so it is an input device. Monitor, printer, and speaker are output devices.`
  }
  if (/output device\?/.test(q) && !/input|both/.test(q)) {
    return `A printer produces hard copy output on paper. Mouse, scanner, and microphone send data in — they are input devices.`
  }
  if (/which enters data into computer/.test(q)) {
    return `Input devices (keyboard, mouse, scanner) send data to the computer. Monitors and speakers only show or play results — they are output devices.`
  }
  if (/1 kb equals|1024 bytes/.test(q)) {
    return `In computing, 1 KB (kilobyte) = 1024 bytes (2¹⁰), not 1000. This is the standard used in CCC and most operating systems.`
  }
  if (/8 bits/.test(q)) {
    return `One byte equals 8 bits. A bit is the smallest unit of data (0 or 1); 8 bits grouped together form one byte.`
  }
  if (/bit is\?/.test(q)) {
    return `A bit (binary digit) is the smallest unit of data — either 0 or 1. It is not 8 bytes or 1 KB.`
  }
  if (/binary uses digits/.test(q)) {
    return `The binary number system uses only two digits: 0 and 1. Decimal uses 0–9; hexadecimal uses 0–9 and A–F.`
  }
  if (/software example/.test(q)) {
    return `MS Word is application software — a program that helps users create documents. CPU, monitor, and keyboard are hardware.`
  }
  if (/hardware example/.test(q)) {
    return `A keyboard is a physical hardware device you can touch. Windows, Chrome, and antivirus are software programs.`
  }
  if (/pen drive is/.test(q)) {
    return `A pen drive (USB flash drive) is a portable storage device used to save and carry files. It is not an input or output device.`
  }
  if (/data processed into meaningful/.test(q)) {
    return `Raw facts are called data. After processing, data becomes useful information (e.g. marks → percentage report).`
  }
  if (/system software/.test(q)) {
    return `The Operating System (Windows, Linux) manages hardware and runs other programs — it is system software. Word, Chrome, and Tally are application software.`
  }
  if (/alu is part/.test(q)) {
    return `The ALU (Arithmetic Logic Unit) performs calculations and logic inside the CPU. It is not a separate monitor or printer.`
  }
  if (/vdu stands/.test(q)) {
    return `VDU means Visual Display Unit — another name for a monitor/screen that displays output.`
  }
  if (/multitasking means/.test(q)) {
    return `Multitasking means running several programs at the same time (e.g. browser + Word together). Modern OS supports this.`
  }
  if (/virus is\?/.test(q)) {
    return `A computer virus is harmful software that can copy itself and damage files or the system. It is not hardware.`
  }
  if (/touchscreen is both/.test(q)) {
    return `A touchscreen accepts touch input and displays output on the same surface — so it works as both input and output device.`
  }
  if (/first generation used/.test(q)) {
    return `First-generation computers (1940s–50s) used vacuum tubes. Transistors came in 2nd gen; IC chips in 3rd; microprocessors in 4th.`
  }
  if (/fourth generation/.test(q)) {
    return `Fourth-generation computers use microprocessors and VLSI chips — the technology in today's PCs and laptops.`
  }
  if (/ssd compared to hdd/.test(q)) {
    return `SSD (Solid State Drive) has no moving parts and is generally faster than HDD (Hard Disk Drive) for booting and loading files.`
  }
  if (/motherboard function/.test(q)) {
    return `The motherboard is the main circuit board that connects CPU, RAM, storage, and other components together.`
  }
  if (/scanner is\?/.test(q)) {
    return `A scanner converts paper documents or images into digital data sent to the computer — it is an input device.`
  }
  if (/webcam is\?/.test(q)) {
    return `A webcam captures video/images and sends them to the computer — it is an input device.`
  }
  if (/application software does/.test(q)) {
    return `Application software helps users do specific tasks (Word for documents, Excel for sheets). It does not boot the PC or cool the CPU.`
  }
  if (/firmware is/.test(q)) {
    return `Firmware is software permanently stored in hardware (e.g. BIOS in ROM) that controls basic device functions.`
  }
  if (/cold boot/.test(q)) {
    return `Cold boot means starting the computer from a completely powered-off state — a full startup, not wake from sleep.`
  }
  if (/gui means/.test(q)) {
    return `GUI (Graphical User Interface) lets you use icons, menus, and a mouse instead of typing only text commands.`
  }
  if (/\.docx/.test(q)) {
    return `The .docx extension is used for Microsoft Word documents. .xlsx is Excel; .pptx is PowerPoint.`
  }
  if (/backup purpose/.test(q)) {
    return `Backup copies important files to another location so you can recover them if the original is lost, deleted, or damaged.`
  }
  if (/microcomputer example/.test(q)) {
    return `A laptop is a microcomputer — a personal computer for one user. Mainframes and supercomputers serve many users or heavy science work.`
  }
  if (/cache memory/.test(q)) {
    return `Cache is very fast, small memory between CPU and RAM that stores frequently used data for quicker access.`
  }
  if (/cpu speed measured/.test(q)) {
    return `CPU speed is measured in GHz (gigahertz) — how many billion cycles per second the processor can perform.`
  }
  if (/decimal 5 in binary/.test(q)) {
    return `Decimal 5 = binary 101 (4 + 0 + 1). Divide by 2 repeatedly and read remainders bottom to top.`
  }
  if (/binary 1010 in decimal/.test(q)) {
    return `Binary 1010 = 8 + 0 + 2 + 0 = 10 in decimal. Each position is a power of 2 from right to left.`
  }
  if (/mainframe used/.test(q)) {
    return `Mainframe computers handle huge transactions for banks, railways, and large organisations — not home gaming.`
  }
  if (/headphones are/.test(q)) {
    return `Headphones receive audio signals from the computer and play sound — they are output devices.`
  }
  if (/joystick is used/.test(q)) {
    return `A joystick is an input device mainly used for games and simulations to control movement on screen.`
  }
  if (/digital camera captures/.test(q)) {
    return `A digital camera captures photos as digital data (files) that can be stored and edited on a computer.`
  }
  if (/mobile app runs/.test(q)) {
    return `Mobile apps run on smartphones and tablets — portable computers — not on printers or scanners alone.`
  }
  if (/e-governance uses/.test(q)) {
    return `E-governance delivers government services online (certificates, tax, schemes) using computers and the internet.`
  }

  // —— Operating system ——
  if (/windows is a\?/.test(q)) {
    return `Microsoft Windows is an operating system (OS) that manages hardware and runs applications. It is not a browser or spreadsheet.`
  }
  if (/linux is\?/.test(q)) {
    return `Linux is an open-source operating system — its source code can be freely used and modified. Ubuntu and Fedora are Linux distributions.`
  }
  if (/shortcut copy/.test(q)) {
    return `Ctrl+C copies selected text or files to the clipboard without removing the original. Ctrl+V pastes; Ctrl+X cuts.`
  }
  if (/shortcut paste/.test(q)) {
    return `Ctrl+V pastes content from the clipboard. Ctrl+C copies; Ctrl+S saves the file.`
  }
  if (/shortcut save/.test(q)) {
    return `Ctrl+S saves the current file quickly. Always save your work often to avoid losing changes.`
  }
  if (/win\+e opens|win e opens/.test(q)) {
    return `Win+E opens File Explorer so you can browse folders and files on your computer.`
  }
  if (/win\+l|win l\?/.test(q)) {
    return `Win+L locks the computer immediately — you must sign in again. Use this when stepping away from your desk.`
  }
  if (/f2 key/.test(q)) {
    return `F2 renames a selected file or folder in Windows File Explorer. F5 refreshes the view.`
  }
  if (/delete sends file/.test(q)) {
    return `Normal Delete (without Shift) moves the file to Recycle Bin — you can restore it later.`
  }
  if (/shift\+delete/.test(q)) {
    return `Shift+Delete permanently deletes a file without sending it to Recycle Bin — recovery is difficult.`
  }
  if (/task manager/.test(q)) {
    return `Ctrl+Shift+Esc opens Task Manager to view running programs, CPU/RAM use, and end stuck tasks.`
  }
  if (/default drive letter for windows/.test(q)) {
    return `Windows is usually installed on drive C:. Drive A: was for floppy disks; other letters are for extra partitions or USB drives.`
  }
  if (/ctrl\+x is/.test(q)) {
    return `Ctrl+X cuts — removes the selection and places it on the clipboard to paste elsewhere.`
  }
  if (/ctrl\+z is/.test(q)) {
    return `Ctrl+Z undoes your last action. Very useful if you make a mistake while typing or editing.`
  }
  if (/alt\+tab/.test(q)) {
    return `Alt+Tab switches between open application windows quickly without using the mouse.`
  }
  if (/recycle bin|restore deleted/.test(q)) {
    return `Deleted files go to Recycle Bin first. Open it and choose Restore to get the file back to its original place.`
  }
  if (/open source means/.test(q)) {
    return `Open source means the program's source code is publicly available to study, modify, and share (e.g. Linux, LibreOffice).`
  }
  if (/safe eject usb/.test(q)) {
    return `Safely ejecting USB (Eject option) finishes writing data before you unplug — prevents file corruption.`
  }
  if (/uninstall program/.test(q)) {
    return `Use Settings → Apps → Uninstall to remove a program properly. Deleting only the desktop shortcut does not uninstall it.`
  }

  // —— Word / Excel / PPT shortcuts & concepts ——
  if (/bold shortcut/.test(q)) {
    return `Ctrl+B applies bold formatting to selected text in Word, Writer, and many other apps.`
  }
  if (/formula starts with/.test(q)) {
    return `Every Excel/Calc formula must begin with = (equals sign), e.g. =SUM(A1:A10). Without it, text is stored as plain text.`
  }
  if (/sum\(\) used/.test(q)) {
    return `SUM() adds numbers in the selected range — the most common function for totals in spreadsheets.`
  }
  if (/f5 starts slideshow/.test(q)) {
    return `F5 starts the PowerPoint/Impress slideshow from the first slide. Shift+F5 starts from the current slide.`
  }
  if (/ctrl\+m in powerpoint|new slide shortcut/.test(q)) {
    return `Ctrl+M inserts a new slide in PowerPoint. Use it quickly while building presentations.`
  }

  // —— Internet & email ——
  if (/internet is\?/.test(q)) {
    return `The Internet is a global network connecting millions of computers worldwide to share data and services.`
  }
  if (/www stands/.test(q)) {
    return `WWW (World Wide Web) is the collection of web pages and links accessed through browsers on the Internet.`
  }
  if (/https indicates/.test(q)) {
    return `HTTPS encrypts data between your browser and the website — look for the padlock when entering passwords or paying online.`
  }
  if (/email stands/.test(q)) {
    return `Email (Electronic Mail) sends messages over the Internet to addresses like user@domain.com.`
  }
  if (/otp in banking/.test(q)) {
    return `OTP (One Time Password) is a temporary code sent to your phone for secure login or payment — never share it with anyone.`
  }
  if (/upi stands/.test(q)) {
    return `UPI (Unified Payments Interface) lets you transfer money instantly between bank accounts using a mobile app and UPI PIN.`
  }
  if (/phishing/.test(q)) {
    return `Phishing is a fraud trick using fake emails, links, or messages to steal passwords, OTP, or bank details.`
  }
  if (/virus is\?|malware means/.test(q)) {
    return `Malware (including viruses) is malicious software designed to harm, steal data, or take control of your device.`
  }
  if (/strong password/.test(q)) {
    return `A strong password mixes upper/lowercase letters, numbers, and symbols — avoid names, birthdays, or "123456".`
  }
  if (/ai stands for/.test(q)) {
    return `AI (Artificial Intelligence) means computer systems that can perform tasks needing human-like learning or reasoning.`
  }
  if (/digilocker stores/.test(q)) {
    return `DigiLocker stores verified digital documents (marksheets, certificates) issued by government authorities online.`
  }

  // —— Explain by correct-answer content (covers most CCC pool questions) ——
  const concept = explainByCorrectAnswer(q, correct)
  if (concept) return concept

  // —— Generic patterns ——
  if (/full form of (.+)/i.test(question)) {
    const m = question.match(/full form of (.+)\?/i)
    const term = m?.[1]?.trim() || 'this term'
    return `${correct} is the correct full form of ${term}. Remember abbreviations — they are common in CCC exams.`
  }
  if (/^which .+ (is|are|device|memory|type|example)/.test(q) || /^which /.test(q)) {
    return `${correct} is correct for this question. ${hint}`
  }
  if (/shortcut|ctrl\+|win\+|shift\+|f\d/.test(q)) {
    return `Use ${correct} for this action. Practice the shortcut on your keyboard during lab sessions so it becomes automatic.`
  }
  if (/stands for|stand for/.test(q)) {
    return `${correct} is the correct expansion or meaning. Learn both the short form and full form for the exam.`
  }
  if (/ equals\?| in binary| in decimal|convert/.test(q)) {
    return `The answer is ${correct}. For number conversions, practice dividing by 2 (decimal→binary) or adding place values (binary→decimal).`
  }
  if (/ is a\?| is an\?| is \?/.test(q)) {
    return `${correct} correctly answers this question. ${hint}`
  }
  if (/function|purpose|used for|used to/.test(q)) {
    return `${correct} is the main purpose or function described in the question. ${hint}`
  }
  if (/example\?/.test(q)) {
    return `${correct} is a correct example for what the question asks about. ${hint}`
  }

  // Final fallback — teach the fact, never send student to notes alone
  return `${correct} is the correct answer. ${hint} This is an important CCC exam point — memorise it.`
}

export function parseExplanationFromBlock(lines) {
  for (const line of lines) {
    const ex = line.match(/\*\*Explanation:\s*(.+?)\*\*/i)
    if (ex) return ex[1].trim()
  }
  return ''
}

function extractMcqBlock(md) {
  const sectionMatch = md.match(/## Section A[^\n]*\n([\s\S]*?)(?=\n## Section B|\n## Short|\n## Practical|\n## MCQ Answer|$)/i)
  if (sectionMatch) return sectionMatch[1]
  const afterMeta = md.replace(/^#[^\n]+\n+(\*\*[^*]+\*\*\n+)?/m, '')
  const cut = afterMeta.split(/\n## /)[0]
  return cut
}

function parseQuestionsBlock(text) {
  const questions = []
  const blocks = text.split(/\n(?=\d+\.\s)/).filter((b) => /^\d+\.\s/.test(b.trim()))

  for (const block of blocks) {
    const lines = block.trim().split('\n')
    const head = lines[0].match(/^(\d+)\.\s+(.+)$/)
    if (!head) continue

    const num = parseInt(head[1], 10)
    const question = head[2].trim()
    const options = []
    let correctIndex = -1
    let answerText = ''
    let explanation = ''

    for (let i = 1; i < lines.length; i += 1) {
      const line = lines[i]
      const opt = line.match(/^\s*([a-d])\)\s+(.+)$/i)
      if (opt) {
        options.push({ id: opt[1].toLowerCase(), text: opt[2].trim() })
        continue
      }
      const ans = line.match(/\*\*Answer:\s*([a-d])\)\s*(.+?)\*\*/i)
      if (ans) {
        correctIndex = ans[1].toLowerCase().charCodeAt(0) - 97
        answerText = ans[2].trim()
        continue
      }
      const ex = line.match(/\*\*Explanation:\s*(.+?)\*\*/i)
      if (ex) explanation = ex[1].trim()
    }

    if (!explanation) explanation = parseExplanationFromBlock(lines)

    if (question && options.length >= 2) {
      questions.push({ num, question, options, correctIndex, answerText, explanation })
    }
  }
  return questions
}

export function parseQuizFromMarkdown(practiceMd, answerMd) {
  const practiceQs = parseQuestionsBlock(extractMcqBlock(practiceMd))
  const answerQs = parseQuestionsBlock(extractMcqBlock(answerMd))
  const answerMap = new Map(answerQs.map((q) => [q.num, q]))

  const questions = practiceQs.map((pq) => {
    const ak = answerMap.get(pq.num)
    const correctIndex = ak?.correctIndex >= 0 ? ak.correctIndex : pq.correctIndex
    const answerText = ak?.answerText || pq.answerText || pq.options[correctIndex]?.text || ''
    const explanation =
      ak?.explanation ||
      pq.explanation ||
      buildExplanation(pq.question, correctIndex, pq.options, answerText)
    return {
      id: pq.num,
      question: pq.question,
      options: pq.options,
      correctIndex,
      explanation,
    }
  })

  const titleMatch = practiceMd.match(/^#\s+(.+)$/m)
  return {
    title: titleMatch?.[1]?.trim() || 'Practice Quiz',
    questions,
  }
}

export function parseQuizFromFiles(practiceMd, answerMd) {
  return parseQuizFromMarkdown(practiceMd, answerMd)
}
