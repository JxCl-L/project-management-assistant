const { Schema, model } = require("mongoose");

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxLength: [100, "Project name must be at most 100 characters long"],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [500, "Description must be at most 500 characters long"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator (User) is required"],
    },
  },
  { timestamps: true, versionKey: false }
);

const Project = model("Project", projectSchema);

module.exports = Project;
