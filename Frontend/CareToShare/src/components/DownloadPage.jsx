/* eslint-disable no-unused-vars */
// src/components/DownloadPage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import FilePreviewModal from './FilePreviewModal';
import FileThumbnail from './FileThumbnail';

const DownloadPage = () => {
    const { groupId } = useParams();
    const [fileInfo, setFileInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchFileInfo = async () => {
            try {
                const response = await axios.get(`https://caretoshare-backend.onrender.com/files/${groupId}`);
                setFileInfo(response.data);
            } catch (error) {
                console.error('Error fetching file info:', error);
                toast.error(error.response?.data?.message || error.message, {
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
        window.location.href = `https://caretoshare-backend.onrender.com/download-zip/${groupId}`;
    };

    const openPreviewModal = (file) => {
        setSelectedFile(file);
        setShowModal(true);
    };

    const getFileTypeIcon = (mimeType) => {
        const fileType = mimeType.split('/')[0];

        switch (fileType) {
            case 'image':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                );
            case 'video':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                        <path fillRule="evenodd" d="M10 5a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2h6z" clipRule="evenodd" />
                    </svg>
                );
            case 'audio':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
                    </svg>
                );
            case 'application':
                if (mimeType.includes('pdf')) {
                    return (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                    );
                }
            // Fall through to default for other application types
            default:
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
                ></motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center"
                >
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
                    <p className="text-gray-700">{error}</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <AnimatePresence>
                {showModal && selectedFile && (
                    <FilePreviewModal
                        fileId={selectedFile.fileId}
                        filename={selectedFile.filename}
                        mimeType={selectedFile.type}
                        onClose={() => setShowModal(false)}
                    />
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
            >
                <h1 className="text-2xl font-bold text-center mb-6">Download Files</h1>

                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">
                        {fileInfo.files.length} {fileInfo.files.length === 1 ? 'File' : 'Files'} Available
                    </h2>

                    <ul className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                        {fileInfo.files.map((file, index) => (
                            <motion.li
                                key={index}
                                className="flex items-center text-sm p-2 rounded-md hover:bg-gray-50 cursor-pointer relative group transition-all duration-200 overflow-y-visible"
                                whileHover={{ backgroundColor: "#f9fafb", x: 3 }}
                                onClick={() => openPreviewModal(file)}
                            >
                                <div className="mr-2 text-gray-500">
                                    {getFileTypeIcon(file.type)}
                                </div>
                                <div className="truncate flex-1 font-medium">
                                    {file.filename}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {(file.size / 1024).toFixed(1)} KB
                                </div>

                                {/* Thumbnail preview on hover */}
                                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 bottom-full left-0 mb-2 pointer-events-none overflow-visible">
                                    <FileThumbnail fileId={file.fileId} filename={file.filename} mimeType={file.type} />
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "#2563eb" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-blue-500 text-white font-medium rounded-lg transition-colors shadow-sm flex items-center justify-center space-x-2"
                    onClick={handleDownload}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>{fileInfo.files.length === 1 ? 'Download File' : 'Download All Files (ZIP)'}</span>
                </motion.button>

                <p className="text-xs text-gray-500 text-center mt-4">
                    Files will be automatically deleted after 24 hours
                </p>
            </motion.div>
        </div>
    );
};

export default DownloadPage;