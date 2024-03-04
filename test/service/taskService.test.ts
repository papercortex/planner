import { Mongoose } from "mongoose";
import { createDayTasks, createTaskWithTags } from "@/services/taskService";
import dbConnect from "@/lib/mongoose";
import { Task } from "@/models/Task";
import { Tag } from "@/models/Tag";
import { startOfDay, endOfDay } from "date-fns";

let instance: Mongoose;

beforeAll(async () => {
  instance = await dbConnect();
});

afterAll(async () => {
  instance.disconnect();
});

describe("createTaskWithTags", () => {
  it("creates a task with new tags", async () => {
    const taskData: any = {
      title: "Integration Test Task",
      status: "NEW",
      date: new Date(),
      fromTime: "09:00",
      toTime: "10:00",
      tags: [{ label: "IntegrationTest" }],
      priority: "major",
      traceId: "testTraceId",
    };

    const task = await createTaskWithTags(taskData);

    expect(task).toBeDefined();
    expect(task.title).toBe(taskData.title);
    expect(task.tags).toHaveLength(1);
    // References to tags are stored as ObjectIds
    expect(task.tags[0].constructor.name).toBe("ObjectId");
  });

  it("creates a task without any tags", async () => {
    const taskData: any = {
      title: "Task Without Tags",
      status: "NEW",
      date: new Date(),
      fromTime: "10:00",
      toTime: "11:00",
      tags: [], // No tags provided
      priority: "minor",
      traceId: "testTraceIdNoTags",
    };

    const task = await createTaskWithTags(taskData);

    expect(task).toBeDefined();
    expect(task.title).toBe(taskData.title);
    expect(task.tags).toHaveLength(0); // Expect no tags associated with the task
  });

  it("creates a task with existing tags", async () => {
    // Step 1: Ensure the tag exists in the database
    const existingTagLabel = "ExistingTag";
    let existingTag = await Tag.findOne({ label: existingTagLabel });
    if (!existingTag) {
      existingTag = await Tag.create({ label: existingTagLabel });
    }

    // Step 2: Create a task with the existing tag
    const taskData: any = {
      title: "Task With Existing Tag",
      status: "NEW",
      date: new Date(),
      fromTime: "11:00",
      toTime: "12:00",
      tags: [{ label: existingTagLabel }], // Reference the existing tag by label
      priority: "default",
      traceId: "testTraceIdExistingTags",
    };

    const task = await createTaskWithTags(taskData);

    // Step 3: Verification
    expect(task).toBeDefined();
    expect(task.title).toBe(taskData.title);
    expect(task.tags).toHaveLength(1);
    expect(task.tags[0].toString()).toBe(existingTag._id.toString()); // Verify the task is linked to the existing tag
  });
});

describe("createDayTasks", () => {
  const testDate = new Date(2024, 2, 4); // March 4th, 2024
  const startOfTestDate = startOfDay(testDate);
  const endOfTestDate = endOfDay(testDate);

  // Example tasks to be used in setup
  const exampleTasks = [
    {
      title: "Pre-Existing Task 1",
      status: "NEW",
      date: testDate,
      fromTime: "09:00",
      toTime: "10:00",
      tags: [],
      priority: "major",
      traceId: "preExisting1",
    },
    {
      title: "Pre-Existing Task 2",
      status: "NEW",
      date: testDate,
      fromTime: "11:00",
      toTime: "12:00",
      tags: [],
      priority: "minor",
      traceId: "preExisting2",
    },
  ];

  beforeEach(async () => {
    // Pre-create tasks for the test date
    await Promise.all(exampleTasks.map((task) => Task.create(task)));
  });

  afterEach(async () => {
    // Cleanup: Remove all tasks created during the tests to prevent test pollution
    await Task.deleteMany({});
  });

  it("removes existing tasks for a given date before adding new ones", async () => {
    const newTasks = [
      {
        title: "New Task for Testing Removal",
        status: "NEW",
        fromTime: "13:00",
        toTime: "14:00",
        tags: [{ label: "CleanupTest" }],
        priority: "default",
        traceId: "newTaskForRemoval",
      },
    ];

    // @ts-ignore
    await createDayTasks({ tasks: newTasks, date: testDate });

    // Verify that only the new tasks exist for that date
    const tasksForDate = await Task.find({
      date: {
        $gte: startOfTestDate,
        $lte: endOfTestDate,
      },
    });

    expect(tasksForDate.length).toBe(newTasks.length);
    expect(tasksForDate[0].title).toBe(newTasks[0].title);
  });

  it("creates tasks with the correct details for the specified date", async () => {
    const newTaskDetails = {
      title: "Detailed Task Creation Test",
      status: "NEW",
      fromTime: "15:00",
      toTime: "16:00",
      tags: [{ label: "DetailedCreationTest" }],
      priority: "blocker",
      traceId: "detailedTaskCreationTest",
    };

    const tasks = [newTaskDetails];

    // @ts-ignore
    const createdTasks = await createDayTasks({ tasks, date: testDate });

    // Verify the details of the created tasks
    expect(createdTasks).toHaveLength(1);
    const createdTask = createdTasks[0];
    expect(createdTask.title).toBe(newTaskDetails.title);
    expect(createdTask.status).toBe(newTaskDetails.status);
  });

  it("does not affect tasks on different dates", async () => {
    // A different date from the testDate
    const differentDate = new Date(2024, 2, 5); // March 5th, 2024
    const tasksForDifferentDate = [
      {
        title: "Task on Different Date",
        status: "NEW",
        date: differentDate,
        fromTime: "10:00",
        toTime: "11:00",
        tags: [],
        priority: "minor",
        traceId: "taskDifferentDate",
      },
    ];

    // Pre-create a task for the different date
    await Promise.all(tasksForDifferentDate.map((task) => Task.create(task)));

    // Now call createDayTasks for the testDate, not affecting the differentDate
    const newTasksForTestDate = [
      {
        title: "New Task for Test Date",
        status: "NEW",
        fromTime: "09:00",
        toTime: "10:00",
        tags: [{ label: "TestDate" }],
        priority: "major",
        traceId: "newTaskTestDate",
      },
    ];

    // @ts-ignore
    await createDayTasks({ tasks: newTasksForTestDate, date: testDate });

    // Verify tasks for the different date are still present and unaffected
    const tasksOnDifferentDate = await Task.find({
      date: {
        $gte: startOfDay(differentDate),
        $lte: endOfDay(differentDate),
      },
    });

    expect(tasksOnDifferentDate.length).toBe(tasksForDifferentDate.length);
    expect(tasksOnDifferentDate[0].title).toBe(tasksForDifferentDate[0].title);
    expect(tasksOnDifferentDate[0].date.toISOString()).toBe(
      differentDate.toISOString()
    );

    // Optionally, verify the tasks for the testDate are correctly updated as well
    const tasksForTestDate = await Task.find({
      date: {
        $gte: startOfTestDate,
        $lte: endOfTestDate,
      },
    });

    expect(tasksForTestDate.length).toBe(newTasksForTestDate.length);
    expect(tasksForTestDate[0].title).toBe(newTasksForTestDate[0].title);
  });
});
