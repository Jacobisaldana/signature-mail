
import React from 'react';
import { BrandColors, TemplateId } from '../types';
import { TEMPLATES } from '../templates';

interface TemplateSelectorProps {
  selectedTemplates: TemplateId[];
  onTemplateToggle: (id: TemplateId) => void;
  colors: BrandColors;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selectedTemplates, onTemplateToggle, colors }) => {
  return (
    <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Signature Templates</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {TEMPLATES.map((template) => {
            const isSelected = selectedTemplates.includes(template.id);
            return (
            <div
                key={template.id}
                onClick={() => onTemplateToggle(template.id)}
                className={`cursor-pointer rounded-lg border-2 p-1 transition-all duration-200 ${
                isSelected ? 'border-amber-500 shadow-lg' : 'border-gray-300 hover:border-amber-400'
                }`}
            >
                <div className="h-24 w-full">
                    <template.component colors={colors} />
                </div>
                <p className={`text-center text-sm font-medium mt-2 ${isSelected ? 'text-amber-600' : 'text-gray-600'}`}>{template.name}</p>
            </div>
            );
        })}
        </div>
    </div>
  );
};
