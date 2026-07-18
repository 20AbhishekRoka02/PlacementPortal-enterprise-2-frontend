import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const cookieStore = await cookies();

        const response = await fetch(
            `${process.env.BACKEND_URL}/student/profile`,
            {
                headers: {
                    Cookie: cookieStore.toString(),
                },
            }
        );

        const data = await response.json();

        return NextResponse.json(data, {
            status: response.status,
        });
    } catch (error) {
        return NextResponse.json(
            {
                message: "Unable to fetch profile.",
            },
            {
                status: 500,
            }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        const cookieStore = await cookies();

        const response = await fetch(
            `${process.env.BACKEND_URL}/student/profile-update/`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: cookieStore.toString(),
                },
                body: JSON.stringify(body),
            }
        );

        const data = await response.json();

        return NextResponse.json(data, {
            status: response.status,
        });
    } catch (error) {
        return NextResponse.json(
            {
                message: "Unable to update profile.",
            },
            {
                status: 500,
            }
        );
    }
}