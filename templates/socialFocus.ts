import { Template, TemplateId } from '../types';
import { SocialFocusPreview } from './previews';
import { TemplateRenderProps, generateCalendarButton, generateSocialIcons, getIconUrls } from './shared';

const render = ({ data, colors, imageData }: TemplateRenderProps) => {
  const icons = getIconUrls();
  return `
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="font-family: 'Verdana', sans-serif; color: ${colors.text}; font-size: 14px; width: 450px; table-layout: fixed;">
      <tr>
        ${imageData ? `<td valign=\"top\" width=\"80\" style=\"padding-right: 15px;\"><img src=\"${imageData}\" alt=\"${data.fullName}\" width=\"60\" height=\"60\" style=\"display:block; border: 2px solid ${colors.primary}; border-radius: 50%;\"></td>` : ''}
        <td valign="top">
          <p style="margin: 0; font-weight: bold; color: ${colors.primary}; font-size: 18px;">${data.fullName}</p>
          <p style="margin: 2px 0 8px 0; color: ${colors.secondary};">${data.jobTitle} at ${data.company}</p>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding-top: 15px; border-top: 2px solid ${colors.primary};">
          <table cellpadding="0" cellspacing="0" style="width: 100%;">
            <tr>
              <td style="vertical-align: top; width: 50%;">
                ${data.email ? `<p style="margin: 0 0 5px 0;"><img src="${icons.email}" alt="Email" width="14" height="14" style="vertical-align: middle; margin-right: 6px; border:0;" /><a href="mailto:${data.email}" style="color: ${colors.text}; text-decoration: none;">${data.email}</a></p>` : ''}
                ${data.phone ? `<p style="margin: 0;"><img src="${icons.phone}" alt="Phone" width="14" height="14" style="vertical-align: middle; margin-right: 6px; border:0;" /><a href="tel:${data.phone}" style="color: ${colors.text}; text-decoration: none;">${data.phone}</a></p>` : ''}
                ${data.calendarUrl ? generateCalendarButton(data, colors) : ''}
              </td>
              <td style="vertical-align: top; text-align: right;">
                ${generateSocialIcons(data)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};

export const socialFocusTemplate: Template = {
  id: TemplateId.SocialFocus,
  name: 'Social Focus',
  component: SocialFocusPreview,
  render,
};
