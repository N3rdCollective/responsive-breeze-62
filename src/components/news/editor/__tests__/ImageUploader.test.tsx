
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ImageUploader from '../ImageUploader';

describe('ImageUploader', () => {
  it('renders file input', () => {
    const onImageSelected = vi.fn();
    render(
      <ImageUploader
        currentImageUrl=""
        onImageSelected={onImageSelected}
      />
    );
    
    expect(screen.getByLabelText('Featured Image')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'file');
  });
  
  it('displays current image when provided', () => {
    const onImageSelected = vi.fn();
    render(
      <ImageUploader
        currentImageUrl="https://example.com/image.jpg"
        onImageSelected={onImageSelected}
      />
    );
    
    expect(screen.getByAltText('Featured')).toBeInTheDocument();
    expect(screen.getByAltText('Featured')).toHaveAttribute('src', 'https://example.com/image.jpg');
  });
  
  it('calls onImageSelected when file is selected', async () => {
    const onImageSelected = vi.fn();
    render(
      <ImageUploader
        currentImageUrl=""
        onImageSelected={onImageSelected}
      />
    );
    
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText('Featured Image');
    
    // Use fireEvent as userEvent doesn't handle file inputs well
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(onImageSelected).toHaveBeenCalledWith(file);
  });
  
  it('does not show image preview when no current image', () => {
    const onImageSelected = vi.fn();
    render(
      <ImageUploader
        currentImageUrl=""
        onImageSelected={onImageSelected}
      />
    );
    
    expect(screen.queryByAltText('Featured')).not.toBeInTheDocument();
  });
});
