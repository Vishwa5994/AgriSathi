/**
 * Google Identity Services & OAuth Helper
 */

export const triggerGoogleAuth = ({ onSuccess, onError, selectRole = 'FARMER' }) => {
  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '912210135-61me4mb0jupt8v1kkrvij3be06atlj88.apps.googleusercontent.com';

  // 1. Google Identity Services: Modern OAuth2 Token Client (Popup flow - no redirect required)
  if (window.google?.accounts?.oauth2) {
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: async (response) => {
          if (response.error) {
            console.warn('Google Token Client error:', response);
            if (onError) onError(response.error_description || response.error);
            return;
          }
          if (response.access_token) {
            if (onSuccess) onSuccess({ access_token: response.access_token });
          }
        },
        error_callback: (err) => {
          console.warn('Google Token Client init error:', err);
          if (onError) onError(err.message || 'Google popup cancelled or closed');
        }
      });
      client.requestAccessToken({ prompt: 'select_account' });
      return;
    } catch (e) {
      console.warn('GSI oauth2 error, trying fallback:', e);
    }
  }

  // 2. Google Identity Services: One-Tap / ID Token flow
  if (window.google?.accounts?.id) {
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) {
            if (onSuccess) onSuccess({ credential: response.credential, id_token: response.credential });
          }
        }
      });
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('GSI Prompt not displayed, fallback to redirect');
          fallbackRedirect(clientId, selectRole);
        }
      });
      return;
    } catch (e) {
      console.warn('GSI ID prompt error, falling back:', e);
    }
  }

  // 3. Standard OAuth 2.0 Redirect Fallback
  fallbackRedirect(clientId, selectRole);
};

const fallbackRedirect = (clientId, role) => {
  const redirectUri = `${window.location.origin}/login`;
  const state = encodeURIComponent(JSON.stringify({ role }));
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=token&scope=openid%20email%20profile&state=${state}&prompt=select_account`;
  window.location.href = googleAuthUrl;
};
