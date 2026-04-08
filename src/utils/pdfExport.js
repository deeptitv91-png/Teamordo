import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDate } from './dateHelpers'
import { getStatusMeta } from './roleDetector'

export const exportReportPDF = ({ period, company, metrics, persons, delayedTasks, generatedBy }) => {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica','bold')
  doc.text('Teamordo', 14, 18)
  doc.setFontSize(11)
  doc.setFont('helvetica','normal')
  doc.setTextColor(100)
  doc.text('Performance Report', 14, 25)
  doc.text(`${company?.name || ''} · ${period}`, 14, 31)
  doc.text(`Generated: ${formatDate(new Date())} by ${generatedBy}`, 14, 37)
  doc.setTextColor(0)

  // Metrics row
  let y = 48
  doc.setFontSize(10)
  doc.setFont('helvetica','bold')
  doc.text('SUMMARY', 14, y)
  y += 6
  metrics.forEach((m, i) => {
    const x = 14 + (i * 48)
    doc.setFillColor(245, 245, 242)
    doc.roundedRect(x, y, 44, 18, 2, 2, 'F')
    doc.setFont('helvetica','normal')
    doc.setFontSize(8)
    doc.setTextColor(120)
    doc.text(m.label, x + 4, y + 6)
    doc.setFontSize(14)
    doc.setFont('helvetica','bold')
    doc.setTextColor(30)
    doc.text(String(m.value), x + 4, y + 14)
  })
  y += 28

  // Performance table
  doc.setFontSize(10)
  doc.setFont('helvetica','bold')
  doc.setTextColor(0)
  doc.text('TEAM PERFORMANCE', 14, y)
  y += 4

  autoTable(doc, {
    startY: y,
    head: [['Name', 'Role/Designation', 'Tasks', 'Delayed', 'Avg Approval', 'Score']],
    body: persons.map(p => [
      p.name,
      p.designation || p.role,
      `${p.completed}/${p.total}`,
      p.delayed,
      p.avgApproval,
      `${p.score}/100`,
    ]),
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [55, 138, 221], textColor: 255, fontStyle:'bold' },
    alternateRowStyles: { fillColor: [248, 248, 246] },
  })

  // Delayed tasks
  if (delayedTasks?.length) {
    const y2 = doc.lastAutoTable.finalY + 10
    doc.setFontSize(10)
    doc.setFont('helvetica','bold')
    doc.text('DELAYED TASKS', 14, y2)
    autoTable(doc, {
      startY: y2 + 4,
      head: [['Task', 'Assignee', 'Deadline', 'Status']],
      body: delayedTasks.map(t => [
        t.title,
        t.assigneeName,
        formatDate(t.deadline),
        getStatusMeta(t.status).label,
      ]),
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [226, 75, 74], textColor: 255, fontStyle:'bold' },
    })
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`Teamordo · ${company?.name} · Confidential · Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 8)
  }

  doc.save(`Teamordo-Report-${period.replace(/\s+/g,'-')}.pdf`)
}
