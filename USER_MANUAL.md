# Aura Medical Center Management System (MCMS)
## Non-Technical Staff User Manual

Welcome to your new Clinic Management System! This guide is written in plain English to help you navigate and use the software in your daily operations. No IT or computer programming knowledge is required.

---

## 1. What is the Aura Clinic System?

Our system replaces manual paper files and clipboard queues with a fast, real-time digital dashboard. The system coordinates the journey of a patient from the moment they walk through the front door, to their vitals check, doctor's consultation, prescription collection, and payment.

### How it Works (The Patient Journey)
```
[1. Front Desk Registration] ➔ [2. Nurse Vitals Triage] ➔ [3. Doctor Consultation] ➔ [4. Pharmacy Pick-up & Payment]
```

---

## 2. How to Launch and Open the System

Launching the clinic software is simple and does not require opening developers' consoles or typing terminal commands:

1. **Locate the Project Folder**: Navigate to the directory where the Aura Medical Center Management System is installed on your computer.
2. **Double-Click the Launcher File**: Look for the file named **`launch_mcms.bat`** (it has a gears icon on Windows and may just show as `launch_mcms`).
3. **Wait for Startup**: A black console window will open, automatically checking if Node.js is ready and starting both the backend database server and the client portal. 
4. **Auto-Open Web Browser**: Within 2 to 4 seconds, the clinic login screen will **automatically open in your default web browser** at `http://localhost:5173`.
5. **Shutting Down the System**: When your daily clinic operations are finished, simply click the standard **"X" close button** on the top-right of the black console launcher window.

> [!IMPORTANT]
> You **must keep the black console window open** while using the software. If you close this launcher window, the database server will turn off and the web pages will stop loading.

---

## 3. Core Concepts You Need to Know

* **Queue Token**: A unique 3-digit number (like `101`, `102`) assigned to a patient when they arrive. This helps them know their order in the waiting lounge.
* **Triage Vitals**: Basic medical readings taken by the receptionist or nurse before the patient sees the doctor. This includes **Blood Pressure** (e.g., 120/80), **Heart Rate** (heartbeats per minute), **Body Temperature** (in degrees Fahrenheit), and **BMI** (body size index).
* **EHR (Electronic Health Record)**: A patient's digital medical file where doctors log consultation notes, diagnoses, and medications.
* **Live Network Status**: A color-coded network pill in the upper-right header. Green **"SMTP Cloud Online"** means an internet connection is active and automated patient emails are enabled. Amber **"Offline Standalone Mode"** means you are disconnected; the system will continue to work perfectly, storing files locally and bypassing email dispatch without any lagging or freezes.

---

## 4. Daily Guide for Receptionists & Front Desk Staff
*Your primary login username is **`receptionist`** with password **`reception123`**.*

