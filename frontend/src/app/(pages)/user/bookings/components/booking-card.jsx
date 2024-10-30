import { useEffect, useState } from 'react';

import { ClipboardCopy } from 'lucide-react';

import { randomNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import EllipsisTooltip from '@/components/ui/ellipsis-tooltip';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import ReviewForm from './review-form';
import FallbackImage from '@/components/fallback-image';

const BookingCard = ({ booking }) => {
  const [copied, setCopied] = useState(false);
  const {
    room = {},
    total_price,
    check_in_date,
    check_out_date,
    guests,
  } = booking;

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <div className="transition ease-in-out w-full h-[200px] bg-white rounded-lg shadow hover:shadow-lg hover:outline hover:outline-1 hover:outline-violet-300 hover:-translate-y-1">
      <div className="flex justify-left w-full h-full">
        <div className="w-1/3 h-full relative">
          {/* <picture>
            <img
              src={`https://picsum.photos/id/${randomNumber(1, 100)}/1500`}
              // src={booking?.room?.images?.[0]?.url}
              alt={`${booking?.room?.name} Cover Image`}
              className="w-full h-full object-cover rounded-l-lg"
            />
          </picture> */}
          <div className="w-full max-h-[200px]">
            <FallbackImage
              fill={true}
              objectFit="cover"
              src={room?.images?.[0]?.url}
              alt={`${room?.name} Cover Image`}
              className="rounded-l-lg"
            />
          </div>
        </div>
        <div className="w-2/3 p-4">
          <div className="flex flex-col justify-between h-full space-y-2">
            <div>
              <div className="flex justify-between items-center w-full">
                <EllipsisTooltip
                  className={'w-1/2 font-medium'}
                  text={room?.name}
                />
                <div>${total_price} CAD</div>
              </div>
              <div className="text-sm text-slate-700">
                {room?.config?.beds} Beds, {room?.config?.bathrooms} Bathrooms{' '}
              </div>
              <div className="text-xs flex items-baseline space-x-2">
                <div className="text-slate-400">Booking Id - {booking?.id}</div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      onClick={() => {
                        setCopied(true);
                        navigator.clipboard.writeText(booking?.id);
                      }}
                    >
                      <ClipboardCopy
                        size={'15px'}
                        className="text-slate-600 hover:text-violet-700 cursor-pointer"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{copied ? 'Copied' : 'Copy to clipboard'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div className="space-y-2">
                <div className="text-xs text-slate-500 flex items-center">
                  <span>Check In - </span>
                  <span className="font-medium">
                    {new Date(check_in_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center">
                  <span>Check Out - </span>
                  <span className="font-medium">
                    {new Date(check_out_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center">
                  <span>Total Guests - </span>
                  <span className="font-medium">{guests}</span>
                </div>
              </div>
              <div className="space-x-2">
                <ReviewForm booking={booking} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
