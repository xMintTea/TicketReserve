import { cn } from "cn"

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
import z from "zod"
import { Link, useRouter } from "@tanstack/react-router"
import { authClient } from "#/lib/authClient"
import { Spinner } from "./ui/spinner"


const formSchema = z.object({
    email: z.email(),
    password: z.string().min(8).max(16)
})


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
    const {data: session} = authClient.useSession()
    const router = useRouter()
    const form = useForm({
        defaultValues: {
            email: '',
            password: ''
        },
        onSubmit: async ({ value }) => {
            try {
                const {data} = await authClient.signIn.email({...value})
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
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
                                onChange={(e) => 
                                    field.handleChange(e.target.value)
                                }
                                placeholder="m@example.com"
                                required
                                />
                            </Field>
                        )
                    }}
            </form.Field>
            <form.Field name="password">
                {(field) => {
                    return (
                    <Field>
                        <div className="flex items-center">
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                        <a
                            href="#"
                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        >
                            Forgot your password?
                        </a>
                        </div>
                        <Input
                            id={field.name}
                            name={field.name}
                            type="password"
                            value={field.state.value}
                            onChange={(e) => 
                                    field.handleChange(e.target.value)
                                }
                            required />
                    </Field>
                    )
                }}
            </form.Field>

              <Field>
                <form.Subscribe
                    selector={(state) => [state.isSubmitting] as const}
                    children={([isSubmitting]) => (
                        <Button 
                            type="submit"
                            disabled={isSubmitting}
                            >
                                {isSubmitting ?
                                <>
                                <span><Spinner/></span>
                                <span>Logging in...</span>
                                </>
                                 : "Login"}
                        </Button>
                    )}
                ></form.Subscribe>

                <Button variant="outline" type="button">
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <Link to="/signup">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
