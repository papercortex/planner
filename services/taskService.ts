import { Tag } from "../models/Tag";
import { Task, ITask } from "../models/Task";

/**
 * Creates a task with tags. Reuses existing tags or creates new ones as necessary.
 *
 * @param taskData Object containing task details and an array of tags.
 * @returns The created task with associated tags.
 */
export async function createTaskWithTags(
  taskData: Omit<ITask, "_id"> & { tags: { label: string }[] }
): Promise<ITask> {
  // Process tags: reuse existing ones or create new
  const processedTags = await Promise.all(
    taskData.tags.map(async (tag) => {
      const existingTag = await Tag.findOne({ label: tag.label });
      if (existingTag) {
        return existingTag._id;
      } else {
        const newTag = await Tag.create([{ label: tag.label }]);
        return newTag[0]._id;
      }
    })
  );

  // Create the task with associated tag IDs
  const task = await Task.create([
    {
      ...taskData,
      tags: processedTags,
    },
  ]);

  return task[0]; // Return the created task document
}

/**
 * Removes all tasks on a given date and then creates new tasks for that date.
 *
 * @param {Object} data Object containing an array of tasks and a date.
 * @param {ITask[]} data.tasks Array of tasks to be created.
 * @param {Date} data.date The date for which to remove and create tasks.
 * @returns {Promise<ITask[]>} The created tasks.
 */
export async function createDayTasks({
  tasks,
  date,
}: {
  tasks: Omit<ITask, "_id" | "date">[] & { tags: { label: string }[] };
  date: Date;
}): Promise<ITask[]> {
  // Convert to the start and end of the given date to ensure full day coverage
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));

  // Remove all tasks for the given date
  await Task.deleteMany({
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  // Create the tasks for the given date
  const createdTasks = await Promise.all(
    tasks.map(async (taskData) =>
      createTaskWithTags({ ...taskData, date: new Date(date) })
    )
  );

  return createdTasks;
}
