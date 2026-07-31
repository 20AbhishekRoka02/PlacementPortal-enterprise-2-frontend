import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{
        slug: string;
    }>;
};

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
            `${process.env.BACKEND_URL}/job/resumes/${slug}/`,
            {
                method: "GET",
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
                    message: "Resume not found",
                },
                { status: 404 }
            );
        }

        if (!res.ok) {
            return NextResponse.json(
                {
                    message: "Failed to fetch resume.",
                },
                { status: res.status }
            );
        }
        console.log("res: ", res);
        const data = await res.json();

        return NextResponse.json(data, {
            status: res.status,
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