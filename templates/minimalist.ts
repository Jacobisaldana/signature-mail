import { Template, TemplateId } from '../types';
import { MinimalistPreview } from './previews';
import { TemplateRenderProps, generateCalendarButton, generateSocialIcons, getIconUrls, normalizeUrl } from './shared';

const render = ({ data, colors, imageData, fontFamily }: TemplateRenderProps) => {
  const icons = getIconUrls();
  return `
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="font-family: ${fontFamily}; font-size: 13px; color: ${colors.text}; line-height: 1.5; table-layout: fixed;">
      <tr>
        ${imageData ? `<td valign="top" width="80" style="padding-right: 12px;"><img src="${imageData}" alt="${data.fullName}" width="60" height="60" style="display:block; border: 2px solid ${colors.primary}; border-radius: 50%;" /></td>` : ''}
        <td valign="top" style="border-left: 2px solid ${colors.primary}; padding-left: 15px;">
          <p style="margin: 0; font-weight: bold; color: ${colors.primary}; font-size: 16px;">${data.fullName}</p>
          <p style="margin: 2px 0; color: ${colors.secondary};">${data.jobTitle}</p>
          <p style="margin: 2px 0 8px 0; color: ${colors.secondary}; font-weight: bold;">${data.company}</p>
          ${data.email ? `<p style="margin: 4px 0;"><img src="${icons.email}" alt="Email" width="14" height="14" style="vertical-align: middle; margin-right: 6px; border:0;" /> <a href="mailto:${data.email}" style="color: ${colors.text}; text-decoration: none;">${data.email}</a></p>` : ''}
          ${data.phone ? `<p style="margin: 4px 0;"><img src="${icons.phone}" alt="Phone" width="14" height="14" style="vertical-align: middle; margin-right: 6px; border:0;" /> <a href="tel:${data.phone}" style="color: ${colors.text}; text-decoration: none;">${data.phone}</a></p>` : ''}
          ${(() => {
            const websiteHref = normalizeUrl(data.website);
            if (!websiteHref) return '';
            return `<p style="margin: 4px 0;"><img src="${icons.website}" alt="Website" width="14" height="14" style="vertical-align: middle; margin-right: 4px; border:0;" /> <a href="${websiteHref}" target="_blank" style="color: ${colors.primary}; text-decoration: none;">${websiteHref.replace(/https?:\/\//, '')}</a></p>`;
          })()}
          ${(() => {
            const calendarHref = normalizeUrl(data.calendarUrl);
            if (!calendarHref) return '';
            return `<p style="margin: 6px 0 0 0;"><a href="${calendarHref}" target="_blank" style="color: ${colors.primary}; text-decoration: none; font-weight: bold;">→ ${data.calendarText || 'Schedule a meeting'}</a></p>`;
          })()}
        </td>
      </tr>
    </table>
  `;
};

export const minimalistTemplate: Template = {
  id: TemplateId.Minimalist,
  name: 'Minimalist',
  component: MinimalistPreview,
  render,
};
