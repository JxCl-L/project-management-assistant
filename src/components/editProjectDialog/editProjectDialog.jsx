import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateProjectSchema } from "@/schema/updateProject.schema.js";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useUpdateProject } from "@/hooks/useUpdateProject.hook.js";
import { useDeleteProject } from "@/hooks/useDeleteProject.hook.js";
import { useToast } from "@/hooks/use-toast.js";
import { Toaster } from "@/components/ui/toaster";
import { Trash2 } from "lucide-react";

export function EditProjectDialog({ open, onOpenChange, project }) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const { toast } = useToast();

  const {
    mutate: updateProject,
    isError: isUpdateError,
    isSuccess: isUpdateSuccess,
    isPending: isUpdatePending,
  } = useUpdateProject();

  const {
    mutate: deleteProject,
    isError: isDeleteError,
    isSuccess: isDeleteSuccess,
    isPending: isDeletePending,
  } = useDeleteProject();

  const form = useForm({
    resolver: zodResolver(UpdateProjectSchema),
  });

  // Populate form with existing project data
  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description || "",
      });
    }
  }, [project, form]);

  // Consolidated toast notifications
  useEffect(() => {
    if (isUpdateSuccess) {
      toast({ title: "Project updated successfully" });
      form.reset();
      onOpenChange(false);
    } else if (isUpdateError) {
      toast({
        title: "Project update failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  }, [isUpdateSuccess, isUpdateError, toast, form, onOpenChange]);

  useEffect(() => {
    if (isDeleteSuccess) {
      toast({ title: "Project deleted successfully" });
      form.reset();
      onOpenChange(false);
      setShowDeleteAlert(false);
    } else if (isDeleteError) {
      toast({
        title: "Project deletion failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  }, [isDeleteSuccess, isDeleteError, toast, form, onOpenChange]);

  const handleSubmit = (values) => {
    updateProject({ _id: project._id, ...values });
  };

  const handleDelete = () => {
    deleteProject({ _id: project._id });
  };

  const handleCancel = () => {
    form.reset();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="text-left">
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
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

              <DialogFooter className="mt-8 flex flex-row justify-between sm:justify-between">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteAlert(true)}
                  disabled={isDeletePending}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUpdatePending}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </DialogClose>

                  <Button type="submit" disabled={isUpdatePending}>
                    {isUpdatePending ? "Updating..." : "Update"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>

        <Toaster />
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete {project?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project "<strong>{project?.name}</strong>" and all associated
              tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletePending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeletePending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletePending ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
