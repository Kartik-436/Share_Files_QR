/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const FileThumbnail = ({ fileId, filename, mimeType }) => {
    const [thumbnailUrl, setThumbnailUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchThumbnail = async () => {
            try {
                // For binary files, we need to create a blob URL
                const response = await axios.get(
                    `https://caretoshare-backend.onrender.com/thumbnail/${fileId}`,
                    { responseType: 'blob' }
                );
                const blob = new Blob([response.data], { type: mimeType });
                const url = URL.createObjectURL(blob);
                setThumbnailUrl(url);
            } catch (error) {
                console.error('Error fetching thumbnail:', error);
                setError('Failed to load thumbnail');
            } finally {
                setLoading(false);
            }
        };

        fetchThumbnail();

        // Cleanup function to revoke object URL
        return () => {
            if (thumbnailUrl) {
                URL.revokeObjectURL(thumbnailUrl);
            }
        };
    }, [fileId, mimeType]);

    const getFileIcon = () => {
        const fileType = mimeType.split('/')[0];

        switch (fileType) {
            case 'image':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                );
            case 'video':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                        <path fillRule="evenodd" d="M10 5a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2h6z" clipRule="evenodd" />
                    </svg>
                );
            case 'audio':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
                    </svg>
                );
            case 'application':
                if (mimeType.includes('pdf')) {
                    return (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                    );
                }
            // Fall through to default for other application types
            default:
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    const renderThumbnailContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center w-full h-full">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"
                    ></motion.div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col justify-center items-center h-full">
                    {getFileIcon()}
                    <p className="text-xs text-gray-500 mt-2">Preview not available</p>
                </div>
            );
        }

        const fileType = mimeType.split('/')[0];

        if (fileType === 'image') {
            return (
                <img
                    src={thumbnailUrl}
                    alt={filename}
                    className="max-h-32 max-w-full object-contain rounded-sm"
                />
            );
        } else if (fileType === 'video') {
            return (
                <div className="flex flex-col justify-center items-center h-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs font-medium mt-1">Video Preview</p>
                </div>
            );
        } else {
            return (
                <div className="flex flex-col justify-center items-center h-full">
                    {getFileIcon()}
                    <p className="text-xs font-medium mt-1 text-center">{filename}</p>
                </div>
            );
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-3 w-40 h-40 overflow-hidden flex flex-col"
        >
            <div className="text-sm font-medium text-center text-gray-700 mb-2 truncate">
                {filename.length > 20 ? filename.substring(0, 20) + '...' : filename}
            </div>

            <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-md overflow-hidden">
                {renderThumbnailContent()}
            </div>
        </motion.div>
    );
};

export default FileThumbnail;