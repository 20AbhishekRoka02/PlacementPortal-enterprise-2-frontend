"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface ApplicationAttribute {
  pk: number;
  name: string;
  data_type:
  | "text"
  | "integer"
  | "decimal"
  | "boolean"
  | "enum"
  | "date";
  value: string | number | boolean | null;
}

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

  resume_file_name: string;
  resume_file_size: number;
  attributes: ApplicationAttribute[] | null;
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

  /*
  * Convert boolean values returned by the API
  * into a user-friendly Yes / No value.
  *
  * Handles: 
  * true 
  * false
  * "true"
  * "false"
  * "True"
  * "False"
  */
  const formatBooleanValue = (value: string | number | boolean | null) => {
    if (value === null) {
      return "-";
    }
    if (value === true || String(value).toLowerCase() === "true") {
      return "Yes";
    }
    if (value === false || String(value).toLowerCase() === "false") {
      return "No";
    }
    return String(value);
  };

  /*
  * Format an attribute value according
  * to its datatype.
  */
  const formatAttributeValue = (attribute: ApplicationAttribute) => {
    const { value, data_type } = attribute;
    if (value === null || value === "") {
      return "-";
    }
    switch (data_type) {
      case "boolean":
        return formatBooleanValue(value);
      case "date":
        return new Date(String(value)).toLocaleDateString("en-IN");
      default:
        return String(value);
    }
  };

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

      {/* Application Attributes */}
      {application.attributes && application.attributes.length > 0 && (
        <Card> 
        <CardHeader> 
        <CardTitle> Application Details </CardTitle> 
        </CardHeader>
        <CardContent> 
        <div className="grid gap-6 md:grid-cols-2">
        {application.attributes.map( (attribute) => (
          <div key={attribute.pk} >
          <p className="text-sm text-muted-foreground"> {attribute.name} </p>
          <p className="font-medium"> {formatAttributeValue( attribute )} </p>
          </div> 
        )
        )}
        </div>
        </CardContent>
        </Card>
      )}

      {/* Resume */}
      <Card>
        <CardHeader>
          <CardTitle>Your Resume</CardTitle>
        </CardHeader>

        <CardContent>
          {application.resume_file_name ? (
            <div className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/40 transition-colors">
              {/* PDF Box */}
              <div className="flex h-14 w-14 items-center justify-center rounded-md bg-red-100 text-red-600 font-bold text-sm">
                PDF
              </div>

              {/* Resume Info */}
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {application.resume_file_name}
                </p>

                <p className="text-sm text-muted-foreground">
                  {application.resume_file_size.toFixed(2)} KB
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              No resume uploaded.
            </p>
          )}
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