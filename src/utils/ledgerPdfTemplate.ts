interface LedgerEntry {
  date: string;
  time: string;
  orNumber: string;
  debit: string;
  credit: string;
  balance: string;
  type: string;
  remarks: string;
}

interface LedgerPdfData {
  studentName: string;
  studentId: string;
  ledgerEntries: LedgerEntry[];
  printedAt: string;
  logoUri?: string;
}

/**
 * Generate HTML template for Ledger PDF
 */
export const generateLedgerPdfHtml = (data: LedgerPdfData): string => {
  const { studentName, studentId, ledgerEntries, printedAt, logoUri } = data;

  // Calculate final balance
  const finalBalance = ledgerEntries.length > 0
    ? ledgerEntries[ledgerEntries.length - 1].balance
    : '0.00';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Ledger - ${studentName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      padding: 30px;
      color: #333;
      background: white;
    }

    .header {
      text-align: center;
      margin-bottom: 25px;
      border-bottom: 3px solid #8B0E07;
      padding-bottom: 20px;
    }

    .header .logo {
      width: 180px;
      height: auto;
      margin: 0 auto 15px;
      display: block;
    }

    .header h1 {
      font-size: 26px;
      color: #8B0E07;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .header h2 {
      font-size: 16px;
      color: #666;
      font-weight: normal;
    }

    .student-info {
      margin-bottom: 20px;
      background: #f9f9f9;
      padding: 15px 20px;
      border-radius: 8px;
      border-left: 4px solid #8B0E07;
    }

    .student-info .name {
      font-size: 18px;
      font-weight: bold;
      color: #333;
      text-transform: uppercase;
    }

    .student-info .id {
      font-size: 13px;
      color: #666;
      margin-top: 4px;
    }

    .ledger-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 11px;
    }

    .ledger-table thead {
      background: #8B0E07;
      color: white;
    }

    .ledger-table th {
      padding: 10px 6px;
      text-align: center;
      font-weight: bold;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      border: 1px solid #6B0E07;
    }

    .ledger-table tbody tr {
      border-bottom: 1px solid #ddd;
    }

    .ledger-table tbody tr:nth-child(even) {
      background: #f9f9f9;
    }

    .ledger-table tbody tr:hover {
      background: #fffdf2;
    }

    .ledger-table td {
      padding: 8px 6px;
      text-align: center;
      font-size: 10px;
      vertical-align: middle;
      border: 1px solid #e0e0e0;
    }

    .ledger-table td.debit {
      color: #d32f2f;
      font-weight: 600;
    }

    .ledger-table td.credit {
      color: #388e3c;
      font-weight: 600;
    }

    .ledger-table td.balance {
      font-weight: bold;
      color: #333;
    }

    .ledger-table td.empty {
      color: #999;
    }

    .balance-section {
      text-align: right;
      margin-top: 20px;
      padding: 15px 20px;
      background: #fffdf2;
      border: 2px solid #ffd700;
      border-radius: 8px;
    }

    .balance-section .balance-label {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin-right: 15px;
    }

    .balance-section .balance-value {
      font-size: 20px;
      font-weight: bold;
      color: ${parseFloat(finalBalance || '0') > 0 ? '#d32f2f' : '#388e3c'};
    }

    .balance-section .balance-note {
      font-size: 11px;
      color: #666;
      margin-top: 5px;
      font-style: italic;
    }

    .empty-ledger {
      text-align: center;
      padding: 40px 20px;
      color: #999;
      font-size: 14px;
    }

    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 2px solid #ddd;
      text-align: center;
      font-size: 11px;
      color: #999;
    }

    .footer .printed-date {
      font-style: italic;
    }

    @media print {
      body {
        padding: 15px;
      }

      .ledger-table {
        page-break-inside: auto;
      }

      .ledger-table tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    ${logoUri ? `<img src="${logoUri}" alt="Sprachins Logo" class="logo" />` : ''}
    <h1>Student Ledger</h1>
    <h2>Financial Transaction Report</h2>
  </div>

  <!-- Student Information -->
  <div class="student-info">
    <div class="name">${studentName}</div>
    <div class="id">Student ID: ${studentId}</div>
  </div>

  ${ledgerEntries.length > 0 ? `
    <!-- Ledger Table -->
    <table class="ledger-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Time</th>
          <th>O.R. No.</th>
          <th>Debit</th>
          <th>Credit</th>
          <th>Balance</th>
          <th>Type</th>
          <th>Remarks</th>
        </tr>
      </thead>
      <tbody>
        ${ledgerEntries.map((entry) => `
          <tr>
            <td>${entry.date || '—'}</td>
            <td>${entry.time || '—'}</td>
            <td>${entry.orNumber || '—'}</td>
            <td class="${entry.debit ? 'debit' : 'empty'}">${entry.debit || '—'}</td>
            <td class="${entry.credit ? 'credit' : 'empty'}">${entry.credit || '—'}</td>
            <td class="balance">${entry.balance || '0.00'}</td>
            <td>${entry.type || '—'}</td>
            <td>${entry.remarks || '—'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Balance Summary -->
    <div class="balance-section">
      <div>
        <span class="balance-label">Current Balance:</span>
        <span class="balance-value">₱${finalBalance}</span>
      </div>
      <div class="balance-note">
        ${parseFloat(finalBalance || '0') > 0
          ? 'Amount due - Please settle outstanding balance'
          : parseFloat(finalBalance || '0') < 0
          ? 'Credit balance - Overpayment or advance payment'
          : 'Account fully settled'}
      </div>
    </div>
  ` : `
    <div class="empty-ledger">
      <p>No transactions recorded</p>
    </div>
  `}

  <!-- Footer -->
  <div class="footer">
    <div class="printed-date">Printed at: ${printedAt}</div>
  </div>
</body>
</html>
  `.trim();
};
