export const getPriorityColors = (priority: string): string => {
  const value = priority.toLowerCase();

  if (value === "urgent") {
    return "text-red-600";
  }

  if (value === "low") {
    return "text-emerald-600";
  }

  return "text-blue-700";
};
