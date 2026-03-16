/**
 * Modal API hooks for Phase 2 features
 * Handles communication between modals and backend APIs
 */

export async function saveSchedule(campaignId: string, data: any) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`/api/campaigns/${campaignId}/schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save schedule');
  }

  return response.json();
}

export async function saveABTest(campaignId: string, data: any) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`/api/campaigns/${campaignId}/ab-tests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save A/B test');
  }

  return response.json();
}

export async function saveAutomation(campaignId: string, data: any) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`/api/campaigns/${campaignId}/automations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save automation');
  }

  return response.json();
}

export async function saveEmailContent(campaignId: string, data: any) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`/api/campaigns/${campaignId}/email-content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save email content');
  }

  return response.json();
}

export async function saveRecipients(campaignId: string, data: any) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`/api/campaigns/${campaignId}/recipients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save recipients');
  }

  return response.json();
}

export async function saveIntegration(campaignId: string, data: any) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`/api/campaigns/${campaignId}/integrations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save integration');
  }

  return response.json();
}

export async function checkCompliance(campaignId: string, data: any) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`/api/campaigns/${campaignId}/compliance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to check compliance');
  }

  return response.json();
}

export async function requestApproval(campaignId: string, data: any) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`/api/campaigns/${campaignId}/approval`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to request approval');
  }

  return response.json();
}
