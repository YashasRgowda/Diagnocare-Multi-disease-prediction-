import React, { useState } from "react";
import { FiUpload } from "react-icons/fi";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { TailSpin } from "react-loader-spinner";

const BreastPage = () => {
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
        "http://localhost:8080/api/v1/predict/breast-pred",
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
        {
          label: "Gender:",
          value: formData.gender === "M" ? "Male" : "Female",
          size: 14,
        },
        {
          label: "Prediction Result:",
          value: predictionResult.includes("not suffering")
            ? "The person is not suffering from Breast Cancer."
            : "The person is suffering from Breast Cancer.",
          size: 16,
        },
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
      link.download = "breast_cancer_report.pdf";
      link.click();

      setError("");
    } catch (error) {
      console.error("Failed to generate PDF:", error.message);
      setError("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4 sm:px-6 md:py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-4 px-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">
            BREAST CANCER PREDICTOR
          </h1>
        </div>
        
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <TailSpin color="#FFF" height={70} width={70} />
          </div>
        )}
        
        <div className="p-4 sm:p-6 md:p-8">
          {!showResult ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div className="col-span-1">
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  />
                </div>
                <div className="col-span-1">
                  <input
                    type="text"
                    name="age"
                    placeholder="Age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  />
                </div>
                <div className="col-span-1 sm:col-span-2 md:col-span-1">
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 border-t border-gray-200 pt-6">
                <p className="text-center text-gray-700 mb-4">
                  Upload your breast X-ray image for prediction
                </p>
                <div className="flex flex-col items-center">
                  <label
                    htmlFor="upload-image"
                    className="flex items-center justify-center w-full sm:w-64 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 cursor-pointer"
                  >
                    <FiUpload className="mr-2" size={20} />
                    Upload Image
                    {imageUploaded && (
                      <span className="ml-2 text-green-300">✓</span>
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
                  
                  <button
                    type="submit"
                    className="mt-6 w-full sm:w-64 px-6 py-3 bg-blue-700 text-white font-semibold rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 disabled:opacity-50"
                    disabled={loading}
                  >
                    Predict
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                Prediction Result:
              </h2>
              
              <div className="space-y-2 mb-6">
                <p className="text-gray-700"><span className="font-semibold">Name:</span> {formData.name}</p>
                <p className="text-gray-700"><span className="font-semibold">Age:</span> {formData.age}</p>
                <p className="text-gray-700">
                  <span className="font-semibold">Gender:</span> {formData.gender === "M" ? "Male" : "Female"}
                </p>
                
                <div className={`p-4 mt-4 rounded-md ${
                  predictionResult.includes("not suffering")
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  <p className="text-lg font-medium">
                    {predictionResult.includes("not suffering")
                      ? "The person is not suffering from Breast Cancer."
                      : "The person is suffering from Breast Cancer."}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button
                  onClick={generateDynamicPDF}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
                >
                  Download Report
                </button>
                <button
                  onClick={handleRePredict}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-300"
                >
                  Predict Again
                </button>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreastPage;