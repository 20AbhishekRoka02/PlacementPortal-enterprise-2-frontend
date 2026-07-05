import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(
  req: NextRequest,
  { params }: RouteContext
) {
  const { slug } = await params;

  try {
    const accessToken = req.cookies.get("access")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const res = await fetch(
      `${process.env.BACKEND_URL}/job/jobs/${slug}/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (res.status === 404) {
      return NextResponse.json(
        {
          message: "Job not found",
        },
        { status: 404 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          message: "Failed to fetch job.",
        },
        { status: res.status }
      );
    }

    const data = await res.json();

    return NextResponse.json(data, {
      status: 200,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}