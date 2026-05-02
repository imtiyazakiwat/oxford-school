"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2 } from "lucide-react";

export type PopupSize = "sm" | "md" | "lg" | "xl" | "full";

// ============================================================================
// Button Component Props
// ============================================================================

export interface PopupButtonProps {
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    children: ReactNode;
}

// ============================================================================
// Pre-styled Button Components for consistent footer actions
// ============================================================================

export function PopupPrimaryButton({ onClick, disabled, loading, children }: PopupButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className="px-6 py-2 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a81832] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            data-testid="popup-primary-button"
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    );
}

export function PopupSecondaryButton({ onClick, disabled, loading, children }: PopupButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            data-testid="popup-secondary-button"
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    );
}

export function PopupDangerButton({ onClick, disabled, loading, children }: PopupButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            data-testid="popup-danger-button"
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    );
}

export function PopupSuccessButton({ onClick, disabled, loading, children }: PopupButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            data-testid="popup-success-button"
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    );
}

export interface GlobalPopupProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
    subtitle?: string;
    headerIcon?: ReactNode;
    footer?: ReactNode;
    size?: PopupSize;
    loading?: boolean;
    showCloseButton?: boolean;
    isAdmin?: boolean;
    headerClassName?: string;
}

/**
 * Returns positioning classes based on size and admin context
 * - Full size: uses inset-based positioning
 * - Other sizes: uses centered flex positioning
 */
export const getPositioningClasses = (size: PopupSize, isAdmin: boolean): string => {
    if (size === "full") {
        // Inset-based positioning for full-screen forms
        return isAdmin
            ? "fixed inset-4 md:inset-10 lg:left-[calc(16rem+2.5rem)] lg:right-20 lg:top-20 lg:bottom-20"
            : "fixed inset-4 md:inset-10 lg:inset-20";
    }

    // Centered positioning for other sizes
    return isAdmin
        ? "fixed inset-0 flex items-center justify-center p-4 lg:pl-[calc(16rem+1rem)]"
        : "fixed inset-0 flex items-center justify-center p-4";
};

/**
 * Returns size constraint classes based on popup size
 */
export const getSizeClasses = (size: PopupSize): string => {
    const sizeMap: Record<PopupSize, string> = {
        sm: "max-w-md",      // 448px
        md: "max-w-lg",      // 512px
        lg: "max-w-2xl",     // 672px
        xl: "max-w-4xl",     // 896px
        full: "w-full h-full",
    };
    return sizeMap[size];
};

export default function GlobalPopup({
    isOpen,
    onClose,
    children,
    title,
    subtitle,
    headerIcon,
    footer,
    size = "md",
    loading = false,
    showCloseButton = true,
    isAdmin = false,
    headerClassName = "bg-gradient-to-r from-[#c41e3a] to-[#8b1528]",
}: GlobalPopupProps) {
    const positioningClasses = getPositioningClasses(size, isAdmin);
    const sizeClasses = getSizeClasses(size);
    const isFull = size === "full";

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-[100]"
                        data-testid="popup-backdrop"
                    />

                    {/* Popup Container */}
                    {isFull ? (
                        // Full size: direct positioning with insets
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`${positioningClasses} bg-white rounded-2xl z-[101] overflow-hidden flex flex-col`}
                            data-testid="popup-container"
                        >
                            {/* Header */}
                            {title && (
                                <div className={`px-6 py-4 flex items-center justify-between ${headerClassName}`}>
                                    <div className="flex items-center gap-3">
                                        {headerIcon && (
                                            <div className="text-white">{headerIcon}</div>
                                        )}
                                        <div>
                                            <h2 className="text-lg font-bold text-white">{title}</h2>
                                            {subtitle && (
                                                <p className="text-white/80 text-sm">{subtitle}</p>
                                            )}
                                        </div>
                                    </div>
                                    {showCloseButton && (
                                        <button
                                            onClick={onClose}
                                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                            data-testid="popup-close-button"
                                        >
                                            <X className="w-5 h-5 text-white" />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-6" data-testid="popup-body">
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-[#c41e3a]" data-testid="popup-loader" />
                                    </div>
                                ) : (
                                    children
                                )}
                            </div>

                            {/* Footer */}
                            {footer && (
                                <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3" data-testid="popup-footer">
                                    {footer}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        // Non-full sizes: centered with flex container
                        <div className={`${positioningClasses} z-[101]`}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ type: "spring", duration: 0.3 }}
                                className={`w-full ${sizeClasses} bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}
                                data-testid="popup-container"
                            >
                                {/* Header */}
                                {title && (
                                    <div className={`px-6 py-4 flex items-center justify-between ${headerClassName}`}>
                                        <div className="flex items-center gap-3">
                                            {headerIcon && (
                                                <div className="text-white">{headerIcon}</div>
                                            )}
                                            <div>
                                                <h2 className="text-lg font-bold text-white">{title}</h2>
                                                {subtitle && (
                                                    <p className="text-white/80 text-sm">{subtitle}</p>
                                                )}
                                            </div>
                                        </div>
                                        {showCloseButton && (
                                            <button
                                                onClick={onClose}
                                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                                data-testid="popup-close-button"
                                            >
                                                <X className="w-5 h-5 text-white" />
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Body */}
                                <div className="flex-1 overflow-y-auto p-6" data-testid="popup-body">
                                    {loading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="w-8 h-8 animate-spin text-[#c41e3a]" data-testid="popup-loader" />
                                        </div>
                                    ) : (
                                        children
                                    )}
                                </div>

                                {/* Footer */}
                                {footer && (
                                    <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3" data-testid="popup-footer">
                                        {footer}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </>
            )}
        </AnimatePresence>
    );
}


// ============================================================================
// Helper Component Props
// ============================================================================

export interface PopupInfoRowProps {
    label: string;
    value: ReactNode;
    icon?: ReactNode;
}

export interface PopupSectionProps {
    title: string;
    icon?: ReactNode;
    children: ReactNode;
}

export interface PopupInfoGridProps {
    children: ReactNode;
    columns?: 1 | 2 | 3;
}

// ============================================================================
// Helper Components for consistent content presentation
// ============================================================================

/**
 * Info display component for consistent data presentation
 * Displays a label-value pair with optional icon
 */
export function PopupInfoRow({ label, value, icon }: PopupInfoRowProps) {
    return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg" data-testid="popup-info-row">
            {icon && <div className="text-gray-400">{icon}</div>}
            <div>
                <p className="text-gray-500 text-xs">{label}</p>
                <p className="font-medium text-gray-900">{value || "-"}</p>
            </div>
        </div>
    );
}

/**
 * Section component for grouping related info
 * Provides consistent styling with optional icon in header
 */
export function PopupSection({ title, icon, children }: PopupSectionProps) {
    return (
        <div className="bg-white rounded-xl border p-6" data-testid="popup-section">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                {icon && <span className="text-[#c41e3a]">{icon}</span>}
                {title}
            </h4>
            {children}
        </div>
    );
}

/**
 * Grid layout for info rows
 * Supports 1, 2, or 3 column responsive layouts
 */
export function PopupInfoGrid({ children, columns = 2 }: PopupInfoGridProps) {
    const colClass = 
        columns === 1 
            ? "grid-cols-1" 
            : columns === 2 
                ? "grid-cols-1 md:grid-cols-2" 
                : "grid-cols-1 md:grid-cols-3";
    
    return (
        <div className={`grid ${colClass} gap-3 text-sm`} data-testid="popup-info-grid">
            {children}
        </div>
    );
}
