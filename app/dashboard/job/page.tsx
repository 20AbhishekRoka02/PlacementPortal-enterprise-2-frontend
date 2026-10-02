"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { generateColumns } from "@/components/dashboard/dynamic-columns";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useDashboard } from "../DashboardSidebarProvider";


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
        console.log("job list: ", result.data)
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };

    fetchJobs();
  }, []);

  const columns = generateColumns(jobs);
  const {profile, profileLoading} = useDashboard();
 
  return (
    <div>
    {profile?.is_staff && (

      <Button
      className="my-3 ml-4 py-5 px-4"
      onClick={()=> router.push('/dashboard/job/create')}
      ><PlusIcon/>Add Jobs</Button>
    )}
   
      
      <DataTable
        columns={columns}
        data={jobs}
        onRowClick={(row) => router.push(`/dashboard/job/${row.id}`)}
      />
    </div>
  );
}