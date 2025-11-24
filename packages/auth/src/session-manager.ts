import { User } from 'firebase/auth';

interface SessionConfig {
  domain: string;
  maxAge: number; // 14 days in seconds
  path: string;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
}

export class SessionManager {
  private static getDomainConfig(): SessionConfig {
    const hostname = typeof window !== 'undefined'
      ? window.location.hostname
      : '';

    // Detect if on subdomain or standalone
    const isSubdomain = hostname.includes('.ainexsuite.com');

    return {
      domain: isSubdomain ? '.ainexsuite.com' : hostname,
      maxAge: 14 * 24 * 60 * 60, // 14 days
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    };
  }

  static async createSession(user: User): Promise<void> {
    // Get Firebase ID token
    const idToken = await user.getIdToken();

    // Call Cloud Function to create session cookie
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to create session');
    }

    const { sessionCookie } = await response.json();

    // Set cookie with appropriate domain
    const config = this.getDomainConfig();
    this.setCookie('__session', sessionCookie, config);

    // Store user info in localStorage for quick access
    this.storeUserInfo(user);
  }

  static setCookie(name: string, value: string, config: SessionConfig): void {
    const cookieString = [
      `${name}=${value}`,
      `domain=${config.domain}`,
      `max-age=${config.maxAge}`,
      `path=${config.path}`,
      config.secure ? 'secure' : '',
      `samesite=${config.sameSite}`,
    ]
      .filter(Boolean)
      .join('; ');

    document.cookie = cookieString;
  }

  static getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }

    return null;
  }

  static clearSession(): void {
    const config = this.getDomainConfig();

    // Clear session cookie
    this.setCookie('__session', '', { ...config, maxAge: 0 });

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_info');
      localStorage.removeItem('user_apps');
    }
  }

  private static storeUserInfo(user: User): void {
    if (typeof window === 'undefined') return;

    const userInfo = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };

    localStorage.setItem('user_info', JSON.stringify(userInfo));
  }

  static getDomainType(): 'subdomain' | 'standalone' {
    if (typeof window === 'undefined') return 'standalone';

    const hostname = window.location.hostname;
    return hostname.includes('.ainexsuite.com') ? 'subdomain' : 'standalone';
  }
}
