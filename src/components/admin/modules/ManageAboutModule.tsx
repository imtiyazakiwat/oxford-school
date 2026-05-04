"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Info, Upload, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
    AboutImage,
    uploadAboutImage,
    
    getAboutImages, saveAboutImage,
    getAboutImageUrl,
} from "@/firebase/aboutImages";

const POSITION_LABELS = [
    { position: 1, label: "Top Left (Shorter)", defaultAlt: "Campus View" },
    { position: 2, label: "Bottom Left (Taller)", defaultAlt: "Classroom" },
    { position: 3, label: "Top Right (Taller)", defaultAlt: "College Infrastructure" },
    { position: 4, label: "Bottom Right (Shorter)", defaultAlt: "Lab Session" },
];

const FALLBACK_IMAGES = ["", "", "", ""];

export default function ManageAboutModule() {
    const { user } = useAuth();
    const [images, setImages] = useState<AboutImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<number | null>(null);
    const [altTexts, setAltTexts] = useState<Record<number, string>>({});

    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        setLoading(true);
        const { data } = await getAboutImages();
        setImages(data);
        // Initialize alt texts
        const alts: Record<number, string> = {};
        data.forEach(img => { alts[img.position] = img.alt_text; });
        setAltTexts(alts);
        setLoading(false);
    };

    const handleUpload = async (position: number, file: File) => {
        if (!user) return;
        setUploading(position);

        const currentImage = images.find(img => img.position === position);
        const { path, error: uploadError } = await uploadAboutImage(file, user.uid);
        
        if (uploadError) {
            alert("Failed to upload image: " + uploadError);
            setUploading(null);
            return;
        }

        const altText = altTexts[position] || POSITION_LABELS[position - 1].defaultAlt;
        const { error: updateError } = await saveAboutImage(
            position,
            path,
            altText,
            user.uid,
        );

        if (updateError) {
            alert("Failed to update: " + updateError);
            setUploading(null);
            return;
        }

        await loadImages();
        setUploading(null);
    };

    const handleAltTextSave = async (position: number) => {
        if (!user) return;
        const currentImage = images.find(img => img.position === position);
        if (!currentImage) return;

        const { error } = await saveAboutImage(
            position,
            currentImage.image_path,
            altTexts[position] || "",
            user.uid
        );

        if (error) {
            alert("Failed to update alt text: " + error);
        }
    };

    const getImageSrc = (position: number) => {
        const img = images.find(i => i.position === position);
        if (img?.image_path) return getAboutImageUrl(img.image_path);
        return FALLBACK_IMAGES[position - 1];
    };


    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Info className="w-5 h-5 text-[#c41e3a]" />
                    About Us Section Images
                </h3>
                <p className="text-sm text-gray-500 mb-6">Manage the 4 images displayed in the About Us section on the landing page.</p>

                {loading ? (
                    <div className="text-center py-12"><div className="w-8 h-8 border-4 border-[#c41e3a] border-t-transparent rounded-full animate-spin mx-auto" /></div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {POSITION_LABELS.map(({ position, label, defaultAlt }) => {
                            const currentImage = images.find(img => img.position === position);
                            const hasCustomImage = !!currentImage?.image_path;
                            
                            return (
                                <div key={position} className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors flex flex-col">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-[#c41e3a] bg-red-50 px-1.5 py-0.5 rounded">#{position}</span>
                                        {hasCustomImage && (
                                            <Check className="w-3 h-3 text-green-600" />
                                        )}
                                    </div>
                                    <p className="text-xs font-medium text-gray-700 mb-2 truncate">{label}</p>

                                    {/* Image Preview - Compact */}
                                    <div className="relative mb-2 aspect-[4/3] bg-gray-100 rounded overflow-hidden">
                                        <img
                                            src={getImageSrc(position)}
                                            alt={altTexts[position] || defaultAlt}
                                            className="w-full h-full object-contain bg-gray-50"
                                        />
                                        {uploading === position && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Alt Text Input */}
                                    <input
                                        type="text"
                                        value={altTexts[position] || ""}
                                        onChange={e => setAltTexts({ ...altTexts, [position]: e.target.value })}
                                        onBlur={() => handleAltTextSave(position)}
                                        placeholder={defaultAlt}
                                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#c41e3a] mb-2"
                                    />

                                    {/* Upload Button */}
                                    <label className="cursor-pointer block mt-auto">
                                        <span className={`w-full px-2 py-1.5 text-xs rounded flex items-center justify-center gap-1 transition-colors ${hasCustomImage ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-[#c41e3a] text-white hover:bg-[#a81832]"}`}>
                                            <Upload className="w-3 h-3" />
                                            {hasCustomImage ? "Replace" : "Upload"}
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            disabled={uploading !== null}
                                            onChange={e => {
                                                if (e.target.files?.[0]) {
                                                    handleUpload(position, e.target.files[0]);
                                                    e.target.value = "";
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Preview Layout */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Preview Layout</h4>
                    <div className="grid grid-cols-2 gap-2 max-w-md">
                        <div className="space-y-2">
                            <div className="bg-gray-200 rounded h-16 flex items-center justify-center text-xs text-gray-500">1 - Shorter</div>
                            <div className="bg-gray-200 rounded h-24 flex items-center justify-center text-xs text-gray-500">2 - Taller</div>
                        </div>
                        <div className="space-y-2 pt-4">
                            <div className="bg-gray-200 rounded h-24 flex items-center justify-center text-xs text-gray-500">3 - Taller</div>
                            <div className="bg-gray-200 rounded h-16 flex items-center justify-center text-xs text-gray-500">4 - Shorter</div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
