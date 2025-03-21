/* eslint-disable no-unused-vars */
// src/components/DownloadPage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const DownloadPage = () => {
    const { groupId } = useParams();
    const [fileInfo, setFileInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFileInfo = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/files/${groupId}`);
                setFileInfo(response.data);
            } catch (error) {
                console.error('Error fetching file info:', error);
                toast.error(error.message, {
                    position: "top-right",
                    theme: "dark",
                });
                setError('Files not found or have expired');
            } finally {
                setLoading(false);
            }
        };

        fetchFileInfo();
    }, [groupId]);

    const handleDownload = () => {
        window.location.href = `http://localhost:3000/download-zip/${groupId}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
                    <p className="text-gray-700">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
            >
                <h1 className="text-2xl font-bold text-center mb-6">Download Files</h1>

                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">
                        {fileInfo.files.length} {fileInfo.files.length === 1 ? 'File' : 'Files'} Available
                    </h2>

                    <ul className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                        {fileInfo.files.map((file, index) => (
                            <li key={index} className="flex items-center text-sm">
                                <div className="mr-2 text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="truncate flex-1">
                                    {file.filename}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {(file.size / 1024).toFixed(1)} KB
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
                    onClick={handleDownload}
                >
                    {fileInfo.files.length === 1 ? 'Download File' : 'Download All Files (ZIP)'}
                </motion.button>

                <p className="text-xs text-gray-500 text-center mt-4">
                    Files will be automatically deleted after 24 hours
                </p>
            </motion.div>
        </div>
    );
};

export default DownloadPage;