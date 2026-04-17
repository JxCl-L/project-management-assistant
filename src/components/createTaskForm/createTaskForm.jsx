import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CreateTaskSchema } from "@/schema/createTask.schema.js";
import { useCreateTask } from "@/hooks/useCreateTask.hook.js";
import { useToast } from "@/hooks/use-toast.js";
import { Toaster } from "@/components/ui/toaster";
import { useQueryClient } from "@tanstack/react-query";


export function CreateTaskForm({onSuccess}) {
  const [date, setDate] = useState();
  const { mutate, isError, isSuccess, isPending } = useCreateTask();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(CreateTaskSchema),
  });

  function onSubmit(values) {
    console.log(values);

    let dueDate = values.dueDate.toISOString();
    mutate({ ...values, dueDate }); //override the dueDate property with the formatted ISO string
    form.reset();
    // queryClient.invalidateQueries({ 
    //   queryKey: ["fetchTasks"],
    //   refetchType: "all",
    //   exact: false
    // }); // invalidate queries in hook
    if(onSuccess){
      onSuccess();
    }
  }

  useEffect(() => {
    if(isSuccess){
      toast({
        title: "New task created successfully",
      })
    }
  }, [isSuccess])

  useEffect(() => {
    if(isError){
      toast({
        title: "Uh no! Your task creation request failed",
        description: "Please try again",
        variant: "destructive"
      })
    }
  }, [isError])



  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight">Create Task</h2>
      <p className="text-sm text-muted-foreground mb-4">Fill in the details to create a new task</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="py-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Title"
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <Input type="text" placeholder="Task Title" /> */}
          </div>
          <div className="flex flex-row justify-between py-2">
            <div className="mr-2 w-full">
              {/* <Input {...field} placeholder="Status" value={field.value ?? "" } /> */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="todo">Todo</SelectItem>
                          <SelectItem value="inProgress">In Progress</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="ml-2 w-full">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="py-2">
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                        //   data-empty={!date}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                            // !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon />
                          {field.value ? format(field.value, "PPP") : <span>Due date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled = {(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="py-2">
            {/* <Textarea placeholder="Task description" /> */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                    <FormControl>
                      <Textarea placeholder="Task description" 
                        {...field} />
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="py-2 flex justify-end">
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </Form>
      <Toaster />
    </div>
  );
}
