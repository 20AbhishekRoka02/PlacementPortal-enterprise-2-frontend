"use client";

import { useEffect, useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group";

import { Label } from "@/components/ui/label";

import { Input } from "@/components/ui/input";

import { ScrollArea } from "@/components/ui/scroll-area";

import { Card } from "@/components/ui/card";

import { FileText } from "lucide-react";

import { toast } from "sonner";


export interface Resume {
    id: number;
    size: string;
    file_name: string;
    file: string;
}


export interface JobAttribute {
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
    value: string | number | boolean | null;  // need to expand it as per data types
}


export interface ApplyJobDialogProps {
    jobId: number;
    attributes: JobAttribute[];
    onSuccessAction: () => void;
}

export type AnswerValue = string | number | boolean;


export default function ApplyJobDialog({
    jobId,
    attributes,
    onSuccessAction,
}: ApplyJobDialogProps) {

    const [open, setOpen] = useState(false);

    const [resumes, setResumes] = useState<Resume[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<string>("");
    const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});

    const [loadingResumes, setLoadingResumes] = useState(false);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [applying, setApplying] = useState(false);


    /* 
    * Initialize dynamic fields from the values 
    * returned by the Job Detail API. 
    * 
    * null -> no previous answer 
    * false -> valid boolean answer 
    */ 
    useEffect(() => {
        const initialAnswers: Record<
            number,
            AnswerValue
        > = {};
        
        attributes.forEach((attribute) => {
            if (attribute.value !== null) {
                initialAnswers[attribute.pk] = attribute.value; 
            } 
        });

        setAnswers(initialAnswers);
    }, [attributes]);

    /*
    * Fetch student's resumes whenever
    * the application dialog is opened.
    */
    const fetchResumes = async () => {

        try {
            setLoadingResumes(true);

            const res = await fetch("/api/resumes", {
                credentials: "include",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.message || "Unable to fetch resumes."
                );
            }

            setResumes(data.data);

        } catch (error) {

            console.error(error);

            toast.error(
                "Unable to fetch your resumes."
            );

        } finally {
            setLoadingResumes(false);
        }
    };


    useEffect(() => {

        if (open) {
            fetchResumes();
        }

    }, [open]);

    /*
    * Update a dynamic application answer.
    */
    const updateAnswer = (
        attributeId: number,
        value: string | boolean
    ) => {

        setAnswers((prev) => ({
            ...prev,
            [attributeId]: value,
        }));

    };

    /* Upload a new resume. */
    const uploadResume = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {

        const file = event.target.files?.[0];

        if (!file) return;


        try {

            setUploadingResume(true);

            const formData = new FormData();

            formData.append("file", file);

            const res = await fetch("/api/resumes", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            const data = await res.json();
            console.log("data: ", data.data)

            if (!res.ok) {
                throw new Error(
                    data.data || "Unable to upload resume."
                );
            }

            const uploadedResume: Resume = {
                id: data.id,
                size: data.size,
                file_name: data.file_name,
                file: data.file,
            };


            setResumes((prev) => [
                uploadedResume,
                ...prev,
            ]);


            setSelectedResumeId(
                String(uploadedResume.id)
            );


            toast.success(
                "Resume uploaded successfully."
            );


        } catch (error) {

            console.error(error);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to upload resume."
            );

        } finally {

            setUploadingResume(false);

            event.target.value = "";

        }
    };


    /*
    * Validate all required dynamic fields.
    *
    * Important:
    * false is a valid answer for boolean fields. 
    */
    const validateAnswers = () => {

        for (const attribute of attributes) {

            if (!attribute.required) {
                continue;
            }

            const value = answers[attribute.pk];

            if (
                value === undefined ||
                value === null ||
                value === ""
            ) {

                toast.error(
                    `${attribute.name} is required.`
                );

                return false;

            }

        }

        return true;

    };

    /* Submit application. */
    const applyJob = async () => {

        if (!selectedResumeId) {

            toast.error(
                "Please select or upload a resume."
            );

            return;
        }

        if (!validateAnswers()) {
            return;
        }

        try {

            setApplying(true);

            const res = await fetch(
                "/api/application",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        job: jobId,
                        resume_id: Number(
                            selectedResumeId
                        ),
                        answers,
                    }),

                    credentials: "include",
                }
            );


            const data = await res.json();


            if (!res.ok) {

                toast.error(
                    data.message ||
                    "Unable to apply."
                );

                return;
            }


            toast.success(
                data.data ||
                "Application submitted successfully."
            );


            setOpen(false);

            onSuccessAction();


        } catch (error) {

            console.error(error);

            toast.error(
                "Something went wrong."
            );

        } finally {

            setApplying(false);

        }

    };

    // Render a dynamic field based on its datatype.
    const renderAttribute = (
        attribute: JobAttribute
    ) => {

        const value = answers[attribute.pk];


        switch (attribute.data_type) {

            case "text":

                return (
                    <Input
                        type="text"
                        value={
                            typeof value === "string"
                                ? value
                                : ""
                        }
                        onChange={(event) =>
                            updateAnswer(
                                attribute.pk,
                                event.target.value
                            )
                        }
                        placeholder={`Enter ${attribute.name}`}
                    />
                );


            case "integer":

                return (
                    <Input
                        type="number"
                        step="1"
                        value={
                            typeof value === "string"
                                ? value
                                : ""
                        }
                        onChange={(event) =>
                            updateAnswer(
                                attribute.pk,
                                event.target.value
                            )
                        }
                        placeholder={`Enter ${attribute.name}`}
                    />
                );


            case "decimal":

                return (
                    <Input
                        type="number"
                        step="0.01"
                        value={
                            typeof value === "string"
                                ? value
                                : ""
                        }
                        onChange={(event) =>
                            updateAnswer(
                                attribute.pk,
                                event.target.value
                            )
                        }
                        placeholder={`Enter ${attribute.name}`}
                    />
                );


            case "boolean":

                return (
                    <RadioGroup
                        value={
                            value === undefined
                                ? ""
                                : value
                                    ? "true"
                                    : "false"
                        }
                        onValueChange={(selectedValue) =>
                            updateAnswer(
                                attribute.pk,
                                selectedValue === "true"
                            )
                        }
                    >
                        <div className="flex items-center gap-6">

                            <div className="flex items-center gap-2">
                                <RadioGroupItem
                                    value="true"
                                    id={`${attribute.name}-yes`}
                                />

                                <Label
                                    htmlFor={`${attribute.name}-yes`}
                                >
                                    Yes
                                </Label>
                            </div>

                            <div className="flex items-center gap-2">
                                <RadioGroupItem
                                    value="false"
                                    id={`${attribute.name}-no`}
                                />

                                <Label
                                    htmlFor={`${attribute.name}-no`}
                                >
                                    No
                                </Label>
                            </div>

                        </div>
                    </RadioGroup>
                );


            case "date":

                return (
                    <Input
                        type="date"
                        value={
                            typeof value === "string"
                                ? value
                                : ""
                        }
                        onChange={(event) =>
                            updateAnswer(
                                attribute.pk,
                                event.target.value
                            )
                        }
                    />
                );


            case "enum":

                return (
                    <Input
                        type="text"
                        value={
                            typeof value === "string"
                                ? value
                                : ""
                        }
                        onChange={(event) =>
                            updateAnswer(
                                attribute.pk,
                                event.target.value
                            )
                        }
                        placeholder={`Enter ${attribute.name}`}
                    />
                );


            default:

                return null;

        }

    };


    return (

        <Dialog
            open={open}
            onOpenChange={setOpen}
        >

            <DialogTrigger asChild>

                <Button size="lg">
                    Apply Now
                </Button>

            </DialogTrigger>


            <DialogContent className="sm:max-w-2xl">

                <DialogHeader>

                    <DialogTitle>
                        Apply for this Job
                    </DialogTitle>

                    <DialogDescription>
                        Complete the application form
                        and select your resume.
                    </DialogDescription>

                </DialogHeader>


                <ScrollArea className="max-h-[70vh] pr-4">

                    <div className="space-y-6">


                        {/* Dynamic Application Fields */}

                        {attributes.length > 0 && (

                            <div className="space-y-4">

                                <div>

                                    <h3 className="font-semibold">
                                        Application Details
                                    </h3>

                                    <p className="text-sm text-muted-foreground">
                                        Please provide the
                                        information required
                                        for this job.
                                    </p>

                                </div>


                                <div className="space-y-4">

                                    {[
                                        ...attributes,
                                    ]
                                        .sort(
                                            (a, b) =>
                                                a.order -
                                                b.order
                                        )
                                        .map(
                                            (
                                                attribute
                                            ) => (

                                                <div
                                                    key={
                                                        attribute.name
                                                    }
                                                    className="space-y-2"
                                                >

                                                    <Label>

                                                        {
                                                            attribute.name
                                                        }

                                                        {attribute.required && (
                                                            <span className="ml-1 text-destructive">
                                                                *
                                                            </span>
                                                        )}

                                                    </Label>


                                                    {renderAttribute(
                                                        attribute
                                                    )}

                                                </div>

                                            )
                                        )}

                                </div>

                            </div>

                        )}


                        {/* Upload Resume */}

                        <div className="space-y-2">

                            <Label>
                                Upload Resume
                            </Label>

                            <Input
                                type="file"
                                accept=".pdf"
                                onChange={
                                    uploadResume
                                }
                                disabled={
                                    uploadingResume
                                }
                            />

                            {uploadingResume && (
                                <p className="text-sm text-muted-foreground">
                                    Uploading resume...
                                </p>
                            )}

                        </div>


                        {/* Existing Resumes */}

                        <div className="space-y-2">

                            <Label>
                                Choose Resume
                            </Label>


                            {loadingResumes ? (

                                <p>
                                    Loading resumes...
                                </p>

                            ) : (

                                <ScrollArea className="max-h-75">

                                    <RadioGroup
                                        value={
                                            selectedResumeId
                                        }
                                        onValueChange={
                                            setSelectedResumeId
                                        }
                                    >

                                        <div className="space-y-3">

                                            {resumes.length === 0 ? (

                                                <p className="text-sm text-muted-foreground">
                                                    No resumes found.
                                                    Upload one to continue.
                                                </p>

                                            ) : (

                                                resumes.map(
                                                    (
                                                        resume
                                                    ) => (

                                                        <Card
                                                            key={
                                                                resume.id
                                                            }
                                                            className="p-4"
                                                        >

                                                            <div className="flex items-center gap-4">

                                                                <RadioGroupItem
                                                                    value={String(
                                                                        resume.id
                                                                    )}
                                                                    id={`resume-${resume.id}`}
                                                                />


                                                                <div className="flex h-14 w-14 flex-col items-center justify-center rounded-md border bg-red-50">

                                                                    <FileText
                                                                        className="h-6 w-6 text-red-600"
                                                                    />

                                                                    <span className="text-[10px] font-semibold text-red-600">
                                                                        PDF
                                                                    </span>

                                                                </div>


                                                                <Label
                                                                    htmlFor={`resume-${resume.id}`}
                                                                    className="flex-1 cursor-pointer"
                                                                >

                                                                    <p className="font-semibold">
                                                                        {
                                                                            resume.file_name
                                                                        }
                                                                    </p>

                                                                    <p className="text-sm text-muted-foreground">
                                                                        {
                                                                            resume.size
                                                                        }{" "}
                                                                        KB
                                                                    </p>

                                                                </Label>

                                                            </div>

                                                        </Card>

                                                    )
                                                )

                                            )}

                                        </div>

                                    </RadioGroup>

                                </ScrollArea>

                            )}

                        </div>


                        {/* Actions */}

                        <div className="flex justify-end gap-3">

                            <Button
                                variant="outline"
                                onClick={() =>
                                    setOpen(false)
                                }
                            >
                                Cancel
                            </Button>


                            <Button
                                onClick={applyJob}
                                disabled={
                                    applying ||
                                    uploadingResume
                                }
                            >

                                {applying
                                    ? "Applying..."
                                    : "Apply"}

                            </Button>

                        </div>


                    </div>

                </ScrollArea>

            </DialogContent>

        </Dialog>

    );

}