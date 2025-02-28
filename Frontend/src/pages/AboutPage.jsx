import React, { useState, useEffect } from "react";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import Modal from "react-modal";

// You'll need to replace this with your actual image path
import yashas from "../assets/AboutImg/yashas.jpg";

// Define team member (only you)
const teamMember = {
  imgUrl: yashas,
  name: "Yashas R",
  position: "Full Stack & ML Developer",
  linkedin: "https://www.linkedin.com/in/yashas-r-gowda/",
  github: "https://github.com/YashasRgowda",
  instagram: "https://www.instagram.com/its_yash_himself/",
};

Modal.setAppElement("#root");

function AboutPage() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener("resize", handleResize);
    
    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const openModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalIsOpen(true);
    setTimeout(() => {
      const modalContent = document.querySelector(".ReactModal__Content");
      if (modalContent) {
        modalContent.style.opacity = 1;
        modalContent.style.transform = "translate(-50%, -50%) scale(1)";
      }
    }, 1);
  };

  const closeModal = () => {
    const modalContent = document.querySelector(".ReactModal__Content");
    if (modalContent) {
      modalContent.style.opacity = 0;
      modalContent.style.transform = "translate(-50%, -50%) scale(0.8)";
    }
    setTimeout(() => {
      setModalIsOpen(false);
      setSelectedImage("");
    }, 500);
  };

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h6 className="text-xs sm:text-sm font-medium text-blue-600 mb-1 sm:mb-2">Hello World</h6>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
            About <span className="text-blue-700">Me</span>
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-blue-600 mx-auto mt-3 sm:mt-4 rounded-full"></div>
        </div>

        <div className="flex justify-center">
          <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden max-w-md">
            <div className="relative overflow-hidden">
              <img
                src={teamMember.imgUrl}
                alt={teamMember.name}
                onClick={() => openModal(teamMember.imgUrl)}
                className="w-full h-64 sm:h-72 md:h-80 object-cover object-center cursor-pointer transition duration-300 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="p-6 sm:p-7 md:p-8">
              <h4 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">{teamMember.name}</h4>
              <p className="text-blue-600 text-sm sm:text-base mb-4 sm:mb-5">{teamMember.position}</p>
              <p className="text-gray-600 mb-5">Passionate about creating innovative solutions using cutting-edge technologies. Specialized in both frontend and backend development with expertise in machine learning applications.</p>
              <div className="flex space-x-4 sm:space-x-5 pt-3 border-t border-gray-100">
                <a
                  href={teamMember.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-700 transition-colors duration-300"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
                <a
                  href={teamMember.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-300"
                  aria-label="GitHub"
                >
                  <FaGithub className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
                <a
                  href={teamMember.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-pink-600 transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <FaInstagram className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%) scale(0.9)",
            maxWidth: isMobile ? "95%" : "90%",
            maxHeight: isMobile ? "80%" : "90%",
            overflow: "hidden",
            padding: 0,
            border: "none",
            borderRadius: "0.5rem",
            transition: "opacity 0.5s ease, transform 0.5s ease",
            opacity: 0,
            backgroundColor: "white",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            transition: "opacity 0.5s ease",
            zIndex: 1000,
          },
        }}
        contentLabel="Enlarged Image"
      >
        <div className="relative">
          <img 
            src={selectedImage} 
            alt="Enlarged view" 
            className="max-w-full max-h-screen object-contain"
          />
          <button
            onClick={closeModal}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white rounded-full p-1 sm:p-2 shadow-md hover:bg-gray-100 transition-colors duration-300"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </Modal>
    </section>
  );
}

export default AboutPage;