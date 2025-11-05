export const addNotification = (message: string, type: "goal" | "skill" | "info") => {
  const existing = JSON.parse(localStorage.getItem("notifications") || "[]");
  const newNotification = {
    id: Date.now(),
    message,
    time: "Agora mesmo",
    type,
    read: false,
  };
  const updated = [newNotification, ...existing];
  localStorage.setItem("notifications", JSON.stringify(updated));
};
