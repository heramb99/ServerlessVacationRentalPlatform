import React from 'react';

const Footer = () => {
  return (
    <div className="flex w-full items-center justify-between border-t-2 py-4">
      <p className="text-center text-gray-500 text-xs">
        &copy; {new Date().getFullYear()} SDP 32. All rights reserved.
      </p>
      <p className="text-gray-500 text-xs">Github</p>
    </div>
  );
};

export default Footer;
