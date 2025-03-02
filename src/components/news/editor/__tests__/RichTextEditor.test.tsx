
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import RichTextEditor from '../RichTextEditor';

// Mock the useEditor hook since it's complex to test
vi.mock('@tiptap/react', async () => {
  const actual = await vi.importActual('@tiptap/react');
  return {
    ...actual,
    useEditor: () => ({
      chain: () => ({
        focus: () => ({
          toggleBold: () => ({ run: vi.fn() }),
          toggleItalic: () => ({ run: vi.fn() }),
          toggleUnderline: () => ({ run: vi.fn() }),
          setTextAlign: () => ({ run: vi.fn() }),
          setImage: () => ({ run: vi.fn() }),
          setLink: () => ({ run: vi.fn() }),
          extendMarkRange: () => ({
            setLink: () => ({ run: vi.fn() }),
            unsetLink: () => ({ run: vi.fn() }),
          }),
          setColor: () => ({ run: vi.fn() }),
        }),
      }),
      getHTML: () => '<p>Test content</p>',
      isActive: () => false,
      commands: {
        setContent: vi.fn(),
      },
      isEmpty: false,
    }),
    EditorContent: ({ editor }) => (
      <div data-testid="editor-content">Editor Content</div>
    ),
  };
});

// Mock the useEditorExtensions hook
vi.mock('../editor/useEditorExtensions', () => ({
  useEditorExtensions: () => [],
}));

describe('RichTextEditor', () => {
  it('renders the editor with label', () => {
    const onChange = vi.fn();
    
    render(
      <RichTextEditor
        id="test-editor"
        value="<p>Test content</p>"
        onChange={onChange}
        label="Editor Label"
      />
    );
    
    expect(screen.getByText('Editor Label')).toBeInTheDocument();
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });
  
  it('renders without label when not provided', () => {
    const onChange = vi.fn();
    
    render(
      <RichTextEditor
        id="test-editor"
        value="<p>Test content</p>"
        onChange={onChange}
      />
    );
    
    expect(screen.queryByText('Editor Label')).not.toBeInTheDocument();
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });
});
