const { Schema, model } = require("mongoose");

const taskSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxLength: [100, "Title must be at most 100 characters long"],
    },
    description: {
      type: String,
      required: [true, "Task description is required"],
      trim: true,
      maxLength: [500, "Description must be at most 500 characters long"],
    },
    status: {
      type: String,
      required: [true, "Task status is required"],
      enum: ["todo", "inProgress", "completed"],
      default: "todo",
    },
    priority: {
      type: String,
      required: [true, "Task priority is required"],
      enum: ["low", "normal", "high"],
      default: "normal",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Enable createdAt and updatedAt fields to automatically update
    versionKey: false, // Disable the __v field because we don't need it
  }
);

// Indexes for query performance
taskSchema.index({ project: 1 });                  // all queries filter by project
taskSchema.index({ project: 1, status: 1 });       // compound: status counts + filtered list
taskSchema.index({ project: 1, createdAt: -1 });   // sorting by createdAt desc
taskSchema.index({ project: 1, createdAt: 1 });    // sorting by createdAt asc

const Task = model("Task", taskSchema); // "Task" is the name of the collection in MongoDB

module.exports = Task;

// cascade delete cotent when task is deleted 
// todo: enable this later
// taskSchema.pre("remove", async function (next) {
//   const TaskContent = require("../taskContent/taskContent.schema");
//   await TaskContent.deleteOne({ task: this._id });
//   next();
// }

/**
 * @swagger
 *
 * components:
 *  schemas:
 *     Task:
 *       type: object
 *       required:
 *        - title
 *        - description
 *        - status
 *        - priority
 *        - dueDate
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the task
 *           maxLength: 100
 *         description:
 *           type: string
 *           description: The description of the task
 *           maxLength: 500
 *         status:
 *           type: string
 *           description: The status of the task
 *           enum: [ "todo", "inProgress", "completed" ]
 *         priority:
 *           type: string
 *           description: The priority of the task
 *           enum: [ "low", "normal", "high" ]
 *         dueDate:
 *           type: string
 *           description: The due date of the task
 *           format: ISO8601 Date String
 *       example:
 *         title: "Create a new video"
 *         description: "A video about creating a new task"
 *         status: "todo"
 *         priority: "normal"
 *         dueDate: "2025-01-01T23:59:59Z"
 */

/**
 * @swagger
 *
 * components:
 *  schemas:
 *     TaskUpdate:
 *       type: object
 *       required:
 *        - _id
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier MongoDB ObjectId of the task
 *           format: ObjectId
 *         title:
 *           type: string
 *           description: The title of the task
 *           maxLength: 100
 *         description:
 *           type: string
 *           description: The description of the task
 *           maxLength: 500
 *         status:
 *           type: string
 *           description: The status of the task
 *           enum: [ "todo", "inProgress", "completed" ]
 *         priority:
 *           type: string
 *           description: The priority of the task
 *           enum: [ "low", "normal", "high" ]
 *         dueDate:
 *           type: string
 *           description: The due date of the task
 *           format: ISO8601 Date String
 *       example:
 *         _id: 68ce4d6df151766023b3cf07
 *         title: "Create a new video"
 *         description: "A video about creating a new task"
 *         status: "todo"
 *         priority: "normal"
 *         dueDate: "2025-01-01T23:59:59Z"
 */

/**
 * @swagger
 *
 * components:
 *  schemas:
 *     TaskDelete:
 *       type: object
 *       required:
 *        - _id
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier MongoDB ObjectId of the task
 *           format: ObjectId
 *       example:
 *         _id: 68ce4d6df151766023b3cf07
 */
