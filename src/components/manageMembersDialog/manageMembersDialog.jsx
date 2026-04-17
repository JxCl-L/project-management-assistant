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
  TableCell,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast.js";
import { Toaster } from "@/components/ui/toaster";
import { Trash2 } from "lucide-react";
import { useUpdateMember } from "@/hooks/useUpdateMember.hook.js";
import { useFetchMembers } from "@/hooks/useFetchMembers.hook.js";
import { AddMemberDialog } from "./addMemberDialog.jsx";
import { DeleteConfirmationDialog } from "./deleteConfirmationDialog.jsx";

export function ManageMembersDialog({
  open,
  onOpenChange,
  project,
  readOnly = false,
}) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const { toast } = useToast();

  const {
    data: members,
    isFetchError,
    isFetchPending,
  } = useFetchMembers(project?._id);

  const {
    mutate: updateMember,
    isError: isUpdateError,
    error: updateError,
    isSuccess: isUpdateSuccess,
    isPending: isUpdatePending,
  } = useUpdateMember();

  useEffect(() => {
    if (isUpdateSuccess) {
      toast({ title: "Member role updated successfully" });
    } else if (isUpdateError) {
      toast({
        title: "Failed to update member",
        description: updateError?.message || "Please try again",
        variant: "destructive",
      });
    }
  }, [isUpdateSuccess, isUpdateError, toast]);

  const handleRoleChange = (memberId, newRole) => {
    updateMember({
      projectId: project._id,
      memberData: { _id: memberId, role: newRole },
    });
  };

  const openDeleteDialog = (member) => {
    setSelectedMember(member);
    setShowDeleteAlert(true);
  };

  const memberCount = members?.data?.length || 0;
  const hasMembersData =
    members?.data && !isFetchPending && !isFetchError && memberCount > 0;

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader className="text-left">
            <DialogTitle>Manage Members</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {project?.name}: {memberCount} member(s)
              </p>
              {!readOnly && (
                <Button
                  onClick={() => setShowAddMember(true)}
                  size="sm"
                  className="gap-2"
                >
                  Add Member
                </Button>
              )}
            </div>

            {isFetchPending ||
              (!members?.data && (
                <div className="text-center py-8 text-muted-foreground">
                  Loading members...
                </div>
              ))}

            {isFetchError && members && (
              <div className="text-center py-8 text-destructive">
                Failed to load members
              </div>
            )}

            {!isFetchPending &&
              !isFetchError &&
              members?.data &&
              memberCount === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No members yet. Add your first member!
                </div>
              )}

            {hasMembersData && (
              <div className="border rounded-lg p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      {!readOnly && <TableHead></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.data.map((member) => (
                      <TableRow key={member._id}>
                        <TableCell>
                          {member.user?.firstName} {member.user?.lastName}
                        </TableCell>
                        <TableCell>{member.user?.email}</TableCell>
                        <TableCell className="capitalize">
                          {readOnly ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  {member.role}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>You have no permission to change roles</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Select
                              value={member.role}
                              onValueChange={(value) =>
                                handleRoleChange(member._id, value)
                              }
                              disabled={isUpdatePending}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Roles</SelectLabel>
                                  <SelectItem value="manager">
                                    Manager
                                  </SelectItem>
                                  <SelectItem value="editor">Editor</SelectItem>
                                  <SelectItem value="viewer">Viewer</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        {!readOnly && (
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
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AddMemberDialog
        showAddMember={showAddMember}
        setShowAddMember={setShowAddMember}
        project={project}
      />

      <DeleteConfirmationDialog
        showDeleteAlert={showDeleteAlert}
        setShowDeleteAlert={setShowDeleteAlert}
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
        project={project}
      />

      <Toaster />
    </TooltipProvider>
  );
}
