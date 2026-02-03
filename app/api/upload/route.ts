import { NextRequest, NextResponse } from "next/server";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await uploadImage(buffer, {
      folder: folder || "xilar/products",
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Upload error:", error);
    
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    const { publicId } = await req.json();

    if (!publicId) {
      return NextResponse.json(
        { error: "No publicId provided" },
        { status: 400 }
      );
    }

    const success = await deleteImage(publicId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete image" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
