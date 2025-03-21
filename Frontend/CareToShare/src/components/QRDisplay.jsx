/* eslint-disable no-unused-vars */
// src/components/QRDisplay.jsx
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';

const QRDisplay = ({ qrCode, filesCount, groupId }) => {
    const qrRef = useRef(null);

    useEffect(() => {
        if (qrRef.current) {
            gsap.from(qrRef.current, {
                opacity: 0,
                scale: 0.8,
                duration: 0.5,
                ease: "back.out(1.7)"
            });
        }
    }, []);

    const downloadQR = () => {
        const link = document.createElement('a');
        link.href = qrCode;
        link.download = `file-share-qr-${groupId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
        >
            <div className="mb-4 text-center">
                <h2 className="text-xl font-semibold mb-2">Your QR Code is Ready!</h2>
                <p className="text-sm text-gray-600">
                    Scan this QR code to download your {filesCount > 1 ? `${filesCount} files` : 'file'}
                </p>
            </div>

            <div
                ref={qrRef}
                className="p-3 bg-white border rounded-lg shadow-sm mb-4"
            >
                <img
                    src={qrCode}
                    alt="QR code for file download"
                    className="w-48 h-48 z-10"
                />
            </div>

            <div className="flex space-x-2">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={downloadQR}
                >
                    Download QR
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="py-2 px-4 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    onClick={() => window.location.reload()}
                >
                    Upload More Files
                </motion.button>
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
                Files will be available for download for 24 hours
            </div>
        </motion.div>
    );
};

export default QRDisplay;