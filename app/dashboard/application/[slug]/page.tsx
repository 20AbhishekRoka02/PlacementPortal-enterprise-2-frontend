"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Application {
  id: number;
  title: string;
  company: string;

  status: string;
  applied_at: string;

  job_title: string;
  job_description: string;
  job_location: string;
  job_salary: string;

  student_phone_number: string;
  student_whatsapp_number: string;
  student_email_id: string | null;
}

export default function ApplicationDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchApplication() {
      try {
        const res = await fetch(`/api/application/${slug}`, {
          credentials: "include",
        });

        if (res.status === 404) {
          setNotFound(true);
          return;
        }

        if (!res.ok) {
          throw new Error("Unable to fetch application.");
        }

        const data = await res.json();
        setApplication(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchApplication();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">
        Loading...
      </div>
    );
  }

  if (notFound || !application) {
    return (
      <div className="container mx-auto flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Application Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            This application doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{application.job_title}</h1>

        <p className="text-muted-foreground text-lg">
          {application.company}
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <Badge>{application.status}</Badge>

          <span className="text-sm text-muted-foreground">
            Applied on{" "}
            {new Date(application.applied_at).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Job Information */}
      <Card>
        <CardHeader>
          <CardTitle>Job Information</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Location</p>
            <p>{application.job_location}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Salary</p>
            <p>
              ₹
              {Number(application.job_salary).toLocaleString("en-IN")}
              /month
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Student Information */}
      <Card>
        <CardHeader>
          <CardTitle>Your Contact Information</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p>{application.student_email_id || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p>{application.student_phone_number || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">WhatsApp</p>
            <p>{application.student_whatsapp_number || "-"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Job Description */}
      <Card>
        <CardHeader>
          <CardTitle>Job Description</CardTitle>
        </CardHeader>

        <CardContent>
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: application.job_description,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}