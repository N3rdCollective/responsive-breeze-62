import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { format, isValid } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ForumCategory } from '@/types/forum';
import { cn } from '@/lib/utils';

const fetchCategories = async (): Promise<ForumCategory[]> => {
  const { data, error } = await supabase
    .from('forum_categories')
    .select('id, name, description, slug, display_order, created_at, updated_at')
    .order('display_order', { ascending: true });
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data || [];
};

const ALL_CATEGORIES_VALUE = "all-categories"; // Define a constant for "All Categories"

const ForumSearchBar: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [searchByUser, setSearchByUser] = useState(searchParams.get('byUser') || '');
  // Use ALL_CATEGORIES_VALUE as the default/initial "all" state
  const [selectedCategoryId, setSelectedCategoryId] = useState(searchParams.get('category') || ALL_CATEGORIES_VALUE);
  const [startDate, setStartDate] = useState<Date | undefined>(
    searchParams.get('startDate') && isValid(new Date(searchParams.get('startDate')!)) ? new Date(searchParams.get('startDate')!) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    searchParams.get('endDate') && isValid(new Date(searchParams.get('endDate')!)) ? new Date(searchParams.get('endDate')!) : undefined
  );

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['forumCategoriesList'],
    queryFn: fetchCategories,
  });

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    if (searchByUser.trim()) params.set('byUser', searchByUser.trim());
    // Adjust logic for selectedCategoryId: only set param if it's not "all-categories"
    if (selectedCategoryId && selectedCategoryId !== ALL_CATEGORIES_VALUE) {
      params.set('category', selectedCategoryId);
    }
    if (startDate && isValid(startDate)) params.set('startDate', format(startDate, 'yyyy-MM-dd'));
    if (endDate && isValid(endDate)) params.set('endDate', format(endDate, 'yyyy-MM-dd'));
    
    navigate(`/forum/search?${params.toString()}`);
  };

  // Effect to update state if URL params change (e.g. browser back/forward)
  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
    setSearchByUser(searchParams.get('byUser') || '');
    // Sync selectedCategoryId with URL, defaulting to ALL_CATEGORIES_VALUE
    setSelectedCategoryId(searchParams.get('category') || ALL_CATEGORIES_VALUE);
    const sd = searchParams.get('startDate');
    const ed = searchParams.get('endDate');
    setStartDate(sd && isValid(new Date(sd)) ? new Date(sd) : undefined);
    setEndDate(ed && isValid(new Date(ed)) ? new Date(ed) : undefined);
  }, [searchParams]);

  return (
    <form onSubmit={handleSearchSubmit} className="mb-8 space-y-4 p-4 border rounded-lg dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Term</Label>
          <Input
            id="searchTerm"
            type="search"
            placeholder="Search topic titles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-base md:text-sm"
          />
        </div>
        <div>
          <Label htmlFor="searchByUser" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">By User</Label>
          <Input
            id="searchByUser"
            type="search"
            placeholder="Username or Display Name..."
            value={searchByUser}
            onChange={(e) => setSearchByUser(e.target.value)}
            className="text-base md:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</Label>
          <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
            <SelectTrigger id="categoryFilter" className="w-full text-base md:text-sm">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {/* Use ALL_CATEGORIES_VALUE for the "All Categories" item */}
              <SelectItem value={ALL_CATEGORIES_VALUE}>All Categories</SelectItem>
              {!isLoadingCategories && categories?.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="startDate"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal text-base md:text-sm",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Pick a start date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="endDate"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal text-base md:text-sm",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>Pick an end date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) =>
                  startDate ? date < startDate : false
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <Button type="submit" variant="default" className="w-full md:w-auto bg-primary hover:bg-primary/90">
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>
    </form>
  );
};

export default ForumSearchBar;
