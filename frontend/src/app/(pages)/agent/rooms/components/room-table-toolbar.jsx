'use client';

import { Input } from '@/components/ui/input';
import { RoomTableViewOption } from './room-table-view-options';
import { CircleX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateRoom } from './create-room';

export function RoomTableToolbar({ table }) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter Name..."
          value={table.getColumn('name')?.getFilterValue() ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className="w-72"
        />
        {isFiltered && (
          <Button
            onClick={() => table.resetColumnFilters()}
            // className="px-2 lg:px-3"
          >
            Reset
            <CircleX className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex justify-end items-center space-x-2">
        <RoomTableViewOption table={table} />
        <CreateRoom />
      </div>
    </div>
  );
}
