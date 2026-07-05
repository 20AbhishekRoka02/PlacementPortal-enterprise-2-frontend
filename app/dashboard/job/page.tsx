"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { generateColumns } from "@/components/dashboard/dynamic-columns";

const response = {
  data: [
    {
      company: 2,
      title: "Full Stack Software Development Intern",
      location: "Gurugram",
      salary: "13000.00",
      deadline: "2026-07-21T18:21:56Z",
      batch: 1,
    },
    {
      company: 2,
      title: "Jr. Dev Ops Engineer",
      location: "Noida",
      salary: "8000.00",
      deadline: "2026-07-23T18:58:04Z",
      batch: 1,
    },
  ],
};

export default function JobsPage() {
  const router = useRouter();
  interface Job {
    id: number;
    company: number;
    title: string;
    location: string;
    salary: string;
    deadline: string;
    batch: number;
  }

  const [jobs, setJobs] = useState<Job[]>([]);


  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/jobs", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch jobs.");
        }

        const result = await res.json();

        setJobs(result.data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };

    fetchJobs();
  }, []);

  const columns = generateColumns(jobs);

  return (
    <DataTable
      columns={columns}
      data={jobs}
      onRowClick={(row) => router.push(`/dashboard/job/${row.id}`)}
    />
  );
}