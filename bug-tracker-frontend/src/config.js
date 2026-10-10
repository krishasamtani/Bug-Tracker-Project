// Deploy pe Vercel ke Environment Variable (REACT_APP_API_URL) se aayega,
// local pe fallback localhost use hoga.
export const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";
