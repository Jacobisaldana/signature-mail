import { Template, TemplateId } from '../types';
import { CompactPreview } from './previews';
import { TemplateRenderProps, getIconUrls, normalizeUrl } from './shared';

const render = ({ data, colors, imageData, fontFamily }: TemplateRenderProps) => {
  const icons = getIconUrls();
  return `
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="font-family: ${fontFamily}; font-size: 12px; color: ${colors.text}; table-layout: fixed;">
      <tr>
        <td style="font-weight: bold; color: ${colors.primary};">${data.fullName}</td>
        <td style="padding: 0 5px; color: #cccccc;">|</td>
        <td>${data.jobTitle}</td>
      </tr>
      <tr>
        <td colspan="3" style="font-size: 11px; color: ${colors.secondary};">
          ${data.email ? `<span><img src="${icons.email}" alt="Email" width="12" height="12" style="vertical-align: middle; margin-right: 4px; border:0;" /><a href="mailto:${data.email}" style="color: ${colors.secondary}; text-decoration: none;">${data.email}</a></span>` : ''}
          ${data.phone ? ` <span style="margin-left:8px;"><img src="${icons.phone}" alt="Phone" width="12" height="12" style="vertical-align: middle; margin-right: 4px; border:0;" />${data.phone}</span>` : ''}
          ${(() => {
            const websiteHref = normalizeUrl(data.website);
            if (!websiteHref) return '';
            return ` <span style="margin-left:8px;"><img src="${icons.website}" alt="Website" width="12" height="12" style="vertical-align: middle; margin-right: 4px; border:0;" /><a href="${websiteHref}" target="_blank" style="color: ${colors.primary}; text-decoration: none;">Website</a></span>`;
          })()}
        </td>
      </tr>
      ${(() => {
        const calendarHref = normalizeUrl(data.calendarUrl);
        if (!calendarHref) return '';
        return `<tr><td colspan="3" style="padding-top: 5px;"><a href="${calendarHref}" target="_blank" style="color: ${colors.primary}; text-decoration: none; font-weight: bold;">${data.calendarText || 'Schedule a meeting'}</a></td></tr>`;
      })()}
    </table>
  `;
};

export const compactTemplate: Template = {
  id: TemplateId.Compact,
  name: 'Compact',
  component: CompactPreview,
  render,
};
