import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const accessToken = req.cookies.get("access")?.value;

    const response = await fetch(
      `${process.env.BACKEND_URL}/job/applications/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get("access")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const backendUrl = new URL(`${process.env.BACKEND_URL}/job/applications/`);
    const jobId = req.nextUrl.searchParams.get("job_id");

    if (jobId) {
      backendUrl.searchParams.set("job_id", jobId);
    }

    const res = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json();

    return NextResponse.json(data, {
      status: res.status,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
