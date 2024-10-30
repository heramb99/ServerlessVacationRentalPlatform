import { BadgeCheck, CalendarCheck, Plane, ShieldAlert } from 'lucide-react';

export const statuses = [
  {
    value: 'available',
    label: 'Available',
    icon: BadgeCheck,
  },
  {
    value: 'reserved',
    label: 'reserved',
    icon: CalendarCheck,
  },
  {
    value: 'ongoing',
    label: 'Ongoing',
    icon: Plane,
  },
  {
    value: 'inactive',
    label: 'Inactive',
    icon: ShieldAlert,
  },
];
