// .gemini/skills/wow-skill-creator/scripts/backend-api-example.js
// Example Node.js script for making authenticated backend API calls within WoW.

const fetch = require('node-fetch');

async function callWoWApi(endpoint, method = 'GET', body = null) {
  const token = process.env.WOP_AUTH_TOKEN || 'YOUR_AUTH_TOKEN_HERE'; // Replace with actual token retrieval
  const baseUrl = process.env.WOP_API_BASE_URL || 'http://localhost:3333/api';

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const options = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, options);
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error calling WoW API:', error);
    throw error;
  }
}

// Example usage:
// callWoWApi('/admin/users')
//   .then(data => console.log('Users:', data))
//   .catch(error => console.error('Failed to fetch users:', error));

// callWoWApi('/projects', 'POST', { name: 'New Project', description: 'Created by WoW Skill Creator' })
//   .then(data => console.log('New Project:', data))
//   .catch(error => console.error('Failed to create project:', error));

module.exports = { callWoWApi };
