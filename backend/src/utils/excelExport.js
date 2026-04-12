import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const excelPath = path.join(__dirname, '..', '..', 'evaluations.xlsx');

export function exportEvaluationsToExcel(db) {
  const evaluations = db.prepare(`
    SELECT 
      e.id,
      e.round_number,
      t.team_name,
      t.team_leader,
      j.name as judge_name,
      e.novelty,
      e.usage_score,
      e.methodology,
      e.presentation,
      e.uniqueness,
      e.total_score,
      e.remarks,
      e.evaluated_at
    FROM evaluations e
    JOIN teams t ON e.team_id = t.id
    JOIN judges j ON e.judge_id = j.id
    ORDER BY e.round_number, e.total_score DESC
  `).all();

  if (evaluations.length === 0) {
    return null;
  }

  const data = evaluations.map((row, index) => ({
    'S.No': index + 1,
    'Round': row.round_number,
    'Team Name': row.team_name,
    'Team Leader': row.team_leader,
    'Judge Name': row.judge_name,
    'Novelty': row.novelty,
    'Usage Score': row.usage_score,
    'Methodology': row.methodology,
    'Presentation': row.presentation,
    'Uniqueness': row.uniqueness,
    'Total Score': row.total_score,
    'Remarks': row.remarks,
    'Evaluated At': row.evaluated_at
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Evaluations');

  const colWidths = [
    { wch: 6 },
    { wch: 8 },
    { wch: 25 },
    { wch: 20 },
    { wch: 20 },
    { wch: 10 },
    { wch: 12 },
    { wch: 13 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 30 },
    { wch: 22 }
  ];
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, excelPath);
  console.log(`Excel file updated: ${excelPath}`);
  return excelPath;
}
