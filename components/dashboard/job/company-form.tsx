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
import { useState } from "react";
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

export default function CompanyForm({
    onCompanySelect,
}: CompanyFormProps) {
    const { profile } = useDashboard();

    const [companies, setCompanies] = useState<Company[]>([]);
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

    const handleCompanySubmit = () =>{

        if (!profile) {
            console.error("No logged-in user found");
            return;
        }

        /*
         * This is the company object we are creating.
         *
         * The user comes from the logged-in profile.
         */
        const newCompany: Company = {
            id: Date.now(),
            user: {
                id: profile.id,
                email: profile.email,
                is_staff: profile.is_staff,
                full_name: "",
                role: profile.role,
            },
            name: companyForm.name,
            website: companyForm.website,
            hr_phone_number: companyForm.hr_phone_number,
            hr_email: companyForm.hr_email,
        };

        // Add company to the company list
        setCompanies((prev) => [
            ...prev,
            newCompany,
        ]);

        // Automatically select the newly created company
        setSelectedCompany(newCompany.id.toString());

        // Send the complete company object to parent
        onCompanySelect(newCompany);

        // Close the form
        setShowCompanyForm(false);

        // Reset form
        setCompanyForm({
            user: profile.id,
            name: "",
            website: "",
            hr_phone_number: "",
            hr_email: "",
        });

        console.log("COMPANY CREATED:", newCompany);
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
                                placeholder="Website"
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

                            <Button type="submit" onClick={handleCompanySubmit}>
                                Submit
                            </Button>

                        </div>
                    </CardContent>
                </Card>
            )}

        </div>
    );
}