import ExcelJS from 'exceljs'
import { map } from 'lodash'

const headerBorderStyle = {
  style: 'medium',
  color: { argb: '000000' }
}

const headerStyle = {
  fill: {
    type: 'pattern',
    pattern: 'solid',
    fgColor: {
      argb: 'BDDBAB'
    }
  },
  font: {
    size: 16
  },
  border: {
    bottom: headerBorderStyle,
    top: headerBorderStyle,
    left: headerBorderStyle,
    right: headerBorderStyle
  }
}

const createSheet1 = (workbook, phrasesData, subjectMatter, includeSubjectMatterCol) => {
  const sheet1Name = subjectMatter.toLowerCase() === 'total'
    ? 'Total Unhandled Questions'
    : 'Unhandled Questions' + (subjectMatter ? ' for ' + subjectMatter.toUpperCase() : '')

  // Create worksheets with headers and footers
  const sheet1 = workbook.addWorksheet(sheet1Name, phrasesData)

  const sheet1ColumnDefs = [
    { width: 100 },
    { width: 20 }
  ]

  sheet1.columns = sheet1ColumnDefs

  const unhandledPhrasesColumn = {
    name: 'Unhandled User Questions',
    filterButton: true,
    style: {
      font: {
        size: 16
      }
    }
  }

  const dateColumn = {
    name: 'Date',
    filterButton: true,
    style: {
      font: {
        size: 16
      }
    }
  }

  let sheet1Columns = [
    unhandledPhrasesColumn,
    dateColumn
  ]

  sheet1.getCell('A1').style = headerStyle
  sheet1.getCell('B1').style = headerStyle

  if (includeSubjectMatterCol) {
    sheet1Columns = [...sheet1Columns, {
      name: 'Subject Matter',
      filterButton: true,
      style: {
        font: {
          size: 16
        }
      }
    }]

    sheet1.columns = [...sheet1.columns, { width: 20 }]

    sheet1.getCell('C1').style = headerStyle
  }

  sheet1.addTable({
    name: 'User',
    ref: 'A1',
    headerRow: true,
    totalsRow: false,
    style: {
      theme: null
    },
    columns: sheet1Columns,
    rows: phrasesData.length > 0 ? phrasesData : [map(new Array(sheet1.columns.length), () => 'N/A')]
  })
}

const createSheet2 = (workbook, feedbackData, subjectMatter, includeSubjectMatterCol) => {
  const sheet2Name = subjectMatter.toLowerCase() === 'total'
    ? 'Total User Feedback'
    : 'User Feedback' + (subjectMatter ? ' for ' + subjectMatter.toUpperCase() : '')

  const sheet2 = workbook.addWorksheet(sheet2Name)

  sheet2.columns = [
    { width: 50 },
    { width: 20 },
    { width: 20 }
  ]

  let sheet2Columns = [
    {
      name: 'User Feedback',
      filterButton: true,
      style: {
        font: {
          size: 16
        },

      }
    },
    {
      name: 'Was <<Bot>> helpful?',
      filterButton: true,
      style: {
        font: {
          size: 16
        }
      }
    },
    {
      name: 'Date',
      filterButton: true,
      style: {
        font: {
          size: 16
        }
      }
    },
  ]

  if (includeSubjectMatterCol) {
    sheet2Columns = [...sheet2Columns, {
      name: 'SubjectMatter',
      filterButton: true,
      style: {
        font: {
          size: 16
        }
      }
    }]

    sheet2.columns = [...sheet2.columns, { width: 20 }]
    sheet2.getCell('D1').style = headerStyle
  }

  sheet2.addTable({
    name: 'UserFeedback',
    ref: 'A1',
    headerRow: true,
    totalsRow: false,
    style: {
      theme: null
    },
    columns: sheet2Columns,
    rows: feedbackData.length > 0 ? feedbackData : [map(new Array(sheet2.columns.length), () => 'N/A')]
  })

  sheet2.getCell('A1').style = headerStyle
  sheet2.getCell('B1').style = headerStyle
  sheet2.getCell('C1').style = headerStyle
}

export const generateExcelFile = async (phrasesData, feedbackData, includeSubjectMatterCol, subjectMatter) => {
  const workbook = new ExcelJS.Workbook()

  workbook.creator = 'Cambria'
  workbook.lastModifiedBy = 'Cambria'
  workbook.created = new Date()
  workbook.modified = new Date()

  createSheet1(workbook, phrasesData, subjectMatter, includeSubjectMatterCol)
  createSheet2(workbook, feedbackData, subjectMatter, includeSubjectMatterCol)

  // write to a new buffer
  const buffer = await workbook.xlsx.writeBuffer()

  const blob = new Blob([buffer], { type: 'application/vnd.ms-excel' })

  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = 'Unhandled Phrases and User Feedback.xlsx'
  link.click()
}