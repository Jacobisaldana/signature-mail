import { BrandColors, FormData, TemplateRenderParams } from '../types';

export type TemplateRenderProps = TemplateRenderParams;

type IconUrls = {
  linkedin: string;
  twitter: string;
  instagram: string;
  facebook: string;
  calendar: string;
  phone: string;
  email: string;
  website: string;
};

// Default icons (fallback). Can be overridden at runtime with setIconUrls.
let iconUrls: IconUrls = {
  linkedin: "https://contractorcommander.com/wp-content/uploads/2025/09/linkedin.png",
  twitter: "https://contractorcommander.com/wp-content/uploads/2025/09/twitter.png",
  instagram: "https://contractorcommander.com/wp-content/uploads/2025/09/instagram.png",
  facebook: "https://contractorcommander.com/wp-content/uploads/2025/09/facebook.png",
  calendar: "https://contractorcommander.com/wp-content/uploads/2025/09/calendar.png",
  phone: "https://contractorcommander.com/wp-content/uploads/2025/09/phone.png",
  email: "https://contractorcommander.com/wp-content/uploads/2025/09/email.png",
  website: "https://contractorcommander.com/wp-content/uploads/2025/09/website.png",
};

export const setIconUrls = (urls: Partial<IconUrls>) => {
  iconUrls = { ...iconUrls, ...urls };
};

export const getIconUrls = () => iconUrls;

export const generateSocialIcons = (data: FormData): string => {
  const cells: string[] = [];
  const icons = getIconUrls();
  const iconStyle = `display:block; width: 24px; height: 24px; border: 0;`;

  const push = (href: string, src: string, alt: string) => {
    cells.push(`
      <td valign="middle" width="28" style="padding-right: 8px;">
        <a href="${href}" target="_blank" style="text-decoration:none; display:inline-block;">
          <img src="${src}" alt="${alt}" style="${iconStyle}" width="24" height="24" border="0" />
        </a>
      </td>
    `);
  };

  if (data.linkedin) push(data.linkedin, icons.linkedin, 'LinkedIn');
  if (data.twitter) push(data.twitter, icons.twitter, 'X (Twitter)');
  if (data.instagram) push(data.instagram, icons.instagram, 'Instagram');
  if (data.facebook) push(data.facebook, icons.facebook, 'Facebook');

  if (!cells.length) return '';
  return `
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="table-layout: fixed;">
      <tr>
        ${cells.join('')}
      </tr>
    </table>
  `;
};

export const generateCalendarButton = (data: FormData, colors: BrandColors): string => {
  if (!data.calendarUrl) return '';
  const icons = getIconUrls();
  const buttonText = data.calendarText || 'Schedule a meeting';
  const textColor = '#ffffff';
  return `
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="padding-top: 12px;">
      <tr>
        <td>
          <a href="${data.calendarUrl}" target="_blank" style="display: inline-block; background-color: ${colors.primary}; color: ${textColor}; font-family: Arial, sans-serif; font-size: 13px; font-weight: bold; text-decoration: none; padding: 8px 12px; border-radius: 5px;">
            <table cellpadding="0" cellspacing="0" border="0" role="presentation">
              <tr>
                <td style="vertical-align: middle;"><img src="${icons.calendar}" alt="calendar" width="16" height="16" style="display: block;" border="0"></td>
                <td style="padding-left: 8px; color: ${textColor}; vertical-align: middle;">${buttonText}</td>
              </tr>
            </table>
          </a>
        </td>
      </tr>
    </table>
  `;
};
