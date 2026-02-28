const { Schema, model } = require("mongoose");

const taskContentSchema = new Schema(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: [true, "Task is required"],
      unique: true, // one-to-one relationship between Task and TaskContent
    },
    content: { // store tiptap json
      type: String,
      default: JSON.stringify({ type: "doc", content: [] }), // default empty content in JSON format
      // required: [true, "Task content is required"], // handled by default
    },
    plainText: {
      type: String,
      default: "",
      // required: [true, "Plain text content is required"], // handled by default
      maxLength: [10000, "Plain text content must be at most 10,000 characters long"],
    },
    contentType: {
      type: String,
      enum: ['tiptap-json'],
      default: 'tiptap-json', 
      // required: [true, "Content type is required"], // handled by default
    },
    lastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    lastEditedAt: {
      type: Date,
      required: [true, "The date of last edit is required"],
    },
  },
  {
    timestamps: true, // Enable createdAt and updatedAt fields to automatically update
    versionKey: false, // Disable the __v field because we don't need it
  }
);

taskContentSchema.index({ task: 1 }); // index on task field for faster queries

const TaskContent = model("TaskContent", taskContentSchema); // "TaskContent" is the name of the collection in MongoDB

module.exports = TaskContent;

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
