
import { useEffect } from "react";
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

  useEffect(() => {
    console.log("[NewsList] Data state:", { 
      hasCategories: Boolean(categories?.length), 
      categoriesCount: categories?.length,
      hasPosts: Boolean(posts?.length), 
      postsCount: posts?.length,
      isLoading, 
      hasError: Boolean(error),
      selectedCategory
    });
  }, [categories, posts, isLoading, error, selectedCategory]);

  if (error) {
    console.error("[NewsList] Error:", error);
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-destructive">Error loading news</h3>
        <p className="text-muted-foreground mt-2">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search bar */}
      <div className="flex justify-center">
        <SearchBar onSearch={handleSearch} />
      </div>
      
      {/* Category filters */}
      <CategoryFilters 
        categories={categories || []} 
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
