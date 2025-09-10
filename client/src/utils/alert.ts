export async function alertWrongArea(): Promise<void> {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("No userId found.");
    return;
  }

  await fetch("http://localhost:3000/send-notification", { // replace with your backend URL
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      title: "⚠️ Warning!",
      message: "You’ve entered a restricted area. Please leave immediately."
    })
  });
}
