import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateMemberByEmailSchema } from "@pm/schemas";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast.js";
import { useCreateMemberByEmail } from "@/hooks/useCreateMemberByEmail.hook.js";

export const AddMemberDialog = ({ showAddMember, setShowAddMember, project }) => {
  const { toast } = useToast();

  const { mutate: createMemberByEmail, isPending: isCreatePending } = useCreateMemberByEmail();

  const createMemberForm = useForm({
    resolver: zodResolver(CreateMemberByEmailSchema),
    defaultValues: { email: "", role: "" },
  });

  const handleCreateMember = (values) => {
    createMemberByEmail({ projectId: project._id, memberData: values }, {
      onSuccess: () => {
        toast({ title: "Member added successfully" });
        createMemberForm.reset();
        setShowAddMember(false);
      },
      onError: (err) => {
        toast({
          title: "Failed to add member",
          description: err?.response?.data?.message || err?.message || "Please try again",
          variant: "destructive",
        });
      },
    });
  };

  const handleCancel = () => {
    createMemberForm.reset();
    setShowAddMember(false);
  };

  return (
    <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
        </DialogHeader>

        <Form {...createMemberForm}>
          <form onSubmit={createMemberForm.handleSubmit(handleCreateMember)}>
            <div className="grid gap-4">
              <FormField
                control={createMemberForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Email</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter user email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createMemberForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isCreatePending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatePending}>
                {isCreatePending ? "Adding..." : "Add Member"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};