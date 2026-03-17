import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Scanner } from '@yudiel/react-qr-scanner';
import { ArrowLeft, CheckCircle, Star, QrCode } from "lucide-react";
import { useNavigate } from "react-router";

export function OrganizerQRScanner() {
    const navigate = useNavigate();
    const [scanState, setScanState] = useState<"scanning" | "confirming" | "feedback" | "success">("scanning");
    const [scannedData, setScannedData] = useState<string | null>(null);

    // Feedback Form State
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState("");

    // Scanner Error handling
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [manualToken, setManualToken] = useState("");

    const handleScan = (result: any) => {
        if (result && result.length > 0) {
            const qrValue = result[0].rawValue;
            if (qrValue.startsWith("crewup-qr:")) {
                setScannedData(qrValue);
                setCameraError(null);
                // Transition instantly to confirming view (simulate API verification)
                setTimeout(() => setScanState("confirming"), 600);
            }
        }
    };

    const handleError = (error: any) => {
        console.error("QR Scanner Error:", error);
        setCameraError("Camera access denied or unavailable. Web browsers require an HTTPS secure context to access the device camera over a network.");
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualToken.startsWith("crewup-qr:")) {
            setScannedData(manualToken);
            setCameraError(null);
            setScanState("confirming");
        } else {
            alert("Invalid QR Token Format");
        }
    };

    const markAttendance = () => {
        // API mock: Mark as present
        setScanState("feedback");
    };

    const submitFeedback = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;

        // API mock: Submit review
        setScanState("success");
    };

    const resetScanner = () => {
        setScannedData(null);
        setRating(0);
        setHoveredRating(0);
        setComment("");
        setScanState("scanning");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 text-white px-4 pt-6 pb-16 shadow-lg shadow-fuchsia-500/20 shrink-0">
                <div className="max-w-md mx-auto">
                    <button
                        onClick={() => navigate("/organizer/dashboard")}
                        className="flex items-center gap-2 mb-4 hover:bg-white/20 px-4 py-2 rounded-full transition-colors font-medium backdrop-blur-sm bg-white/10 border border-white/20"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-extrabold tracking-tight mb-2">Event Scanner</h1>
                    <p className="text-violet-100 font-medium">Scan volunteer QR tickets to check them in.</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 max-w-md mx-auto w-full px-4 -mt-8 relative z-10 pb-24">

                <AnimatePresence mode="wait">

                    {/* STATE 1: CAMERA SCANNING */}
                    {scanState === "scanning" && (
                        <motion.div
                            key="scanning"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2rem] p-4 shadow-xl border border-gray-100 overflow-hidden relative"
                        >
                            {cameraError && (
                                <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-[1.5rem] text-sm text-red-600 font-medium">
                                    <p className="mb-2 font-bold">⚠️ Camera Error</p>
                                    <p>{cameraError}</p>
                                </div>
                            )}

                            <div className="rounded-[1.5rem] overflow-hidden aspect-[4/5] bg-gray-900 shadow-inner relative flex items-center justify-center">
                                <Scanner
                                    onScan={handleScan}
                                    onError={handleError}
                                    components={{ finder: false }}
                                    styles={{ video: { objectFit: "cover" } }}
                                />

                                {/* Targeting Reticle */}
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    <div className="w-56 h-56 border-2 border-white/30 rounded-3xl relative">
                                        {/* Corner Accents */}
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-fuchsia-500 rounded-tl-3xl"></div>
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-fuchsia-500 rounded-tr-3xl"></div>
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-fuchsia-500 rounded-bl-3xl"></div>
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-fuchsia-500 rounded-br-3xl"></div>
                                        {/* Scanning Laser Line */}
                                        <motion.div
                                            animate={{ y: [0, 220, 0] }}
                                            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                            className="w-full h-0.5 bg-fuchsia-500 shadow-[0_0_15px_3px_rgba(217,70,239,0.7)]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mt-6 mb-2">
                                <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <QrCode className="w-6 h-6 text-violet-600" />
                                </div>
                                <h3 className="font-extrabold text-gray-900 text-lg">Align QR Code</h3>
                                <p className="text-sm text-gray-500 mt-1">Point your camera at the volunteer's digital ticket.</p>
                            </div>

                            {/* Manual Fallback for HTTP testing */}
                            <div className="mt-4 p-4 border-t border-gray-100">
                                <p className="text-xs text-gray-500 mb-2 font-medium text-center">Testing via HTTP IP? Use manual entry:</p>
                                <form onSubmit={handleManualSubmit} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="crewup-qr:num:vol-num"
                                        value={manualToken}
                                        onChange={(e) => setManualToken(e.target.value)}
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-fuchsia-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-fuchsia-700 transition-colors"
                                    >
                                        Verify
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}

                    {/* STATE 2: CONFIRM ATTENDANCE */}
                    {scanState === "confirming" && (
                        <motion.div
                            key="confirming"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 text-center"
                        >
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <div className="inline-block px-3 py-1 bg-violet-50 text-violet-700 text-xs font-bold uppercase tracking-wider rounded-full mb-3 border border-violet-100">
                                Token Verified
                            </div>
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">John Davis</h2>
                            <p className="text-gray-500 mb-8 font-medium">Summer Music Festival</p>

                            <div className="space-y-3">
                                <button
                                    onClick={markAttendance}
                                    className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white py-4 rounded-full font-bold text-lg shadow-lg shadow-teal-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                >
                                    Mark Present
                                </button>
                                <button
                                    onClick={resetScanner}
                                    className="w-full bg-gray-50 text-gray-600 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors border border-gray-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STATE 3: FEEDBACK FORM */}
                    {scanState === "feedback" && (
                        <motion.div
                            key="feedback"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100"
                        >
                            <div className="text-center mb-6 border-b border-gray-100 pb-6">
                                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
                                    <CheckCircle className="w-4 h-4" /> Checked In Successfully
                                </div>
                                <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Rate Volunteer</h2>
                                <p className="text-gray-500 text-sm">How did John Davis perform today?</p>
                            </div>

                            <form onSubmit={submitFeedback} className="space-y-6">
                                {/* Star Rating */}
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onMouseLeave={() => setHoveredRating(0)}
                                            onClick={() => setRating(star)}
                                            className="transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star
                                                className={`w-10 h-10 transition-colors ${star <= (hoveredRating || rating)
                                                    ? "fill-yellow-400 text-yellow-400 drop-shadow-md"
                                                    : "fill-gray-100 text-gray-200"
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>

                                {/* Comment Area */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 mt-4">Additional Notes (Optional)</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Great energy, handled crowds very well..."
                                        className="w-full p-4 border border-gray-200 rounded-2xl resize-none h-32 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 bg-gray-50 hover:bg-white transition-colors"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={rating === 0}
                                    className={`w-full py-4 rounded-full font-bold text-lg transition-all ${rating > 0
                                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/20 hover:shadow-xl hover:-translate-y-0.5"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    Submit Feedback
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* STATE 4: SUCCESS SUMMARY */}
                    {scanState === "success" && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 rounded-[2rem] p-8 shadow-2xl text-center text-white border border-white/20"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
                            >
                                <CheckCircle className="w-12 h-12 text-white" />
                            </motion.div>

                            <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Review Saved!</h2>
                            <p className="text-violet-100 font-medium text-lg mb-8">
                                John Davis has been rated {rating} stars and checked in.
                            </p>

                            <button
                                onClick={resetScanner}
                                className="w-full bg-white text-fuchsia-600 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                            >
                                <QrCode className="w-5 h-5" />
                                Scan Next Volunteer
                            </button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
