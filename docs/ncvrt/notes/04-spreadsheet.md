# Module 4: Spreadsheet with MS Excel (12 Hours)

**Course:** CCC 90-Hour DCA | **Module duration:** 12 hours  
**Primary software:** Microsoft Excel  
**Alternative reference:** LibreOffice Calc as an open-source equivalent

---

## Learning Objectives

After completing this module, you will be able to:

- Explain what a spreadsheet is and why MS Excel is used in offices, schools, banks, and businesses.
- Navigate workbook, worksheet, rows, columns, cells, ranges, formula bar, name box, and sheet tabs.
- Enter and format text, numbers, currency, dates, time, percentage, and custom formats.
- Write formulas and use functions such as SUM, AVERAGE, MIN, MAX, COUNT, COUNTA, ROUND, IF, COUNTIF, SUMIF, TODAY, CONCAT, AND, and OR.
- Apply relative, absolute, and mixed cell references using F4.
- Identify and fix common formula errors such as #DIV/0!, #VALUE!, #NAME?, and #REF!.
- Sort and filter data for reports and analysis.
- Apply conditional formatting for fail marks, high performers, low stock, and overdue payments.
- Create and customize column, bar, line, pie, area, and scatter charts.
- Design professional spreadsheets with headers, borders, freeze panes, data validation, and cell protection.
- Prepare marksheets, attendance registers, salary sheets, fee reports, inventory sheets, and expense trackers.
- Build simple Excel dashboards using totals, charts, and KPI-style summaries.
- Set print area, print titles, page setup, scaling, and PDF export.
- Use essential MS Excel keyboard shortcuts for faster office work.
- Connect Excel skills with careers such as data entry operator, MIS executive, accountant, HR executive, and business analyst.

**Note:** This module focuses on spreadsheet skills. Database tools such as MS Access or LibreOffice Base are not covered here.

---

## 1. Introduction to Spreadsheets

### What It Is

A **spreadsheet** is application software used to organize data in rows and columns, perform calculations, analyze information, create charts, and prepare reports. **Microsoft Excel** is the most widely used spreadsheet program in offices, schools, colleges, banks, shops, hospitals, and government departments.

### Why It Is Used

Excel saves time, reduces manual calculation errors, and helps users make quick decisions. Instead of calculating totals on paper, Excel can instantly sum hundreds of rows, find averages, apply conditions, sort data, and create visual charts.

### Where It Is Used

- Schools and colleges: marksheets, attendance, fee records.
- Banks: transaction summaries, loan calculations, reports.
- Offices: salary sheets, expense tracking, inventory lists.
- Shops: billing summaries, stock tracking, sales reports.
- Government: data collection, monitoring, and reporting.
- Freelancing: data entry, MIS reports, client spreadsheets.

### MS Excel Method

1. Click **Start**.
2. Search **Excel**.
3. Open **Microsoft Excel**.
4. Click **Blank workbook**.
5. Press **Ctrl + S** and save as `my-first-workbook.xlsx`.

### Calc Equivalent

LibreOffice Calc is an open-source spreadsheet. It uses similar formulas and saves in `.ods` format. Most Excel formulas work in Calc, but menus and some advanced features differ.

### Real-World Example

A school clerk uses Excel to enter marks of 40 students, calculate totals and percentages, identify pass/fail students, and print a marksheet for the principal.

### Practice Exercise

Create a blank Excel workbook, type your name in cell A1, save the file, close Excel, reopen it, and verify the data.

---

## 2. Spreadsheet Fundamentals

Understanding Excel terminology is essential for practical work and exams.

### Workbook

#### What It Is

A **workbook** is the entire Excel file you create, open, save, and share.

#### Why It Is Used

It holds one or more worksheets together in one file.

#### Real-World Example

`Class10_Marksheet_2026.xlsx` is one workbook containing sheets for different subjects or terms.

### Worksheet

#### What It Is

A **worksheet** (or sheet) is a single tab inside a workbook where data is entered in rows and columns.

#### Why It Is Used

Different sheets can store different data such as January sales, February sales, or subject-wise marks.

#### MS Excel Method

- View sheet tabs at the bottom: Sheet1, Sheet2, Sheet3.
- Add sheet: click **+** or press **Shift + F11**.
- Rename sheet: double-click tab name.

### Row

#### What It Is

A **row** is a horizontal line of cells numbered 1, 2, 3, 4…

#### Use

Each student, employee, or product is often entered in one row.

### Column

#### What It Is

A **column** is a vertical line of cells labeled A, B, C… Z, AA, AB…

#### Use

Each field such as Name, Roll No, Marks, Salary is usually placed in one column.

### Cell

#### What It Is

A **cell** is the intersection of one row and one column.

#### Example

Cell **D10** is where column D and row 10 meet.

### Range

#### What It Is

A **range** is a group of selected cells forming a rectangle.

#### Examples

- `A1:C10` — from A1 to C10.
- `B2:B20` — column B from row 2 to 20.

### Active Cell

#### What It Is

The **active cell** is the currently selected cell with a dark border.

#### Why It Matters

Formulas and formatting apply to the active cell or selected range.

### Cell Address

#### What It Is

A **cell address** identifies a cell using column letter + row number.

#### Examples

- `A1`
- `C15`
- `F100`

### Formula Bar

#### What It Is

The **formula bar** appears below the ribbon and shows the content of the active cell, including formulas.

#### Why It Is Used

It helps view and edit long formulas easily.

### Name Box

#### What It Is

The **name box** shows the address of the active cell and can be used to jump to a cell quickly.

#### Example

Type `D15` in the name box and press Enter to go to that cell.

