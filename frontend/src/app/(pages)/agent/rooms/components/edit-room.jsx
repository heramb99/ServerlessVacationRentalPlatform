import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import RoomForm from './room-form';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function EditRoom({ room, isOpen, onOpenChange }) {
  const { toast } = useToast();
  const [disableForm, setDisableForm] = useState(false);

  const editRoom = async (formInstance, formValues) => {
    setDisableForm(true);
    try {
      const response = await fetch(`/api/agent/rooms/${room?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formValues),
      });
      const data = await response.json();
      if (!response.ok) {
        formInstance.setError('formError', {
          message: data?.message,
        });
      } else {
        toast({
          title: 'Success',
          description: data?.message,
        });
        onOpenChange(false);
      }
    } finally {
      setDisableForm(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Add Room</Button>
      </DialogTrigger>
      <DialogContent className="min-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Room</DialogTitle>
          <DialogDescription>
            Update room details. Click save to apply changes.
          </DialogDescription>
        </DialogHeader>
        <RoomForm room={room} onSubmit={editRoom} disableForm={disableForm} />
      </DialogContent>
    </Dialog>
  );
}
