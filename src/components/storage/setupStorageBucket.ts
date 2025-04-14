
import { supabase } from "@/integrations/supabase/client";

export const setupAvatarsBucket = async () => {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }
    
    const avatarBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
    
    if (!avatarBucketExists) {
      // Create the avatars bucket
      const { error } = await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 1024 * 1024 * 2, // 2MB
      });
      
      if (error) {
        console.error('Error creating avatars bucket:', error);
        return false;
      }
      
      console.log('Avatars bucket created successfully');
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up avatars bucket:', error);
    return false;
  }
};