### Sheet Tabs

#### What It Is

**Sheet tabs** appear at the bottom and let you switch between worksheets in the same workbook.

### Status Bar

#### What It Is

The **status bar** at the bottom shows information such as Average, Count, and Sum of selected cells.

### Visual Layout Diagram

```text
+----------------------------------------------------------+
| Title Bar | Quick Access Toolbar | Ribbon Tabs           |
+----------------------------------------------------------+
| Name Box [A1] | Formula Bar [=SUM(B2:B10)]                |
+----------------------------------------------------------+
|      |  A   |  B   |  C   |  D   |                       |
|------+------+------+------+------|                       |
|  1   | Name | Roll | Math | Total|  <- Row 1              |
|  2   | Rina | 101  |  85  |      |                       |
|  3   | Amit | 102  |  72  |      |                       |
+----------------------------------------------------------+
| Sheet1 | Sheet2 | Sheet3 | +                              |
| Status Bar: Average | Count | Sum                         |
+----------------------------------------------------------+
```

### Fill Handle

#### What It Is

The **fill handle** is a small square at the bottom-right corner of the active cell.

#### MS Excel Method

1. Enter `1` in A1 and `2` in A2.
2. Select A1:A2.
3. Drag the fill handle down to extend the series.

#### Use Cases

- Copy formulas.
- Extend number series.
- Extend month names.

### Practice Exercise

Label a diagram with workbook, worksheet, row, column, cell, range, formula bar, name box, and sheet tabs.

---

## 3. Data Entry and Formatting

### Text Data

#### What It Is

Text data includes names, roll numbers stored as text, cities, and descriptions.

#### Why It Is Used

Text identifies records and labels columns.

#### MS Excel Method

1. Click a cell.
2. Type text such as `Rasmita Sahu`.
3. Press Enter.

#### Real-World Example

Student names, employee IDs, department names.

### Numeric Data

#### What It Is

Numeric data includes marks, quantities, amounts, and scores.

#### MS Excel Method

Enter numbers directly. Excel aligns numbers to the right by default.

#### Real-World Example

Marks: 85, Salary: 25000, Quantity: 120.

### Currency

#### What It Is

Currency format displays amounts with currency symbol.

#### MS Excel Method

1. Select cells.
2. Home -> Number -> Currency or Accounting.
3. Or press **Ctrl + 1** -> Currency.

#### Real-World Example

`₹ 25,000` salary, `₹ 1,250` fee, `₹ 45,000` sales.

### Dates

#### What It Is

Date values represent calendar dates.

#### MS Excel Method

1. Enter date such as `15-08-2026`.
2. Home -> Number -> Short Date.
3. Or Format Cells -> Date.

#### Real-World Example

Joining date, fee due date, exam date.

### Time

#### What It Is

Time values represent clock time.

#### Real-World Example

Attendance in-time, shift start time.

### Percentage

#### What It Is

Percentage shows part of a whole out of 100.

#### MS Excel Method

1. Enter decimal or fraction.
2. Home -> Number -> Percentage.
3. Or use formula: `=B2/C2*100`.

#### Real-World Example

`85%` attendance, `72%` marks, `15%` discount.

### Scientific Numbers

#### What It Is

Scientific format displays very large or very small numbers in compact form.

#### Use

Advanced science and engineering data.

### Custom Formats

#### What It Is

Custom formats let users control how values appear without changing actual values.

#### MS Excel Method

1. Select cells.
2. Press **Ctrl + 1**.
3. Choose **Custom**.
4. Apply format code if required.

### Format Cells Dialog (Ctrl + 1)

| Tab | Use |
|---|---|
| Number | General, Number, Currency, Date, Percentage |
| Alignment | Horizontal, vertical, wrap text, merge |
| Font | Font style, size, bold, color |
| Border | Table borders |
| Fill | Background color |
| Protection | Lock/hide cells |

### Common Formatting Tools

| Tool | Use |
|---|---|
| Bold | Headings |
| Borders | Tables |
| Merge & Center | Titles |
| Wrap Text | Long text in one cell |
| Increase/Decrease Decimal | Money and percentages |

### MS Excel Method — Professional Table Formatting

1. Enter headings in row 1.
2. Apply bold to headings.
3. Add borders.
4. Apply currency or number format.
5. Freeze top row if needed.

### Calc Equivalent

Calc uses Format -> Cells or Ctrl + 1 with similar tabs and options.

### Practice Exercise

Create a table with columns: Name, Salary (₹), Joining Date, Attendance %. Format each column correctly.

---

## 4. Essential MS Excel Shortcuts

### Workbook Management

| Shortcut | Use |
|---|---|
| Ctrl + N | New workbook |
| Ctrl + O | Open workbook |
| Ctrl + S | Save workbook |
| F12 | Save As |
| Ctrl + P | Print / Print Preview |
| Ctrl + W | Close workbook |

### Navigation

| Shortcut | Use |
|---|---|
| Ctrl + Arrow Keys | Jump to edge of data region |
| Ctrl + Home | Go to cell A1 |
| Ctrl + End | Go to last used cell |
| Page Up | Move up one screen |
| Page Down | Move down one screen |
| Arrow Keys | Move one cell |
| Tab | Move right |
| Enter | Move down |

### Editing

| Shortcut | Use |
|---|---|
| F2 | Edit active cell |
| Delete | Clear cell content |
| Ctrl + Z | Undo |
| Ctrl + Y | Redo |
| Ctrl + C | Copy |
| Ctrl + X | Cut |
| Ctrl + V | Paste |

### Selection

