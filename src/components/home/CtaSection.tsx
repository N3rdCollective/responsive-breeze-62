
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

interface CtaSectionProps {
  title: string;
  subtitle: string;
  buttonText: string;
}

const CtaSection: React.FC<CtaSectionProps> = ({ title, subtitle, buttonText }) => {
  return (
    <section className="py-16 bg-gradient-to-r from-primary/5 via-background to-secondary/5 dark:from-primary/10 dark:to-secondary/10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            {title}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/auth" className="gap-2">
                <Users className="w-5 h-5" />
                {buttonText}
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/about">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
