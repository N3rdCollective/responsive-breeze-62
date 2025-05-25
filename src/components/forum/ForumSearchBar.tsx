
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const ForumSearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/forum/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearchSubmit} className="mb-8 flex gap-2">
      <Input
        type="search"
        placeholder="Search forum topics..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-grow text-base md:text-sm"
      />
      <Button type="submit" variant="default" className="bg-primary hover:bg-primary/90">
        <Search className="h-4 w-4 mr-0 sm:mr-2" />
        <span className="hidden sm:inline">Search</span>
      </Button>
    </form>
  );
};

export default ForumSearchBar;
