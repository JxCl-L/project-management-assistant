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
import { CreateTaskForm } from "@/components/createTaskForm/createTaskForm.jsx";

export function CreateTaskDialog({open, onOpenChange}) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Create Task</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
          <DialogTitle className="sr-only">Create Task</DialogTitle>
          <CreateTaskForm onSuccess={() => onOpenChange(false)}/>
      </DialogContent>
    </Dialog>
  );
}
