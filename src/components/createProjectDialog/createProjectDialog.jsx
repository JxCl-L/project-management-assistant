import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateProject } from "@/hooks/useCreateProject.hook.js";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CreateProjectSchema } from "@/schema/createProject.schema.js";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast.js";
import { Toaster } from "@/components/ui/toaster";
import { useQueryClient } from "@tanstack/react-query";
import { set } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function CreateProjectDialog({ trigger } = {}) {
  const [openDialog, setDialogOpen] = useState(false);
  const { mutate, isError, isSuccess, isPending, error } = useCreateProject();
  const { toast } = useToast();
  //   const queryClient = useQueryClient(); // invalidate queries in hook

  const form = useForm({
    resolver: zodResolver(CreateProjectSchema),
  });

  function onSubmit(values) {
    console.log("Submitting:", values);

    mutate(values, {
      onSuccess: () => {
        console.log("Project creation successful");
        form.reset();
        setDialogOpen(false);
        toast({
          title: "Project created successfully",
        });
      },
      onError: () => {
        console.log("Project creation failed:", error);
        toast({
          title: "Uh no! Your project creation request failed",
          description: "Please try again",
          variant: "destructive",
        });
      },
    });
  }

  return (
    <Dialog open={openDialog} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline">Create Project</Button>}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-left">
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new project
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              {/* project name */}
              {/* <div className="grid gap-3">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...form.register("name")} />
              </div> */}
              <FormField
                control={form.control} // connect to form
                name="name" // which field to control
                render={(
                  { field } // render function
                ) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Project name"
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* project description */}
              {/* <div className="grid gap-3">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  rows={4}
                  className="resize-none"
                />
              </div> */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Project description"
                        rows={4}
                        className="resize-none"
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-8 flex flex-row justify-end gap-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => form.reset()}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      <Toaster />
    </Dialog>
  );
}
