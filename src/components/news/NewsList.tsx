
import CategoryFilters from "./components/CategoryFilters";
import NewsLoadingSkeleton from "./components/NewsLoadingSkeleton";
import NewsGrid from "./components/NewsGrid";
import SearchBar from "./components/SearchBar";
import useNewsData from "./hooks/useNewsData";

export const NewsList = () => {
  const {
    categories,
    posts,
    isLoading,
    error,
    selectedCategory,
    handleCategoryFilter,
    handleSearch,
  } = useNewsData();

  console.log('🗞️ NewsList component state:', {
    categories,
    categoriesCount: categories?.length,
    posts,
    postsCount: posts?.length,
    isLoading,
    error,
    selectedCategory
  });

  if (error) {
    console.error('🗞️ NewsList error:', error);
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-destructive">Error loading news</h3>
        <p className="text-muted-foreground mt-2">Please try again later</p>
      </div>
    );
  }

  if (isLoading) {
    console.log('🗞️ NewsList: Showing loading skeleton');
    return <NewsLoadingSkeleton />;
  }

  console.log('🗞️ NewsList: Rendering news grid with', posts?.length || 0, 'posts');

  return (
    <div className="space-y-8">
      {/* Search bar */}
      <div className="flex justify-center">
        <SearchBar onSearch={handleSearch} />
      </div>
      
      {/* Category filters */}
      <CategoryFilters 
        categories={categories} 
        selectedCategory={selectedCategory} 
        onCategorySelect={handleCategoryFilter} 
      />
      
      {/* Posts grid */}
      <NewsGrid 
        posts={posts} 
        selectedCategory={selectedCategory} 
      />
    </div>
  );
};

export default NewsList;
