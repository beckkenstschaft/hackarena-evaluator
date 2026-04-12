import ExcelJS from 'exceljs';
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

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'HackArena Scanner';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Evaluations');

  worksheet.columns = [
    { header: 'S.No', key: 'sno', width: 6 },
    { header: 'Round', key: 'round', width: 8 },
    { header: 'Team Name', key: 'teamName', width: 25 },
    { header: 'Team Leader', key: 'teamLeader', width: 20 },
    { header: 'Judge Name', key: 'judgeName', width: 20 },
    { header: 'Novelty', key: 'novelty', width: 10 },
    { header: 'Usage Score', key: 'usageScore', width: 12 },
    { header: 'Methodology', key: 'methodology', width: 13 },
    { header: 'Presentation', key: 'presentation', width: 14 },
    { header: 'Uniqueness', key: 'uniqueness', width: 12 },
    { header: 'Total Score', key: 'totalScore', width: 12 },
    { header: 'Remarks', key: 'remarks', width: 30 },
    { header: 'Evaluated At', key: 'evaluatedAt', width: 22 }
  ];

  evaluations.forEach((row, index) => {
    worksheet.addRow({
      sno: index + 1,
      round: row.round_number,
      teamName: row.team_name,
      teamLeader: row.team_leader,
      judgeName: row.judge_name,
      novelty: row.novelty,
      usageScore: row.usage_score,
      methodology: row.methodology,
      presentation: row.presentation,
      uniqueness: row.uniqueness,
      totalScore: row.total_score,
      remarks: row.remarks,
      evaluatedAt: row.evaluated_at
    });
  });

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF6366F1' }
  };
  headerRow.alignment = { horizontal: 'center' };

  worksheet.eachRow((row) => {
    row.alignment = { horizontal: 'left', vertical: 'center' };
  });

  workbook.xlsx.writeFile(excelPath)
    .then(() => {
      console.log(`Excel file updated: ${excelPath}`);
    })
    .catch((err) => {
      console.error('Error writing Excel file:', err);
      throw err;
    });

  return excelPath;
}
