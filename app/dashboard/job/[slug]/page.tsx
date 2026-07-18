"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
interface Job {
  id: number;
  company: string;
  title: string;
  location: string;
  salary: string;
  deadline: string;
  batch: string;
  description: string;
  status: string;
}
import { toast } from "sonner";
import ApplyJobDialog from "@/components/dashboard/application/ApplyJobDialogBox";

export default function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/jobs/${slug}`, {
          credentials: "include",
        });

        if (res.status === 404) {
          setNotFound(true);
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch job.");
        }

        const result = await res.json();
        setJob(result.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchJob();
    }
  }, [slug]);

  // const apply_job = async () => {
  //   try {
  //     const res = await fetch("/api/application", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         job: Number(slug),
  //       }),
  //     });

  //     const data = await res.json();

  //     if (!res.ok) {
  //       toast.error(data.message || "Unable to apply.");
  //       return;
  //     }

  //     toast.success(data.message || "Application submitted successfully.");

  //     // Reload page so status changes to Applied
  //     setJob((prev) =>
  //       prev
  //         ? {
  //           ...prev,
  //           status: "Applied",
  //         }
  //         : prev
  //     );
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Something went wrong.");
  //   }
  // };

  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">
        Loading...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container mx-auto flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Job Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The job you're looking for doesn't exist or may have been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{job!.title}</h1>

        <p className="mt-2 text-muted-foreground">
          {job!.company}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">Location</p>
          <p>{job!.location}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Salary</p>
          <p>₹{Number(job!.salary).toLocaleString("en-IN")}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Deadline</p>
          <p>
            {new Date(job!.deadline).toLocaleDateString("en-IN")}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Batch</p>
          <p>{job!.batch}</p>
        </div>
      </div>
      <div className="pt-2">
        {job?.status === "Not Applied" ? (
          <ApplyJobDialog
            jobId={job.id}
            onSuccessAction={() => {
              setJob((prev) =>
                prev
                  ? {
                    ...prev,
                    status: "Applied",
                  }
                  : prev
              );
            }}
          />
        ) : (
          <Button
            size="lg"
            variant="ghost"
            className="w-full md:w-auto"
            disabled
          >
            Applied
          </Button>
        )}

      </div>

      <div>
        <h2 className="mb-3 text-xl font-semibold">
          Job Description
        </h2>

        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: job!.description,
          }}
        />
      </div>
    </div>
  );
}