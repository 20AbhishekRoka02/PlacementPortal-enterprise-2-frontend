"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDashboard } from "@/app/dashboard/DashboardSidebarProvider";

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

interface CompanyFormData {
    user: number | "";
    name: string;
    website: string;
    hr_phone_number: string;
    hr_email: string;
}

interface CompanyFormProps {
    onCompanySelect: (company: Company) => void;
}

function getApiErrorMessage(payload: unknown): string {
    if (typeof payload === "string") return payload;
    if (!payload || typeof payload !== "object") return "Unable to create company.";

    const errors = payload as Record<string, unknown>;
    const summary = errors.message ?? errors.detail;
    if (typeof summary === "string") return summary;

    const fieldErrors = Object.entries(errors)
        .map(([field, value]) => {
            const messages = Array.isArray(value)
                ? value.map(String).join(", ")
                : typeof value === "string"
                    ? value
                    : JSON.stringify(value);
            return `${field}: ${messages}`;
        })
        .join("; ");

    return fieldErrors || "Unable to create company.";
}

export default function CompanyForm({
    onCompanySelect,
}: CompanyFormProps) {
    const { profile } = useDashboard();

    const [companies, setCompanies] = useState<Company[]>([]);
    const [savingCompany, setSavingCompany] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<string>("");
    const [showCompanyForm, setShowCompanyForm] = useState(false);

    const [companyForm, setCompanyForm] =
        useState<CompanyFormData>({
            user: "",
            name: "",
            website: "",
            hr_phone_number: "",
            hr_email: "",
        });

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await fetch("/api/companies", {
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch companies.");
                }

                const payload: unknown = await response.json();
                const list = Array.isArray(payload)
                    ? payload
                    : payload && typeof payload === "object" && "data" in payload && Array.isArray(payload.data)
                        ? payload.data
                        : payload && typeof payload === "object" && "results" in payload && Array.isArray(payload.results)
                            ? payload.results
                            : [];

                setCompanies(list as Company[]);
            } catch (error) {
                console.error("Unable to load companies:", error);
            }
        };

        fetchCompanies();
    }, []);

    const handleAddCompany = () => {
        setShowCompanyForm((prev) => !prev);

        // Automatically use the logged-in user
        if (profile) {
            setCompanyForm((prev) => ({
                ...prev,
                user: profile.id,
            }));
        }
    };

    const handleCompanySubmit = async () => {
        if (!profile) {
            toast.error("Unable to identify the signed-in user.");
            return;
        }

        if (
            !companyForm.name.trim() ||
            !companyForm.website.trim() ||
            !companyForm.hr_email.trim() ||
            !companyForm.hr_phone_number.trim()
        ) {
            toast.error("Fill in all company and HR fields.");
            return;
        }

        setSavingCompany(true);

        try {
            const enteredWebsite = companyForm.website.trim();
            const website = enteredWebsite
                .replace(/^http:\/\//i, "https://")
                .replace(/^(?!https:\/\/)/i, "https://");

            const response = await fetch("/api/companies", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: profile.id,
                    name: companyForm.name.trim(),
                    website,
                    hr_phone_number: companyForm.hr_phone_number.trim(),
                    hr_email: companyForm.hr_email.trim(),
                }),
            });

            const payload: unknown = await response.json();
            if (!response.ok) {
                throw new Error(getApiErrorMessage(payload));
            }

            const responseBody = payload as Record<string, unknown>;
            const companyData = (
                responseBody.company ?? responseBody.data ?? payload
            ) as Record<string, unknown>;
            const userData = companyData.user;
            const responseUser =
                userData && typeof userData === "object"
                    ? (userData as Partial<CompanyUser>)
                    : null;
            const id = Number(companyData.id);

            if (!Number.isFinite(id)) {
                throw new Error("The server did not return the created company.");
            }

            const newCompany: Company = {
                id,
                user: {
                    id: Number(responseUser?.id ?? userData ?? profile.id),
                    email: responseUser?.email ?? profile.email,
                    is_staff: responseUser?.is_staff ?? profile.is_staff,
                    full_name: responseUser?.full_name ?? "",
                    role: responseUser?.role ?? profile.role,
                },
                name: String(companyData.name ?? companyForm.name.trim()),
                website: String(companyData.website ?? companyForm.website.trim()),
                hr_phone_number: String(
                    companyData.hr_phone_number ?? companyForm.hr_phone_number.trim()
                ),
                hr_email: String(companyData.hr_email ?? companyForm.hr_email.trim()),
            };

            setCompanies((prev) => [...prev, newCompany]);
            setSelectedCompany(newCompany.id.toString());
            onCompanySelect(newCompany);
            setShowCompanyForm(false);
            setCompanyForm({
                user: profile.id,
                name: "",
                website: "",
                hr_phone_number: "",
                hr_email: "",
            });
            toast.success("Company created and selected.");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Unable to create company."
            );
        } finally {
            setSavingCompany(false);
        }
    };

    const handleCompanySelect = (value: string) => {
        setSelectedCompany(value);

        const company = companies.find(
            (company) =>
                company.id.toString() === value
        );

        if (company) {
            onCompanySelect(company);
        }
    };

    return (
        <div className="space-y-4">

            {/* Company selector + Add button */}
            <div className="flex gap-2">

                <Select
                    value={selectedCompany}
                    onValueChange={handleCompanySelect}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a company" />
                    </SelectTrigger>

                    <SelectContent>
                        {companies.map((company) => (
                            <SelectItem
                                key={company.id}
                                value={company.id.toString()}
                            >
                                {company.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    type="button"
                    onClick={handleAddCompany}
                    variant="outline"
                >
                    <Plus className="h-4 w-4" />
                </Button>

            </div>

            {/* Add company form */}
            {showCompanyForm && (
                <Card>

                    <CardContent>
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Company Information</h3>

                            {/* Logged-in user */}
                            <Select
                                value={
                                    companyForm.user
                                        ? companyForm.user.toString()
                                        : ""
                                }
                                disabled
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select user" />
                                </SelectTrigger>

                                <SelectContent>
                                    {profile && (
                                        <SelectItem
                                            value={profile.id.toString()}
                                        >
                                            (
                                            {profile.email}
                                            )
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>

                            {/* Company name */}
                            <Input
                                placeholder="Company Name"
                                value={companyForm.name}
                                onChange={(e) =>
                                    setCompanyForm((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                required
                            />

                            {/* Website */}
                            <Input
                                placeholder="https://example.com"
                                value={companyForm.website}
                                onChange={(e) =>
                                    setCompanyForm((prev) => ({
                                        ...prev,
                                        website: e.target.value,
                                    }))
                                }
                                required
                            />

                            <h3 className="text-lg font-semibold">HR Information</h3>
                            {/* HR Email */}
                            <Input
                                type="email"
                                placeholder="HR Email"
                                value={companyForm.hr_email}
                                onChange={(e) =>
                                    setCompanyForm((prev) => ({
                                        ...prev,
                                        hr_email: e.target.value,
                                    }))
                                }
                                required
                            />

                            {/* HR Phone */}
                            <Input
                                placeholder="HR Phone Number"
                                value={companyForm.hr_phone_number}
                                onChange={(e) =>
                                    setCompanyForm((prev) => ({
                                        ...prev,
                                        hr_phone_number: e.target.value,
                                    }))
                                }
                                required
                            />

                            <Button
                                type="button"
                                onClick={handleCompanySubmit}
                                disabled={savingCompany}
                            >
                                {savingCompany ? "Creating..." : "Submit"}
                            </Button>

                        </div>
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
