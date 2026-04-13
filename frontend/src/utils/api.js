const API_BASE = 'https://tried-pristine-disarray.ngrok-free.dev';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

export async function getTeams() {
  return request('/teams');
}

export async function getTeam(id) {
  return request(`/teams/${id}`);
}

export async function createTeam(data) {
  return request('/teams', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function deleteTeam(id) {
  return request(`/teams/${id}`, { method: 'DELETE' });
}

export async function getTeamQRCode(id) {
  return request(`/teams/${id}/qrcode`);
}

export async function getJudges() {
  return request('/judges');
}

export async function createJudge(name) {
  return request('/judges', {
    method: 'POST',
    body: JSON.stringify({ name })
  });
}

export async function deleteJudge(id) {
  return request(`/judges/${id}`, { method: 'DELETE' });
}

export async function getEvaluations(round) {
  const params = new URLSearchParams();
  if (round) params.append('round', round);
  return request(`/evaluations${params.toString() ? '?' + params.toString() : ''}`);
}

export async function getEvaluationsByRound(roundNumber) {
  return request(`/evaluations/round/${roundNumber}`);
}

export async function getEvaluationByTeam(teamId) {
  return request(`/evaluations/team/${teamId}`);
}

export async function submitEvaluation(data) {
  return request('/evaluations', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function deleteEvaluation(id) {
  console.log('Deleting evaluation:', id);
  return request(`/evaluations/${id}`, {
    method: 'DELETE'
  });
}

export async function getEvaluationCount(judgeId, roundNumber) {
  return request(`/evaluations/count/${judgeId}/${roundNumber}`);
}

export async function getEvaluatedTeams(judgeId, roundNumber) {
  return request(`/evaluations/evaluated-teams/${judgeId}/${roundNumber}`);
}

export async function getAdminStats() {
  return request('/admin/stats');
}

export async function getJudgeStats() {
  return request('/admin/judge-stats');
}

export async function getJudgeActivity(judgeId) {
  return request(`/admin/judge/${judgeId}/activity`);
}

export async function getScanActivity() {
  return request('/admin/scan-activity');
}

export async function scanQR(qrId, judgeId) {
  return request(`/admin/scan/${qrId}`, {
    method: 'POST',
    body: JSON.stringify({ judgeId })
  });
}

export async function generateTeamQR(teamId, baseUrl) {
  return request(`/admin/teams/${teamId}/generate-qr`, {
    method: 'POST',
    body: JSON.stringify({ baseUrl })
  });
}

export async function regenerateTeamQR(teamId, baseUrl) {
  return request(`/admin/teams/${teamId}/regenerate-qr`, {
    method: 'POST',
    body: JSON.stringify({ baseUrl })
  });
}

export async function getTeamQRStatus(teamId) {
  return request(`/admin/teams/${teamId}/qr-status`);
}

export async function adminLogin(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

export async function adminLogout(adminName) {
  return request('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ adminName })
  });
}

export async function logTabAccess(adminName, tabName) {
  return request('/auth/tab-access', {
    method: 'POST',
    body: JSON.stringify({ adminName, tabName })
  });
}

export async function logAdminAction(adminName, action, details = {}) {
  return request('/auth/action', {
    method: 'POST',
    body: JSON.stringify({ adminName, action, details })
  });
}