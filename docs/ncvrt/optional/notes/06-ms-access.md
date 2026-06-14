# Subject 6: MS Access (10 Hours)

## Learning Objectives

- Understand database concepts (DBMS, tables, records, fields)
- Create database and tables in MS Access
- Set data types and primary keys
- Enter and edit data in datasheets
- Create simple queries (select, criteria, calculations)
- Design basic forms and reports
- Import data from Excel

---

## 1. Database Concepts

**Database** = organized collection of related data  
**DBMS** = Database Management System (MS Access, MySQL, Oracle)

| Term | Meaning | Example |
|------|---------|---------|
| Table | Collection of records | Students |
| Record (Row) | One complete entry | One student's data |
| Field (Column) | One attribute | Name, RollNo, Marks |
| Primary Key | Unique identifier | RollNo |
| Query | Question asked of data | "All students from Delhi" |
| Form | User-friendly data entry screen | Student entry form |
| Report | Formatted printout | Fee receipt list |

**Extension:** `.accdb` (Access 2007+) | older `.mdb`

---

## 2. Starting Access

Start → Microsoft Access → Blank Database  
- Enter file name → Create  
- **Navigation Pane** (left) — tables, queries, forms, reports

---

## 3. Creating Tables

### Design View (recommended)
1. Create → Table Design
2. Define fields:

| Field Name | Data Type | Description |
|------------|-----------|-------------|
| StudentID | AutoNumber | Primary key |
| Name | Short Text | Full name |
| DOB | Date/Time | Birth date |
| Phone | Short Text | 10 digits |
| Fees | Currency | Amount paid |
| Active | Yes/No | Currently enrolled |

3. Select StudentID row → Design → Primary Key  
4. Save table as `tblStudents`

### Common data types
- **Short Text** — names, codes (up to 255 chars)
- **Long Text** — paragraphs
- **Number** — Integer, Long Integer, Decimal
- **Date/Time**
- **Currency**
- **Yes/No** — Boolean
- **AutoNumber** — automatic unique ID

### Datasheet View
Double-click table → enter data like Excel spreadsheet

---

## 4. Relationships (Introduction)

**Database → Relationships**  
Link tables on common field (e.g. StudentID in Orders table)  
- **One-to-Many:** One student → many fee payments  
Enforce **Referential Integrity** — prevent orphan records

---

## 5. Queries

**Create → Query Design**

### Simple select query
1. Add table(s)
2. Drag fields to grid
3. **Criteria row:** e.g. `[City]="Bhubaneswar"`
4. Run (red exclamation) → datasheet result

### Operators in criteria
| Criteria | Meaning |
|----------|---------|
| `=50` | Equals 50 |
| `>40` | Greater than 40 |
| `Between 40 And 60` | Range |
| `"Pass"` | Exact text |
| `Like "A*"` | Starts with A |
| `Is Null` | Empty field |

### Calculated field in query
`Total: [Price]*[Quantity]`  
`Grade: IIf([Marks]>=40,"Pass","Fail")`

### Query types
- **Select** — fetch data
- **Make Table** — save results as new table
- **Update / Delete** — modify data (use carefully)

---

## 6. Forms

**Create → Form Wizard** or **Form Design**

**Purpose:** Easier data entry than raw table  
- Add labels, text boxes, combo boxes  
- **Combo box** — dropdown list (e.g. select City from list)  
- Navigation buttons at bottom — first, previous, next, last record

---

## 7. Reports

**Create → Report Wizard**

- Group data (by class, city)
- Sort order
- Summary (Sum of fees)
- Print-ready layout with header/footer

**Report View / Print Preview** — Ctrl+P to print

---

## 8. Import from Excel

External Data → New Data Source → From File → Excel  
- Choose sheet  
- Option: import into new table or link  
Useful when student list already in Excel

---

## Lab Tasks

1. Create `Library.accdb` with table Books (BookID, Title, Author, Price, Qty)
2. Enter 8 book records in datasheet
3. Query: books with Price > 300
4. Query with calculated field: StockValue = Price * Qty
5. Create form for Books using Form Wizard
6. Create report grouped by Author (if same author multiple books)
7. Import 5 rows from Excel sheet into new table

---

## Summary Checklist

- [ ] Explain table, record, field, primary key
- [ ] Create table in Design View with correct data types
- [ ] Build select query with criteria
- [ ] Create form and report using wizards
- [ ] Import Excel data

---

## Mini Self-Test

1. What is a primary key?  
2. Name four data types in Access.  
3. What does a query do?  
4. Criteria to find marks between 40 and 60?  
5. Difference between form and report?

*Answers in [practice/06-ms-access-qa.md](../practice/06-ms-access-qa.md)*
