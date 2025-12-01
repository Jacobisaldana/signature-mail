import { Template, TemplateId } from '../types';
import { ClassicPreview } from './previews';
import { TemplateRenderProps, generateCalendarButton, getIconUrls } from './shared';

const render = ({ data, colors, imageData }: TemplateRenderProps) => {
  const icons = getIconUrls();
  return `
    <table cellpadding="0" cellspacing="0" style="font-family: 'Times New Roman', Times, serif; font-size: 14px; color: ${colors.text};">
      <tr>
        ${imageData ? `<td style=\"padding-right: 15px;\"><img src=\"${imageData}\" alt=\"${data.fullName}\" width=\"70\" height=\"70\" style=\"display:block; border: 2px solid ${colors.primary}; border-radius: 50%;\"></td>` : ''}
        <td style="border-left: 1px solid #cccccc; padding-left: 15px; vertical-align: top;">
          <p style="margin: 0; font-weight: bold; font-size: 16px; color: #000000;">${data.fullName}</p>
          <p style="margin: 2px 0; font-style: italic; color: ${colors.secondary};">${data.jobTitle}</p>
          <p style="margin: 2px 0 8px 0; color: ${colors.secondary};">${data.company}</p>
          <p style="margin: 4px 0;"><strong>Tel:</strong> ${data.phone || 'N/A'}</p>
          <p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${data.email}" style="color: ${colors.primary}; text-decoration: none;">${data.email}</a></p>
          ${generateCalendarButton(data, colors)}
        </td>
      </tr>
    </table>
  `;
};

export const classicTemplate: Template = {
  id: TemplateId.Classic,
  name: 'Classic',
  component: ClassicPreview,
  render,
};
