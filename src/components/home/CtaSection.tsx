
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
    <section className="py-12 sm:py-16 bg-gradient-to-r from-primary/5 via-background to-secondary/5 dark:from-primary/10 dark:to-secondary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-foreground leading-tight">
            {title}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Button size="lg" asChild className="w-full sm:w-auto min-h-[48px] px-6 sm:px-8">
              <Link to="/auth" className="gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                {buttonText}
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto min-h-[48px] px-6 sm:px-8">
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
