
import React, { useState, useEffect, useCallback, useRef } from 'react';
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

const MentionList = React.forwardRef<HTMLDivElement, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const componentRef = useRef<HTMLDivElement>(null);

  const selectItem = useCallback((index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  }, [props]);

  useEffect(() => {
    const navigationKeys = ['ArrowUp', 'ArrowDown', 'Enter', 'Tab'];
    const onKeyDown = (e: KeyboardEvent) => {
      if (navigationKeys.includes(e.key)) {
        e.preventDefault();
        if (e.key === 'ArrowUp') {
          setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
          return true;
        }
        if (e.key === 'ArrowDown') {
          setSelectedIndex((selectedIndex + 1) % props.items.length);
          return true;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
          selectItem(selectedIndex);
          return true;
        }
      }
      return false;
    };

    // Attach the event listener to the componentRef if it's the active element,
    // or more broadly to the document if needed for global capture during suggestion.
    // For simplicity, we'll assume the editor handles focusing the suggestion list
    // or that these key events are appropriately propagated.
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [props.items, selectedIndex, selectItem]);
  
  useEffect(() => {
     // Scroll to selected item
    if (componentRef.current && props.items.length > 0) {
      const selectedElement = componentRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, props.items.length]);


  if (props.items.length === 0) {
    return null;
  }

  return (
    <div 
      ref={ref} 
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
          <span className="font-medium">{item.displayName || item.username}</span>
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

