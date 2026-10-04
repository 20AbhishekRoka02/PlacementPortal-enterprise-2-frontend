"use client";

import BatchForm from "@/components/dashboard/job/batch-form";
import CompanyForm from "@/components/dashboard/job/company-form";
import { JobAttributes } from "@/components/dashboard/job/jobattributes";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { useState } from "react";
// import CkEditor from "@/components/dashboard/job/CKEditor";

import dynamic from "next/dynamic";

// Disable Server-Side Rendering for CKEditor
const CkEditor = dynamic(
  () => import("@/components/dashboard/job/CKEditor"),
  { 
    ssr: false,
    loading: () => <p>Loading editor...</p> 
  }
);
// import CkEditor from "../../../../components/dashboard/job/CKEditor";

interface CompanyUser {
  id: number;
  email: string;
  is_staff: boolean;
  full_name: string;
  role: string;
}

interface Company {
  id: number;
  user: CompanyUser;
  name: string;
  website: string;
  hr_phone_number: string;
  hr_email: string;
}

interface JobAttribute {
  pk: number;
  name: string;
  data_type:
  | "text"
  | "integer"
  | "decimal"
  | "boolean"
  | "enum"
  | "date";
  required: boolean;
  order: number;
  value: string | number | boolean | null;
  visible_to_company: boolean;
  filterable: boolean;
}

interface Batch {
  id: number;
  course_name: string;
  start_year: string;
  end_year: string;
}

interface JobForm {
  company: Company | null;
  title: string;
  description: string;
  location: string;
  salary: string;
  deadline: string;
  batch: Batch[];
  attributes: JobAttribute[];
}

export default function CreateJobPage() {
  const [job, setJob] = useState<JobForm>({
    company: null,
    title: "",
    description: "",
    location: "",
    salary: "",
    deadline: "",
    batch: [],
    attributes: [],
  });

  const [editorData, setEditorData] = useState<string>("");

  // Add a new dynamic attribute
  const addAttribute = () => {
    const newAttribute: JobAttribute = {
      pk: Date.now(),
      name: "",
      data_type: "text",
      required: false,
      order: job.attributes.length,
      value: "",
      visible_to_company: true,
      filterable: false,
    };

    setJob((prev) => ({
      ...prev,
      attributes: [...prev.attributes, newAttribute],
    }));
  };

  // Update an existing attribute
  const updateAttribute = (
    pk: number,
    field: keyof JobAttribute,
    value: string | number | boolean
  ) => {
    setJob((prev) => ({
      ...prev,
      attributes: prev.attributes.map((attribute) =>
        attribute.pk === pk
          ? {
            ...attribute,
            [field]: value,
          }
          : attribute
      ),
    }));
  };

  // Remove an attribute
  const removeAttribute = (pk: number) => {
    setJob((prev) => ({
      ...prev,
      attributes: prev.attributes.filter(
        (attribute) => attribute.pk !== pk
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("JOB CREATION FORM :", job);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-6 py-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Enter Job Details
          </h1>

          <p className="mt-2 text-muted-foreground">
            Add a new job opportunity for students.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="relative z-20">
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5 p-5">

              {/* Company */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Company
                </label>

                <CompanyForm
                  onCompanySelect={(company) =>
                    setJob((prev) => ({
                      ...prev,
                      company: company,
                    }))
                  }
                />
              </div>

              {/* Job Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Job Title
                </label>

                <Input
                  placeholder="e.g. Full Stack Developer"
                  value={job.title}
                  onChange={(e) =>
                    setJob((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Description
                </label>

                <CkEditor
                  editorData={editorData}
                  setEditorData={setEditorData}
                  handleOnUpdate={(editor: string, field: string) => {
                    if (field === "description") {
                      setJob((prev) => ({
                        ...prev,
                        description: editor,
                      }));
                    }
                  }}
                />
              </div>

              {/* Location + Salary + Deadline + Batch */}
              <div className="grid gap-5 md:grid-cols-2">

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Location
                  </label>

                  <Input
                    placeholder="e.g. Gurugram"
                    value={job.location}
                    onChange={(e) =>
                      setJob((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                {/* Salary */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Salary
                  </label>

                  <Input
                    type="number"
                    placeholder="e.g. 13000"
                    value={job.salary}
                    onChange={(e) =>
                      setJob((prev) => ({
                        ...prev,
                        salary: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                {/* Deadline */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Deadline
                  </label>

                  <Input
                    type="datetime-local"
                    value={job.deadline}
                    onChange={(e) =>
                      setJob((prev) => ({
                        ...prev,
                        deadline: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                {/* Batch */}
                <div className="relative space-y-2">
                  <label className="text-sm font-medium">
                    Batch
                  </label>

                  <BatchForm
                    onBatchSelect={(batches) =>
                      setJob((prev) => ({
                        ...prev,
                        batch: batches,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Dynamic Job Attributes */}
              <div className="relative z-10">
                <JobAttributes
                  attributes={job.attributes}
                  addAttribute={addAttribute}
                  updateAttribute={updateAttribute}
                  removeAttribute={removeAttribute}
                />
              </div>

            </CardContent>
          </Card>

          {/* Submit */}
          <div className="mt-6">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
            >
              Create Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
