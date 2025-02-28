import React, { useState } from "react";
import { FiUpload } from "react-icons/fi";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import Loader from "react-loader-spinner"; 
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

const LungPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
  });
  const [predictionResult, setPredictionResult] = useState("");
  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUploadImage = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImageUploaded(true);
      setError("");
    } else {
      setError("Please upload a valid image file.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setError("Please upload an image file.");
      return;
    }

    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("image", imageFile);
    formDataToSend.append("name", formData.name);
    formDataToSend.append("age", formData.age);
    formDataToSend.append("gender", formData.gender);

    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/predict/lung-pred",
        {
          method: "POST",
          body: formDataToSend,
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Prediction request failed.");
      }

      const data = await response.json();

      if (data.prediction) {
        setPredictionResult(data.prediction);
        setError("");
        setShowResult(true);
      } else {
        throw new Error("Prediction failed.");
      }
    } catch (error) {
      console.error("Prediction failed:", error.message);
      setError("Failed to predict. Please try again.");
      setPredictionResult("");
      setShowResult(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRePredict = () => {
    setShowResult(false);
    setPredictionResult("");
    setFormData({
      name: "",
      age: "",
      gender: "",
    });
    setImageFile(null);
    setImageUploaded(false);
  };

  const generateDynamicPDF = async () => {
    try {
      const existingPdfBytes = await fetch(
        "/src/ReportTemplate/Report.pdf"
      ).then((res) => res.arrayBuffer());

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      const fields = [
        { label: "Name:", value: formData.name, size: 14 },
        { label: "Age:", value: formData.age, size: 14 },
        { label: "Gender:", value: formData.gender, size: 14 },
        { label: "Prediction Result:", value: predictionResult, size: 16 },
      ];

      let yOffset = height - 250;
      const lineHeight = 24;

      fields.forEach(({ label, value, size }) => {
        firstPage.drawText(`${label} ${value}`, {
          x: 50,
          y: yOffset,
          size: size,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        yOffset -= lineHeight;
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "lung_disease_report.pdf";
      link.click();

      setError("");
    } catch (error) {
      console.error("Failed to generate PDF:", error.message);
      setError("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-teal-700 mb-8">
        LUNG CANCER PREDICTOR
      </h1>
      
      {/* Loading Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 ${
          loading ? "block" : "hidden"
        }`}
      >
        <Loader type="TailSpin" color="#FFF" height={70} width={70} />
      </div>
      
      {!showResult ? (
        <form 
          className="bg-white rounded-lg shadow-lg p-6 md:p-8"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4 mb-6">
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              type="text"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
              required
            />
            <select
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-white"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
          
          <div className="text-center space-y-6">
            <p className="text-gray-700">Upload your C.T Scanned image of Lungs for prediction</p>
            
            <div className="flex justify-center">
              <label 
                htmlFor="upload-image" 
                className="flex items-center justify-center px-6 py-3 border border-teal-500 text-teal-600 rounded-lg cursor-pointer hover:bg-teal-50 transition duration-300"
              >
                <FiUpload className="mr-2" /> 
                Upload Image
                {imageUploaded && (
                  <span className="ml-2 text-green-500">✔</span>
                )}
                <input
                  id="upload-image"
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                  className="hidden"
                  required
                />
              </label>
            </div>
            
            <button
              type="submit"
              className="w-full md:w-1/2 bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Predict
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 text-center">
          <p className="text-2xl font-bold mb-4 text-teal-700">
            Prediction Result:
          </p>
          <div className="space-y-2 mb-6 text-lg">
            <p className="text-gray-700"><span className="font-medium">Name:</span> {formData.name}</p>
            <p className="text-gray-700"><span className="font-medium">Age:</span> {formData.age}</p>
            <p className="text-gray-700"><span className="font-medium">Gender:</span> {formData.gender === "M" ? "Male" : "Female"}</p>
            <p className={`text-xl font-medium p-4 rounded-md ${
              predictionResult.includes("not suffering")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}>
              {predictionResult}
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-center">
            <button 
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
              onClick={handleRePredict}
            >
              Re-predict
            </button>
            <button 
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
              onClick={generateDynamicPDF}
            >
              Download Report
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <p className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-md">
          {error}
        </p>
      )}
    </div>
  );
};

export default LungPage;