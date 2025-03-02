
export const RegistrationSuccess = () => {
  return (
    <div className="text-center py-6">
      <div className="mb-4 flex justify-center">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Registration Complete!</h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Your registration request has been submitted and is pending approval. Redirecting to login page...
      </p>
    </div>
  );
};
