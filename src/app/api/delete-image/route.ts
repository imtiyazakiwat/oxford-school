import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const imagePath = searchParams.get("path");

        if (!imagePath) {
            return NextResponse.json(
                { error: "Image path is required" },
                { status: 400 }
            );
        }

        // Only allow deletion of images in the img folder
        if (!imagePath.startsWith("/img/")) {
            return NextResponse.json(
                { error: "Only images in /img/ can be deleted" },
                { status: 403 }
            );
        }

        // Construct the full file path
        const fullPath = path.join(process.cwd(), "public", imagePath);

        // Check if file exists
        if (!fs.existsSync(fullPath)) {
            return NextResponse.json(
                { error: "Image not found" },
                { status: 404 }
            );
        }

        // Delete the file
        fs.unlinkSync(fullPath);

        return NextResponse.json(
            { success: true, message: "Image deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting image:", error);
        return NextResponse.json(
            { error: "Failed to delete image" },
            { status: 500 }
        );
    }
}
