import Image from 'next/image';
import { useState } from 'react';
import FallBackImage from '../../../public/fallback.png';

const FallbackImage = (props) => {
  const { src, ...rest } = props;
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      alt={'Image not found'}
      {...rest}
      src={imgSrc}
      onError={() => {
        setImgSrc(FallBackImage);
      }}
    />
  );
};

export default FallbackImage;
