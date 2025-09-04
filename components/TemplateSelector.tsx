
import React from 'react';
import { BrandColors, TemplateId, Template } from '../types';

const ModernDemo: React.FC<{ colors: BrandColors }> = ({ colors }) => (
  <div className="w-full h-full p-2 flex items-center space-x-2 border border-gray-200 rounded-md bg-white">
    <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: colors.primary, border: `2px solid ${colors.primary}` }}></div>
    <div className="flex-grow">
      <div className="h-2.5 rounded" style={{ backgroundColor: colors.primary, width: '70%' }}></div>
      <div className="h-2 mt-1.5 rounded" style={{ backgroundColor: colors.secondary, width: '90%' }}></div>
      <div className="h-1.5 mt-1 rounded" style={{ backgroundColor: colors.text, width: '80%' }}></div>
    </div>
  </div>
);

const MinimalistDemo: React.FC<{ colors: BrandColors }> = ({ colors }) => (
  <div className="w-full h-full p-2 flex items-center space-x-2 border border-gray-200 rounded-md bg-white">
    <div className="w-1 h-12 rounded-full" style={{ backgroundColor: colors.primary }}></div>
    <div className="flex-grow">
      <div className="h-2.5 rounded" style={{ backgroundColor: colors.primary, width: '60%' }}></div>
      <div className="h-2 mt-1.5 rounded" style={{ backgroundColor: colors.secondary, width: '80%' }}></div>
      <div className="h-1.5 mt-1 rounded" style={{ backgroundColor: colors.text, width: '90%' }}></div>
    </div>
  </div>
);

const ClassicDemo: React.FC<{ colors: BrandColors }> = ({ colors }) => (
  <div className="w-full h-full p-2 flex items-center space-x-2 border border-gray-200 rounded-md bg-white">
    <div className="w-8 h-8 flex-shrink-0" style={{ backgroundColor: colors.secondary }}></div>
    <div className="w-px h-10 bg-gray-300"></div>
    <div className="flex-grow">
      <div className="h-2.5 rounded" style={{ backgroundColor: colors.text, width: '70%' }}></div>
      <div className="h-2 mt-1.5 rounded" style={{ backgroundColor: colors.secondary, width: '50%' }}></div>
    </div>
  </div>
);

const VerticalDemo: React.FC<{ colors: BrandColors }> = ({ colors }) => (
  <div className="w-full h-full flex border border-gray-200 rounded-md bg-white overflow-hidden">
    <div className="w-1/3 h-full p-2 flex flex-col items-center justify-center space-y-1" style={{ backgroundColor: colors.primary }}>
      <div className="w-6 h-6 rounded-full bg-white opacity-50"></div>
      <div className="h-2 w-8/12 rounded bg-white opacity-50"></div>
    </div>
    <div className="w-2/3 p-2">
       <div className="h-2 rounded" style={{ backgroundColor: colors.secondary, width: '60%' }}></div>
       <div className="h-1.5 mt-2 rounded" style={{ backgroundColor: colors.text, width: '90%' }}></div>
       <div className="h-1.5 mt-1 rounded" style={{ backgroundColor: colors.text, width: '80%' }}></div>
    </div>
  </div>
);

const CompactDemo: React.FC<{ colors: BrandColors }> = ({ colors }) => (
  <div className="w-full h-full p-2 flex flex-col justify-center border border-gray-200 rounded-md bg-white">
      <div className="h-2 rounded" style={{ backgroundColor: colors.primary, width: '80%' }}></div>
      <div className="h-1.5 mt-1.5 rounded" style={{ backgroundColor: colors.secondary, width: '90%' }}></div>
  </div>
);

const SocialFocusDemo: React.FC<{ colors: BrandColors }> = ({ colors }) => (
  <div className="w-full h-full p-2 flex flex-col justify-center border border-gray-200 rounded-md bg-white">
    <div className="flex items-center space-x-2">
        <div className="w-6 h-6 rounded flex-shrink-0" style={{ backgroundColor: colors.secondary }}></div>
        <div className="flex-grow">
            <div className="h-2.5 rounded" style={{ backgroundColor: colors.primary, width: '70%' }}></div>
        </div>
    </div>
    <div className="mt-2 pt-2 flex justify-between items-center" style={{ borderTop: `2px solid ${colors.primary}`}}>
        <div className="h-1.5 rounded" style={{ backgroundColor: colors.text, width: '40%' }}></div>
        <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.secondary }}></div>
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.secondary }}></div>
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.secondary }}></div>
        </div>
    </div>
  </div>
);


export const TEMPLATES: Template[] = [
  { id: TemplateId.Modern, name: 'Modern', component: ModernDemo },
  { id: TemplateId.Minimalist, name: 'Minimalist', component: MinimalistDemo },
  { id: TemplateId.Vertical, name: 'Vertical', component: VerticalDemo },
  { id: TemplateId.SocialFocus, name: 'Social Focus', component: SocialFocusDemo },
  { id: TemplateId.Classic, name: 'Classic', component: ClassicDemo },
  { id: TemplateId.Compact, name: 'Compact', component: CompactDemo },
];

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