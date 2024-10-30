const GUEST_ROUTES = [
  {
    label: 'Rooms',
    path: '/rooms',
  },
  {
    label: 'Guest Login',
    path: '/user/login',
  },
  {
    label: 'Agent Login',
    path: '/agent/login',
  },
];

const USER_ROUTES = [
  {
    label: 'Rooms',
    path: '/rooms',
  },
  {
    label: 'My Bookings',
    path: '/user/bookings',
  },
  {
    label: 'Tickets',
    path: '/user/tickets',
  },
  {
    label: 'Logout',
    path: '/logout',
  },
];

const AGENT_ROUTES = [
  {
    label: 'Dashboard',
    path: '/agent/dashboard',
  },
  {
    label: 'Rooms',
    path: '/agent/rooms',
  },
  {
    label: 'Tickets',
    path: '/agent/tickets',
  },
  {
    label: 'Logout',
    path: '/logout',
  },
];

const SECURITY_QUESTIONS = [
  {
    value: 'What is your favorite color?',
    label: 'What is your favorite color?',
  },
  {
    value: "What is your mother's maiden name?",
    label: "What is your mother's maiden name?",
  },
  {
    value: 'What was the name of your first pet?',
    label: 'What was the name of your first pet?',
  },
  {
    value: 'In what city were you born?',
    label: 'In what city were you born?',
  },
  {
    value: 'What was the name of your first school?',
    label: 'What was the name of your first school?',
  },
  {
    value: 'What is the name of your best friend from childhood?',
    label: 'What is the name of your best friend from childhood?',
  },
  {
    value: 'What is the name of your favorite teacher?',
    label: 'What is the name of your favorite teacher?',
  },
  {
    value: 'What is your favorite movie?',
    label: 'What is your favorite movie?',
  },
  {
    value: 'What is your favorite book?',
    label: 'What is your favorite book?',
  },
];

export { GUEST_ROUTES, USER_ROUTES, AGENT_ROUTES, SECURITY_QUESTIONS };
