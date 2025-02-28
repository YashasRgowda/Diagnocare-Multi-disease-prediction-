import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import heartImage from "../assets/heart.png";
import lungImage from "../assets/lung.png";
import diabetesImage from "../assets/diabetes.png";
import breastImage from "../assets/breast.png";
import { UserContext } from "../context/UserContext";

// Tailwind Card Component
const Card = ({ image, title, description }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden h-full transition-transform duration-300 hover:shadow-lg hover:scale-105">
      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-center mb-4">
          <img src={image} alt={title} className="h-32 w-32 object-contain" />
        </div>
        <h3 className="text-xl font-bold text-teal-700 mb-2 text-center">{title}</h3>
        <p className="text-gray-600 text-center flex-grow">{description}</p>
      </div>
    </div>
  );
};

function PredictorsPage() {
  const { userInfo } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLinkClick = (path) => {
    if (userInfo) {
      navigate(path);
    } else {
      toast.info("Please log in to access this predictor.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <ToastContainer />
      <div className="bg-teal-50 rounded-xl shadow-md p-6 mb-10">
        <p className="text-gray-700 leading-relaxed text-center md:text-lg">
          The Comprehensive Health Diagnostics Suite utilizes advanced AI
          technology for early detection and precise prediction of breast cancer,
          lung cancer, heart disease, and diabetes. By leveraging sophisticated
          algorithms and extensive datasets, our system identifies these
          conditions early, enabling timely interventions and personalized
          treatments. Our mission is to transform healthcare into a predictive and
          personalized experience, fostering a healthier future for all by
          reducing the burden of these diseases and enhancing quality of life.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          onClick={() => handleLinkClick("/predictors/heart")}
          className="cursor-pointer"
        >
          <Card
            image={heartImage}
            title="Heart Disease"
            description="Guarding Hearts: AI solutions for accurate prediction and early intervention in heart disease."
          />
        </div>
        
        <div 
          onClick={() => handleLinkClick("/predictors/lung")}
          className="cursor-pointer"
        >
          <Card
            image={lungImage}
            title="Lung Cancer"
            description="Clearing the Air: AI-driven insights for proactive lung cancer prediction and care."
          />
        </div>
        
        <div 
          onClick={() => handleLinkClick("/predictors/breast")}
          className="cursor-pointer"
        >
          <Card
            image={breastImage}
            title="Breast Cancer"
            description="Beyond Detection: AI innovation for early, precise breast cancer prediction and care."
          />
        </div>
        
        <div 
          onClick={() => handleLinkClick("/predictors/diabetes")}
          className="cursor-pointer"
        >
          <Card
            image={diabetesImage}
            title="Diabetes"
            description="Empowering Health: AI solutions for precise diabetes prediction and proactive wellness."
          />
        </div>
      </div>
    </div>
  );
}

export default PredictorsPage;