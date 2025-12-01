import { Template, TemplateId } from '../types';
import { ModernPreview } from './previews';
import { TemplateRenderProps, generateCalendarButton, generateSocialIcons, getIconUrls } from './shared';

const render = ({ data, colors, imageData }: TemplateRenderProps) => {
  const icons = getIconUrls();
  return `
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="font-family: Arial, sans-serif; font-size: 14px; color: ${colors.text}; background-color: ${colors.background}; border-left: 5px solid ${colors.primary}; table-layout: fixed;">
      <tr>
        ${imageData ? `<td valign=\"top\" width=\"110\" style=\"padding:16px 20px 16px 20px;\"><img src=\"${imageData}\" alt=\"${data.fullName}\" width=\"90\" height=\"90\" style=\"display:block; border:0; border-radius: 50%; border: 2px solid ${colors.primary};\"></td>` : ''}
        <td valign="top" style="padding:16px 20px 16px 20px;">
          <h3 style="margin: 0; font-size: 18px; font-weight: bold; color: ${colors.primary};">${data.fullName}</h3>
          <p style="margin: 2px 0; color: ${colors.secondary};">${data.jobTitle} | ${data.company}</p>
          ${data.tagline ? `<p style="margin: 8px 0 10px 0; font-style: italic; color: ${colors.secondary}; font-size: 12px;">“${data.tagline}”</p>` : '<span style="display:block; height: 10px;"></span>'}
          <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-top: 1px solid #eeeeee; padding-top: 8px;">
            <tr><td>
            ${data.phone ? `<p style="margin: 4px 0;"><img src="${icons.phone}" alt="Phone" width="14" height="14" style="vertical-align: middle; margin-right: 6px; border:0;" /> <a href="tel:${data.phone}" style="color: ${colors.text}; text-decoration: none;">${data.phone}</a></p>` : ''}
            ${data.email ? `<p style="margin: 4px 0;"><img src="${icons.email}" alt="Email" width="14" height="14" style="vertical-align: middle; margin-right: 6px; border:0;" /> <a href="mailto:${data.email}" style="color: ${colors.text}; text-decoration: none;">${data.email}</a></p>` : ''}
            ${data.website ? `<p style="margin: 4px 0;"><img src="${icons.website}" alt="Website" width="14" height="14" style="vertical-align: middle; margin-right: 6px; border:0;" /> <a href="${data.website}" target="_blank" style="color: ${colors.text}; text-decoration: none;">${data.website.replace(/https?:\/\//, '')}</a></p>` : ''}
            </td></tr>
          </table>
          ${generateCalendarButton(data, colors)}
          <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-top: 12px;"><tr><td>${generateSocialIcons(data)}</td></tr></table>
        </td>
      </tr>
    </table>
  `;
};

export const modernTemplate: Template = {
  id: TemplateId.Modern,
  name: 'Modern',
  component: ModernPreview,
  render,
};