### A. Registering a New Patient
1. Click **New Patient Intake** in the left sidebar menu.
2. Fill out the registration form:
   - Type the patient's **Full Name**, **Phone Number**, and **Date of Birth**.
   - Type the patient's **Email Address** (Optional - necessary if they wish to receive automated discharge summary and payment receipt emails).
   - Enter their **National ID** (NID number).
   - List any **Medication Allergies** (type "None" if they don't have any).
   - Enter relevant **Medical History** (e.g., Asthma, Hypertension).
3. Click the **Register Patient File** button. A green checkmark confirms the file is saved.

### B. Giving a Patient a Queue Number (Token) & Roster Checks
1. Click **Queue Scheduler** in the left sidebar.
2. In the **Allocate Queue Token** search box, search the patient by name or phone and select them.
3. Choose the **Attending Doctor** from the dropdown menu.
4. Select the **Visit Category** (Walk-in vs. Scheduled Appointment).
5. **Roster Status Validation**: If the selected doctor is off-duty today or has a registered vacation override on the calendar, a warning banner will appear: **"Doctor Unavailable Now: On leave"** and token generation will be disabled. You must choose another physician or consult the supervisor.
6. If the doctor is available, click **Generate Sequential Token**. 
7. A blue alert bar will appear. Click **Print Ticket (80mm)** to print the slip.
8. **Automated Confirmation Email**: If the patient registered a valid email, they will automatically receive a queue confirmation email containing their token number and estimated appointment slot.

### C. Cancelling a Token
1. If a patient leaves the waiting area or booked by error, locate their active token in the scheduler table.
2. Click the red **Cancel** button on their row.
3. This voids their token and any outstanding invoice balances. An automated **Cancellation Email** is sent to their address to notify them.

### D. Nurse Vitals Triage
1. On the **Queue Scheduler** table, locate the patient. You will see a flashing orange **"Pending Triage"** notice.
2. Click **Triage Nurse** next to their name. A form will open.
3. Enter their vitals (Blood Pressure, Heart Rate, Temperature, BMI).
   - *Demo Shortcut*: Click the **Mock Vitals** button to instantly autofill the form with standard test values (`122/81 BP`, `74 HR`, `98.8°F Temp`, `23.0 BMI`) in a single click.
4. Click **Record Vitals**. The flashing warning turns into green badges showing the vitals to the doctor.

### E. Payments & Billing Desk
1. Click **Billing Desk** in the left sidebar.
2. Locate the patient in the billing table (marked with a flashing red **"unpaid"** status).
3. Click **Collect Fee**.
4. In the checkout window, choose the payment method: **Cash**, **Card**, **Insurance**, or **QR Code**.
5. Click **Finalize Checkout**. The status changes to a green **"paid"**. 
6. **Automated Discharge Emails**: The system automatically compiles two PDF files in the background and emails them as attachments:
   - **Payment_Receipt.pdf**: Detailed financial statement and itemized checkout ledger (PAID).
   - **Medical_Discharge_Summary.pdf**: Clinical chart notes, vital logs, and electronic prescription (Rx) sheet.
7. Click the **Receipt** button if they need a physical copy printed.

---

## 5. Daily Guide for Doctors
*Your primary login username is **`doctor`** with password **`doctor123`**.*

### A. Calling the Next Patient
1. Click **Consultation Pad** in the left sidebar.
2. In the **Waiting Patients Queue** panel, find the next patient (marked in blue).
3. Click the green **Call Patient** button.
4. **What happens next**: The waiting room TV screen will sound a chime and read aloud: *"Token 102, John Doe, please proceed to consultation Room 1"*.

### B. Entering Medical Notes & Prescriptions
1. Once the patient enters your room, review their **Nurse Triage Vitals** on the screen.
2. In the **Clinical Documentation** form:
   - Check the boxes for **Symptoms** (e.g., Fever, Cough, Headache).
   - Type your detailed consultation notes in the text box.
   - Check the boxes for **Diagnosis Codes** (e.g., Essential Hypertension, Acute Tonsillitis).
3. To add medicines in the **Prescription Builder**:
   - Select a medication from the list.
   - Type the **Dosage** (e.g., "1 tablet"), **Frequency** (e.g., "Twice daily"), and **Duration** (e.g., "7 days").
   - Click **Add to Prescription**. Repeat for other medicines.
4. Click the blue **Complete Consultation** button. This automatically marks the patient as finished, sends the prescription list directly to the pharmacist, and updates the bill.

### C. Private Earnings & Consultation Ledger
1. Click **My Earnings** in the left sidebar menu.
2. Review your private metrics:
   - **Settled Earnings**: Total fee collected from paid consultation charges (LKR).
   - **Pending Ledger Bills**: Outstanding/unpaid fees from completed consultations.
   - **Completed Consultations**: Total number of patients you consulted.
   - **Shift Consult Fee**: Your individual consultation fee (LKR).
3. **Timeline & payment splits**: Explore your 7-day consulting income graph and patient settlement method split (Cash, Card, Insurance, QR Code).
4. **CSV Export**: Click the blue **Export Earnings Report (CSV)** button to download your private transaction history as an Excel-compatible spreadsheet.

> [!NOTE]
> For privacy and security compliance, **this page is strictly restricted to your own session**. You cannot see consultation records, statistics, or earnings generated by other attending physicians.

---

## 6. Daily Guide for Pharmacists
*Your primary login username is **`pharmacist`** with password **`pharmacy123`**.*

### A. Dispensing Doctor Prescriptions
1. Click **Prescriptions Queue** in the left sidebar.
2. Find the patient's name (new prescriptions from the doctor appear instantly).
3. Click **Dispense & Update Ledger**.
4. Hand the medicines to the patient. The system automatically updates stock levels and sends the pricing to the Billing Desk.

### B. Managing Stock & Alerts
1. Click **Inventory Manager** in the left sidebar.
2. Observe the stock table:
   - Flashing red **"Low Stock"** labels show medicines running out.
   - Orange **"Expiring Soon"** labels show medicines close to expiry.
3. To add new stock: click **Add Medication**, type the name, amount, batch number, and click **Commit to Stockroom**.

### C. Direct Counter Sales (OTC)
1. On the **Inventory Manager** page, locate the direct sales cart on the right.
2. To add medicines to the cart:
   - Click **Add to Sales** next to any drug in the table.
   - OR, if using a **USB Barcode Scanner**: point and click your scanner at the physical product box. The system automatically reads the barcode and adds the item to the cart!
   - (For demonstration: you can click the shortcut buttons in the **Wedge Barcode Simulation** box to test scanning).
3. Choose the payment method (Cash, Card, QR) and click **Process OTC Checkout**.

---

## 7. Daily Guide for Clinic Managers & Administrators
*Your primary login username is **`admin`** with password **`admin123`**.*

### A. Adding Staff User Accounts
1. Click **User Accounts** in the left sidebar.
2. Under **Provision Staff Account**:
   - Type the worker's full name, choose a login username, and type a password.
   - Select their role: **System Admin**, **Doctor**, **Receptionist**, or **Pharmacist**.
   - Select their specialty or department.
3. Click **Provision Credentials**. They can now log in using those details.

### B. Doctor Profiles, Weekly Rosters, & Leave Overrides
You configure details and work calendars for doctors:
1. Click **User Accounts** in the sidebar.
2. Click the tab at the top labeled **Doctor Profiles & Roster**.
3. Select a doctor from the list.
4. Edit their **Room Assignment**, **Consultation Fee (LKR)**, and professional **Bio** text.
5. In the **Weekly Availability Calendar**, check or uncheck active days, and set their shift Start/End times (e.g. `09:00 - 18:00`).
6. In **Vacation & Time-Off Blocks**, choose calendar dates they will be away (e.g., `2026-08-05`), add a reason (e.g. "Annual Leave"), and click **Add Block**. 
7. Click **Save Doctor Details** to write scheduling rules to the server database.

### C. Clinic Reports & Financial Analytics
Navigate to **Financial Analytics** in the sidebar. The panel is split into five interactive reports:
1. **Clinic Revenue & Ledger**: View total clinic earnings, average ticket sizes, cashflow timeline graphs, payment distribution splits (Cash, Card, Insurance, QR Code), and the raw transaction ledger table.
2. **Patient Footfall Reports**: Analyze total ticket admissions, split comparison between walk-in customers and scheduled appointments, peak load clinic hours (bar chart representing the busiest hours of the day), and cancellation rates.
3. **Doctor Performance Panel**: Chart consultations completed per physician and view an administrative table detailing specialties, room numbers, consult fees, and consultation revenue generated per doctor.
4. **Pharmacy & Stock Velocity**: Track total medication batch count, low stock warnings, impending 30-day expiries, fast-moving drugs (consumption velocity chart), and a full stockroom inventory registry table.
5. **HIPAA Access Compliance**: Review secure audit trails, patient charts read volume, operator roles activity distribution, and a live search-enabled security audit registry console logs table.

#### Downloadable Spreadsheet Reports (CSV)
You can download raw data directly from the system for accounting, supervisor review, or audit analysis:
* In **Clinic Revenue & Ledger**, click the blue **Download Ledger (CSV)** button on the header of the ledger table to save a `.csv` spreadsheet file containing dates, references, patients, settlement modes, and amounts.
* In **Doctor Performance Panel**, click the green **Download Performance (CSV)** button on the table header to download a `.csv` file detailing doctors, consultation counts, room numbers, fees, and consultation revenue generated.
* In **Pharmacy & Stock Velocity**, click the sky-blue **Download Stockroom CSV** button to download a `.csv` file containing the complete stock inventory database.
* In **HIPAA Access Compliance**, click the green **Download Logs (CSV)** button on the log table header to export the filtered security audit trail.
* These files are compiled locally (works fully offline) and can be imported directly into Microsoft Excel, Google Sheets, or LibreOffice Calc.

### D. Exporters & Data Backups (Air-Gap Protection)
Because our system runs locally on your clinic computer, you have full control over backups:
1. Click **User Accounts** in the sidebar.
2. Click the tab at the top labeled **Turnkey Backup & Maintenance**.
3. Under **Manual Export**, click the blue **Export db.json Snapshot** button.
4. A database file will immediately download to your computer. Save this file onto a USB thumb drive daily.

---

## 8. Troubleshooting FAQ

#### Q: The waiting room speaker is not announcing patient tokens.
* **A**: Web browsers block sounds unless you click on the page first. Ensure you have clicked once anywhere on the **Waiting Room display board** to enable the voice synthesis. Also check that your computer speakers are turned on and not muted.

#### Q: How do we scan medication boxes with barcodes?
* **A**: Simply plug in a standard USB barcode scanner. Make sure your cursor is focused in the dashboard browser window, scan the medication barcode, and it will be added to the shopping cart instantly.

#### Q: How can we configure our own email SMTP server (like Gmail or SES)?
* **A**: Locate the `server/config.json` file in the project folder and edit the SMTP details (host, port, auth user, pass, and from address) to match your email provider. The system will start sending emails via your provider immediately after you save.
