const API_BASE = '/api';

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