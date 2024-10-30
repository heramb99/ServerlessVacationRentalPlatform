'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Ellipsis } from 'lucide-react';
import { useState } from 'react';
import { EditRoom } from './edit-room';

export function RoomTableRowActions({ row }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDialogOpenChange = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      window.location.reload();
    }
  };

  const deleteRoom = async () => {
    try {
      const response = await fetch(`/api/agent/rooms/${row?.original?.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        console.error(data?.message);
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <Ellipsis className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              handleDialogOpenChange(true);
            }}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={deleteRoom}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isDialogOpen && (
        <EditRoom
          room={row?.original}
          isOpen={isDialogOpen}
          onOpenChange={handleDialogOpenChange}
        />
      )}
    </>
  );
}
