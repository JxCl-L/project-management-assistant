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
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast.js";
import { useDeleteMember } from "@/hooks/useDeleteMember.hook.js";

export const DeleteConfirmationDialog = ({
  showDeleteAlert,
  setShowDeleteAlert,
  selectedMember,
  setSelectedMember,
  project,
}) => {
  const { toast } = useToast();

  const {
    mutate: deleteMember,
    isError: isDeleteError,
    error: deleteError,
    isSuccess: isDeleteSuccess,
    isPending: isDeletePending,
  } = useDeleteMember();

  // Handle delete success/error notifications
  useEffect(() => {
    if (isDeleteSuccess) {
      toast({ title: "Member removed successfully" });
      handleClose();
    } else if (isDeleteError) {
      toast({
        title: "Failed to delete member",
        description: deleteError?.message || "Please try again",
        variant: "destructive",
      });
    }
  }, [isDeleteSuccess, isDeleteError]);

  const handleClose = () => {
    setShowDeleteAlert(false);
    setSelectedMember(null);
  };

  const handleDeleteMember = () => {
    if (!selectedMember?._id || !project?._id) return;
    
    deleteMember({
      projectId: project._id,
      memberId: selectedMember._id,
    });
  };

  const memberFullName = selectedMember?.user
    ? `${selectedMember.user.firstName || ""} ${selectedMember.user.lastName || ""}`.trim()
    : "this member";

  return (
    <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Member?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove{" "}
            <strong>{memberFullName}</strong> from this project? They will lose
            access to all project resources.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeletePending} onClick={handleClose}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteMember}
            disabled={isDeletePending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeletePending ? "Removing..." : "Remove Member"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};