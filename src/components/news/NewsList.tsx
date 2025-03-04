
import CategoryFilters from "./components/CategoryFilters";
import NewsLoadingSkeleton from "./components/NewsLoadingSkeleton";
import NewsGrid from "./components/NewsGrid";
import useNewsData from "./hooks/useNewsData";

export const NewsList = () => {
  const {
    categories,
    posts,
    isLoading,
    error,
    selectedCategory,
    handleCategoryFilter,
  } = useNewsData();

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-destructive">Error loading news</h3>
        <p className="text-muted-foreground mt-2">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Category filters */}
      <CategoryFilters 
        categories={categories} 
        selectedCategory={selectedCategory} 
        onCategorySelect={handleCategoryFilter} 
      />
      
      {/* Posts grid */}
      {isLoading ? (
        <NewsLoadingSkeleton />
      ) : (
        <NewsGrid 
          posts={posts} 
          selectedCategory={selectedCategory} 
        />
      )}
    </div>
  );
};

export default NewsList;
