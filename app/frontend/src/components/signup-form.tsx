import { authClient } from "#/lib/authClient"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForm } from "@tanstack/react-form"
import { Link, useRouter } from "@tanstack/react-router"
import z from "zod"
import { Spinner } from "./ui/spinner"


const formSchema = z.object({
    name: z.string().min(4).max(64),
    email: z.email(),
    password: z.string().min(8).max(16),
    confirmPassword: z.string().min(6).max(16)
}).refine((data) => data.password === data.confirmPassword, {
    error: "Пароли не совпадают",
    path: ["confirmPassword"]
})

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
    const router = useRouter()
    const {data: session} = authClient.useSession()
    const form = useForm({
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        },
        onSubmit: async ({ value }) => {
            const { confirmPassword, ...credentials } = value
            try {
                const {data} = await authClient.signUp.email(credentials)
                if (data) router.navigate({to: "/movies"})
            } catch (e) {
                // TODO: make exceptions visible for user
                console.error(e)
            }
        },
        validators: {
            onSubmit: formSchema
        }
    })

    if (session) {
        // router.navigate({to: "/movies"})
    }

    return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
            onSubmit={(e) => {
                e.preventDefault(),
                e.stopPropagation(),
                form.handleSubmit()
            }}>
          <FieldGroup>
            <form.Field name="name">
                {(field) => {
                    return (
                        <Field>
                        <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                        <Input
                            id={field.name}
                            name={field.name}
                            type="text"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="John Doe"
                            required />
                        </Field>
                    )
                }
                }
            </form.Field>
            <form.Field name="email">
                {(field) => {
                    return (
                        <Field>
                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                        <Input
                            id={field.name}
                            name={field.name}
                            type="email"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="m@example.com"
                            required
                        />
                        <FieldDescription>
                            We&apos;ll use this to contact you. We will not share your email
                            with anyone else.
                        </FieldDescription>
                        </Field>
                    )
                }}
            </form.Field>
            <form.Field name="password">
                {(field) => {
                    return (
                        <Field>
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                        <Input
                            id={field.name}
                            name={field.name}
                            type="password"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            required />
                        <FieldDescription>
                            Must be at least 8 characters long.
                        </FieldDescription>
                        </Field>
                    )
                }}
            </form.Field>
            <form.Field name="confirmPassword">
                {(field) => {
                    return (
                        <Field>
                        <FieldLabel htmlFor={field.name}>
                            Confirm Password
                        </FieldLabel>
                        <Input
                            id={field.name}
                            name={field.name}
                            type="password"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            required />
                        <FieldDescription>Please confirm your password.</FieldDescription>
                        </Field>
                    )
                }}
            </form.Field>

            <FieldGroup>
              <Field>
                <form.Subscribe
                    selector={(state) => [state.isSubmitting] as const}
                    children={([isSubmitting]) => (
                    <Button
                        type="submit"
                        disabled={isSubmitting}>
                        {isSubmitting ?
                            <><span><Spinner/></span>
                            <span>Creating Account...</span></>
                         : "Create Account"}
                    </Button>
                    )}/>
                <Button variant="outline" type="button">
                  Sign up with Google
                </Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <Link to="/signin">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
