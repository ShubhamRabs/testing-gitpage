import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

const FileUploader = () => {
  const [fileData, setFileData] = useState([]);
  const fileInputRef = useRef(null); // Reference for the file input

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Parse as JSON
        setFileData(jsonData);
      };

      reader.readAsBinaryString(file); // Read the file as binary
    }
  };

  const handleSaveToJSON = async () => {
    if (fileData.length === 0) {
      alert("No file data to save.");
      return;
    }

    const formattedData = fileData.slice(1).map((row, index) => {
      const entry = {};
      fileData[0].forEach((key, i) => {
        entry[key] = row[i] || null;
      });
      return entry;
    });

    try {
      await axios.post("http://localhost:3002/fileData", formattedData);
      alert("File data saved successfully to JSON!");

      // Reset file input and clear file data
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear the file input
      }
      setFileData([]); // Clear the file data
    } catch (error) {
      console.error("Error saving data to JSON:", error);
      alert("Failed to save data to JSON.");
    }
  };

  return (
    <div>
      <h3>Upload Excel or CSV File</h3>
      <input
        type="file"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        onChange={handleFileChange}
        ref={fileInputRef} // Attach the ref to the input
      />

      {fileData.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4>File Preview:</h4>
          <table
            border="1"
            style={{ borderCollapse: "collapse", width: "100%" }}
          >
            <thead>
              <tr>
                {fileData[0].map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fileData.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={handleSaveToJSON}
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Save to JSON
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
