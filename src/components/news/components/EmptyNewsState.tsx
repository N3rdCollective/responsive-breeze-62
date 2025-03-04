
interface EmptyNewsStateProps {
  selectedCategory: string | null;
}

export const EmptyNewsState = ({ selectedCategory }: EmptyNewsStateProps) => {
  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
      <h3 className="text-xl font-semibold">No posts found</h3>
      <p className="text-muted-foreground mt-2">
        {selectedCategory 
          ? `No posts in the '${selectedCategory}' category` 
          : "Check back later for new content"}
      </p>
    </div>
  );
};

export default EmptyNewsState;
