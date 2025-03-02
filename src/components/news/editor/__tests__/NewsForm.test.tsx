
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

// Mock sub-components
vi.mock('../components/EditorTabContent', () => ({
  default: ({
    title,
    setTitle,
    excerpt,
    setExcerpt,
    onImageSelected,
  }) => (
    <div data-testid="editor-tab-content">
      <input
        data-testid="title-input"
        aria-label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        data-testid="excerpt-input"
        aria-label="Excerpt (optional)"
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
      />
      <button
        data-testid="select-image-button"
        onClick={() => onImageSelected(new File([''], 'test.jpg', { type: 'image/jpeg' }))}
      >
        Select Image
      </button>
    </div>
  ),
}));

vi.mock('../components/FormActions', () => ({
  default: ({ onSave, isSaving, onOpenPreview }) => (
    <div data-testid="form-actions">
      <button
        data-testid="preview-button"
        onClick={onOpenPreview}
      >
        Preview in Modal
      </button>
      <button
        data-testid="save-button"
        onClick={onSave}
      >
        {isSaving ? 'Saving...' : 'Save Post'}
      </button>
    </div>
  ),
}));

vi.mock('../components/NewsPreview', () => ({
  default: ({ title, content, excerpt, currentFeaturedImageUrl }) => (
    <div data-testid="news-preview">
      <h1>{title}</h1>
      <div>{excerpt}</div>
      <div dangerouslySetInnerHTML={{ __html: content }} />
      {currentFeaturedImageUrl && <img src={currentFeaturedImageUrl} alt="preview" />}
    </div>
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
    category: 'Test Category',
    setCategory: vi.fn(),
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
    
    expect(screen.getByTestId('editor-tab-content')).toBeInTheDocument();
    expect(screen.getByTestId('form-actions')).toBeInTheDocument();
  });
  
  it('opens preview modal when preview button is clicked', async () => {
    renderWithRouter(<NewsForm {...defaultProps} />);
    
    const previewButton = screen.getByTestId('preview-button');
    await userEvent.click(previewButton);
    
    expect(defaultProps.setIsPreviewModalOpen).toHaveBeenCalledWith(true);
  });
  
  it('calls onSave when save button is clicked', async () => {
    renderWithRouter(<NewsForm {...defaultProps} />);
    
    const saveButton = screen.getByTestId('save-button');
    await userEvent.click(saveButton);
    
    expect(defaultProps.onSave).toHaveBeenCalled();
  });
  
  it('switches between edit and preview tabs', async () => {
    renderWithRouter(<NewsForm {...defaultProps} />);
    
    // Initially the edit tab should be active
    expect(screen.getByTestId('editor-tab-content')).toBeInTheDocument();
    
    // Click on the preview tab
    const previewTab = screen.getByRole('tab', { name: /preview/i });
    await userEvent.click(previewTab);
    
    // Now the preview should be visible
    expect(screen.getByTestId('news-preview')).toBeInTheDocument();
    
    // Go back to edit tab
    const editTab = screen.getByRole('tab', { name: /edit/i });
    await userEvent.click(editTab);
    
    // Editor should be visible again
    expect(screen.getByTestId('editor-tab-content')).toBeInTheDocument();
  });
});
