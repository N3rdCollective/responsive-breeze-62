
import { Shield, Mail, Globe, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16 space-y-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-muted-foreground">Effective Date: April 14, 2025</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert">
              <p>
                Welcome to Rappin' Lounge Radio. We are committed to protecting your privacy and 
                ensuring the security of your personal information. This Privacy Policy outlines 
                how we collect, use, and disclose information when you use our website.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Automatically Collected Information:</h3>
                <p>We use Google Analytics to collect information about your interactions with our website. This includes:</p>
                <ul>
                  <li>IP address (which may be anonymized)</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Device type</li>
                  <li>Pages visited</li>
                  <li>Time spent on pages</li>
                  <li>Referring websites</li>
                  <li>User interactions (clicks, scrolls, etc.)</li>
                </ul>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold">Google Analytics</h3>
                <p>
                  We use Google Analytics, a web analytics service provided by Google, Inc. 
                  Google Analytics uses cookies to collect and analyze information about your 
                  use of our website. You can learn more about how Google uses your data by 
                  visiting their{" "}
                  <a 
                    href="https://policies.google.com/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </a>.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Data Security & Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert space-y-4">
              <p>
                We take reasonable measures to protect your information from unauthorized 
                access, use, or disclosure. You have the right to:
              </p>
              <ul>
                <li>Request access to your personal data</li>
                <li>Request correction of your personal data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Request restriction of processing your personal data</li>
                <li>Request transfer of your personal data</li>
                <li>Withdraw consent</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert">
              <p>
                If you have any questions or concerns about this Privacy Policy, please contact us at:{" "}
                <a href="mailto:privacy@rappinlounge.com" className="text-primary hover:underline">
                  privacy@rappinlounge.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
