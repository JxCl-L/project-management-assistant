import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateMemberSchema } from "@/schema/updateMember.schema.js";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast.js";
import { Toaster } from "@/components/ui/toaster";
import { Trash2, Edit } from "lucide-react";
import { useUpdateMember } from "@/hooks/useUpdateMember.hook.js";
import { useFetchMembers } from "@/hooks/useFetchMembers.hook.js";
import { AddMemberDialog } from "./addMemberDialog.jsx";
import { DeleteConfirmationDialog } from "./deleteConfirmationDialog.jsx";

export function ManageMembersDialog({ open, onOpenChange, project }) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const { toast } = useToast();

  const {
    data: members,
    isFetchError,
    isFetchSuccess,
    isFetchPending,
  } = useFetchMembers(project?._id);

  const {
    mutate: updateMember,
    isError: isUpdateError,
    isSuccess: isUpdateSuccess,
    isPending: isUpdatePending,
  } = useUpdateMember();

  const updateMemberForm = useForm({
    resolver: zodResolver(UpdateMemberSchema),
  });

  // Update member toast notifications
  useEffect(() => {
    if (isUpdateSuccess) {
      toast({ title: "Member role updated successfully" });
      updateMemberForm.reset();
      setSelectedMember(null);
    } else if (isUpdateError) {
      toast({
        title: "Failed to update member",
        description: "Please try again",
        variant: "destructive",
      });
    }
  }, [isUpdateSuccess, isUpdateError, toast, updateMemberForm]);

  const handleUpdateMember = (values) => {
    console.log("Updating member with project id", project._id);
    console.log("Member ID:", values._id, "New Role:", values.role);
    updateMember({
      projectId: project._id,
      memberData: { _id: values._id, role: values.role },
    });
  };

  const openDeleteDialog = (member) => {
    setSelectedMember(member);
    setShowDeleteAlert(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader className="text-left">
            <DialogTitle>Manage Members</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {project?.name}: {members?.data?.length || 0} member(s)
              </p>
              <Button
                onClick={() => setShowAddMember(true)}
                size="sm"
                className="gap-2"
              >
                Add Member
              </Button>
            </div>

            {isFetchPending ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading members...
              </div>
            ) : isFetchError ? (
              <div className="text-center py-8 text-destructive">
                Failed to load members
              </div>
            ) : members?.data?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No members yet. Add your first member!
              </div>
            ) : (
              <div className="border rounded-lg p-4 space-y-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members?.data?.map((member) => (
                      <TableRow key={member._id}>
                        <TableCell>
                          {member.user?.firstName} {member.user?.lastName}
                        </TableCell>
                        <TableCell>{member.user?.email}</TableCell>
                        <TableCell className="capitalize">
                          <Select
                            value={member?.role}
                            onValueChange={(value) => handleUpdateMember({_id: member._id, role: value})}
                            disabled={isUpdatePending}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder={member?.role} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Roles</SelectLabel>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(member)}
                            className="my-0 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <AddMemberDialog
        showAddMember={showAddMember}
        setShowAddMember={setShowAddMember}
        project={project}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        showDeleteAlert={showDeleteAlert}
        setShowDeleteAlert={setShowDeleteAlert}
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
        project={project}
      />

      <Toaster />
    </>
  );
}
