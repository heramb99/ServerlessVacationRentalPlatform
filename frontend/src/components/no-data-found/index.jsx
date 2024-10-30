import React from 'react';

const NoDataFound = ({ placeholder = 'No Data Found!!' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-10">
      <svg
        className="w-16 h-16 mb-4 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 14l2-2m0 0l2-2m-2 2l2 2m-2-2l-2 2m2-6h.01M6 18V6a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2z"
        ></path>
      </svg>
      <p className="text-lg font-medium text-gray-500">{placeholder}</p>
    </div>
  );
};

export default NoDataFound;
