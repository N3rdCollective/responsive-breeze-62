
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useNewsState } from '../../hooks/useNewsState';

describe('useNewsState', () => {
  it('initializes with default values when no initialData is provided', () => {
    const { result } = renderHook(() => useNewsState());
    
    expect(result.current.title).toBe('');
    expect(result.current.content).toBe('');
    expect(result.current.excerpt).toBe('');
    expect(result.current.status).toBe('draft');
    expect(result.current.featuredImage).toBe(null);
    expect(result.current.currentFeaturedImageUrl).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSaving).toBe(false);
    expect(result.current.isUploading).toBe(false);
    expect(result.current.isPreviewModalOpen).toBe(false);
  });
  
  it('initializes with provided initialData', () => {
    const initialData = {
      title: 'Test Title',
      content: '<p>Test Content</p>',
      excerpt: 'Test Excerpt',
      status: 'published',
      featuredImageUrl: 'https://example.com/image.jpg',
    };
    
    const { result } = renderHook(() => useNewsState(initialData));
    
    expect(result.current.title).toBe('Test Title');
    expect(result.current.content).toBe('<p>Test Content</p>');
    expect(result.current.excerpt).toBe('Test Excerpt');
    expect(result.current.status).toBe('published');
    expect(result.current.currentFeaturedImageUrl).toBe('https://example.com/image.jpg');
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
