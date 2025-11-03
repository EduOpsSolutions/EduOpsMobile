interface Schedule {
  courseName: string;
  days: string;
  time_start: string;
  time_end: string;
  teacherName: string;
  location: string;
  hours: string;
}

interface StudyLoadPdfData {
  studentName: string;
  studentId: string;
  batchName: string;
  schedules: Schedule[];
  totalHours: string;
  printedAt: string;
  logoUri?: string;
}

/**
 * Generate HTML template for Study Load PDF
 */
export const generateStudyLoadPdfHtml = (data: StudyLoadPdfData): string => {
  const { studentName, studentId, batchName, schedules, totalHours, printedAt, logoUri } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Study Load - ${studentName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      padding: 40px;
      color: #333;
      background: white;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #de0000;
      padding-bottom: 20px;
    }

    .header .logo {
      width: 200px;
      height: auto;
      margin: 0 auto 20px;
      display: block;
    }

    .header h1 {
      font-size: 28px;
      color: #de0000;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .header h2 {
      font-size: 18px;
      color: #666;
      font-weight: normal;
    }

    .student-info {
      margin-bottom: 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f9f9f9;
      padding: 15px 20px;
      border-radius: 8px;
      border-left: 4px solid #de0000;
    }

    .student-info .name {
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }

    .student-info .id {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
    }

    .student-info .batch {
      font-size: 16px;
      color: #de0000;
      font-weight: bold;
    }

    .schedule-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
    }

    .schedule-table thead {
      background: #de0000;
      color: white;
    }

    .schedule-table th {
      padding: 12px 10px;
      text-align: center;
      font-weight: bold;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .schedule-table tbody tr {
      border-bottom: 1px solid #ddd;
    }

    .schedule-table tbody tr:nth-child(even) {
      background: #f9f9f9;
    }

    .schedule-table tbody tr:hover {
      background: #fffdf2;
    }

    .schedule-table td {
      padding: 12px 10px;
      text-align: center;
      font-size: 13px;
      vertical-align: middle;
    }

    .schedule-table td.schedule-cell {
      line-height: 1.6;
    }

    .total-section {
      text-align: right;
      margin-top: 20px;
      padding: 15px 20px;
      background: #fffdf2;
      border: 2px solid #ffd700;
      border-radius: 8px;
    }

    .total-section .total-label {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin-right: 15px;
    }

    .total-section .total-value {
      font-size: 20px;
      font-weight: bold;
      color: #de0000;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
      text-align: center;
      font-size: 12px;
      color: #999;
    }

    .footer .printed-date {
      font-style: italic;
    }

    @media print {
      body {
        padding: 20px;
      }

      .schedule-table {
        page-break-inside: auto;
      }

      .schedule-table tr {
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
    <h1>Study Load</h1>
    <h2>Academic Schedule Report</h2>
  </div>

  <!-- Student Information -->
  <div class="student-info">
    <div>
      <div class="name">${studentName}</div>
      <div class="id">Student ID: ${studentId}</div>
    </div>
    <div class="batch">${batchName}</div>
  </div>

  <!-- Schedule Table -->
  <table class="schedule-table">
    <thead>
      <tr>
        <th>Course</th>
        <th>Schedule</th>
        <th>Adviser</th>
        <th># of Hours</th>
        <th>Room</th>
      </tr>
    </thead>
    <tbody>
      ${schedules.map((schedule) => `
        <tr>
          <td>${schedule.courseName || '—'}</td>
          <td class="schedule-cell">
            ${schedule.days || '—'}<br/>
            ${schedule.time_start || '—'}${schedule.time_end ? ` - ${schedule.time_end}` : ''}
          </td>
          <td>${schedule.teacherName || '—'}</td>
          <td><strong>${schedule.hours || '—'}</strong></td>
          <td>${schedule.location || '—'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- Total Hours -->
  <div class="total-section">
    <span class="total-label">Total Hours:</span>
    <span class="total-value">${totalHours}</span>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="printed-date">Printed at: ${printedAt}</div>
  </div>
</body>
</html>
  `.trim();
};
