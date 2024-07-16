// fonts
import { Sora, Roboto, Copse } from '@next/font/google';

// font settings
const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  weight: ['100', '300', '400', '500', '700'],
});

const Layout = ({ children }) => {
  return (
    
// <Header />
<div className={`page bg-test_c text-white bg-cover bg-no-repeat
                           ${roboto.variable} font-roboto relative`}>
      {children}
    </div>
  );
};

export default Layout;
