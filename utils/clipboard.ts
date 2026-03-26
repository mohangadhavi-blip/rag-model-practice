export const handleCopy = async (text: any) => {
  try {
    await navigator.clipboard.writeText(text);
    console.log("Copied to clipboard");
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
};