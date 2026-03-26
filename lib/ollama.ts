// export async function ollamaGenerate(prompt: string) {
//   const res = await fetch("http://localhost:11434/api/generate", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       model: "qwen2:1.5b",
//       prompt,
//       stream: false,
//     }),
//   });

//   if (!res.ok) {
//     throw new Error("Ollama request failed");
//   }

//   const data = await res.json();
//   return data.response;
// }