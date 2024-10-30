import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogFooter } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleMinus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(1, 'Room name is required'),
  beds: z
    .number()
    .min(1, 'Number of beds must be greater than or equal to 1')
    .max(6, 'Number of beds must be less than or equal to 6'),
  bathrooms: z
    .number()
    .min(1, 'Number of bathrooms must be greater than or equal to 1')
    .max(6, 'Number of bathrooms must be less than or equal to 6'),
  guests: z
    .number()
    .min(1, 'Number of guests must be greater than or equal to 1')
    .max(10, 'Number of guests must be less than or equal to 10'),
  price: z.number().min(1, 'Price must be greater than or equal to 1'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters'),
  amenities: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one amenity.',
  }),
  images: z
    .array(
      z.union([
        z.object({ name: z.string(), url: z.string() }),
        z.string(),
        z.instanceof(File),
      ]),
    )
    .min(1, 'You have to upload at least one image.')
    .max(5, 'You can upload up to 5 images.')
    .refine(
      (files) =>
        files.every((file) => {
          if (file instanceof File) {
            return file.size <= 2 * 1024 * 1024;
          } else {
            return true;
          }
        }),
      {
        message: 'Each image must be less than 2MB.',
      },
    ),
});

const amenities = [
  { value: 'wifi', label: 'WiFi' },
  { value: 'air-conditioning', label: 'Air Conditioning' },
  { value: 'parking', label: 'Parking' },
  { value: 'pool', label: 'Pool' },
  { value: 'pet-friendly', label: 'Pet Friendly' },
  { value: 'gym', label: 'Gym' },
  { value: 'breakfast-included', label: 'Breakfast Included' },
  { value: 'tv', label: 'TV' },
  { value: 'washer', label: 'Washer' },
];

const RoomForm = ({ room, onSubmit, disableForm }) => {
  const [images, setImages] = useState([]);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: room?.name || '',
      beds: room?.config?.beds || 1,
      bathrooms: room?.config?.bathrooms || 1,
      guests: room?.config?.guests || 2,
      price: room?.price_per_day || 0,
      description: room?.description || '',
      amenities: room?.amenities || [],
      images: room?.images || [],
    },
    mode: 'onChange',
  });

  useEffect(() => {
    setImages(room?.images || []);
  }, [room]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert('You can upload up to 5 images.');
      return;
    }
    for (let file of files) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Each image must be less than 2MB.');
        return;
      }
    }
    setImages((prevImages) => [...prevImages, ...files]);
    form.setValue('images', [...images, ...files]);
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    form.setValue('images', newImages);
  };

  async function convertImageToBase64(image) {
    if (image) {
      const reader = new FileReader();

      return new Promise((resolve) => {
        reader.onload = (ev) => {
          resolve(ev.target.result);
        };
        reader.readAsDataURL(image);
      });
    }
  }

  const handleSubmit = async (data) => {
    let payload = data;

    let imageArray = await Promise.all(
      images.map(async (image) => {
        if (image instanceof File) {
          const convertedImage = await convertImageToBase64(image);
          return {
            name: image.name,
            url: `data:${image.type};base64,${convertedImage.split(',')[1]}`,
            type: image.type,
          };
        } else {
          return image;
        }
      }),
    );

    payload['images'] = imageArray;
    onSubmit(form, payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {form.formState.errors.formError && (
          <div className="mb-4 text-sm font-medium text-red-600">
            {form.formState.errors.formError.message}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 max-h-[calc(100dvh-300px)] overflow-y-scroll p-1">
          <div className="col-span-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="mt-2"
                      placeholder="Enter room name"
                      {...field}
                      disabled={disableForm}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-1">
            <FormField
              control={form.control}
              name="beds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Beds</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(Number(value))}
                      className="w-full"
                      disabled={disableForm}
                    >
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Select number of beds" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(6).keys()].map((i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-1">
            <FormField
              control={form.control}
              name="bathrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Bathrooms</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(Number(value))}
                      className="w-full"
                      disabled={disableForm}
                    >
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Select number of bathrooms" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(6).keys()].map((i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-1">
            <FormField
              control={form.control}
              name="guests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Guests</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(Number(value))}
                      className="w-full"
                      disabled={disableForm}
                    >
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Select number of guests" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(10).keys()].map((i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-1">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price per Night</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className="mt-2"
                      placeholder="Enter price per night"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={disableForm}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.price?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="mt-2"
                      placeholder="Enter room description"
                      {...field}
                      disabled={disableForm}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.description?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-2">
            <FormField
              control={form.control}
              name="amenities"
              render={() => (
                <FormItem>
                  <div className="mb-3">
                    <FormLabel>Amenities</FormLabel>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {amenities.map((item) => (
                      <FormField
                        key={item.value}
                        control={form.control}
                        name="amenities"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.value}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.value)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          item.value,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.value,
                                          ),
                                        );
                                  }}
                                  disabled={disableForm}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-2">
            <FormItem>
              <FormLabel>Upload Images (up to 5)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={disableForm}
                />
              </FormControl>
              <div className="mt-2 flex flex-wrap gap-3">
                {images?.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={
                        image instanceof File
                          ? URL.createObjectURL(image)
                          : image?.url || image
                      }
                      alt={`Room image ${index + 1}`}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <CircleMinus
                      onClick={() => handleRemoveImage(index)}
                      className="transition ease-out delay-150 text-white cursor-pointer w-6 hover:-translate-y-1 fill-red-500 absolute -top-2 -right-2"
                    />
                  </div>
                ))}
              </div>
              <FormMessage>{form.formState.errors.images?.message}</FormMessage>
            </FormItem>
          </div>
        </div>

        <DialogFooter>
          <Button type="submit" disabled={disableForm}>
            Save changes
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default RoomForm;
