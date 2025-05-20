
import React, { useState, useEffect, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface MentionListItem {
  id: string;
  label: string;
  username?: string | null;
  displayName?: string | null;
  avatar?: string | null;
}

export interface MentionListProps {
  items: MentionListItem[];
  command: (item: MentionListItem) => void;
}

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const MentionList = forwardRef<MentionListRef, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const componentRef = useRef<HTMLDivElement>(null); // For scrolling

  const selectItem = useCallback((index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  }, [props]);

  // This handler will be called by the Tiptap extension
  const onKeyDownHandler = useCallback((event: KeyboardEvent): boolean => {
    const navigationKeys = ['ArrowUp', 'ArrowDown', 'Enter', 'Tab'];
    if (navigationKeys.includes(event.key)) {
      event.preventDefault();
      if (event.key === 'ArrowUp') {
        setSelectedIndex((prevIndex) => (prevIndex + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((prevIndex) => (prevIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        selectItem(selectedIndex);
        return true;
      }
    }
    return false;
  }, [props.items, selectedIndex, selectItem, setSelectedIndex]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      return onKeyDownHandler(event);
    }
  }), [onKeyDownHandler]);
  
  // Reset selectedIndex when items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useEffect(() => {
    // Scroll to selected item
    if (componentRef.current && props.items.length > 0 && componentRef.current.children[selectedIndex]) {
      const selectedElement = componentRef.current.children[selectedIndex] as HTMLElement;
      selectedElement.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, props.items, componentRef]);


  if (props.items.length === 0) {
    return null;
  }

  return (
    <div
      ref={componentRef} // Use componentRef for the div to manage scrolling
      className="z-50 border bg-background shadow-md rounded-md p-1 max-h-60 overflow-y-auto"
      data-testid="mention-list"
    >
      {props.items.map((item, index) => (
        <button
          type="button"
          className={`flex items-center w-full text-left p-2 text-sm rounded-md hover:bg-accent ${
            index === selectedIndex ? 'bg-accent ring-1 ring-primary' : ''
          }`}
          key={item.id}
          onClick={() => selectItem(index)}
        >
          <Avatar className="w-6 h-6 mr-2">
            <AvatarImage src={item.avatar ?? undefined} alt={item.label} />
            <AvatarFallback>{item.label.substring(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{item.displayName || item.username || item.label}</span>
          {item.username && item.displayName && (
            <span className="text-xs text-muted-foreground ml-1">(@{item.username})</span>
          )}
        </button>
      ))}
    </div>
  );
});

MentionList.displayName = 'MentionList';
export default MentionList;
