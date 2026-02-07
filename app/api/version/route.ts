import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// This endpoint returns the current deployed version
// Since it's an API route, it won't be cached by the browser/SW like static files
export async function GET() {
    try {
        // Try to read from version.json in public folder
        const versionPath = path.join(process.cwd(), "public", "version.json");
        const versionData = JSON.parse(fs.readFileSync(versionPath, "utf8"));

        return NextResponse.json(versionData, {
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        });
    } catch (error) {
        return NextResponse.json(
            { version: "unknown", error: "Failed to read version" },
            { status: 500 }
        );
    }
}
