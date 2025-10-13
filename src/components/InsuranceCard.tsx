import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface InsuranceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  onQuote: () => void;
}

export const InsuranceCard = ({ title, description, icon: Icon, features, onQuote }: InsuranceCardProps) => {
  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-strong border-border bg-gradient-card h-full">
      <CardHeader className="text-center pb-3 sm:pb-4 p-4 sm:p-6">
        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary-foreground" />
        </div>
        <CardTitle className="text-lg sm:text-xl font-bold text-foreground mb-2">{title}</CardTitle>
        <CardDescription className="text-sm sm:text-base text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
        <ul className="space-y-1.5 sm:space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
              <span className="leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
        <Button 
          onClick={onQuote}
          variant="quote" 
          size="lg" 
          className="w-full h-10 sm:h-11 text-sm sm:text-base"
        >
          Cotizar Ahora
        </Button>
      </CardContent>
    </Card>
  );
};