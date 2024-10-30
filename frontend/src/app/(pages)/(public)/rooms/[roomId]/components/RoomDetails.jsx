import { Separator } from '@/components/ui/separator';
import DUMMY_AMENITIES from '@/utils/amenities';
import { Star } from 'lucide-react';
import React, { useEffect } from 'react';

const RoomDetails = ({ room }) => {
  const { name, config, description, amenities = [], feedbacks = [] } = room;
  const [overallRating, setOverallRating] = React.useState(0);
  const [totalReviews, setTotalReviews] = React.useState(0);
  const [likePercentage, setLikePercentage] = React.useState(0);

  useEffect(() => {
    prepareOverallFeedback();
  }, []);

  const prepareOverallFeedback = () => {
    const totalFeedbacks = feedbacks.length;
    const averageSentimentScore =
      feedbacks.reduce(
        (acc, feedback) => acc + (feedback?.sentiment?.score || 0.5),
        0,
      ) / totalFeedbacks;

    setTotalReviews(totalFeedbacks);
    setLikePercentage(averageSentimentScore?.toFixed(1) * 100);
    setOverallRating(
      (
        feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0) /
        totalFeedbacks
      ).toFixed(1),
    );
  };

  const RoomTitle = () => (
    <div>
      <span className="font-medium text-lg">{name}</span>
      <div className="flex items-center space-x-2 py-1 text-sm">
        <div>{config?.guests || 4} Guests</div>{' '}
        <Separator orientation="vertical" className="h-5" />
        <div>{config?.beds || 1} Bed</div>{' '}
        <Separator orientation="vertical" className="h-5" />
        <div>{config?.baths || 1} Bath</div>
      </div>
    </div>
  );

  const OverallFeedbackAndPolarity = () => (
    <div>
      <span className="text-lg font-medium">Overall Feedback</span>
      <div className="flex items-center space-x-10 mt-5">
        <div className="flex flex-col space-y-3">
          <div className="flex space-x-1 items-center">
            <span className="text-5xl font-semibold text-slate-700">
              {overallRating}
            </span>
            <Star className="text-yellow-500" fill="yellow" />
          </div>
          <div className="text-md text-slate-500">Overall Rating</div>
        </div>

        <div className="flex flex-col space-y-3">
          <div className="text-5xl font-semibold text-slate-700">
            {totalReviews}
          </div>
          <div className="text-md text-slate-500">Total Reviews</div>
        </div>

        <div className="flex flex-col space-y-3">
          <div className="text-5xl font-semibold text-slate-700">{`${likePercentage}%`}</div>
          <div className="text-md text-slate-500">Like Percentage</div>
        </div>
      </div>
    </div>
  );

  const RoomDescription = () => (
    <div>
      <span className="text-lg font-medium">Description</span>
      <p className="text-sm leading-loose">{description}</p>
    </div>
  );

  const RoomAmenities = () => (
    <div>
      <span className="text-lg font-medium">What this place offers</span>
      <div className="grid grid-cols-2 gap-y-6 gap-x-4 mt-4">
        {DUMMY_AMENITIES?.map((amenity, index) => {
          const { icon: AmenityIcon, title, description } = amenity;
          return (
            <div className="flex space-x-4" key={`amenity-${index}`}>
              <div>
                <AmenityIcon />
              </div>
              <div className="w-2/3 space-y-1">
                <p className="font-medium">{title}</p>
                <p className="text-sm text-slate-500 truncate overflow-hidden">
                  {description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-5 pr-6">
      <RoomTitle />
      <Separator className="my-6" />
      <OverallFeedbackAndPolarity />
      <Separator className="my-6" />
      <RoomDescription />
      <Separator className="my-6" />
      <RoomAmenities />
    </div>
  );
};

export default RoomDetails;
