/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FileUpload from './components/FileUpload';
import QRDisplay from './components/QRDisplay';
import DownloadPage from './components/DownloadPage'; // Import DownloadPage
import { motion } from 'framer-motion';
import { ToastContainer } from "react-toastify";

function App() {
  const [uploadState, setUploadState] = useState({
    isUploaded: false,
    qrCode: null,
    groupId: null,
    filesCount: 0
  });

  return (
    <motion.div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">

      <ToastContainer />

      <Routes>
        {/* Home Route - File Upload */}
        <Route path="/" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white rounded-lg shadow-lg p-6"
          >
            <h1 className="text-2xl font-bold text-center mb-6">
              File Sharing with QR Code
            </h1>

            {!uploadState.isUploaded ? (
              <FileUpload setUploadState={setUploadState} />
            ) : (
              <QRDisplay
                qrCode={uploadState.qrCode}
                filesCount={uploadState.filesCount}
                groupId={uploadState.groupId}
              />
            )}
          </motion.div>
        } />

        {/* Download Page Route */}
        <Route path="/download/:groupId" element={<DownloadPage />} />
      </Routes>
    </motion.div>
  );
}

export default App;
