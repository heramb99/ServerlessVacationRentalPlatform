import NoDataFound from '@/components/no-data-found';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Ratings } from '@/components/ui/ratings';
import { cn } from '@/lib/utils';
import { humanizeDate } from '@/utils/Helpers';
import React from 'react';

const RoomReviews = ({ room }) => {
  const FeedbackCard = ({ feedback }) => {
    let feedbackSentimentScore = feedback?.sentiment?.score || 0.5;
    return (
      <div className="flex space-x-4 p-4">
        <Avatar>
          <AvatarFallback>{feedback?.user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{feedback?.user?.name}</h3>
          <div className="flex space-x-4">
            <Ratings rating={feedback?.rating} size={13} variant="yellow" />
            <span className="text-xs">
              {humanizeDate(feedback?.created_at)}
            </span>
          </div>
          <p className="text-sm">
            <span>Sentiment Score: </span>
            <span
              className={cn({
                'text-red-500 font-semibold': feedbackSentimentScore <= 0.5,
                'text-green-500 font-semibold': feedbackSentimentScore > 0.5,
              })}
            >
              {feedbackSentimentScore?.toFixed(1) || '0.5'}
            </span>
          </p>
          <p className="text-sm text-gray-800">{feedback?.comment}</p>
        </div>
      </div>
    );
  };

  return (
    <div>
      <span className="text-lg font-medium">Reviews</span>
      {!room?.feedbacks?.length ? (
        <NoDataFound placeholder="No reviews. Be the first one to try out!!" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {room?.feedbacks?.map((feedback, index) => (
            <FeedbackCard key={index} feedback={feedback} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomReviews;
