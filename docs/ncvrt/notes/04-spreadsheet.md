# Module 4: Spreadsheet (12 Hours)

**Course:** CCC 90-Hour DCA | **Module duration:** 12 hours

## Learning Objectives

After this module you will be able to:
- Navigate workbook, sheets, cells, and ranges in Excel and LibreOffice Calc
- Enter and format data (numbers, text, dates, currency)
- Write formulas and use common functions (SUM, AVERAGE, IF, COUNTIF)
- Apply relative and absolute cell references
- Sort, filter, and use conditional formatting
- Create and customize charts
- Set print area, headers, and page setup for worksheets

**Focus:** Spreadsheet skills in **MS Excel** and **LibreOffice Calc** — not database tools (Access/Base).

---

## 1. Introduction to Spreadsheets

A **spreadsheet** organizes data in rows and columns for calculation, analysis, and charts.

| Software | Extension | Open source? |
|----------|-----------|--------------|
| **MS Excel** | `.xlsx` | No (Microsoft) |
| **LibreOffice Calc** | `.ods` | Yes |

### Basic terms
- **Workbook** = entire file
- **Worksheet (Sheet)** = tab (Sheet1, Sheet2…)
- **Cell** = intersection of row and column
- **Cell address:** Column letter + row number — **A1**, **D15**
- **Range:** A1:C10 (rectangle)

### Fill handle
Drag small square at cell corner to copy formula or extend series (1,2,3… or Jan, Feb…)

---

## 2. MS Excel vs LibreOffice Calc — Parity

| Task | MS Excel | LibreOffice Calc |
|------|----------|------------------|
| New workbook | Ctrl+N | Ctrl+N |
| Save | Ctrl+S | Ctrl+S |
| Format cells | Ctrl+1 | Ctrl+1 |
| Sum formula | `=SUM(A1:A10)` | Same syntax |
| AutoSum | Home → AutoSum | Sigma Σ on toolbar |
| Sort/Filter | Data tab | Data menu |
| Chart | Insert → Chart | Insert → Chart |
| Sheet tab | Bottom tabs | Bottom tabs |
| Print preview | Ctrl+P | Ctrl+P |
| Export PDF | File → Save As PDF | File → Export as PDF |

**Formula syntax is nearly identical** — CCC exams often use Excel notation; it works in Calc.

---

## 3. Data Entry and Formatting

### Data types
- **Text** — left-aligned (names, roll numbers as text)
- **Numbers** — right-aligned (marks, amounts)
- **Dates** — format dd-mm-yyyy (India)

### Home tab / Formatting toolbar
| Tool | Use |
|------|-----|
| Number format | General, Number, Currency ₹, Percentage, Date |
| Decimal places | Increase/decrease |
| Bold / Borders | Table appearance |
| Merge & Center | Title across columns |
| Wrap Text | Multi-line in one cell |

**Format Cells (Ctrl+1):** Number, Alignment, Font, Border, Fill

---

## 4. Formulas (always start with `=`)

| Formula | Example | Result |
|---------|---------|--------|
| Addition | `=A1+B1` | Sum of two cells |
| Subtraction | `=A1-B1` | Difference |
| Multiplication | `=A1*B1` | Product |
| Division | `=A1/B1` | Quotient |
| Average | `=AVERAGE(A1:A10)` | Mean |
| Sum | `=SUM(A1:A10)` | Total |
| Count | `=COUNT(A1:A10)` | Count numbers |
| Max / Min | `=MAX(A1:A10)` / `=MIN()` | Highest / lowest |
| Percentage | `=B1/C1*100` | % marks |

### Cell references
- **Relative:** `=B2*C2` — changes when copied down (B3*C3, B4*C4…)
- **Absolute:** `=$B$1` — fixed when copying (press **F4** in Excel/Calc)
- **Mixed:** `=$B1` or `=B$1` — lock one part only

**Use case:** Tax rate in cell B1 ($B$1) applied to every row of amounts.

---

## 5. Important Functions (Exam Focus)

| Function | Syntax | Use |
|----------|--------|-----|
| SUM | `=SUM(B2:B20)` | Total |
| AVERAGE | `=AVERAGE(B2:B20)` | Average |
| COUNT | `=COUNT(B2:B20)` | Count numeric cells |
| COUNTA | `=COUNTA(A2:A20)` | Count non-empty cells |
| MAX / MIN | `=MAX()`, `=MIN()` | Extremes |
| IF | `=IF(C2>=40,"Pass","Fail")` | Condition |
| COUNTIF | `=COUNTIF(B2:B20,">=40")` | Count if condition |
| SUMIF | `=SUMIF(A2:A20,"Delhi",B2:B20)` | Sum matching criteria |
| CONCAT / & | `=A2&" "&B2` | Join text (Calc: CONCATENATE) |
| TODAY | `=TODAY()` | Current date |
| ROUND | `=ROUND(A2,2)` | Round decimals |

**Nested IF (grades):**  
`=IF(B2>=60,"First",IF(B2>=45,"Second","Fail"))`

