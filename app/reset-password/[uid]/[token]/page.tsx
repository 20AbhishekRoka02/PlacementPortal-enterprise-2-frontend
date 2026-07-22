"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import * as z from "zod";

const formSchema = z
    .object({
        new_password1: z.string().min(8),
        new_password2: z.string().min(8),
    })
    .refine(
        (data) => data.new_password1 === data.new_password2,
        {
            message: "Passwords do not match.",
            path: ["new_password2"],
        }
    );

function getErrorMessage(result: any) {
    if (result.detail) return result.detail;

    if (result.message) return result.message;

    if (result.non_field_errors?.length) {
        return result.non_field_errors[0];
    }

    const firstKey = Object.keys(result)[0];

    if (firstKey && Array.isArray(result[firstKey])) {
        return result[firstKey][0];
    }

    return "Something went wrong.";
}

export default function ResetPasswordPage() {
    const params = useParams();
    const uid = params.uid as string;
    const token = params.token as string;

    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            new_password1: "",
            new_password2: "",
        },
    });

    async function onSubmit(
        values: z.infer<typeof formSchema>
    ) {
        const loadingToast = toast.loading(
            "Resetting password...",
            {
                position: "top-center",
            }
        );

        try {
            const response = await fetch(
                "/api/auth/forgot-password/confirm",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        uid,
                        token,
                        ...values,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    getErrorMessage(result)
                );
            }

            toast.dismiss(loadingToast);

            toast.success(
                "Password reset successful.",
                {
                    position: "top-center",
                }
            );

            router.push("/login");
        } catch (error) {
            toast.dismiss(loadingToast);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Something went wrong.",
                {
                    position: "top-center",
                }
            );
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md">
                <form
                    id="form-reset-password"
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-6"
                >
                    <FieldGroup>
                        <div className="flex flex-col items-center gap-1 text-center">
                            <h1 className="text-2xl font-bold">
                                Reset your password
                            </h1>

                            <p className="text-sm text-balance text-muted-foreground">
                                Enter and confirm your new password.
                            </p>
                        </div>

                        {/* New Password */}
                        <Controller
                            name="new_password1"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field
                                    data-invalid={
                                        fieldState.invalid
                                    }
                                >
                                    <FieldLabel htmlFor="new-password">
                                        New Password
                                    </FieldLabel>

                                    <Input
                                        {...field}
                                        id="new-password"
                                        type="password"
                                        placeholder="Enter your new password"
                                        required
                                    />

                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[
                                                fieldState.error,
                                            ]}
                                        />
                                    )}
                                </Field>
                            )}
                        />

                        {/* Confirm Password */}
                        <Controller
                            name="new_password2"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field
                                    data-invalid={
                                        fieldState.invalid
                                    }
                                >
                                    <FieldLabel htmlFor="confirm-password">
                                        Confirm Password
                                    </FieldLabel>

                                    <Input
                                        {...field}
                                        id="confirm-password"
                                        type="password"
                                        placeholder="Confirm your new password"
                                        required
                                    />

                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[
                                                fieldState.error,
                                            ]}
                                        />
                                    )}
                                </Field>
                            )}
                        />

                        {/* Submit Button */}
                        <Field>
                            <Button
                                type="submit"
                                form="form-reset-password"
                                className="w-full"
                            >
                                Reset Password
                            </Button>
                        </Field>
                    </FieldGroup>
                </form>
            </div>
        </div>
    );
}