| Shortcut | Use |
|---|---|
| Ctrl + A | Select all |
| Shift + Arrow Keys | Extend selection |
| Ctrl + Shift + Arrow Keys | Select to edge of data |

### Formatting

| Shortcut | Use |
|---|---|
| Ctrl + 1 | Format Cells dialog |
| Ctrl + B | Bold |
| Ctrl + I | Italic |
| Ctrl + U | Underline |

### Formula Shortcuts

| Shortcut | Use |
|---|---|
| Alt + = | AutoSum |
| F4 | Toggle absolute/relative reference |
| Ctrl + ` | Show formulas in worksheet |
| Ctrl + Shift + U | Expand formula bar in some versions |

### Shortcut Drills

#### Drill 1

Create a workbook using Ctrl + N, enter data, save with Ctrl + S, and open Format Cells with Ctrl + 1.

#### Drill 2

Enter numbers in A1:A5 and use Alt + = in A6 to calculate total.

#### Drill 3

Write a formula with B1 reference, press F4 repeatedly to see `$B$1`, `B$1`, `$B1`, and B1.

#### Drill 4

Press Ctrl + ` to show formulas, then press again to hide them.

---

## 5. Formulas and Functions — Deep Dive

Every Excel formula begins with **`=`**.

### SUM Function

#### What It Is

Adds values together.

#### Why It Is Used

To calculate totals quickly.

#### Excel Syntax

`=SUM(A1:A10)`

#### Arguments

Range of numbers or cell references.

#### Real Example

`=SUM(B2:D2)` adds three subject marks for one student.

#### Common Errors

- Forgetting `=`.
- Selecting wrong range.
- Including text cells accidentally.

#### Practice

Create a marksheet and calculate total marks for 10 students.

### AVERAGE Function

#### Purpose

Finds mean value.

#### Syntax

`=AVERAGE(B2:B20)`

#### Real Example

Average marks of a class.

#### Practice

Calculate average marks for each subject.

### MIN Function

#### Purpose

Finds smallest value.

#### Syntax

`=MIN(B2:B20)`

#### Real Example

Lowest mark in a subject.

### MAX Function

#### Purpose

Finds highest value.

#### Syntax

`=MAX(B2:B20)`

#### Real Example

Highest sales amount in a month.

### COUNT Function

#### Purpose

Counts cells containing numbers only.

#### Syntax

`=COUNT(B2:B20)`

#### Real Example

Count how many numeric marks are entered.

### COUNTA Function

#### Purpose

Counts non-empty cells.

#### Syntax

`=COUNTA(A2:A20)`

#### Real Example

Count how many students have names entered.

### ROUND Function

#### Purpose

Rounds a number to specified decimal places.

#### Syntax

`=ROUND(A2,2)`

#### Real Example

Round percentage to 2 decimal places.

### IF Function

#### Purpose

Returns one value if condition is true, another if false.

#### Syntax

`=IF(logical_test, value_if_true, value_if_false)`

#### Real Example

`=IF(C2>=40,"Pass","Fail")`

#### Nested IF Example

`=IF(B2>=60,"First",IF(B2>=45,"Second","Fail"))`

#### Practice

Add Pass/Fail and Grade columns to a marksheet.

### COUNTIF Function

#### Purpose

Counts cells that meet a condition.

#### Syntax

`=COUNTIF(range, criteria)`

#### Real Example

`=COUNTIF(B2:B20,">=40")` counts passes.

#### Practice

Count number of students with attendance above 75%.

### SUMIF Function

#### Purpose

Sums values that meet a condition.

#### Syntax

`=SUMIF(range, criteria, sum_range)`

#### Real Example

`=SUMIF(A2:A20,"Delhi",B2:B20)` sums sales for Delhi only.

### TODAY Function

#### Purpose

Returns current date.

#### Syntax

`=TODAY()`

#### Real Example

Attendance sheet date, invoice date.

### CONCAT Function

#### Purpose

Joins text from multiple cells.

#### Syntax

`=CONCAT(A2," ",B2)` or `=A2&" "&B2`

#### Real Example

Combine first name and last name.

### AND Function

#### Purpose

Returns TRUE only if all conditions are true.

#### Syntax

`=AND(C2>=40,D2>=40,E2>=40)`

#### Real Example

Check pass in all three subjects.

### OR Function

#### Purpose

Returns TRUE if any condition is true.

#### Syntax

`=OR(C2>=40,D2>=40,E2>=40)`

#### Real Example

Pass if student passes in at least one subject under special rule.

### Important Formula Summary Table

| Function | Syntax | Use |
|---|---|---|
| SUM | `=SUM(B2:B10)` | Total |
| AVERAGE | `=AVERAGE(B2:B10)` | Mean |
| MIN | `=MIN(B2:B10)` | Lowest |
| MAX | `=MAX(B2:B10)` | Highest |
| COUNT | `=COUNT(B2:B10)` | Count numbers |
| COUNTA | `=COUNTA(A2:A10)` | Count non-empty |
| ROUND | `=ROUND(A2,2)` | Round decimals |
| IF | `=IF(C2>=40,"Pass","Fail")` | Condition |
| COUNTIF | `=COUNTIF(B2:B20,">=40")` | Conditional count |
| SUMIF | `=SUMIF(A:A,"A",B:B)` | Conditional sum |
| TODAY | `=TODAY()` | Current date |
| CONCAT | `=A2&" "&B2` | Join text |
| AND | `=AND(C2>=40,D2>=40)` | All true |
| OR | `=OR(C2>=40,D2>=40)` | Any true |

---

## 6. Formula Troubleshooting

Excel shows error messages when a formula cannot be calculated correctly.

