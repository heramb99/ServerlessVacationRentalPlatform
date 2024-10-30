import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import FallbackImage from '@/components/fallback-image';

const RoomCard = ({ room }) => {
  const router = useRouter();
  const {
    images,
    name,
    id,
    price_per_day,
    config = {},
    total_reviews = 0,
    overall_rating = 0,
  } = room;
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1,
    );
  };

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1,
    );
  };

  return (
    <Card
      className="max-w-xs rounded-lg overflow-hidden border-none shadow-none hover:bg-slate-100	hover:p-0.5 group relative cursor-pointer transition-all"
      onClick={() => router.push(`/rooms/${room.id}`)}
    >
      <div className="relative">
        <div className="w-full h-48 object-cover rounded">
          <FallbackImage
            fill={true}
            objectFit="cover"
            src={images?.[currentIndex]?.url}
            alt={name}
          />
        </div>
        {/* <Badge className="absolute top-4 left-4 bg-white text-black px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          Guest favorite
        </Badge>
        <Heart className="absolute top-4 right-4 text-white w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" /> */}
        <button
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={prevSlide}
        >
          <ChevronLeft className="w-4 h-4 text-black" />
        </button>
        <button
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={nextSlide}
        >
          <ChevronRight className="w-4 h-4 text-black" />
        </button>
      </div>
      <CardContent className="p-1 pt-2 text-xs">
        <div className="flex justify-between text-sm items-center">
          <div className="basis-3/4 truncate font-semibold">{name}</div>
          <div className="basis-1/4 flex justify-end font-normal space-x-1">
            <span className="flex items-center">
              <span>{overall_rating.toFixed(1)}</span>
              <Star size={'12px'} color="orange" />
            </span>
            <span>({total_reviews})</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 py-1">
          <div>{config?.beds || 1} Bed</div>{' '}
          <Separator orientation="vertical" className="h-5" />
          <div>{config?.baths || 1} Bath</div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-gray-500 font-bold">
            ${price_per_day} CAD night
          </div>
          <div className="text-gray-500 font-normal">
            ${price_per_day * 3} CAD total
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomCard;
