import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    exportId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { exportId } = await params;
  const parsedExportId = Number(exportId);
  const accessToken = request.cookies.get("access")?.value;

  if (!Number.isInteger(parsedExportId) || parsedExportId < 1) {
    return NextResponse.json({ message: "Invalid export id." }, { status: 400 });
  }

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/job/application-exports/${parsedExportId}/download/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    const headers = new Headers({
      "Cache-Control": "no-store",
    });
    const contentType = response.headers.get("content-type");
    const contentDisposition = response.headers.get("content-disposition");

    if (contentType) {
      headers.set("Content-Type", contentType);
    }
    if (contentDisposition) {
      headers.set("Content-Disposition", contentDisposition);
    }

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error("Error downloading application export:", error);

    return NextResponse.json(
      { message: "Unable to download application export." },
      { status: 500 }
    );
  }
}