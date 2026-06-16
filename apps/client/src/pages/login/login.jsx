import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoginSchema } from "@/schema/login.schema.js";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useLogin } from "@/hooks/useLogin.hook.js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useToast } from "@/hooks/use-toast.js";
import { Loader2 } from "lucide-react";

export default function Login() {
  const { mutate, isError, isSuccess, isPending } = useLogin();
  const [login, setLogin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(LoginSchema),
  });

  function onSubmit(values) {
    mutate(values, {
      onSuccess: () => form.reset(),
    });
  }

  useEffect(() => {
    if (isSuccess) {
      console.log("Login successful");
      setLogin(true);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (login) {
      // Redirect to home page after successful login
      navigate("/projects");
    }
  }, [login]);

  useEffect(() => {
    if (isError) {
      toast({
        title: "Uh no! Your login request failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    }
  }, [isError]);

  return (
    <section
      className="flex flex-row w-full max-w-screen-xl
          min-h-screen justify-center items-center"
    >
      <div className="w-4/12 min-w-64">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Login to your account to create tasks
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Email"
                          value={field.value ?? ""}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Password"
                          {...field}
                          value={field.value ?? ""}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-row justify-between">
                <p className="basis-1/2">
                  Don't have an account?{" "}
                  <Link to="/Signup" className="hover:text-blue-500">
                    Signup Here
                  </Link>
                </p>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isPending ? "Logging in…" : "Login"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </section>
  );
}