### #DIV/0!

#### Why It Occurs

Division by zero.

#### Example

`=A1/B1` when B1 is 0.

#### Fix

Check denominator; use IF to avoid divide-by-zero:

`=IF(B1=0,"NA",A1/B1)`

### #VALUE!

#### Why It Occurs

Wrong data type used in calculation.

#### Example

Adding text to numbers incorrectly.

#### Fix

Check cell values; convert text numbers to numeric format.

### #NAME?

#### Why It Occurs

Excel does not recognize function or range name.

#### Example

`=SUMA1:A10)` or misspelled function.

#### Fix

Check spelling; ensure function name is valid.

### #REF!

#### Why It Occurs

Invalid cell reference, often after deleting rows/columns.

#### Fix

Correct formula references.

### #####

#### Why It Occurs

Column is too narrow to display value.

#### Fix

Widen column or reduce decimal places.

### Best Practices

- Always start formulas with `=`.
- Check cell references carefully.
- Use parentheses properly in IF.
- Preview formulas with Ctrl + `.
- Do not type commas in Indian number style inside formulas unless formatted properly.

---

## 7. Relative, Absolute, and Mixed References

### Relative Reference

#### What It Is

A reference that changes when copied to another cell.

#### Example

`=B2*C2` copied down becomes `=B3*C3`, `=B4*C4`.

#### Use

Row-wise calculations such as marks × weight for each student.

### Absolute Reference

#### What It Is

A reference that remains fixed when copied.

#### Example

`=$B$1`

#### MS Excel Method

Type reference and press **F4** until `$` signs appear on both column and row.

#### Real Office Example

- GST rate in B1 applied to all amounts.
- Tax rate in one cell.
- Discount rate in one cell.
- Salary calculation using fixed allowance in one cell.

### Mixed Reference

#### What It Is

Only part of reference is fixed.

#### Examples

- `=$B1` — column fixed, row changes.
- `=B$1` — row fixed, column changes.

### Visual Example

If tax rate is in cell **F1**:

```text
Amount in C2: =B2*$F$1
Copy down: C3 = B3*$F$1
Copy right: D2 = B2*$F$1
```

### Practice Exercise

Place GST rate `18%` in F1. Calculate GST for 10 invoice amounts using absolute reference.

### Calc Equivalent

F4 works similarly in Calc for toggling absolute references.

---

## 8. Professional Spreadsheet Design

### Titles

Use clear workbook and sheet titles such as `Student Marksheet March 2026`.

### Headers

Row 1 should contain bold column headings: Name, Roll No, Marks, Total, Grade.

### Borders

Use borders to separate table data from other content.

### Colors

Use light colors for headers; avoid too many bright colors in official reports.

### Alignment

- Text: left.
- Numbers: right or center.
- Headings: center.

### Freeze Panes

#### Purpose

Keeps headings visible while scrolling.

#### MS Excel Method

View -> Freeze Panes -> Freeze Top Row.

### Wrap Text

Home -> Wrap Text for long headings or addresses.

### Merge and Center

Use for report title only; avoid merging data cells unnecessarily.

### Data Validation

#### Purpose

Restricts data entry to valid values.

#### MS Excel Method

Data -> Data Validation -> List / Whole Number / Date.

#### Example

Allow only Pass/Fail in a column.

### Cell Protection

Protect sheet structure after formatting so users edit only input cells.

### Best Practices

- One row = one record.
- One column = one field.
- No blank rows inside table.
- Use consistent formats.
- Keep formulas in separate columns from raw data when possible.

---

## 9. Sorting and Filtering

### Single Column Sort

#### MS Excel Method

1. Select data including headers.
2. Data -> Sort.
3. Choose column and A to Z or Z to A.

### Multi-Level Sort

Sort by Class first, then by Total marks descending.

### Text, Number, and Date Sorting

Excel sorts according to data type automatically if data is entered correctly.

### Custom Sort

Used for non-alphabetical order such as S, A, B, C grade sequence.

### Filters

#### MS Excel Method

1. Select data.
2. Data -> Filter.
3. Click dropdown arrow in header.
4. Choose values to display.

### Search Filters

Use filter search box to find names quickly.

### Advanced Filter Concepts

Used for complex criteria such as marks > 40 and attendance > 75%.

### Real Office Scenarios

- Sort employees by salary descending.
- Filter students who failed in Maths.
- Filter fee records due this month.
- Sort inventory by quantity low to high.

### Practice Exercise

Sort 10 students by total marks descending and filter students with total > 200.

---

## 10. Conditional Formatting — Deep Dive

Conditional formatting automatically changes cell appearance based on rules.

### Highlight Cell Rules

#### MS Excel Method

Home -> Conditional Formatting -> Highlight Cell Rules.

#### Examples

- Greater than 75 -> green.
- Less than 40 -> red.
- Between 40 and 75 -> yellow.

### Top/Bottom Rules

Highlight top 10 marks or bottom 10 performers.

### Data Bars

Visual bars inside cells showing relative values.

### Color Scales

Heat-map style coloring from low to high values.

### Icon Sets

Traffic lights, arrows, stars for quick visual analysis.

### Real Examples

| Scenario | Rule |
|---|---|
| Fail students | Marks < 40 -> red fill |
| High performers | Marks > 75 -> green fill |
| Low inventory | Quantity < 10 -> red text |
| Overdue payments | Due date passed -> orange fill |

### Practice Exercise

Apply conditional formatting to marks column: fail red, distinction green.

### Calc Equivalent

Format -> Conditional in Calc provides similar rule-based formatting.

---

## 11. Charts and Graphs

### Why Charts Matter

Charts turn numbers into visuals so managers, teachers, and decision-makers can understand trends quickly.

### Choosing the Right Chart

| Chart | Best For | Limitation |
|---|---|---|
| Column | Compare categories | Too many categories look crowded |
| Bar | Long category names | Less common for time trends |
| Line | Trends over time | Not ideal for parts of whole |
| Pie | Parts of a whole | Too many slices become unclear |
| Area | Volume over time | Can look cluttered |
| Scatter | Relationship between two variables | Needs numeric pairs on both axes |

### Column Chart

#### Purpose

Compare marks, sales, or expenses across categories.

#### MS Excel Method

1. Select data with labels.
2. Insert -> Column Chart.
3. Add chart title and axis labels.

### Bar Chart

Similar to column chart but horizontal.

### Line Chart

Used for monthly sales, attendance trend, or growth over time.

### Pie Chart

Used for pass/fail proportion or expense category share.

### Area Chart

Shows cumulative or volume trends.

### Scatter Chart (Introduction)

Shows relationship between two numeric variables such as study hours vs marks.

### Practice Exercise

Create a column chart of subject-wise marks and a pie chart of pass/fail count.

---

## 12. Business and Office Applications

### Student Marksheet

Columns: Name, Roll No, Subject marks, Total, Average, %, Grade, Pass/Fail.

### Attendance Register

Columns: Name, Total Days, Present, Absent, Attendance %.

### Salary Sheet

Columns: Employee Name, Basic, HRA, Deductions, Net Salary.

### Fee Management

Columns: Student, Fee Amount, Paid, Due, Date, Receipt No.

### Inventory Tracking

Columns: Item, Opening Stock, Purchased, Sold, Closing Stock.

### Sales Reporting

Columns: Date, Product, Quantity, Rate, Amount, Total Sales.

### Expense Tracking

Columns: Date, Category, Description, Amount.

### Budget Planning

Columns: Category, Planned Amount, Actual Amount, Difference.

### GST Calculations

Use absolute reference for GST rate and formulas for taxable value and tax amount.

### Employee Records

Columns: ID, Name, Department, Joining Date, Salary, Contact.

---

## 13. Mini Dashboard Introduction

A simple dashboard summarizes key information on one sheet.

### Beginner Dashboard Components

- Total sales.
- Total expenses.
- Net profit.
- Pass count / fail count.
- Attendance percentage.
- Charts for trends.
- Conditional formatting for alerts.

### Simple Example

Create a sheet with:

- Cell B2: Total Sales `=SUM(C2:C20)`
- Cell B3: Total Expenses `=SUM(D2:D20)`
- Cell B4: Profit `=B2-B3`
- Pie chart of expense categories.
- Red highlight for low stock items.

### Practice Mini Project

Build a school performance dashboard showing total students, pass count, fail count, average marks, and one chart.

---

## 14. Data Analysis Basics

Businesses rely on Excel because it supports quick analysis without advanced software.

### Totals

Use SUM for revenue, expenses, marks, stock.

### Averages

Use AVERAGE for class performance, monthly sales, attendance.

### Trends

Use line charts and month-wise data.

### Comparisons

Compare subject marks, branch sales, or employee performance.

### Summaries

Use pivot-style thinking even in beginner sheets: totals by category, count by status.

### Decision Making

Managers use Excel to decide reorder levels, identify weak students, and monitor budgets.

---

## 15. Print and Reporting

### Print Area

#### MS Excel Method

Select range -> Page Layout -> Print Area -> Set Print Area.

### Print Titles

Repeat header row on every printed page: Page Layout -> Print Titles -> Rows to repeat at top.

### Page Setup

Set margins, orientation, and paper size.

### Headers and Footers

Insert page number, date, file name, and institute name.

### Orientation

Portrait for tall lists; Landscape for wide tables.

### Scaling

Fit sheet on one page when needed.

### PDF Export

File -> Save As -> PDF.

### Print Preview

Ctrl + P before final printing.

### Professional Reporting Standards

- Include title and date.
- Use clear headers.
- Align numbers properly.
- Print preview before printing.
- Export PDF for submission.

---

## 16. Multiple Sheets and 3D Formulas

### Add, Rename, Delete Sheets

- Add: click **+** or Shift + F11.
- Rename: double-click tab.
- Delete: right-click tab -> Delete.

### Link Between Sheets

Reference another sheet: `=Sheet2!A1`

### 3D Formula

Sum same cell across sheets:

`=SUM(Jan:Mar!B2)`

### Use Case

Quarterly sales totals across Jan, Feb, Mar sheets.

---

## 17. Industry Applications

### Education

Mark sheets, attendance, fee records, exam analysis.

### Banking

Transaction summaries, loan EMI sheets, branch reports.

### Healthcare

Patient count summaries, medicine stock, billing summaries.

### Government Offices

Monitoring data, beneficiary lists, scheme reports.

### Retail

Sales, stock, billing summaries, GST reports.

### Manufacturing

Production quantity, raw material inventory, quality records.

### Logistics

Delivery records, vehicle usage, shipment tracking.

### Human Resources

Employee records, attendance, salary, leave summaries.

### Finance

Budgets, expenses, profit/loss summaries.

### Data Analytics

Basic cleaning, sorting, filtering, charting, and summary reporting.

---

## 18. Career Awareness

Excel is one of the most demanded workplace skills.

| Career | How Excel Helps |
|---|---|
| Data Entry Operator | Fast data entry, formatting, saving, printing |
| Office Assistant | Reports, lists, letters with data tables |
| MIS Executive | Management Information System reports |
| Accountant | Ledgers, totals, balances, GST calculations |
| HR Executive | Attendance, salary, employee records |
| Banking Staff | Transaction summaries and customer reports |
| Business Analyst | Comparison, trends, summaries |
| Data Analyst | Basic analysis, charts, dashboards |
| Operations Executive | Inventory, logistics, performance tracking |

---

## 19. Real Office Scenarios

### Scenario 1: Prepare a Student Marksheet

Enter 10 students, 3 subjects, calculate Total, Average, %, Grade, Pass/Fail, sort by total, and create chart.

### Scenario 2: Generate Monthly Salary Calculations

Use Basic, Allowance, Deduction, Net Salary formulas with absolute reference for fixed allowance rate.

### Scenario 3: Create a Fee Collection Report

Track Paid, Due, Date, and Receipt No. Use SUM and conditional formatting for due amounts.

### Scenario 4: Track Inventory Levels

Use quantity columns and highlight low stock with conditional formatting.

### Scenario 5: Analyze Monthly Expenses

Categorize expenses, calculate totals, and create pie chart of spending.

---

## 20. Practical Lab Work

### Lab 1: Excel Basics

- **Guided Exercise:** Create workbook and identify interface parts.
- **Independent Exercise:** Enter 5 rows of student data.
- **Classroom Activity:** Label workbook, worksheet, cell, range.
- **Home Assignment:** Create attendance sheet for one week.
- **Mini Project:** Personal contact list with formatting.

### Lab 2: Formulas and Functions

- **Guided Exercise:** Use SUM and AVERAGE.
- **Independent Exercise:** Add MIN, MAX, COUNT, COUNTA.
- **Classroom Activity:** Fix deliberate formula errors.
- **Home Assignment:** Create marksheet with IF grade.
- **Mini Project:** School Marksheet System for 10 students.

### Lab 3: References and GST

- **Guided Exercise:** Use `$F$1` for tax rate.
- **Independent Exercise:** Calculate GST for 10 invoices.
- **Classroom Activity:** Demonstrate F4 reference toggling.
- **Home Assignment:** Salary sheet with fixed allowance cell.
- **Mini Project:** Employee Salary Register.

### Lab 4: Sort, Filter, Conditional Formatting

- **Guided Exercise:** Sort by marks descending.
- **Independent Exercise:** Filter pass students only.
- **Classroom Activity:** Apply red/green conditional formatting.
- **Home Assignment:** Inventory sheet with low-stock highlight.
- **Mini Project:** Inventory Management Sheet.

### Lab 5: Charts and Dashboard

- **Guided Exercise:** Create column chart.
- **Independent Exercise:** Create pie chart.
- **Classroom Activity:** Compare chart types.
- **Home Assignment:** Monthly expense pie chart.
- **Mini Project:** Sales Dashboard with totals and one chart.

### Lab 6: Print and PDF

- **Guided Exercise:** Set print area.
- **Independent Exercise:** Repeat header row.
- **Classroom Activity:** Compare portrait vs landscape.
- **Home Assignment:** Export marksheet as PDF.
- **Mini Project:** Final formatted report ready for submission.

### Major Mini Projects

1. **School Marksheet System**
2. **Personal Monthly Budget**
3. **Inventory Management Sheet**
4. **Employee Salary Register**
5. **Sales Dashboard**

---

## 21. Interview and Viva Questions

### Basic Excel Questions

1. What is MS Excel?
2. What is a workbook?
3. What is a worksheet?
4. What is a cell?
5. What is a range?

**Model Answer Example:** MS Excel is spreadsheet software used to store data in rows and columns, perform calculations, analyze information, and create charts.

### Formula-Based Questions

1. What is the syntax of SUM?
2. What is the difference between COUNT and COUNTA?
3. What does IF function do?
4. What is absolute reference?
5. What is the use of F4?

### Practical Questions

1. How do you calculate total marks in Excel?
2. How do you apply currency format?
3. How do you create a chart?
4. How do you filter data?
5. How do you fix #DIV/0! error?

### Scenario Questions

1. How will you prepare a class marksheet?
2. How will you highlight fail students?
3. How will you calculate GST for multiple items?
4. How will you print only selected data?
5. How will you create a monthly expense summary?

### Job Interview Questions

1. Why is Excel important in office work?
2. Which Excel functions do you know?
3. Have you prepared any report using Excel?
4. What is conditional formatting?
5. What is the difference between formula and function?

---

## 22. Quick Revision Sheet

### Most Important Formulas

`=SUM()`, `=AVERAGE()`, `=MIN()`, `=MAX()`, `=COUNT()`, `=COUNTA()`, `=ROUND()`, `=IF()`, `=COUNTIF()`, `=SUMIF()`, `=TODAY()`

### Most Important Shortcuts

Ctrl + N, Ctrl + O, Ctrl + S, Ctrl + P, Ctrl + 1, Ctrl + B, Alt + =, F4, F2, Ctrl + `, Ctrl + Z, Ctrl + Y

