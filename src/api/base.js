// window.apiPrefix defaults to '/api' in index.html, but is rewritten
// server-side by bitcore-node-pirate/index.js's filterIndexHTML() when the
// InsightUI service is mounted under a custom apiPrefix - always read it
// at request time, never cache it at module-load time.
function apiPrefix() {
  return window.apiPrefix || '/api';
}

export class ApiError extends Error {
  constructor(status, data) {
    super(typeof data === 'string' ? data : JSON.stringify(data));
    this.status = status;
    this.data = data;
  }
}

export async function apiGet(path) {
  const res = await fetch(apiPrefix() + path);
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new ApiError(res.status, data);
  }
  return data;
}

export async function apiPost(path, body) {
  const res = await fetch(apiPrefix() + path, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body)
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new ApiError(res.status, data);
  }
  return data;
}
