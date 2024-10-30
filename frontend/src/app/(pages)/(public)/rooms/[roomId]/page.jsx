'use client';

import { Loading } from '@/components/ui/loading';
import { Separator } from '@/components/ui/separator';
import { Heart, Share } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import RoomBooking from './components/RoomBooking';
import RoomDetails from './components/RoomDetails';
import RoomReviews from './components/RoomReviews';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import FallbackImage from '@/components/fallback-image';

const Index = ({ params }) => {
  const { roomId } = params;
  const [room, setRoom] = useState({});
  const [loading, setLoading] = useState(false);
  const { images = [], name } = room;

  useEffect(() => {
    fetchRoomDetails();
  }, []);

  const fetchRoomDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/user/rooms/${roomId}`);
      const data = await response.json();
      if (response.ok) {
        setRoom(data?.room);
      } else {
      }
    } finally {
      setLoading(false);
    }
  };

  const NavBar = () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/rooms">Rooms</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );

  const Header = () => (
    <div className="flex justify-end items-center">
      <div className="flex space-x-4">
        <button className="text-gray-500 hover:text-gray-700">
          <Share className="w-6 h-6" />
          <span className="sr-only">Share</span>
        </button>
        <button className="text-gray-500 hover:text-gray-700">
          <Heart className="w-6 h-6" />
          <span className="sr-only">Save</span>
        </button>
      </div>
    </div>
  );

  const Gallery = () => (
    <div className="grid grid-cols-2 gap-1 rounded h-[500px]">
      <div className="relative w-full h-full">
        <FallbackImage
          fill={true}
          objectFit="cover"
          src={room?.images?.[0]?.url}
          alt={`${room?.name} Cover Image`}
          className="w-full h-full"
        />
      </div>
      <div className="grid grid-cols-2 gap-1">
        {[1, 2, 3, 4].map((image, index) => (
          <div key={index} className="relative">
            <FallbackImage
              fill={true}
              objectFit="cover"
              src={room?.images?.[index]?.url}
              alt={`${room?.name} Cover Image - ${index}`}
              className="w-full h-full static"
            />
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <Loading placeHolder={'Fetching details...'} />;
  }

  return (
    <div>
      <div className="flex items-center w-full justify-between py-4">
        <NavBar />
        <Header />
      </div>
      <Gallery />
      <div className="grid grid-cols-1 grid-cols-3 gap-6 pt-6">
        <div className="md:col-span-2">
          <RoomDetails room={room} />
        </div>
        <div>
          <RoomBooking room={room} />
        </div>
        <Separator className="col-span-3" />
        <div className="col-span-3">
          <RoomReviews room={room} />
        </div>
      </div>
    </div>
  );
};

export default Index;
