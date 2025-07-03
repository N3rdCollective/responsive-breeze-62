import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSystemSettings } from "@/hooks/useSystemSettings";

const PrivacyPolicy = () => {
  const { settings } = useSystemSettings();
  const siteName = settings?.site_title || "Rappin' Lounge Radio";
  const contactEmail = settings?.contact_email || "contact@rappinlounge.com";

  const lastUpdated = "January 1, 2024";

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Introduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Welcome to {siteName}. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you use our radio station website and services.
            </p>
            <p>
              By using our services, you agree to the collection and use of information in accordance with this policy.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Name and username when you create an account</li>
                <li>Email address for account verification and communication</li>
                <li>Profile information you choose to share (bio, profile picture, social links)</li>
                <li>Forum posts, messages, and other content you create</li>
              </ul>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-2">Automatically Collected Information</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent on our site</li>
                <li>Listening habits and preferences</li>
                <li>Technical data for improving our services</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>To provide and maintain our radio streaming services</li>
              <li>To manage your user account and profile</li>
              <li>To enable forum discussions and community features</li>
              <li>To send important updates about our services</li>
              <li>To improve our website and user experience</li>
              <li>To prevent fraud and ensure security</li>
              <li>To comply with legal obligations</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Information Sharing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong>With your consent:</strong> When you explicitly agree to share information</li>
              <li><strong>Service providers:</strong> With trusted partners who help us operate our services (hosting, analytics)</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Public content:</strong> Forum posts and public profile information are visible to other users</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Data Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, 
              alteration, disclosure, or destruction. Our security measures include:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Encrypted data transmission (SSL/TLS)</li>
              <li>Secure database storage with access controls</li>
              <li>Regular security audits and updates</li>
              <li>Staff training on data protection practices</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Access and review your personal data</li>
              <li>Update or correct your information</li>
              <li>Delete your account and associated data</li>
              <li>Object to certain uses of your data</li>
              <li>Request data portability</li>
              <li>Withdraw consent where applicable</li>
            </ul>
            <p className="mt-3 text-sm">
              To exercise these rights, please contact us at {contactEmail}.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cookies and Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We use cookies and similar tracking technologies to enhance your experience on our website. 
              These help us remember your preferences, analyze site usage, and provide personalized content.
            </p>
            <p>
              You can control cookie settings through your browser preferences. Note that disabling cookies may affect some features of our website.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Our website may contain links to external websites and uses third-party services including:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Supabase for database and authentication services</li>
              <li>Social media platforms for sharing content</li>
              <li>Analytics services to understand site usage</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              These third parties have their own privacy policies, and we encourage you to review them.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. 
              If you believe we have collected information from a child under 13, please contact us immediately.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Data Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We retain your personal data only as long as necessary for the purposes outlined in this policy or as required by law. 
              When you delete your account, we will remove your personal data within a reasonable timeframe, 
              except for information we are legally required to retain.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We may update this privacy policy from time to time. We will notify you of any significant changes by posting the new policy on this page 
              and updating the "Last updated" date. We encourage you to review this policy periodically.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact us at:
            </p>
            <div className="mt-3 space-y-1 text-muted-foreground">
              <p>Email: {contactEmail}</p>
              <p>Website: {siteName}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;