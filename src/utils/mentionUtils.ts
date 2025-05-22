
/**
 * Extracts user IDs from tiptap mention nodes in HTML content.
 * Mentions are expected to be like <span data-mention-id="user-uuid" ...>@username</span>
 * @param htmlContent The HTML string to parse.
 * @returns An array of unique user IDs.
 */
export const extractMentionedUserIds = (htmlContent: string): string[] => {
  if (!htmlContent || typeof document === 'undefined') {
    return [];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const mentionNodes = doc.querySelectorAll('span[data-mention-id]');
  
  const userIds = new Set<string>();
  mentionNodes.forEach(node => {
    const userId = node.getAttribute('data-mention-id');
    if (userId) {
      userIds.add(userId);
    }
  });

  return Array.from(userIds);
};
