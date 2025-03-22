/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';

const FilePreviewModal = ({ fileId, filename, mimeType, onClose }) => {
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPreview = async () => {
            try {
                // For binary files, we need to create a blob URL
                const response = await axios.get(
                    `https://caretoshare-backend.onrender.com/preview/${fileId}`,
                    { responseType: 'blob' }
                );
                const blob = new Blob([response.data], { type: mimeType });
                const url = URL.createObjectURL(blob);
                setPreviewUrl(url);
            } catch (error) {
                console.error('Error fetching preview:', error);
                setError('Failed to load preview');
            } finally {
                setLoading(false);
            }
        };

        fetchPreview();

        // Cleanup function to revoke object URL
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [fileId, mimeType]);

    const renderPreviewContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-64">
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
                <div className="flex justify-center items-center h-64">
                    <p className="text-red-500">{error}</p>
                </div>
            );
        }

        const fileType = mimeType.split('/')[0];

        switch (fileType) {
            case 'image':
                return (
                    <img
                        src={previewUrl}
                        alt={filename}
                        className="max-h-[70vh] max-w-full object-contain rounded-md"
                    />
                );
            case 'video':
                return (
                    <video
                        src={previewUrl}
                        controls
                        className="max-h-[70vh] max-w-full rounded-md"
                    >
                        Your browser does not support the video tag.
                    </video>
                );
            case 'audio':
                return (
                    <div className="flex flex-col items-center justify-center py-8">
                        <audio src={previewUrl} controls className="w-full">
                            Your browser does not support the audio tag.
                        </audio>
                        <div className="mt-4 text-center">
                            <h3 className="text-lg font-medium">{filename}</h3>
                            <p className="text-gray-500 text-sm">Audio File</p>
                        </div>
                    </div>
                );
            case 'application':
                if (mimeType === 'application/pdf') {
                    return (
                        <iframe
                            src={previewUrl}
                            className="w-full h-[70vh] rounded-md"
                            title={filename}
                        ></iframe>
                    );
                }
            // Fall through to default for other application types
            default:
                return (
                    <div className="flex flex-col items-center justify-center py-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="mt-4 text-center">
                            <h3 className="text-lg font-medium">{filename}</h3>
                            <p className="text-gray-500 text-sm">This file type cannot be previewed</p>
                            <a
                                href={`https://caretoshare-backend.onrender.com/preview/${fileId}`}
                                download={filename}
                                className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                            >
                                Download to view
                            </a>
                        </div>
                    </div>
                );
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl w-full max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-medium truncate">{filename}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 overflow-auto">
                    {renderPreviewContent()}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default FilePreviewModal;