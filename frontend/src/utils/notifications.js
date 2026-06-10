export const requestPermission = async () => {
  if ('Notification' in window) {
    await Notification.requestPermission();
  }
};

export const checkDueTasks = (tasks) => {
  if (Notification.permission !== 'granted') return;

  const today = new Date().toDateString();
  const tomorrow = new Date(Date.now() + 86400000).toDateString();

  tasks.forEach(task => {
    if (task.status === 'completed' || !task.due_date) return;

    const due = new Date(task.due_date).toDateString();

    if (due === today) {
      new Notification('Task due today', {
        body: task.title,
        icon: '/favicon.ico'
      });
    } else if (due === tomorrow) {
      new Notification('Task due tomorrow', {
        body: task.title,
        icon: '/favicon.ico'
      });
    }
  });
};