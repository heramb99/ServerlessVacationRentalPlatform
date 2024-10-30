import {
  differenceInDays,
  differenceInMonths,
  differenceInWeeks,
  formatDistanceToNow,
  parseISO,
} from 'date-fns';

export const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
};

export const isEmpty = (value) => {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return true;
  }
  return false;
};

export const humanizeDate = (dateString) => {
  const date = parseISO(dateString);

  const daysDifference = differenceInDays(new Date(), date);
  const weeksDifference = differenceInWeeks(new Date(), date);
  const monthsDifference = differenceInMonths(new Date(), date);

  if (daysDifference === 0) {
    return 'today';
  } else if (daysDifference === 1) {
    return '1 day ago';
  } else if (daysDifference < 7) {
    return `${daysDifference} days ago`;
  } else if (weeksDifference === 1) {
    return '1 week ago';
  } else if (weeksDifference < 4) {
    return `${weeksDifference} weeks ago`;
  } else if (monthsDifference === 1) {
    return '1 month ago';
  } else {
    return formatDistanceToNow(date, { addSuffix: true });
  }
};
