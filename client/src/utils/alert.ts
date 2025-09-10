export async function alertWrongArea(): Promise<void> {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("No userId found.");
    return;
  }

  await fetch("https://geofence-37q0.onrender.com/send-notification", { // replace with your backend URL
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      title: "⚠️ Warning!",
      message: "You’ve entered a restricted area. Please leave immediately."
    })
  });
}
