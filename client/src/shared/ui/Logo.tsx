import { FC } from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xl';
}

const Logo: FC<LogoProps> = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl',
    xl: 'text-4xl',
  };

  return (
    <Link
      href="/"
      className={`
        w-fit 
        font-semibold 
        select-none 
        whitespace-nowrap
        bg-gradient-to-r 
        from-gray-700 
        via-gray-500 
        to-gray-300 
        bg-clip-text 
        text-transparent 
        ${sizeClasses[size]}
      `}
    >
      Electric Avenue
    </Link>
  );
};

export default Logo;
