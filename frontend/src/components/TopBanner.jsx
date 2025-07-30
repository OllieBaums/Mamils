import React from "react";

const HeroBanner = () => {
  return (
    <section
      className="h-screen md:h-[50vh] bg-cover bg-center relative text-white"
      style={{
        backgroundImage: `url('/The Rockies.jpg')`,
      }}
    >
      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Happy 60th Birthday, Dad! 🎉
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            This app is your personal biking adventure journal – a place to look back on your rides, remember great moments, and plan new ones. Love from Ollie 🚴‍♂️💙
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
