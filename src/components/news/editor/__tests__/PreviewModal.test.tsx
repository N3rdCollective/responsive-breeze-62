
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import PreviewModal from '../PreviewModal';

// Mock the Dialog component from @/components/ui/dialog
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, onOpenChange, children }) => (
    open ? <div data-testid="dialog">{children}</div> : null
  ),
  DialogContent: ({ children }) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogClose: ({ children }) => (
    <button data-testid="dialog-close">{children}</button>
  ),
}));

describe('PreviewModal', () => {
  const defaultProps = {
    isOpen: true,
    onOpenChange: vi.fn(),
    title: 'Test Title',
    content: '<p>Test content</p>',
    excerpt: 'Test excerpt',
    featuredImageUrl: 'https://example.com/image.jpg',
    authorName: 'Test Author',
  };

  it('renders correctly when open', () => {
    render(<PreviewModal {...defaultProps} />);
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
    expect(screen.getByText('Post Preview')).toBeInTheDocument();
  });
  
  it('displays post title', () => {
    render(<PreviewModal {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  
  it('displays featured image when provided', () => {
    render(<PreviewModal {...defaultProps} />);
    const image = screen.getByAltText('Test Title');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });
  
  it('displays excerpt when provided', () => {
    render(<PreviewModal {...defaultProps} />);
    expect(screen.getByText('Test excerpt')).toBeInTheDocument();
  });
  
  it('displays author name', () => {
    render(<PreviewModal {...defaultProps} />);
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });
  
  it('does not render when closed', () => {
    render(<PreviewModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });
  
  it('uses default author name when not provided', () => {
    const propsWithoutAuthor = { ...defaultProps };
    delete propsWithoutAuthor.authorName;
    
    render(<PreviewModal {...propsWithoutAuthor} />);
    expect(screen.getByText('Staff Author')).toBeInTheDocument();
  });
});
