import React from "react";
import { Link } from "react-router-dom";
import homepageImage from "../assets/homepage.png";

function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-12 px-4 md:py-20 md:px-6 lg:py-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-12">
        
        {/* Hero Content */}
        <div className="text-center md:text-left md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 leading-tight">
            An AI Multi-Disease Diagnostic Suite
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto md:mx-0">
            Revolutionizing Healthcare: Comprehensive, Rapid AI Diagnostics Suite
            for Accurate Multi-Disease Detection and Prevention.
          </p>
          <Link to="/predictors" className="inline-block">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-lg">
              Diagnose Now
            </button>
          </Link>
        </div>
        
        {/* Hero Image */}
        <div className="md:w-1/2">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img 
              src={homepageImage} 
              alt="AI Multi-Disease Diagnostic Suite" 
              className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
        
      </div>
    </section>
  );
}

export default Hero;