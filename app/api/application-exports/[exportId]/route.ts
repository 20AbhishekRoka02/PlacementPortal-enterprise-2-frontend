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
      `${process.env.BACKEND_URL}/job/application-exports/${parsedExportId}/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching application export status:", error);

    return NextResponse.json(
      { message: "Unable to fetch application export status." },
      { status: 500 }
    );
  }
}