### Common Formula Errors

#DIV/0!, #VALUE!, #NAME?, #REF!, #####

### Important Exam Facts

- Cell address = column letter + row number.
- Every formula starts with `=`.
- `$B$1` is absolute reference.
- F4 toggles reference type.
- COUNT counts numbers only.
- COUNTA counts non-empty cells.
- IF checks condition.
- Ctrl + 1 opens Format Cells.
- Workbook contains worksheets.
- `.xlsx` is Excel file extension.

### Frequently Asked Questions

**Q: What is the difference between workbook and worksheet?**  
A: Workbook is the file; worksheet is one tab inside it.

**Q: What is AutoSum?**  
A: Quick tool to insert SUM formula, shortcut Alt + =.

**Q: Why use charts?**  
A: To visualize data and understand trends quickly.

---

## 23. Assessment Enhancement

### A. Multiple Choice Questions (30)

**1.** MS Excel is mainly used for:
- a) Spreadsheet work
- b) Video editing
- c) Hardware repair
- d) Virus removal

**2.** A workbook contains:
- a) One or more worksheets
- b) Only one cell
- c) Only charts
- d) Only macros

**3.** Cell at column D row 10 is:
- a) 10D
- b) D10
- c) D:10
- d) 10-D

**4.** Every Excel formula must begin with:
- a) +
- b) =
- c) #
- d) @

