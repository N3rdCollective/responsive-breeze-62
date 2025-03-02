
import { describe, it, expect, beforeEach } from 'vitest';
import { extractTextFromHtml } from '../textUtils';

describe('textUtils', () => {
  describe('extractTextFromHtml', () => {
    it('extracts plain text from HTML', () => {
      const html = '<p>This is <strong>bold</strong> and <em>italic</em> text.</p>';
      const result = extractTextFromHtml(html);
      expect(result).toBe('This is bold and italic text.');
    });
    
    it('truncates text to 150 characters and adds ellipsis', () => {
      const longText = 'a'.repeat(200);
      const html = `<p>${longText}</p>`;
      const result = extractTextFromHtml(html);
      expect(result.length).toBe(153); // 150 chars + 3 dots
      expect(result.endsWith('...')).toBe(true);
    });
    
    it('does not add ellipsis if text is under 150 characters', () => {
      const shortText = 'a'.repeat(100);
      const html = `<p>${shortText}</p>`;
      const result = extractTextFromHtml(html);
      expect(result.length).toBe(100);
      expect(result.endsWith('...')).toBe(false);
    });
    
    it('handles empty HTML', () => {
      const result = extractTextFromHtml('');
      expect(result).toBe('');
    });
    
    it('handles HTML with no text content', () => {
      const result = extractTextFromHtml('<div><br/></div>');
      expect(result).toBe('');
    });
    
    it('handles complex HTML structures', () => {
      const html = `
        <div>
          <h1>Heading</h1>
          <p>Paragraph with <a href="#">link</a>.</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      `;
      const result = extractTextFromHtml(html);
      expect(result).toContain('Heading');
      expect(result).toContain('Paragraph with link.');
      expect(result).toContain('Item 1');
      expect(result).toContain('Item 2');
    });
  });
});
