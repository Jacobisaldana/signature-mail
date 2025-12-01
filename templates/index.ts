import { Template, TemplateId } from '../types';
import { modernTemplate } from './modern';
import { minimalistTemplate } from './minimalist';
import { classicTemplate } from './classic';
import { verticalTemplate } from './vertical';
import { compactTemplate } from './compact';
import { socialFocusTemplate } from './socialFocus';
import { TemplateRenderProps, setIconUrls, getIconUrls } from './shared';

export const TEMPLATES: Template[] = [
  modernTemplate,
  minimalistTemplate,
  verticalTemplate,
  socialFocusTemplate,
  classicTemplate,
  compactTemplate,
];

const templateMap = new Map<TemplateId, Template>(TEMPLATES.map((t) => [t.id, t]));

export const renderSignatureHtml = (templateId: TemplateId, params: TemplateRenderProps): string => {
  const template = templateMap.get(templateId);
  if (!template) return '<p>Error: Template not found.</p>';
  return template.render(params);
};

export { setIconUrls, getIconUrls };
