import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.BACKEND_URL;


export async function GET(request: NextRequest) {
    try {

        const cookie = request.headers.get("cookie") ?? "";

        const response = await fetch(
            `${BASE_URL}/job/resumes/`,
            {
                method: "GET",

                headers: {
                    Cookie: cookie,
                },
            }
        );


        const data = await response.json();


        return NextResponse.json(
            data,
            {
                status: response.status,
            }
        );

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


export async function POST(request: NextRequest) {
    try {

        const cookie = request.headers.get("cookie") ?? "";

        const incomingFormData = await request.formData();

        const file = incomingFormData.get("file");

        if (!file) {
            return NextResponse.json(
                {
                    message: "Resume file is required.",
                },
                {
                    status: 400,
                }
            );
        }


        const formData = new FormData();

        formData.append(
            "file",
            file as Blob
        );


        const response = await fetch(
            `${BASE_URL}/job/resumes/`,
            {
                method: "POST",

                headers: {
                    Cookie: cookie,
                },

                body: formData,
            }
        );


        const data = await response.json();


        return NextResponse.json(
            data,
            {
                status: response.status,
            }
        );

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