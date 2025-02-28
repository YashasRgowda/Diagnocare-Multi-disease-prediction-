import React, { useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { FiUpload } from "react-icons/fi";
import Loader from "react-loader-spinner";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

const DiabetesPage = () => {
  const [formData, setFormData] = useState({
    pregnancies: "",
    glucose: "",
    bloodPressure: "",
    skinThickness: "",
    insulin: "",
    bmi: "",
    diabetesPedigreeFunction: "",
    age: "",
  });
  const [predictionResult, setPredictionResult] = useState("");
  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUploadReport = async (e) => {
    setLoading(true);
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      console.log("PDF file uploaded:", file);

      const formData = new FormData();
      formData.append("pdfFile", file);

      try {
        const response = await fetch(
          "http://localhost:8080/api/pdf/diabetes-scraper",
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("PDF upload request failed.");
        }
        const data = await response.json();
        console.log("Data from server:", data);

        setFormData({
          pregnancies: data.Pregnancies || "",
          glucose: data.Glucose || "",
          bloodPressure: data.BloodPressure || "",
          skinThickness: data.SkinThickness || "",
          insulin: data.Insulin || "",
          bmi: data.BMI || "",
          diabetesPedigreeFunction: data.DiabetesPedigreeFunction || "",
          age: data.Age || "",
        });
      } catch (error) {
        console.error("PDF upload failed:", error.message);
        setError("Failed to process PDF. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Please upload a valid PDF file.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/predict/diabetes-pred",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Prediction request failed.");
      }
      const data = await response.json();
      setPredictionResult(data.result);
      setError("");
      setShowResult(true);
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
      pregnancies: "",
      glucose: "",
      bloodPressure: "",
      skinThickness: "",
      insulin: "",
      bmi: "",
      diabetesPedigreeFunction: "",
      age: "",
    });
    setPdfFile(null);
  };

  const generateDynamicPDF = async () => {
    try {
      setLoading(true);

      const existingPdfBytes = await fetch(
        "/src/ReportTemplate/Report.pdf"
      ).then((res) => res.arrayBuffer());

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      const fields = [
        { label: "Number of Pregnancies:", value: formData.pregnancies },
        { label: "Glucose Level:", value: formData.glucose },
        { label: "Blood Pressure:", value: formData.bloodPressure },
        { label: "Skin Thickness:", value: formData.skinThickness },
        { label: "Insulin:", value: formData.insulin },
        { label: "BMI (Body Index Mass):", value: formData.bmi },
        {
          label: "Diabetes Pedigree Function:",
          value: formData.diabetesPedigreeFunction,
        },
        { label: "Age:", value: formData.age },
        { label: "Prediction Result:", value: predictionResult },
      ];

      let yOffset = height - 250;
      const lineHeight = 20;

      fields.forEach(({ label, value }) => {
        firstPage.drawText(`${label} ${value}`, {
          x: 50,
          y: yOffset,
          size: 12,
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
      link.download = "Diabetes_Pred_Result.pdf";
      link.click();

      setError("");
    } catch (error) {
      console.error("Failed to generate PDF:", error.message);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl bg-gradient-to-b from-blue-50 to-white rounded-lg shadow-lg">
      <h1 className="text-3xl md:text-4xl text-center font-bold text-blue-800 mb-6 tracking-wide">DIABETES PREDICTOR</h1>
      
      {/* Loading overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${loading ? 'flex' : 'hidden'}`}
      >
        <Loader type="TailSpin" color="#FFF" height={70} width={70} />
      </div>
      
      {!showResult ? (
        <form className="bg-white p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              type="text"
              name="pregnancies"
              placeholder="Number of Pregnancies"
              value={formData.pregnancies || ""}
              onChange={handleChange}
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              type="text"
              name="glucose"
              placeholder="Glucose Level"
              value={formData.glucose || ""}
              onChange={handleChange}
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              type="text"
              name="bloodPressure"
              placeholder="Blood Pressure"
              value={formData.bloodPressure || ""}
              onChange={handleChange}
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              type="text"
              name="skinThickness"
              placeholder="Skin Thickness"
              value={formData.skinThickness || ""}
              onChange={handleChange}
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              type="text"
              name="insulin"
              placeholder="Insulin"
              value={formData.insulin || ""}
              onChange={handleChange}
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              type="text"
              name="bmi"
              placeholder="BMI (Body Index Mass)"
              value={formData.bmi || ""}
              onChange={handleChange}
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              type="text"
              name="diabetesPedigreeFunction"
              placeholder="Diabetes Pedigree Function"
              value={formData.diabetesPedigreeFunction || ""}
              onChange={handleChange}
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              type="text"
              name="age"
              placeholder="Age"
              value={formData.age || ""}
              onChange={handleChange}
            />
          </div>
          
          <div className="flex flex-col items-center mt-6 space-y-4">
            <p className="text-gray-600 text-center">
              Don't want to type manually? Upload your report and we will do it for you
            </p>
            <label
              htmlFor="upload-report"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 text-white font-medium rounded-md cursor-pointer hover:bg-teal-600 transition-colors w-full md:w-auto"
            >
              <FiUpload className="text-xl" /> Upload Report
              <input
                id="upload-report"
                type="file"
                accept="application/pdf"
                onChange={handleUploadReport}
                className="hidden"
              />
            </label>
            <button 
              type="submit" 
              className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Predict
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-2xl font-bold text-center text-blue-800 mb-4">
            Prediction Result:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mb-6">
            <p className="text-gray-700"><span className="font-medium">Number of Pregnancies:</span> {formData.pregnancies}</p>
            <p className="text-gray-700"><span className="font-medium">Glucose Level:</span> {formData.glucose}</p>
            <p className="text-gray-700"><span className="font-medium">Blood Pressure:</span> {formData.bloodPressure}</p>
            <p className="text-gray-700"><span className="font-medium">Skin Thickness:</span> {formData.skinThickness}</p>
            <p className="text-gray-700"><span className="font-medium">Insulin:</span> {formData.insulin}</p>
            <p className="text-gray-700"><span className="font-medium">BMI (Body Index Mass):</span> {formData.bmi}</p>
            <p className="text-gray-700"><span className="font-medium">Diabetes Pedigree Function:</span> {formData.diabetesPedigreeFunction}</p>
            <p className="text-gray-700"><span className="font-medium">Age:</span> {formData.age}</p>
          </div>
          
          <div className={`text-center text-xl font-bold p-4 mb-6 rounded-lg ${
            predictionResult.includes("not") 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            {predictionResult}
          </div>
          
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button 
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
              onClick={generateDynamicPDF}
            >
              Download Report
            </button>
            <button 
              className="px-6 py-3 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 transition-colors"
              onClick={handleRePredict}
            >
              Re-predict
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default DiabetesPage;