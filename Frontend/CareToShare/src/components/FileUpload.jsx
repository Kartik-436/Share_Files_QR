/* eslint-disable no-unused-vars */
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import FilePreviewModal from './FilePreviewModal';
import FileThumbnail from './FileThumbnail';

const UploadPage = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    const [hoveredFileId, setHoveredFileId] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            // Convert FileList to Array and add preview URLs
            const newFiles = Array.from(e.target.files).map(file => ({
                file,
                preview: URL.createObjectURL(file), // Create preview URL for all files
                id: Math.random().toString(36).substring(2, 9)
            }));
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files).map(file => ({
                file,
                preview: URL.createObjectURL(file), // Create preview URL for all files
                id: Math.random().toString(36).substring(2, 9)
            }));
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (id) => {
        // Find the file to remove
        const fileToRemove = files.find(file => file.id === id);

        // Revoke the object URL if it exists to prevent memory leaks
        if (fileToRemove && fileToRemove.preview) {
            URL.revokeObjectURL(fileToRemove.preview);
        }

        // Remove the file from the state
        setFiles(files.filter(file => file.id !== id));
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            toast.warning('Please add at least one file to upload', {
                position: "top-right",
                theme: "dark",
            });
            return;
        }

        if (files.length > 50) { // Updated from 10 to 50
            toast.warning('Maximum 50 files can be uploaded at once', { // Updated message
                position: "top-right",
                theme: "dark",
            });
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            files.forEach(fileObj => {
                formData.append('files', fileObj.file);
            });

            const response = await axios.post('https://caretoshare-backend.onrender.com/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Clean up preview URLs
            files.forEach(fileObj => {
                if (fileObj.preview) {
                    URL.revokeObjectURL(fileObj.preview);
                }
            });

            setUploadResult(response.data);
            setFiles([]);

            toast.success('Files uploaded successfully!', {
                position: "top-right",
                theme: "dark",
            });
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Upload failed, please try again', {
                position: "top-right",
                theme: "dark",
            });
        } finally {
            setUploading(false);
        }
    };

    const resetUpload = () => {
        setUploadResult(null);
        setFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
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
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2-2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    const copyLinkToClipboard = () => {
        const url = `${window.location.origin}/download/${uploadResult.groupId}`;
        navigator.clipboard.writeText(url).then(() => {
            toast.success('Link copied to clipboard!', {
                position: "top-right",
                theme: "dark",
            });
        });
    };

    const handleFilePreview = (fileObj) => {
        setPreviewFile({
            id: fileObj.id,
            filename: fileObj.file.name,
            mimeType: fileObj.file.type,
            localFile: true,  // Flag to indicate this is a local file
            previewUrl: fileObj.preview  // Pass the preview URL
        });
    };

    const closePreview = () => {
        setPreviewFile(null);
    };

    // Custom FilePreviewModal for local files
    const LocalFilePreviewModal = ({ file, onClose }) => {
        if (!file) return null;

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-lg overflow-hidden shadow-xl max-w-3xl w-full max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="font-semibold truncate">{file.filename}</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-4 flex justify-center items-center bg-gray-50 h-[60vh] overflow-auto">
                        {file.mimeType.startsWith('image/') ? (
                            <img
                                src={file.previewUrl}
                                alt={file.filename}
                                className="max-w-full max-h-full object-contain"
                            />
                        ) : file.mimeType.startsWith('video/') ? (
                            <video
                                src={file.previewUrl}
                                controls
                                className="max-w-full max-h-full"
                            >
                                Your browser does not support the video tag.
                            </video>
                        ) : file.mimeType.startsWith('audio/') ? (
                            <audio
                                src={file.previewUrl}
                                controls
                                className="w-full"
                            >
                                Your browser does not support the audio tag.
                            </audio>
                        ) : file.mimeType === 'application/pdf' ? (
                            <iframe
                                src={file.previewUrl}
                                className="w-full h-full"
                                title={file.filename}
                            />
                        ) : (
                            <div className="text-center p-6">
                                <div className="text-4xl mb-4">{getFileTypeIcon(file.mimeType)}</div>
                                <p className="text-gray-600">Preview not available for this file type</p>
                                <p className="text-sm text-gray-500 mt-2">{file.mimeType}</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    return (
        <div className="flex justify-center items-center min-h-[50vh] bg-gray-100 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
            >
                <h1 className="text-2xl font-bold text-center mb-6">Share Files</h1>

                {!uploadResult ? (
                    <>
                        <div
                            className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                                }`}
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="hidden"
                                multiple
                                ref={fileInputRef}
                            />

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="mb-2 bg-blue-500 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-600 transition-colors"
                                    type="button"
                                >
                                    Select Files
                                </button>
                            </motion.div>

                            <p className="text-gray-500 text-sm mt-2">
                                or drag and drop files here<br />
                                <span className="text-xs">(Maximum 50 files, 10MB each)</span> {/* Updated from 10 to 20 */}
                            </p>
                        </div>

                        {files.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-2">
                                    {files.length} {files.length === 1 ? 'File' : 'Files'} Selected
                                </h2>

                                {/* Updated to have a fixed height with scroll if needed */}
                                <div className="mb-4 overflow-hidden">
                                    <ul className="space-y-2 max-h-60 overflow-y-auto pr-1 pb-1">
                                        <AnimatePresence>
                                            {files.map((fileObj) => (
                                                <motion.li
                                                    key={fileObj.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="flex items-center text-sm p-2 rounded-md hover:bg-gray-50 group relative"
                                                    onMouseEnter={() => setHoveredFileId(fileObj.id)}
                                                    onMouseLeave={() => setHoveredFileId(null)}
                                                >
                                                    <div className="mr-2 text-gray-500">
                                                        {getFileTypeIcon(fileObj.file.type)}
                                                    </div>
                                                    <div
                                                        className="truncate flex-1 cursor-pointer hover:text-blue-500 transition-colors"
                                                        onClick={() => handleFilePreview(fileObj)}
                                                    >
                                                        {fileObj.file.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mx-2">
                                                        {(fileObj.file.size / 1024).toFixed(1)} KB
                                                    </div>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => removeFile(fileObj.id)}
                                                        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                        </svg>
                                                    </motion.button>

                                                    {/* Thumbnail popup on hover - Always show for any file type */}
                                                    {hoveredFileId === fileObj.id && (
                                                        <div className="absolute left-0 -top-24 z-10">
                                                            <div className="bg-white rounded-lg shadow-xl p-2 border">
                                                                {fileObj.file.type.startsWith('image/') ? (
                                                                    <img
                                                                        src={fileObj.preview}
                                                                        alt={fileObj.file.name}
                                                                        className="max-h-20 max-w-full object-contain"
                                                                    />
                                                                ) : (
                                                                    <div className="w-32 h-20 flex items-center justify-center">
                                                                        <div className="text-center">
                                                                            {getFileTypeIcon(fileObj.file.type)}
                                                                            <p className="text-xs mt-1 truncate max-w-full">
                                                                                {fileObj.file.name}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.li>
                                            ))}
                                        </AnimatePresence>
                                    </ul>
                                </div>
                            </div>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: "#2563eb" }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 bg-blue-500 text-white font-medium rounded-lg transition-colors shadow-sm flex items-center justify-center space-x-2 mt-4"
                            onClick={handleUpload}
                            disabled={uploading || files.length === 0}
                        >
                            {uploading ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="rounded-full h-5 w-5 border-2 border-t-transparent border-white"
                                    ></motion.div>
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Upload {files.length > 0 ? `${files.length} Files` : 'Files'}</span>
                                </>
                            )}
                        </motion.button>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                    >
                        <div className="mb-6 flex justify-center">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, type: "spring" }}
                                className="bg-green-100 text-green-700 rounded-full p-4 inline-block"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </motion.div>
                        </div>

                        <h2 className="text-xl font-bold mb-4 text-green-700">Files Uploaded Successfully!</h2>

                        <p className="mb-6 text-gray-600">
                            {uploadResult.filesCount} {uploadResult.filesCount === 1 ? 'file' : 'files'} ready to share
                        </p>

                        <div className="mb-6">
                            <img
                                src={uploadResult.qrCode}
                                alt="QR Code"
                                className="mx-auto w-48 h-48 border p-2"
                            />
                            <p className="text-sm text-gray-500 mt-2">Scan to download</p>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm font-medium mb-2">Or share this link:</p>
                            <div className="flex">
                                <input
                                    type="text"
                                    value={`${window.location.origin}/download/${uploadResult.groupId}`}
                                    readOnly
                                    className="flex-1 p-2 border rounded-l-md text-sm bg-gray-50"
                                />
                                <motion.button
                                    whileHover={{ backgroundColor: "#2563eb" }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-blue-500 text-white px-3 py-2 rounded-r-md"
                                    onClick={copyLinkToClipboard}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                    </svg>
                                </motion.button>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors shadow-sm hover:bg-gray-300"
                            onClick={resetUpload}
                        >
                            Upload More Files
                        </motion.button>

                        <p className="text-xs text-gray-500 mt-4">
                            Files will be automatically deleted after 24 hours
                        </p>
                    </motion.div>
                )}
            </motion.div>

            {/* File Preview Modal - Different handling for local vs server files */}
            <AnimatePresence>
                {previewFile && previewFile.localFile ? (
                    <LocalFilePreviewModal
                        file={previewFile}
                        onClose={closePreview}
                    />
                ) : previewFile && (
                    <FilePreviewModal
                        fileId={previewFile.id}
                        filename={previewFile.filename}
                        mimeType={previewFile.mimeType}
                        onClose={closePreview}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default UploadPage;