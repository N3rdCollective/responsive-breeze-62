import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSystemSettings } from "@/hooks/useSystemSettings";

const TermsOfService = () => {
  const { settings } = useSystemSettings();
  const siteName = settings?.site_title || "Rappin' Lounge Radio";
  const contactEmail = settings?.contact_email || "contact@rappinlounge.com";

  const lastUpdated = "January 1, 2024";

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Welcome to {siteName}! These Terms of Service ("Terms") govern your use of our website, radio streaming services, 
              and community features. By accessing or using our services, you agree to be bound by these Terms.
            </p>
            <p>
              If you do not agree to these Terms, please do not use our services.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Description of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              {siteName} provides online radio streaming services, community forums, user profiles, messaging systems, 
              and related features. Our services include:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Live radio streaming and audio content</li>
              <li>Community forums and discussion boards</li>
              <li>User profiles and social features</li>
              <li>Private messaging between users</li>
              <li>News and information about artists and music</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>User Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Registration</h3>
              <p className="text-muted-foreground">
                To access certain features, you must create an account. You agree to provide accurate, current, and complete information 
                during registration and to update such information as needed.
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-2">Account Security</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You are responsible for all activities that occur under your account</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>We reserve the right to suspend or terminate accounts that violate these Terms</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Acceptable Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>You agree to use our services only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Post, transmit, or share content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
              <li>Impersonate any person or entity or falsely state your affiliation with any person or entity</li>
              <li>Upload, post, or transmit any content that infringes intellectual property rights</li>
              <li>Engage in spamming, flooding, or any form of automated data collection</li>
              <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
              <li>Distribute malware, viruses, or any other harmful software</li>
              <li>Use our services for commercial purposes without our written consent</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Content and Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Your Content</h3>
              <p className="text-muted-foreground">
                You retain ownership of content you post on our platform. However, by posting content, you grant us a non-exclusive, 
                royalty-free license to use, display, and distribute your content in connection with our services.
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-2">Our Content</h3>
              <p className="text-muted-foreground">
                All content provided by {siteName}, including but not limited to text, graphics, logos, audio clips, and software, 
                is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our permission.
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-2">Music Licensing</h3>
              <p className="text-muted-foreground">
                We obtain proper licensing for all music played on our radio station. Users may not redistribute, download, or use our audio content 
                for commercial purposes without appropriate licensing.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Community Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Our community thrives on respectful interaction. Please follow these guidelines:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Be respectful:</strong> Treat all community members with kindness and respect</li>
              <li><strong>Stay on topic:</strong> Keep discussions relevant to the forum category</li>
              <li><strong>No hate speech:</strong> Discrimination, harassment, or hate speech will not be tolerated</li>
              <li><strong>Respect privacy:</strong> Do not share personal information of others without consent</li>
              <li><strong>Report violations:</strong> Help us maintain a safe community by reporting inappropriate content</li>
              <li><strong>Original content:</strong> Only post content you have the right to share</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Moderation and Enforcement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We reserve the right to monitor, review, and moderate content and user activity on our platform. 
              Violations of these Terms may result in:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Content removal or editing</li>
              <li>Temporary account suspension</li>
              <li>Permanent account termination</li>
              <li>Legal action if necessary</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              We strive to be fair and consistent in our moderation practices while maintaining a safe and welcoming community.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information. 
              By using our services, you also agree to our Privacy Policy.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Disclaimers and Limitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Service Availability</h3>
              <p className="text-muted-foreground">
                We strive to provide uninterrupted service but cannot guarantee 100% uptime. Services may be temporarily unavailable 
                due to maintenance, technical issues, or circumstances beyond our control.
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-2">Limitation of Liability</h3>
              <p className="text-muted-foreground">
                To the fullest extent permitted by law, {siteName} shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages arising from your use of our services.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Termination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              You may terminate your account at any time by contacting us or using the account deletion feature. 
              We may terminate or suspend your access to our services at any time, with or without cause or notice, for conduct that we believe:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Violates these Terms or our Privacy Policy</li>
              <li>Harms other users or our business interests</li>
              <li>Violates applicable law</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We may modify these Terms from time to time. We will notify users of significant changes by posting the updated Terms on our website 
              and updating the "Last updated" date. Your continued use of our services after such modifications constitutes acceptance of the updated Terms.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
              without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction 
              of the courts in [Your Jurisdiction].
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-3 space-y-1 text-muted-foreground">
              <p>Email: {contactEmail}</p>
              <p>Website: {siteName}</p>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              These Terms of Service were last updated on {lastUpdated}.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;