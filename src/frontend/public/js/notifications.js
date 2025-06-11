export const notify = (message, type = "info") => {
  const color =
    type === "success" ? "green" : type === "error" ? "red" : "blue";
  const div = document.createElement("div");
  div.textContent = message;
  div.style.background = color;
  div.style.color = "white";
  div.style.padding = "1rem";
  div.style.position = "fixed";
  div.style.top = "10px";
  div.style.right = "10px";
  div.style.zIndex = "1000";
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
};
