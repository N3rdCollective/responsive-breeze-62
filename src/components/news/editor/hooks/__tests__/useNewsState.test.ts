
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useNewsState } from '../../hooks/useNewsState';
import { NewsStatus } from '../../NewsForm';

describe('useNewsState', () => {
  it('initializes with default values when no initialData is provided', () => {
    const { result } = renderHook(() => useNewsState());
    
    expect(result.current.title).toBe('');
    expect(result.current.content).toBe('');
    expect(result.current.excerpt).toBe('');
    expect(result.current.status).toBe('draft');
    expect(result.current.category).toBe('');
    expect(result.current.featuredImage).toBe(null);
    expect(result.current.currentFeaturedImageUrl).toBe('');
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSaving).toBe(false);
    expect(result.current.isUploading).toBe(false);
    expect(result.current.isPreviewModalOpen).toBe(false);
  });
  
  it('updates state correctly with setter functions', () => {
    const { result } = renderHook(() => useNewsState());
    
    act(() => {
      result.current.setTitle('New Title');
    });
    expect(result.current.title).toBe('New Title');
    
    act(() => {
      result.current.setContent('<p>New Content</p>');
    });
    expect(result.current.content).toBe('<p>New Content</p>');
    
    act(() => {
      result.current.setExcerpt('New Excerpt');
    });
    expect(result.current.excerpt).toBe('New Excerpt');
    
    act(() => {
      result.current.setStatus('published');
    });
    expect(result.current.status).toBe('published');
    
    act(() => {
      result.current.setCategory('News');
    });
    expect(result.current.category).toBe('News');
    
    const testFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    act(() => {
      result.current.setFeaturedImage(testFile);
    });
    expect(result.current.featuredImage).toBe(testFile);
    
    act(() => {
      result.current.setCurrentFeaturedImageUrl('https://example.com/new-image.jpg');
    });
    expect(result.current.currentFeaturedImageUrl).toBe('https://example.com/new-image.jpg');
    
    act(() => {
      result.current.setIsLoading(true);
    });
    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      result.current.setIsSaving(true);
    });
    expect(result.current.isSaving).toBe(true);
    
    act(() => {
      result.current.setIsUploading(true);
    });
    expect(result.current.isUploading).toBe(true);
    
    act(() => {
      result.current.setIsPreviewModalOpen(true);
    });
    expect(result.current.isPreviewModalOpen).toBe(true);
  });
});
