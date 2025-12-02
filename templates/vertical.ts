import { Template, TemplateId } from '../types';
import { VerticalPreview } from './previews';
import { TemplateRenderProps, generateCalendarButton, generateSocialIcons, getIconUrls, normalizeUrl } from './shared';

const render = ({ data, colors, imageData, fontFamily }: TemplateRenderProps) => {
  const icons = getIconUrls();
  return `
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="font-family: ${fontFamily}; font-size: 14px; color: ${colors.text}; table-layout: fixed;">
      <tr>
        <td valign="top" width="140" style="background-color: ${colors.primary}; padding: 20px; border-radius: 8px 0 0 8px; text-align: center;">
          ${imageData ? `<span style=\"display:inline-block; border: 2px solid ${colors.primary}; border-radius: 50%; padding: 2px; background-color: #ffffff; margin-bottom: 10px;\"><img src=\"${imageData}\" alt=\"${data.fullName}\" width=\"72\" height=\"72\" style=\"display:block; border:0; border-radius: 50%;\"></span>` : ''}
          <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: white;">${data.fullName}</h3>
          <p style="margin: 2px 0; color: white; font-size: 12px;">${data.jobTitle}</p>
        </td>
        <td valign="top" style="background-color: ${colors.background}; padding: 20px; border-radius: 0 8px 8px 0;">
          <p style="margin: 0 0 5px 0; font-weight: bold; color: ${colors.primary};">${data.company}</p>
          ${data.email ? `<p style="margin: 4px 0;"><img src="${icons.email}" alt="Email" width="14" height="14" style="vertical-align: middle; margin-right: 6px; border:0;" /> <a href="mailto:${data.email}" style="color: ${colors.text}; text-decoration: none;">${data.email}</a></p>` : ''}
          ${data.phone ? `<p style="margin: 4px 0;"><img src="${icons.phone}" alt="Phone" width="14" height="14" style="vertical-align: middle; margin-right: 6px; border:0;" /> <a href="tel:${data.phone}" style="color: ${colors.text}; text-decoration: none;">${data.phone}</a></p>` : ''}
          ${data.address ? `<p style="margin: 4px 0;"><strong>A:</strong> ${data.address}</p>` : ''}
          ${(() => {
            const calendarHref = normalizeUrl(data.calendarUrl);
            if (!calendarHref) return '';
            return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-top:10px;"><tr><td><a href="${calendarHref}" target="_blank" style="color: ${colors.primary}; text-decoration: none; font-weight: bold;">${data.calendarText || 'Schedule a meeting'}</a></td></tr></table>`;
          })()}
          <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-top: 10px;"><tr><td>${generateSocialIcons(data)}</td></tr></table>
        </td>
      </tr>
    </table>
  `;
};

export const verticalTemplate: Template = {
  id: TemplateId.Vertical,
  name: 'Vertical',
  component: VerticalPreview,
  render,
};
