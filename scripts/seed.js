const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const path = require("path");

// Load .env.development
dotenv.config({ path: path.resolve(__dirname, "../.env.development") });

// ===== Import Models =====
const User = require("../src/users/user.schema");
const Project = require("../src/projects/project.schema");
const Member = require("../src/projectMembers/member.schema");
const Task = require("../src/tasks/task.schema");
const TaskContent = require("../src/taskContent/taskContent.schema");

async function seed() {
  await mongoose.connect(process.env.DATABASE_URL, {
    dbName: process.env.DATABASE_NAME,
  });
  console.log("✅ Connected to MongoDB:", process.env.DATABASE_NAME);

  // ===== Clear existing data =====
  await TaskContent.deleteMany({});
  await Task.deleteMany({});
  await Member.deleteMany({});
  await Project.deleteMany({});
  await User.deleteMany({});
  console.log("🗑️  Cleared existing data");

  // ===== 1. Create Users =====
  const hashedPassword = await bcrypt.hash("Password123#", 10);

  const [alice, bob, charlie] = await User.insertMany([
    { firstName: "Alice", lastName: "Wang", email: "alice@example.com", password: hashedPassword },
    { firstName: "Bob", lastName: "Chen", email: "bob@example.com", password: hashedPassword },
    { firstName: "Charlie", lastName: "Li", email: "charlie@example.com", password: hashedPassword },
  ]);
  console.log("👤 Created users");

  // ===== 2. Create Projects =====
  const [projectA, projectB] = await Project.insertMany([
    { name: "Website Redesign", description: "Redesign the company website with modern UI", createdBy: alice._id },
    { name: "Mobile App", description: "Build a cross-platform mobile application", createdBy: bob._id },
  ]);
  console.log("📁 Created projects");

  // ===== 3. Create Members =====
  await Member.insertMany([
    { project: projectA._id, user: alice._id, role: "manager" },
    { project: projectA._id, user: bob._id, role: "editor" },
    { project: projectA._id, user: charlie._id, role: "viewer" },
    { project: projectB._id, user: bob._id, role: "manager" },
    { project: projectB._id, user: alice._id, role: "editor" },
  ]);
  console.log("👥 Created members");

  // ===== 4. Create Tasks =====
  const [task1, task2, task3, task4] = await Task.insertMany([
    {
      project: projectA._id,
      title: "Design homepage mockup",
      description: "Create wireframes and high-fidelity mockups for the new homepage",
      status: "completed",
      priority: "high",
      createdBy: alice._id,
      dueDate: new Date("2025-06-01"),
    },
    {
      project: projectA._id,
      title: "Implement navbar component",
      description: "Build a responsive navbar with dropdown menus",
      status: "inProgress",
      priority: "normal",
      createdBy: alice._id,
      dueDate: new Date("2025-06-15"),
    },
    {
      project: projectB._id,
      title: "Set up React Native project",
      description: "Initialize the project with navigation and state management",
      status: "completed",
      priority: "high",
      createdBy: bob._id,
      dueDate: new Date("2025-05-20"),
    },
    {
      project: projectB._id,
      title: "Build login screen",
      description: "Create login and signup screens with form validation",
      status: "todo",
      priority: "normal",
      createdBy: bob._id,
      dueDate: new Date("2025-07-01"),
    },
  ]);
  console.log("📝 Created tasks");

  // ===== 5. Create TaskContents =====
  await TaskContent.insertMany([
    {
      task: task1._id,
      content: JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Mockup has been approved by the team. Ready for development." }] }] }),
      plainText: "Mockup has been approved by the team. Ready for development.",
      contentType: "tiptap-json",
      lastEditedBy: alice._id,
      lastEditedAt: new Date(),
    },
    {
      task: task2._id,
      content: JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Using Tailwind CSS for styling. Need to support mobile breakpoints." }] }] }),
      plainText: "Using Tailwind CSS for styling. Need to support mobile breakpoints.",
      contentType: "tiptap-json",
      lastEditedBy: bob._id,
      lastEditedAt: new Date(),
    },
    {
      task: task3._id,
      content: JSON.stringify({ type: "doc", content: [] }),
      plainText: "",
      contentType: "tiptap-json",
      lastEditedBy: bob._id,
      lastEditedAt: new Date(),
    },
    {
      task: task4._id,
      content: JSON.stringify({ type: "doc", content: [] }),
      plainText: "",
      contentType: "tiptap-json",
      lastEditedBy: bob._id,
      lastEditedAt: new Date(),
    },
  ]);
  console.log("📄 Created task contents");

  console.log("\n🎉 Seed complete!");
  console.log("----------------------------");
  console.log("Test accounts (all use password: Password123#):");
  console.log("  alice@example.com");
  console.log("  bob@example.com");
  console.log("  charlie@example.com");
  console.log("----------------------------");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});