**5.** Shortcut for Save is:
- a) Ctrl + S
- b) Ctrl + P
- c) Ctrl + N
- d) Ctrl + F

**6.** Shortcut for Format Cells is:
- a) Ctrl + 1
- b) Ctrl + 2
- c) Ctrl + F
- d) F7

**7.** AutoSum shortcut is:
- a) Alt + =
- b) Ctrl + =
- c) Shift + =
- d) F4

**8.** Absolute reference example is:
- a) B1
- b) $B$1
- c) B:1
- d) #B1

**9.** Function to add values:
- a) SUM
- b) TEXT
- c) PRINT
- d) SAVE

**10.** Function to find average:
- a) AVERAGE
- b) TOTAL
- c) MEANONLY
- d) ADDAVG

**11.** COUNT function counts:
- a) Numeric cells only
- b) All non-empty cells
- c) Text only
- d) Charts only

**12.** COUNTA function counts:
- a) Non-empty cells
- b) Blank cells only
- c) Formulas only
- d) Charts only

**13.** IF function is used for:
- a) Conditional result
- b) Printing
- c) Saving
- d) Chart design only

**14.** `=IF(C2>=40,"Pass","Fail")` returns Fail when:
- a) C2 is 50
- b) C2 is 40
- c) C2 is 35
- d) C2 is blank always

