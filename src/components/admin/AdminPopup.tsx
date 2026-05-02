"use client";

import { ReactNode } from "react";
import GlobalPopup, {
    PopupSize,
    GlobalPopupProps,
    PopupButtonProps,
    PopupPrimaryButton as GlobalPopupPrimaryButton,
    PopupSecondaryButton as GlobalPopupSecondaryButton,
    PopupDangerButton as GlobalPopupDangerButton,
    PopupSuccessButton as GlobalPopupSuccessButton,
    PopupInfoRow as GlobalPopupInfoRow,
    PopupInfoRowProps,
    PopupSection as GlobalPopupSection,
    PopupSectionProps,
    PopupInfoGrid as GlobalPopupInfoGrid,
    PopupInfoGridProps,
} from "../GlobalPopup";

// Re-export PopupSize type for backward compatibility
export type { PopupSize };

// AdminPopup props - extends GlobalPopupProps but makes title required and isAdmin defaults to true
interface AdminPopupProps extends Omit<GlobalPopupProps, "isAdmin"> {
    title: string; // Title is required for AdminPopup
}

/**
 * AdminPopup - A wrapper around GlobalPopup with isAdmin=true preset
 * 
 * This component maintains backward compatibility with existing AdminPopup usage
 * while leveraging the unified GlobalPopup component for consistent styling.
 */
export default function AdminPopup(props: AdminPopupProps) {
    return <GlobalPopup {...props} isAdmin={true} />;
}

// Re-export button components for backward compatibility
export function PopupPrimaryButton(props: PopupButtonProps) {
    return <GlobalPopupPrimaryButton {...props} />;
}

export function PopupSecondaryButton(props: PopupButtonProps) {
    return <GlobalPopupSecondaryButton {...props} />;
}

export function PopupDangerButton(props: PopupButtonProps) {
    return <GlobalPopupDangerButton {...props} />;
}

export function PopupSuccessButton(props: PopupButtonProps) {
    return <GlobalPopupSuccessButton {...props} />;
}

// Re-export helper components for backward compatibility
export function PopupInfoRow(props: PopupInfoRowProps) {
    return <GlobalPopupInfoRow {...props} />;
}

export function PopupSection(props: PopupSectionProps) {
    return <GlobalPopupSection {...props} />;
}

export function PopupInfoGrid(props: PopupInfoGridProps) {
    return <GlobalPopupInfoGrid {...props} />;
}
