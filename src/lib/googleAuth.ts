interface GoogleTokenInfo {
  aud?: string;
  email?: string;
  email_verified?: string;
  exp?: string;
  given_name?: string;
  family_name?: string;
  iss?: string;
  name?: string;
  picture?: string;
  sub?: string;
}

const GOOGLE_TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo';
const VALID_ISSUERS = new Set(['accounts.google.com', 'https://accounts.google.com']);

export async function verifyGoogleCredential(credential: string): Promise<GoogleTokenInfo> {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured');
  }

  const response = await fetch(
    `${GOOGLE_TOKENINFO_URL}?id_token=${encodeURIComponent(credential)}`,
    {
      method: 'GET',
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error('Google token verification failed');
  }

  const tokenInfo = (await response.json()) as GoogleTokenInfo;

  if (tokenInfo.aud !== clientId) {
    throw new Error('Google token audience mismatch');
  }

  if (!tokenInfo.iss || !VALID_ISSUERS.has(tokenInfo.iss)) {
    throw new Error('Google token issuer is invalid');
  }

  if (tokenInfo.email_verified !== 'true') {
    throw new Error('Google email is not verified');
  }

  if (!tokenInfo.email || !tokenInfo.sub) {
    throw new Error('Google token is missing required claims');
  }

  if (tokenInfo.exp && Number(tokenInfo.exp) * 1000 < Date.now()) {
    throw new Error('Google token has expired');
  }

  return tokenInfo;
}
