import {
  Bed,
  Camera,
  Car,
  Eye,
  Lock,
  Map,
  ShowerHead,
  Slash,
  Sun,
  Thermometer,
  Utensils,
  Wifi,
} from 'lucide-react';

const DUMMY_AMENITIES = [
  {
    title: 'Scenic views',
    icon: Eye,
    description: 'Beach view, Lake view, Mountain view',
  },
  {
    title: 'Bathroom',
    icon: ShowerHead,
    description: 'Body soap, Bidet, Outdoor shower, Hot water',
  },
  {
    title: 'Bedroom and laundry',
    icon: Bed,
    description:
      'Essentials, Towels, bed sheets, soap, and toilet paper, Hangers, Bed linens, Cotton linens, Room-darkening shades, Clothing storage: walk-in closet',
  },
  {
    title: 'Heating and cooling',
    icon: Thermometer,
    description:
      'Portable air conditioning, Heating - split-type ductless system',
  },
  {
    title: 'Home safety',
    icon: Camera,
    description:
      'Exterior security cameras on property, Dispositivi resi noti agli ospiti e che monitorano solo spazi pubblici e aree comuni',
  },
  {
    title: 'Internet and office',
    icon: Wifi,
    description: 'Wifi',
  },
  {
    title: 'Kitchen and dining',
    icon: Utensils,
    description:
      'Kitchen, Space where guests can cook their own meals, Refrigerator, Cooking basics, Pots and pans, oil, salt and pepper, Dishes and silverware, Bowls, chopsticks, plates, cups, etc., Stainless steel gas stove, Oven, Coffee maker, Dining table',
  },
  {
    title: 'Location features',
    icon: Map,
    description:
      'Waterfront, Right next to a body of water, Private beach access - Beachfront, Guests can enjoy a nearby beach, Lake access, Guests can get to a lake using a path or dock, Private entrance, Separate street or building entrance',
  },
  {
    title: 'Outdoor',
    icon: Sun,
    description:
      'Private backyard - Not fully fenced, An open space on the property usually covered in grass, Outdoor furniture, Outdoor dining area, Sun loungers',
  },
  {
    title: 'Parking and facilities',
    icon: Car,
    description: 'Free parking on premises, Free street parking',
  },
  {
    title: 'Services',
    icon: Lock,
    description: 'Self check-in, Lockbox',
  },
  {
    title: 'Not included',
    icon: Slash,
    description:
      'Unavailable: TV, Unavailable: Washer, Unavailable: Hair dryer, Unavailable: Smoke alarm, There is no smoke alarm on the property, Unavailable: Carbon monoxide alarm, There is no carbon monoxide detector on the property, Unavailable: Shampoo',
  },
];

export default DUMMY_AMENITIES;
