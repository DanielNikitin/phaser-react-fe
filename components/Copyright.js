import React from 'react';

const Copyright = () => {
  return (
    <>
      {/* sm */}
      <div className='sm:absolute sm:opacity-40 sm:bottom-4 w-full text-center sm:py-14 text-xs sm:block sm2:hidden lg:hidden md:hidden xl:hidden'>
      IN DEVELOPMENT
      </div>

      {/* sm 2 */}
      <div className='sm2:absolute sm2:opacity-40 sm2:bottom-4 w-full text-center py-14 text-xs sm2:block sm:hidden lg:hidden md:hidden xl:hidden'>
      IN DEVELOPMENT
      </div>

      {/* md */}
      <div className='md:absolute md:opacity-40 md:-bottom-2 w-full text-center py-20 text-xs md:block sm:hidden sm2:hidden lg:hidden xl:hidden'>
      IN DEVELOPMENT
      </div>

      {/* lg */}
      <div className='lg:absolute lg:opacity-40 lg:-bottom-2 w-full text-center py-20 text-xs lg:block sm:hidden sm2:hidden md:hidden xl:hidden'>
      IN DEVELOPMENT
      </div>

      {/* xl */}
      <div className='xl:absolute xl:opacity-40 xl:-bottom-2 w-full text-center py-20 text-xs lg:hidden sm:hidden sm2:hidden md:hidden xl:block'>
      IN DEVELOPMENT
      </div>
      
    </>
  );
};

export default Copyright;
