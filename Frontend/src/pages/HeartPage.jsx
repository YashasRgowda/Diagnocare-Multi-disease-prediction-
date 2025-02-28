import React, { useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { FiUpload } from "react-icons/fi";
import Loader from "react-loader-spinner";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

const HeartPage = () => {
  const [formData, setFormData] = useState({
    age: "",
    sex: "",
    chestPainType: "",
    restingBloodPressure: "",
    serumCholesterol: "",
    fastingBloodSugar: "",
    restingECG: "",
    maxHeartRate: "",
    exerciseInducedAngina: "",
    oldPeak: "",
    slope: "",
    numMajorVessels: "",
    thal: "",
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
          "http://localhost:8080/api/pdf/heart-scraper",
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
          age: data.Age || "",
          sex: data.Sex || "",
          chestPainType: data["Chest pain type"] || "",
          restingBloodPressure: data["Resting blood pressure"] || "",
          serumCholesterol: data["Serum cholesterol in mg/dl"] || "",
          fastingBloodSugar:
            data["Fasting blood sugar > 120 mg/dl"] === "Yes" ? "1" : "0",
          restingECG: data["Resting Electrocardiographic Results"] || "",
          maxHeartRate: data["Maximum Heart Rate Achieved"] || "",
          exerciseInducedAngina: data["Exercise Induced Angina"] || "",
          oldPeak: data["Old peak"] || "",
          slope: data["Slope of the peak exercise ST Segment"] || "",
          numMajorVessels:
            data["Number of major vessels (0-3) colored by fluoroscopy"] || "",
          thal: data["Thal (Thallium Stress Test Result)"] || "",
        });
      } catch (error) {
        console.error("PDF upload failed:", error.message);
        setError("Failed to process PDF. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Please upload a valid PDF file.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/predict/heart-pred",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            p1: formData.age,
            p2: formData.sex,
            p3: formData.chestPainType,
            p4: formData.restingBloodPressure,
            p5: formData.serumCholesterol,
            p6: formData.fastingBloodSugar,
            p7: formData.restingECG,
            p8: formData.maxHeartRate,
            p9: formData.exerciseInducedAngina,
            p10: formData.oldPeak,
            p11: formData.slope,
            p12: formData.numMajorVessels,
            p13: formData.thal,
          }),
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
      age: "",
      sex: "",
      chestPainType: "",
      restingBloodPressure: "",
      serumCholesterol: "",
      fastingBloodSugar: "",
      restingECG: "",
      maxHeartRate: "",
      exerciseInducedAngina: "",
      oldPeak: "",
      slope: "",
      numMajorVessels: "",
      thal: "",
    });
    setPdfFile(null);
  };

  const generateDynamicPDF = async () => {
    setLoading(true);
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
        { label: "Age:", value: formData.age },
        { label: "Sex:", value: formData.sex },
        { label: "Chest Pain Type:", value: formData.chestPainType },
        {
          label: "Resting Blood Pressure:",
          value: formData.restingBloodPressure,
        },
        { label: "Serum Cholesterol:", value: formData.serumCholesterol },
        { label: "Fasting Blood Sugar:", value: formData.fastingBloodSugar },
        { label: "Resting ECG:", value: formData.restingECG },
        {
          label: "Maximum Heart Rate Achieved:",
          value: formData.maxHeartRate,
        },
        {
          label: "Exercise Induced Angina:",
          value: formData.exerciseInducedAngina,
        },
        { label: "Old Peak:", value: formData.oldPeak },
        { label: "Slope:", value: formData.slope },
        {
          label: "Number of Major Vessels (0-3):",
          value: formData.numMajorVessels,
        },
        { label: "Thal:", value: formData.thal },
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
      link.download = "Heart_Disease_Pred_Result.pdf";
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
    <div className="container mx-auto px-4 py-8 max-w-5xl bg-gradient-to-b from-red-50 to-white rounded-lg shadow-lg">
      <h1 className="text-3xl md:text-4xl text-center font-bold text-red-800 mb-6 tracking-wide">HEART DISEASE PREDICTOR</h1>
      
      {/* Loading overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${loading ? 'flex' : 'hidden'}`}
      >
        <Loader type="TailSpin" color="#FFF" height={70} width={70} />
      </div>
      
      {!showResult ? (
        <form className="bg-white p-4 md:p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              type="text"
              name="age"
              placeholder="Age"
              value={formData.age || ""}
              onChange={handleChange}
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              type="text"
              name="sex"
              placeholder="Sex (0 - female, 1 - male)"
              value={formData.sex || ""}
              onChange={handleChange}
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors col-span-1 md:col-span-2"
              type="text"
              name="chestPainType"
              placeholder="Chest Pain Type (1-Typical Angina, 2-Atypical Angina, 3-Non-anginal Pain, 4-Asymptomatic)"
              value={formData.chestPainType || ""}
              onChange={handleChange}
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              type="text"
              name="restingBloodPressure"
              placeholder="Resting Blood Pressure"
              value={formData.restingBloodPressure || ""}
              onChange={handleChange}
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              type="text"
              name="serumCholesterol"
              placeholder="Serum Cholesterol"
              value={formData.serumCholesterol || ""}
              onChange={handleChange}
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              type="text"
              name="fastingBloodSugar"
              placeholder="Fasting Blood Sugar (0 or 1)"
              value={formData.fastingBloodSugar || ""}
              onChange={handleChange}
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              type="text"
              name="restingECG"
              placeholder="Resting ECG"
              value={formData.restingECG || ""}
              onChange={handleChange}
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              type="text"
              name="maxHeartRate"
              placeholder="Maximum Heart Rate Achieved"
              value={formData.maxHeartRate || ""}
              onChange={handleChange}
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              type="text"
              name="exerciseInducedAngina"
              placeholder="Exercise Induced Angina (0 or 1)"
              value={formData.exerciseInducedAngina || ""}
              onChange={handleChange}
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              type="text"
              name="oldPeak"
              placeholder="Old Peak"
              value={formData.oldPeak || ""}
              onChange={handleChange}
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              type="text"
              name="slope"
              placeholder="Slope"
              value={formData.slope || ""}
              onChange={handleChange}
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              type="text"
              name="numMajorVessels"
              placeholder="Number of Major Vessels (0-3)"
              value={formData.numMajorVessels || ""}
              onChange={handleChange}
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              type="text"
              name="thal"
              placeholder="Thal (Thallium Stress Test Result)"
              value={formData.thal || ""}
              onChange={handleChange}
            />
          </div>
          
          <div className="flex flex-col items-center mt-6 space-y-4">
            <p className="text-gray-600 text-center">
              Don't want to type manually? Upload your report and we will do it for you
            </p>
            <label
              htmlFor="upload-report"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white font-medium rounded-md cursor-pointer hover:bg-red-600 transition-colors w-full md:w-auto"
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
              className="w-full md:w-auto px-6 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
            >
              Predict
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-2xl font-bold text-center text-red-800 mb-4">
            Prediction Result:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mb-6">
            <p className="text-gray-700"><span className="font-medium">Age:</span> {formData.age}</p>
            <p className="text-gray-700"><span className="font-medium">Sex:</span> {formData.sex === "1" ? "Male" : "Female"}</p>
            <p className="text-gray-700"><span className="font-medium">Chest Pain Type:</span> {formData.chestPainType}</p>
            <p className="text-gray-700"><span className="font-medium">Resting Blood Pressure:</span> {formData.restingBloodPressure}</p>
            <p className="text-gray-700"><span className="font-medium">Serum Cholesterol:</span> {formData.serumCholesterol}</p>
            <p className="text-gray-700"><span className="font-medium">Fasting Blood Sugar:</span> {formData.fastingBloodSugar === "1" ? "Yes" : "No"}</p>
            <p className="text-gray-700"><span className="font-medium">Resting ECG:</span> {formData.restingECG}</p>
            <p className="text-gray-700"><span className="font-medium">Maximum Heart Rate:</span> {formData.maxHeartRate}</p>
            <p className="text-gray-700"><span className="font-medium">Exercise Induced Angina:</span> {formData.exerciseInducedAngina === "1" ? "Yes" : "No"}</p>
            <p className="text-gray-700"><span className="font-medium">Old Peak:</span> {formData.oldPeak}</p>
            <p className="text-gray-700"><span className="font-medium">Slope:</span> {formData.slope}</p>
            <p className="text-gray-700"><span className="font-medium">Number of Major Vessels:</span> {formData.numMajorVessels}</p>
            <p className="text-gray-700 col-span-1 md:col-span-2"><span className="font-medium">Thal (Thallium Stress Test):</span> {formData.thal}</p>
          </div>
          
          <div className={`text-center text-xl font-bold p-4 mb-6 rounded-lg ${
            predictionResult.includes("not suffering") 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            {predictionResult}
          </div>
          
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button 
              className="px-6 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
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

export default HeartPage;