import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from 'next/server';

import { getSession } from './lib/session';
import { isEmpty } from './utils/Helpers';

const PUBLIC_PATHS = [
  '/user/login',
  '/user/register',
  '/user/register/verify',
  '/agent/login',
  '/agent/register',
  '/agent/register/verify',
  '/rooms',
  '/rooms/(.*)',
  '/user/login/mfa-verify',
  '/user/register/mfa-setup',
  '/agent/login/mfa-verify',
  '/agent/register/mfa-setup',
  '/',
];

const SUDO_PATHS = ['/logout'];

const AGENT_PATHS = ['/agent/rooms', '/agent/tickets', '/agent/dashboard'];

const USER_PATHS = ['/rooms', '/user/bookings', '/user/tickets'];

const LOGIN_SIGNUP_PATHS = [
  '/user/login',
  '/agent/login',
  '/user/register',
  '/agent/register',
];

const MFA_CONFIG_PATHS = [
  '/user/register/mfa-setup',
  '/agent/register/mfa-setup',
];

const MFA_VERIFY_PATHS = ['/user/login/mfa-verify', '/agent/login/mfa-verify'];

const isPublicPath = (pathname: string) => {
  const publicRegexes = PUBLIC_PATHS.map((path) => path.replace('(.*)', '.*'));
  const regex = new RegExp(`^(${publicRegexes.join('|')})$`);
  return regex.test(pathname);
};

const redirectToUserRooms = (request: NextRequest) => {
  const url = request.nextUrl.clone();
  url.pathname = '/rooms';
  return NextResponse.redirect(url);
};

const redirectToAgentDashboard = (request: NextRequest) => {
  const url = request.nextUrl.clone();
  url.pathname = '/agent/dashboard';
  return NextResponse.redirect(url);
};

const redirectToHome = (request: NextRequest) => {
  const url = request.nextUrl.clone();
  url.pathname = '/';
  return NextResponse.redirect(url);
};

const redirectToMfaConfiguration = (
  request: NextRequest,
  role: string,
  email: string,
) => {
  const url = request.nextUrl.clone();
  url.pathname = `/${role}/register/mfa-setup`;
  url.searchParams.set('email', email);
  return NextResponse.redirect(url);
};

const redirectToMfaVerification = (request: NextRequest, role: string) => {
  const url = request.nextUrl.clone();
  url.pathname = `/${role}/login/mfa-verify`;
  return NextResponse.redirect(url);
};

export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  const session: any = await getSession();
  const { user = {}, role = '', mfa_1 = {}, mfa_2 = {} } = session || {};
  const isMFAConfigured = mfa_1.configured && mfa_2.configured;
  const isMFAVerified = isMFAConfigured && mfa_1.verified && mfa_2.verified;
  const isLoggedInWithoutMFAConfigured = !isEmpty(user) && !isMFAConfigured;
  const isLoggedInWithoutMFAVerified = !isEmpty(user) && !isMFAVerified;
  const isUser = !isEmpty(user) && role === 'user' && isMFAVerified;
  const isAgent = !isEmpty(user) && role === 'agent' && isMFAVerified;
  const isGuest = isEmpty(user) && role === 'guest';
  const isAuthenticated = isUser || isAgent;

  if (SUDO_PATHS.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  } else if (isAuthenticated) {
    if (LOGIN_SIGNUP_PATHS.includes(request.nextUrl.pathname)) {
      return isUser
        ? redirectToUserRooms(request)
        : redirectToAgentDashboard(request);
    }
    if (isUser && AGENT_PATHS.includes(request.nextUrl.pathname)) {
      return redirectToUserRooms(request);
    }
    if (isAgent && USER_PATHS.includes(request.nextUrl.pathname)) {
      return redirectToAgentDashboard(request);
    }
  } else if (
    isLoggedInWithoutMFAConfigured &&
    !MFA_CONFIG_PATHS.includes(request.nextUrl.pathname)
  ) {
    return redirectToMfaConfiguration(request, role, user?.email);
  } else if (
    isLoggedInWithoutMFAVerified &&
    !MFA_VERIFY_PATHS.includes(request.nextUrl.pathname)
  ) {
    return redirectToMfaVerification(request, role);
  } else {
    if (!isPublicPath(request.nextUrl.pathname)) {
      return redirectToHome(request);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
