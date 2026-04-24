export async function getUsers() {
  const res = await fetch("/users");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}
