import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CirclePlus } from 'lucide-react';
import RoomForm from './room-form';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';

export function CreateRoom() {
  const { toast } = useToast();
  const [disableForm, setDisableForm] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const createRoom = async (formInstance, formValues) => {
    setDisableForm(true);
    try {
      const response = await fetch('/api/agent/rooms', {
        method: 'POST',
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
        setDialogOpen(false);
      }
    } finally {
      setDisableForm(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="group/item">
          <CirclePlus className="mr-2 w-4 group-hover/item:animate-spin group-hover/item:w-5" />
          Add Room
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Room</DialogTitle>
          <DialogDescription>
            Add new details in your room profile. Click save to apply changes.
          </DialogDescription>
        </DialogHeader>
        <RoomForm onSubmit={createRoom} disableForm={disableForm} />
      </DialogContent>
    </Dialog>
  );
}
