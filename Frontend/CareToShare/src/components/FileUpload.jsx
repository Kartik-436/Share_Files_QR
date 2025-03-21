/* eslint-disable no-unused-vars */
// src/components/FileUpload.jsx
import { useState, useRef } from 'react';
import { gsap } from 'gsap';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const FileUpload = ({ setUploadState }) => {
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles(droppedFiles);
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setIsUploading(true);

        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            const progressTl = gsap.timeline();
            progressTl.to({ value: 0 }, {
                value: 90,
                duration: 2,
                ease: "power2.out",
                onUpdate: function () {
                    setUploadProgress(this.targets()[0].value);
                }
            });

            const response = await axios.post('http://localhost:3000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            progressTl.to({ value: 90 }, {
                value: 100,
                duration: 0.5,
                ease: "power2.out",
                onUpdate: function () {
                    setUploadProgress(this.targets()[0].value);
                }
            });

            if (response.data.success) {
                setUploadState({
                    isUploaded: true,
                    qrCode: response.data.qrCode,
                    groupId: response.data.groupId,
                    filesCount: response.data.filesCount
                });
            }
            else {
                toast.error(response.data.message, {
                    position: "top-right",
                    theme: "dark",
                });
            }
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error(error.message, {
                position: "top-right",
                theme: "dark",
            });
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full">
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                />

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <div className="text-gray-500 mb-2">
                        Drag & drop files or click to browse
                    </div>
                    <div className="text-sm text-gray-400">
                        Upload up to 10 files (max 50MB each)
                    </div>
                </motion.div>
            </div>

            {files.length > 0 && (
                <div className="mb-4">
                    <div className="text-sm font-medium mb-2">
                        {files.length} {files.length === 1 ? 'file' : 'files'} selected
                    </div>
                    <ul className="text-xs text-gray-600 max-h-32 overflow-y-auto">
                        {files.map((file, index) => (
                            <li key={index} className="truncate">
                                {file.name} ({(file.size / 1024).toFixed(1)} KB)
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {isUploading ? (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                    ></div>
                </div>
            ) : (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-2 px-4 rounded ${files.length > 0
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    onClick={handleUpload}
                    disabled={files.length === 0}
                >
                    Upload and Generate QR
                </motion.button>
            )}
        </div>
    );
};

export default FileUpload;