**15.** COUNTIF is used to:
- a) Count cells meeting a condition
- b) Add all cells
- c) Delete duplicates automatically
- d) Print worksheet

**16.** SUMIF is used to:
- a) Sum values meeting a condition
- b) Sort data
- c) Merge cells
- d) Create chart only

**17.** TODAY function returns:
- a) Current date
- b) Current time only
- c) Total marks
- d) Cell color

**18.** Best chart to compare subject marks:
- a) Column chart
- b) Pie chart of one mark only
- c) Scatter with no data
- d) No chart needed

**19.** Pie chart is best for:
- a) Parts of a whole
- b) Daily time trend only
- c) Large text data
- d) Page setup

**20.** Conditional formatting:
- a) Formats cells based on rules
- b) Installs printer
- c) Deletes rows
- d) Creates workbook

**21.** Filter is used to:
- a) Show only selected records
- b) Change CPU speed
- c) Save file as PDF automatically
- d) Rename sheet only

**22.** Sort is used to:
- a) Arrange data in order
- b) Add numbers automatically
- c) Remove all formulas
- d) Insert chart only

**23.** Print Area is used to:
- a) Print selected range only
- b) Delete data
- c) Change font
- d) Insert row

**24.** Error caused by division by zero:
- a) #DIV/0!
- b) #NAME?
- c) #REF!
- d) #NULL!

**25.** Error caused by invalid function name:
- a) #NAME?
- b) #DIV/0!
- c) #VALUE!
- d) ##### always

**26.** F4 key is used to:
- a) Toggle absolute reference
- b) Open print dialog
- c) Save workbook
- d) Insert chart

**27.** Formula bar shows:
- a) Active cell content or formula
- b) Printer name
- c) Sheet tab color
- d) Windows version

**28.** Freeze Panes helps to:
- a) Keep headings visible while scrolling
- b) Delete columns
- c) Save file
- d) Add chart title

**29.** Default Excel workbook extension is:
- a) .xlsx
- b) .ods
- c) .docx
- d) .pptx

**30.** LibreOffice Calc is:
- a) Open-source spreadsheet alternative
- b) Word processor
- c) Database only
- d) Antivirus

### B. True/False (20)

1. MS Excel is spreadsheet software.
2. A worksheet is the same as a workbook.
3. Cell D10 means column D and row 10.
4. Every formula must start with =.
5. Ctrl + S saves the workbook.
6. Ctrl + 1 opens Format Cells.
7. SUM adds values together.
8. COUNT counts all non-empty cells.
9. COUNTA counts non-empty cells.
10. $B$1 is an absolute reference.
11. F4 toggles reference types.
12. IF function checks a condition.
13. Conditional formatting changes appearance by rules.
14. Pie chart is best for time-series trend always.
15. Filter hides rows that do not match criteria.
16. #DIV/0! occurs due to divide by zero.
17. Print Area prints only selected range.
18. A chart helps visualize data.
19. Excel is widely used in offices.
20. Spreadsheet and database are exactly the same thing.

### C. Fill in the Blanks (15)

1. MS Excel is a __________ application.
2. A workbook contains one or more __________.
3. Cell address is formed by column __________ and row number.
4. Every formula begins with __________.
5. Shortcut to save workbook is __________.
6. Shortcut to open Format Cells is __________.
7. Function to calculate total is __________.
8. Function to calculate average is __________.
9. Function to count numeric cells is __________.
10. Function to count non-empty cells is __________.
11. Absolute reference example is __________.
12. Key used to toggle reference type is __________.
13. Error for divide by zero is __________.
14. Feature to show only matching records is __________.
15. Default Excel file extension is __________.

