
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralSettingsTab from "./tabs/GeneralSettingsTab";
import ContactSettingsTab from "./tabs/ContactSettingsTab";
import CopyrightSettingsTab from "./tabs/CopyrightSettingsTab";
import LocalizationSettingsTab from "./tabs/LocalizationSettingsTab";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { SystemSettingsFormValues } from "@/types/settings";

const formSchema = z.object({
  site_title: z.string().min(1, "Site title is required"),
  site_tagline: z.string().min(1, "Site tagline is required"),
  contact_email: z.string().email("Invalid email address").optional().or(z.literal("")),
  contact_phone: z.string().optional().or(z.literal("")),
  social_media_links: z.object({
    facebook: z.string().optional().or(z.literal("")),
    twitter: z.string().optional().or(z.literal("")),
    instagram: z.string().optional().or(z.literal("")),
    youtube: z.string().optional().or(z.literal(""))
  }),
  copyright_text: z.string().min(1, "Copyright text is required"),
  language: z.string().min(1, "Language is required"),
  time_zone: z.string().min(1, "Time zone is required")
});

const SystemSettingsForm = () => {
  const { settings, isLoading, isSaving, updateSettings } = useSystemSettings();
  const [activeTab, setActiveTab] = useState("general");
  const [isFormReady, setIsFormReady] = useState(false);

  const form = useForm<SystemSettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      site_title: "",
      site_tagline: "",
      contact_email: "",
      contact_phone: "",
      social_media_links: {
        facebook: "",
        twitter: "",
        instagram: "",
        youtube: ""
      },
      copyright_text: "",
      language: "en",
      time_zone: "UTC"
    }
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        site_title: settings.site_title,
        site_tagline: settings.site_tagline,
        contact_email: settings.contact_email || "",
        contact_phone: settings.contact_phone || "",
        social_media_links: settings.social_media_links,
        copyright_text: settings.copyright_text,
        language: settings.language,
        time_zone: settings.time_zone
      });
      setIsFormReady(true);
    }
  }, [settings, form]);

  const onSubmit = (values: SystemSettingsFormValues) => {
    updateSettings(values);
  };

  if (isLoading) {
    return (
      <Card className="p-4 sm:p-6">
        <div className="flex justify-center items-center h-60">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading system settings...</span>
        </div>
      </Card>
    );
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="p-4 sm:p-6">
          {isFormReady ? (
            <Tabs 
              defaultValue="general" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-4 sm:mb-6 h-auto">
                <TabsTrigger value="general" className="text-xs sm:text-sm px-2 py-2">
                  General
                </TabsTrigger>
                <TabsTrigger value="contact" className="text-xs sm:text-sm px-2 py-2">
                  <span className="hidden sm:inline">Contact Info</span>
                  <span className="sm:hidden">Contact</span>
                </TabsTrigger>
                <TabsTrigger value="copyright" className="text-xs sm:text-sm px-2 py-2">
                  Copyright
                </TabsTrigger>
                <TabsTrigger value="localization" className="text-xs sm:text-sm px-2 py-2">
                  <span className="hidden sm:inline">Localization</span>
                  <span className="sm:hidden">Locale</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="mt-4 sm:mt-6">
                <GeneralSettingsTab />
              </TabsContent>
              
              <TabsContent value="contact" className="mt-4 sm:mt-6">
                <ContactSettingsTab />
              </TabsContent>
              
              <TabsContent value="copyright" className="mt-4 sm:mt-6">
                <CopyrightSettingsTab />
              </TabsContent>
              
              <TabsContent value="localization" className="mt-4 sm:mt-6">
                <LocalizationSettingsTab />
              </TabsContent>
              
              <div className="flex justify-end mt-6">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full sm:w-auto"
                >
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Settings
                </Button>
              </div>
            </Tabs>
          ) : (
            <div className="flex justify-center items-center h-60">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Preparing settings form...</span>
            </div>
          )}
        </Card>
      </form>
    </FormProvider>
  );
};

export default SystemSettingsForm;
