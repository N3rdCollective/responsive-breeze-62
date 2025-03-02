
/**
 * Utility functions for text manipulation
 */

/**
 * Extracts plain text from HTML content for excerpt generation
 * @param html HTML content to extract text from
 * @returns Plain text with a maximum of 150 characters, with ellipsis if truncated
 */
export const extractTextFromHtml = (html: string): string => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const textContent = tempDiv.textContent || tempDiv.innerText || "";
  return textContent.substring(0, 150) + (textContent.length > 150 ? "..." : "");
};
