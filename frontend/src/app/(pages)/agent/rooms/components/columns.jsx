'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { RoomTableRowActions } from './room-table-row-actions';
import { RoomTableColumnHeader } from './room-table-column-header';
import EllipsisTooltip from '@/components/ui/ellipsis-tooltip';

export const columns = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    label: 'Name',
    header: ({ column }) => (
      <RoomTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <EllipsisTooltip
        text={row.getValue('name')}
        className={'w-72 cursor-pointer'}
      />
    ),
  },
  {
    accessorKey: 'beds',
    label: 'Beds',
    accessorFn: (data) => data?.config?.beds,
    header: ({ column }) => (
      <RoomTableColumnHeader column={column} title="Beds" />
    ),
    cell: ({ row }) => <div>{`${row.getValue('beds')} beds`}</div>,
  },
  {
    accessorKey: 'bathrooms',
    label: 'Bathrooms',
    accessorFn: (data) => data?.config?.bathrooms,
    header: ({ column }) => (
      <RoomTableColumnHeader column={column} title="Bathrooms" />
    ),
    cell: ({ row }) => <div>{`${row.getValue('bathrooms')} baths`}</div>,
  },
  {
    accessorKey: 'price_per_day',
    label: 'Price',
    header: ({ column }) => (
      <RoomTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => <div>{`$${row.getValue('price_per_day')} CAD`}</div>,
  },
  {
    id: 'actions',
    cell: ({ row }) => <RoomTableRowActions row={row} />,
  },
];
