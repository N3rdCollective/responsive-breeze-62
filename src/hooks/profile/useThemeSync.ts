
import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * A hook that synchronizes the user's profile theme preference with the application theme
 * @param profileTheme The theme stored in the user's profile
 * @param setTheme The function to update the theme in the profile form
 */
export const useThemeSync = (profileTheme: string | undefined, setTheme: (theme: string) => void) => {
  const { theme: appTheme, setTheme: setAppTheme } = useTheme();

  // Initial sync: When profile loads, apply the profile theme to the app if available
  useEffect(() => {
    if (profileTheme && profileTheme !== 'default') {
      setAppTheme(profileTheme);
    }
  }, [profileTheme, setAppTheme]);

  // Provide a function to update both the profile and app theme
  const updateTheme = (newTheme: string) => {
    setTheme(newTheme);
    setAppTheme(newTheme);
  };

  return {
    appTheme,
    updateTheme
  };
};