---

## 6. Sort and Filter

- **Sort:** Data → Sort A to Z / Z to A / Custom sort (multiple columns)
- **Filter:** Data → Filter — dropdown arrows in headers; show only matching rows
- **Remove Duplicates:** Data → Remove Duplicates (Excel); Calc: Data → More filters → Standard filter

**Example:** Sort students by total marks descending; filter total > 200.

---

## 7. Conditional Formatting

Home → Conditional Formatting (Calc: Format → Conditional)

- Highlight Cell Rules — greater than, less than, between
- Color scales — heat map
- Data bars — visual bars in cells
- Icon sets — arrows, traffic lights

**Example:** Marks < 40 → red fill; marks > 75 → green fill.

---

## 8. Charts

Insert → Chart → select data range with labels

| Chart type | Best for |
|------------|----------|
| Column / Bar | Compare categories (subject-wise marks) |
| Line | Trends over time (monthly sales) |
| Pie | Parts of whole (pass/fail proportion) |
| Area | Volume over time |

**Steps:** Select data including row/column labels → Insert chart → add title, legend, axis labels.

---

## 9. Page Setup and Print

- **Print area:** Page Layout → Print Area → Set Print Area
- **Print titles:** Repeat row 1 (headers) on every printed page
- **Orientation:** Portrait (tall data) / Landscape (wide tables)
- **Margins:** Narrow for more columns on one page
- **Gridlines:** Print gridlines option for clarity
- **Preview:** Ctrl+P

---

## 10. Multiple Sheets

- **Add sheet:** + tab or Shift+F11
- **Rename:** Double-click tab
- **3D formula:** `=SUM(Sheet1:Sheet3!B2)` — same cell across sheets
- **Link:** `=Sheet2!A1` — reference another sheet

---

## 11. Typical CCC Spreadsheet Tasks

| Task | Approach |
|------|----------|
| Student marksheet | Formulas: Total, Average, %, Grade (IF) |
| Fee collection | SUM, date column, receipt number |
| Attendance % | COUNTA, division, percentage format |
| Inventory list | Sort by quantity; filter low stock |
| Simple budget | SUM by category; pie chart of expenses |

---

## Lab Tasks

1. Create marks sheet: 10 students, 3 subjects — Total, Average, % (formulas)
2. Add **Pass/Fail** column with `=IF(total>=120,"Pass","Fail")` or per-subject IF
3. Use COUNTIF to count passes (>=40) in each subject
4. Sort by total descending; filter students with total > 200
5. Conditional format: fail marks red, distinction (>75) green
6. Column chart of totals; pie chart of pass/fail count
7. Set print area and repeat header row; print preview
8. Use **absolute reference:** tax rate in $B$1 applied to all amount rows
9. Repeat tasks 1–4 in **LibreOffice Calc** — save as `.ods` and export PDF

---

## Summary Checklist

- [ ] I can work in Excel and Calc with same formulas
- [ ] I write SUM, AVERAGE, IF, COUNTIF correctly
- [ ] I use relative and absolute references (F4)
- [ ] I sort, filter, and apply conditional formatting
- [ ] I create column and pie charts
- [ ] I set print titles and print area
- [ ] I know spreadsheet ≠ database (no Access focus in this module)

---

## Quick MCQs (10 Questions)

**1.** Cell at column D row 10 is:
- a) 10D  
- b) D10  
- c) D:10  
- d) 4J  

**2.** Every formula in Excel/Calc must begin with:
- a) +  
- b) =  
- c) #  
- d) @  

**3.** To keep cell B1 fixed when copying a formula down, use:
- a) B1  
- b) $B$1  
- c) B$1 only in Excel Mac  
- d) #B1  

**4.** Function to count only numeric cells in a range:
- a) COUNTA  
- b) COUNT  
- c) SUM  
- d) LEN  

**5.** LibreOffice Calc default file extension:
- a) .xlsx  
- b) .ods  
- c) .odt  
- d) .mdb  

**6.** `=IF(C2>=40,"Pass","Fail")` returns "Fail" when:
- a) C2 is 50  
- b) C2 is 40  
- c) C2 is 35  
- d) C2 is text "Pass"  

**7.** Best chart to show marks of 5 subjects for one class:
- a) Pie chart of one student  
- b) Column/Bar chart  
- c) Scatter with no labels  
- d) Only line chart for categories  

**8.** Conditional formatting is used to:
- a) Change hardware  
- b) Automatically format cells based on rules  
- c) Install fonts  
- d) Merge sheets  

**9.** Shortcut to open Format Cells dialog:
- a) Ctrl+1  
- b) Ctrl+F  
- c) Alt+Tab  
- d) F5  

**10.** A workbook contains:
- a) Only one cell  
- b) One or more worksheets  
- c) Only charts  
- d) Only macros  

---

### MCQ Answers
1-b | 2-b | 3-b | 4-b | 5-b | 6-c | 7-b | 8-b | 9-a | 10-b
