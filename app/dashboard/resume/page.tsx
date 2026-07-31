"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { DataTable } from "@/components/dashboard/data-table";
import { generateColumns } from "@/components/dashboard/dynamic-columns";

import { toast } from "sonner";

export default function ResumePage() {
    const router = useRouter();

    interface Resume {
        id: number;
        file_name: string;
        file: string;
        created_at: string;
        updated_at: string;
    }

    const [resumes, setResumes] = useState<Resume[]>([]);

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const res = await fetch("/api/resumes", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const result = await res.json();

                if (!res.ok) {
                    toast.error(
                        result.message || "Failed to fetch resumes."
                    );
                    return;
                }

                setResumes(result.data);
                console.log("Resume List:", result.data);
            } catch (error) {
                console.error("Error fetching resumes:", error);

                toast.error("Something went wrong.");
            }
        };

        fetchResumes();
    }, []);

    const columns = generateColumns(resumes);

    return (
        <DataTable
            columns={columns}
            data={resumes}
            onRowClick={(row) =>
                router.push(`/dashboard/resume/${row.id}`)
            }
        />
    );
}