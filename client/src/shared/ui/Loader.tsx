import { Loader2 } from 'lucide-react';
import { FC } from 'react';

interface LoaderProps {
  pageLoad?: boolean;
}

const Loader: FC<LoaderProps> = ({ pageLoad }) => {
  return <Loader2 className={`animate-spin text-foreground ${pageLoad && 'flex-1'}`} size={40}/>
};

export default Loader;