import Logo from '~/shared/ui/Logo';
import { Button } from '~/shared/components/ui/button';
import { Mail, Search, User } from 'lucide-react';
import { Input } from '~/shared/components/ui/input';
import Category from '~/features/CategoryMenu/ui/Category';

const Header = () => {
  const isAuth = true;

  return (
    <header className="bg-white p-2 rounded-xl shadow-md mt-2">
      <div className="flex items-center justify-around gap-4">
        <div className="flex items-center gap-2">
          <Logo size="small" />
          <Category />
        </div>
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            className="pl-10"
          />
        </div>
        {isAuth ? (
          <div className="flex gap-1">
            <Button size="icon" variant="link"><Mail className="color-primary" /></Button>
            <Button size="icon" variant="link"><User /></Button>
          </div>
        ) : (
          <Button>Login</Button>
        )}
      </div>
    </header>
  );
};

export default Header;
