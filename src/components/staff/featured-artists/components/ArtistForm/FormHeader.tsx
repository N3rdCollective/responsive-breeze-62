
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";

interface FormHeaderProps {
  title: string;
}

const FormHeader: React.FC<FormHeaderProps> = ({ title }) => {
  return (
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
  );
};

export default FormHeader;
