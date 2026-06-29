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

const formSchema = z.object({
  email: z.email(),
  password: z.string()
})

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })


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

      router.push("/");
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
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
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
        {/* <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            className="bg-background"
            onChange={(event) => {
              setEmail(event?.target.value)
            }}
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            required
            className="bg-background"
            onChange={(event) => {
              setPassword(event?.target.value)
            }}
          />
        </Field>
        <Field>
          <Button type="submit">Login</Button>
        </Field> */}
        {/* <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button variant="outline" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Login with GitHub
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <a href="#" className="underline underline-offset-4">
              Sign up
            </a>
          </FieldDescription>
        </Field> */}
      </FieldGroup>
    </form>
  )
}