### D. Match the Following (10)

| Column A | Column B |
|---|---|
| 1. SUM | a. Conditional count |
| 2. AVERAGE | b. Add values |
| 3. IF | c. Mean value |
| 4. COUNTIF | d. Current date |
| 5. TODAY | e. Condition result |
| 6. Ctrl + 1 | f. Format Cells |
| 7. Alt + = | g. AutoSum |
| 8. F4 | h. Absolute reference toggle |
| 9. Filter | i. Show selected records |
| 10. Print Area | j. Print selected range |

### E. Viva Questions (15)

1. What is MS Excel?
2. What is the difference between workbook and worksheet?
3. What is a cell address?
4. What is a range?
5. What is the use of formula bar?
6. What is the syntax of SUM?
7. What is the difference between COUNT and COUNTA?
8. What is IF function?
9. What is absolute reference?
10. What is conditional formatting?
11. What is the use of filter?
12. What is the use of sort?
13. What chart is best for comparing categories?
14. What is #DIV/0! error?
15. What is LibreOffice Calc?

### F. Practical Questions (10)

1. Create a marksheet for 10 students with 3 subjects.
2. Calculate Total, Average, and Percentage using formulas.
3. Add Pass/Fail column using IF.
4. Apply currency format to fee column.
5. Sort students by total marks descending.
6. Filter students with total greater than 200.
7. Apply conditional formatting for fail marks.
8. Create a column chart of totals.
9. Set print area and repeat header row.
10. Export worksheet as PDF.

### G. Case Studies (5)

#### Case Study 1: Class Marksheet

A teacher has marks of 30 students in three subjects and needs total, average, grade, and a chart.

Questions:

1. Which Excel features are required?
2. Which functions will you use?
3. How will you identify fail students?
4. Which chart is suitable?

#### Case Study 2: Salary Sheet

An office must calculate net salary for 20 employees using fixed allowance in one cell.

Questions:

1. Which reference type is needed for allowance cell?
2. Which functions are useful?
3. Why use absolute reference?
4. How will you format currency?

#### Case Study 3: Inventory Alert

A shop wants to highlight items with stock below 10.

Questions:

1. Which feature highlights low stock?
2. Which column should be checked?
3. Why is sorting useful?
4. How can a chart help?

#### Case Study 4: Fee Due Report

A school wants to see only students with pending fees.

Questions:

1. Which feature shows selected records?
2. Which formula finds total due amount?
3. Why use date format?
4. Why export PDF?

#### Case Study 5: Monthly Expense Analysis

A student tracks monthly expenses by category.

Questions:

1. Which function finds total expense?
2. Which chart shows category share?
3. Why use budget vs actual columns?
4. How can dashboard cells help?

### H. Mini Projects (5)

1. School Marksheet System with formulas, grades, chart, and PDF export.
2. Personal Monthly Budget with categories, totals, and pie chart.
3. Inventory Management Sheet with low-stock conditional formatting.
4. Employee Salary Register with absolute reference for allowance/tax.
5. Sales Dashboard with totals, KPI cells, and one chart.

---

## Answer Keys

### MCQ Answers

1-a | 2-a | 3-b | 4-b | 5-a | 6-a | 7-a | 8-b | 9-a | 10-a | 11-a | 12-a | 13-a | 14-c | 15-a | 16-a | 17-a | 18-a | 19-a | 20-a | 21-a | 22-a | 23-a | 24-a | 25-a | 26-a | 27-a | 28-a | 29-a | 30-a

### True/False Answers

1-True | 2-False | 3-True | 4-True | 5-True | 6-True | 7-True | 8-False | 9-True | 10-True | 11-True | 12-True | 13-True | 14-False | 15-True | 16-True | 17-True | 18-True | 19-True | 20-False

### Fill in the Blanks Answers

1. spreadsheet
2. worksheets
3. letter
4. =
5. Ctrl + S
6. Ctrl + 1
7. SUM
8. AVERAGE
9. COUNT
10. COUNTA
11. $B$1
12. F4
13. #DIV/0!
14. Filter
15. .xlsx

### Match the Following Answers

1-b | 2-c | 3-e | 4-a | 5-d | 6-f | 7-g | 8-h | 9-i | 10-j

### Case Study Model Answers

1. Use SUM, AVERAGE, IF, sort, filter, conditional formatting, chart; identify fail using IF or conditional formatting; column chart suitable.
2. Use absolute reference for allowance; SUM and arithmetic formulas; absolute reference keeps allowance fixed; currency format for salary columns.
3. Conditional formatting; stock quantity column; sorting helps see lowest stock first; chart shows stock comparison.
4. Filter; SUM for due amounts; date format for due dates; PDF for professional sharing.
5. SUM; pie chart; budget vs actual helps control spending; dashboard totals give quick summary.

### Final Self-Check

- [ ] I can explain workbook, worksheet, cell, range, and active cell.
- [ ] I can enter and format text, numbers, currency, dates, and percentages.
- [ ] I can use SUM, AVERAGE, MIN, MAX, COUNT, COUNTA, ROUND, IF, COUNTIF, SUMIF, TODAY, CONCAT, AND, and OR.
- [ ] I can use relative, absolute, and mixed references with F4.
- [ ] I can identify and fix common formula errors.
- [ ] I can sort, filter, and apply conditional formatting.
- [ ] I can create column, bar, line, pie, and area charts.
- [ ] I can prepare marksheets, salary sheets, fee reports, and inventory sheets.
- [ ] I can set print area, print titles, and export PDF.
- [ ] I can answer Excel practical, viva, interview, and exam questions confidently.
