const { Schema, model } = require("mongoose");

const memberSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    role: {
      type: String,
      enum: ["manager", "editor", "viewer"],
      default: "viewer",
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

// Optionally enforce unique (project, user) pair
memberSchema.index({ project: 1, user: 1 }, { unique: true });

const Member = model("Member", memberSchema);

module.exports = Member;
