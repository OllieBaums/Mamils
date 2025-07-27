import React from "react";

const IntroScreen = ({ onEnter }) => {
  return (
    <div
      className="h-screen bg-cover bg-center flex flex-col justify-center items-center text-white relative"
      style={{
        backgroundImage: `url('/cheems.png')`,
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60" />
      <div className="relative z-10 text-center px-6">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Happy 60th, Dad! 🎉
        </h1>
        <p className="text-xl md:text-2xl mb-6 max-w-2xl mx-auto">
          Welcome to your personal biking journal. This is a place to relive your past rides,
          share memories, and plan new adventures. Love, Ollie 💙
        </p>
        <button
          onClick={onEnter}
          className="bg-white text-black font-semibold px-6 py-3 rounded-xl shadow-lg hover:bg-gray-200 transition"
        >
          Enter Your Adventure Journal 🚴‍♂️
        </button>
      </div>
    </div>
  );
};

export default IntroScreen;
