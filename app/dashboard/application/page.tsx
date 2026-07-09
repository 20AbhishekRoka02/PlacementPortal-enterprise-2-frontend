"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { generateColumns } from "@/components/dashboard/dynamic-columns";


export default function JobsPage() {
  const router = useRouter();
  interface Job {
    id: number;
    title: string;
    company: number;
    applied_at: string;
    status: string;
  }

  const [jobs, setJobs] = useState<Job[]>([]);


  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch("/api/application", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch applications.");
        }

        const result = await res.json();

        setJobs(result.data);
        console.log("application list: ", result.data)
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };

    fetchApplications();
  }, []);

  const columns = generateColumns(jobs);

  return (
    <DataTable
      columns={columns}
      data={jobs}
      onRowClick={(row) => router.push(`/dashboard/application/${row.id}`)}
    />
  );
}