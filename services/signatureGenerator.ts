import { TemplateId, TemplateRenderParams } from '../types';
import { renderSignatureHtml, setIconUrls } from '../templates';

// Re-export icon configuration so callers can override bucket URLs at runtime
export { setIconUrls };

export const generateSignatureHtml = (templateId: TemplateId, params: TemplateRenderParams): string => {
  return renderSignatureHtml(templateId, params);
};
