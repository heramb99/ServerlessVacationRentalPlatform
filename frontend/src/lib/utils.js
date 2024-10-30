import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const randomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
