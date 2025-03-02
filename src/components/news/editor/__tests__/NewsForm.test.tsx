
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import NewsForm, { NewsStatus } from '../NewsForm';
import { BrowserRouter } from 'react-router-dom';

// Mock RichTextEditor component
vi.mock('../RichTextEditor', () => ({
  default: ({ id, value, onChange, label }) => (
    <div data-testid="rich-text-editor">
      <label>{label}</label>
      <textarea 
        data-testid={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  ),
}));

// Mock ImageUploader component
vi.mock('../ImageUploader', () => ({
  default: ({ currentImageUrl, onImageSelected }) => (
    <div data-testid="image-uploader">
      <button 
        onClick={() => onImageSelected(new File([''], 'test.jpg', { type: 'image/jpeg' }))}
        data-testid="select-image-button"
      >
        Select Image
      </button>
      {currentImageUrl && <img src={currentImageUrl} alt="preview" data-testid="preview-image" />}
    </div>
  ),
}));

// Mock PreviewModal component
vi.mock('../PreviewModal', () => ({
  default: ({ isOpen, onOpenChange, title, content }) => (
    isOpen ? (
      <div data-testid="preview-modal">
        <h1>{title}</h1>
        <div dangerouslySetInnerHTML={{ __html: content }} />
        <button onClick={() => onOpenChange(false)} data-testid="close-preview">Close</button>
      </div>
    ) : null
  ),
}));

describe('NewsForm', () => {
  const defaultProps = {
    title: 'Test Title',
    setTitle: vi.fn(),
    content: '<p>Test content</p>',
    setContent: vi.fn(),
    excerpt: 'Test excerpt',
    setExcerpt: vi.fn(),
    status: 'draft' as NewsStatus,
    setStatus: vi.fn(),
    currentFeaturedImageUrl: '',
    onImageSelected: vi.fn(),
    onSave: vi.fn(),
    isSaving: false,
    isUploading: false,
    isPreviewModalOpen: false,
    setIsPreviewModalOpen: vi.fn(),
  };

  const renderWithRouter = (ui, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(ui, { wrapper: BrowserRouter });
  };

  it('renders the form with initial values', () => {
    renderWithRouter(<NewsForm {...defaultProps} />);
    
    expect(screen.getByLabelText('Title')).toHaveValue('Test Title');
    expect(screen.getByLabelText('Excerpt (optional)')).toHaveValue('Test excerpt');
    expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument();
  });
  
  it('handles title input change', async () => {
    renderWithRouter(<NewsForm {...defaultProps} />);
    
    const titleInput = screen.getByLabelText('Title');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'New Title');
    
    expect(defaultProps.setTitle).toHaveBeenCalledWith('New Title');
  });
  
  it('handles excerpt input change', async () => {
    renderWithRouter(<NewsForm {...defaultProps} />);
    
    const excerptInput = screen.getByLabelText('Excerpt (optional)');
    await userEvent.clear(excerptInput);
    await userEvent.type(excerptInput, 'New Excerpt');
    
    expect(defaultProps.setExcerpt).toHaveBeenCalledWith('New Excerpt');
  });
  
  it('opens preview modal when preview button is clicked', async () => {
    renderWithRouter(<NewsForm {...defaultProps} />);
    
    const previewButton = screen.getByText('Preview in Modal');
    await userEvent.click(previewButton);
    
    expect(defaultProps.setIsPreviewModalOpen).toHaveBeenCalledWith(true);
  });
  
  it('shows save button in loading state when saving', () => {
    renderWithRouter(<NewsForm {...defaultProps} isSaving={true} />);
    
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });
  
  it('calls onSave when save button is clicked', async () => {
    renderWithRouter(<NewsForm {...defaultProps} />);
    
    const saveButton = screen.getByText('Save Post');
    await userEvent.click(saveButton);
    
    expect(defaultProps.onSave).toHaveBeenCalled();
  });
  
  it('renders featured image when provided', () => {
    renderWithRouter(
      <NewsForm 
        {...defaultProps} 
        currentFeaturedImageUrl="https://example.com/image.jpg" 
      />
    );
    
    expect(screen.getByTestId('preview-image')).toBeInTheDocument();
  });
});
