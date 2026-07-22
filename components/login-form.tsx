"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react"

const formSchema = z.object({
  email: z.email(),
  password: z.string()
});

const forgotPasswordSchema = z.object({
  email: z.email(),
});

function getErrorMessage(result: any) {
  if (result.detail) return result.detail;
  if (result.message) return result.message;
  if (result.non_field_errors?.length) return result.non_field_errors[0];

  const firstKey = Object.keys(result)[0];
  if (firstKey && Array.isArray(result[firstKey])) {
    return result[firstKey][0];
  }

  return "Something went wrong.";
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const forgotPasswordForm = useForm<
    z.infer<typeof forgotPasswordSchema>
  >({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function handleForgotPassword(
    values: z.infer<typeof forgotPasswordSchema>
  ) {
    const loadingToast = toast.loading(
      "Sending password reset email...",
      {
        position: "top-center",
      }
    );

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(getErrorMessage(result));
      }

      toast.dismiss(loadingToast);

      toast.success(result.message, {
        position: "top-center",
      });

      forgotPasswordForm.reset();
      setIsForgotPasswordOpen(false);
    } catch (err) {
      toast.dismiss(loadingToast);

      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong.",
        {
          position: "top-center",
        }
      );
    }
  }


  async function onSubmit(values: z.infer<typeof formSchema>) {
    const loadingToast = toast.loading("Logging in...", {
      position: "top-center",
    });

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(values),
      });

      const result = await res.json();

      if (!res.ok) {
        let errorMessage = "Login failed.";

        if (typeof result.detail === "string") {
          errorMessage = result.detail;
        } else if (typeof result.message === "string") {
          errorMessage = result.message;
        } else if (Array.isArray(result.non_field_errors)) {
          errorMessage = result.non_field_errors[0];
        } else {
          const firstKey = Object.keys(result)[0];
          if (firstKey && Array.isArray(result[firstKey])) {
            errorMessage = result[firstKey][0];
          }
        }

        throw new Error(errorMessage);
      }

      toast.dismiss(loadingToast);

      toast.success("Login Successful!", {
        position: "top-center",
      });

      router.push("/dashboard");
    } catch (err) {
      toast.dismiss(loadingToast);

      toast.error(
        err instanceof Error ? err.message : "Something went wrong.",
        {
          position: "top-center",
        }
      );

      console.error(err);
    }
  }

  return (
    <>
      <form id="form-login" className={cn("flex flex-col gap-6", className)} {...props} onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Login to your account</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          {/* Email Controller */}
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="form-email"
                  type="email"
                  placeholder="Enter your email"
                  aria-invalid={fieldState.invalid}
                  // onChange={(e) => { setEmail(e.target.value) }}
                  autoComplete="off"
                  required
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}

              </Field>
            )}
          />


          {/* Password Controller */}
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex">

                  <FieldLabel htmlFor="form-password">Password</FieldLabel>
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>
                <Input
                  {...field}
                  id="form-password"
                  type="password"
                  placeholder="Enter your password"
                  required
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}

              </Field>
            )}
          />

          {/* Submit the form */}
          <Field>
            <Button type="submit" form="form-login">Login</Button>
          </Field>
        </FieldGroup>
      </form>
      {/* Forgot password email form dialog */}
      <Dialog
        open={isForgotPasswordOpen}
        onOpenChange={setIsForgotPasswordOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Forgot Password?</DialogTitle>
            <DialogDescription>
              Enter the email address associated with your account.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={forgotPasswordForm.handleSubmit(
              handleForgotPassword
            )}
            className="space-y-4"
          >
            <Controller
              name="email"
              control={forgotPasswordForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Email</FieldLabel>

                  <Input
                    {...field}
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="off"
                    required
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Button type="submit" className="w-full">
              Send Reset Link
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
