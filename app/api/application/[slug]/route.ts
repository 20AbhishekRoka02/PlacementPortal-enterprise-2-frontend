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
      `${process.env.BACKEND_URL}/job/applications/${slug}/`,
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

export async function PUT(
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

    const body = await req.json();
    const cookie = req.headers.get("cookie") ?? "";
    const csrfToken = req.cookies.get("csrftoken")?.value;
    const res = await fetch(
      `${process.env.BACKEND_URL}/job/applications/${slug}/`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Cookie: cookie,
          ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
        },
        body: JSON.stringify(body),
      }
    );

    const responseText = await res.text();

    if (!responseText) {
      return new NextResponse(null, { status: res.status });
    }

    try {
      return NextResponse.json(JSON.parse(responseText), {
        status: res.status,
      });
    } catch {
      return new NextResponse(responseText, {
        status: res.status,
        headers: {
          "Content-Type": res.headers.get("content-type") ?? "text/plain",
        },
      });
    }
  } catch (error) {
    console.error("Error updating application:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
