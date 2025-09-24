import { FormData, BrandColors, TemplateId } from '../types';

interface GeneratorParams {
  data: FormData;
  colors: BrandColors;
  imageData: string | null;
}

// Default icons (fallback). Can be overridden at runtime with setIconUrls.
let iconUrls = {
  linkedin: "https://contractorcommander.com/wp-content/uploads/2025/09/linkedin.png",
  twitter: "https://contractorcommander.com/wp-content/uploads/2025/09/twitter.png",
  instagram: "https://contractorcommander.com/wp-content/uploads/2025/09/instagram.png",
  facebook: "https://contractorcommander.com/wp-content/uploads/2025/09/social.png",
  calendar: "https://contractorcommander.com/wp-content/uploads/2025/09/calendar.png",
  phone: "https://contractorcommander.com/wp-content/uploads/2025/09/phone.png",
  email: "https://contractorcommander.com/wp-content/uploads/2025/09/email.png",
  website: "https://contractorcommander.com/wp-content/uploads/2025/09/website.png",
};

export const setIconUrls = (urls: Partial<typeof iconUrls>) => {
  iconUrls = { ...iconUrls, ...urls };
};

const generateSocialIcons = (data: FormData): string => {
  const icons: string[] = [];
  const iconStyle = `width: 24px; height: 24px; border: 0;`;
  
  if (data.linkedin) icons.push(`<a href="${data.linkedin}" target="_blank" style="margin-right: 8px;"><img src="${iconUrls.linkedin}" alt="LinkedIn" style="${iconStyle}" width="24" height="24" border="0"></a>`);
  if (data.twitter) icons.push(`<a href="${data.twitter}" target="_blank" style="margin-right: 8px;"><img src="${iconUrls.twitter}" alt="X (Twitter)" style="${iconStyle}" width="24" height="24" border="0"></a>`);
  if (data.instagram) icons.push(`<a href="${data.instagram}" target="_blank" style="margin-right: 8px;"><img src="${iconUrls.instagram}" alt="Instagram" style="${iconStyle}" width="24" height="24" border="0"></a>`);
  if (data.facebook) icons.push(`<a href="${data.facebook}" target="_blank"><img src="${iconUrls.facebook}" alt="Website/Social" style="${iconStyle}" width="24" height="24" border="0"></a>`);
  
  return icons.join('');
};

const generateCalendarButton = (data: FormData, colors: BrandColors): string => {
  if (!data.calendarUrl) return '';
  const buttonText = data.calendarText || 'Schedule a meeting';
  const textColor = '#ffffff'; // Assuming white text looks best on a primary color background
  return `
    <div style="padding-top: 12px;">
      <a href="${data.calendarUrl}" target="_blank" style="display: inline-block; background-color: ${colors.primary}; color: ${textColor}; font-family: Arial, sans-serif; font-size: 13px; font-weight: bold; text-decoration: none; padding: 8px 12px; border-radius: 5px;">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="vertical-align: middle;"><img src="${iconUrls.calendar}" alt="calendar" width="16" height="16" style="display: block;" border="0"></td>
            <td style="padding-left: 8px; color: ${textColor}; vertical-align: middle;">${buttonText}</td>
          </tr>
        </table>
      </a>
    </div>
  `;
};

const generators: Record<TemplateId, (params: GeneratorParams) => string> = {
  [TemplateId.Modern]: ({ data, colors, imageData }) => `
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="font-family: Arial, sans-serif; font-size: 14px; color: ${colors.text}; background-color: ${colors.background}; border-left: 5px solid ${colors.primary}; table-layout: fixed;">
      <tr>
        ${imageData ? `<td valign="top" width="110" style="padding:16px 20px 16px 20px;"><img src="${imageData}" alt="${data.fullName}" width="90" height="90" style="display:block; border-radius: 50%; border: 2px solid ${colors.primary};"></td>` : ''}
        <td valign="top" style="padding:16px 20px 16px 20px;">
          <h3 style="margin: 0; font-size: 18px; font-weight: bold; color: ${colors.primary};">${data.fullName}</h3>
          <p style="margin: 2px 0; color: ${colors.secondary};">${data.jobTitle} | ${data.company}</p>
          ${data.tagline ? `<p style="margin: 8px 0 10px 0; font-style: italic; color: ${colors.secondary}; font-size: 12px;">“${data.tagline}”</p>` : '<div style="height: 10px;"></div>'}
          <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-top: 1px solid #eeeeee; padding-top: 8px;">
            <tr><td>
            ${data.phone ? `<p style="margin: 4px 0;"><img src="${iconUrls.phone}" alt="Phone" width="14" height="14" style="vertical-align: middle; margin-right: 6px; border:0;" /> <a href="tel:${data.phone}" style="color: ${colors.text}; text-decoration: none;">${data.phone}</a></p>` : ''}
            ${data.email ? `<p style="margin: 4px 0;"><img src="${iconUrls.email}" alt="Email" width="14" height="14" style="vertical-align: middle; margin-right: 6px; border:0;" /> <a href="mailto:${data.email}" style="color: ${colors.text}; text-decoration: none;">${data.email}</a></p>` : ''}
            ${data.website ? `<p style="margin: 4px 0;"><img src="${iconUrls.website}" alt="Website" width="14" height="14" style="vertical-align: middle; margin-right: 6px; border:0;" /> <a href="${data.website}" target="_blank" style="color: ${colors.text}; text-decoration: none;">${data.website.replace(/https?:\/\//, '')}</a></p>` : ''}
            </td></tr>
          </table>
          ${generateCalendarButton(data, colors)}
          <div style="margin-top: 12px;">${generateSocialIcons(data)}</div>
        </td>
      </tr>
    </table>
  `,
  [TemplateId.Minimalist]: ({ data, colors, imageData }) => `
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: ${colors.text}; line-height: 1.5; table-layout: fixed;">
      <tr>
        <td style="border-left: 2px solid ${colors.primary}; padding-left: 15px;">
          <p style="margin: 0; font-weight: bold; color: ${colors.primary}; font-size: 16px;">${data.fullName}</p>
          <p style="margin: 2px 0; color: ${colors.secondary};">${data.jobTitle}</p>
          <p style="margin: 2px 0 8px 0; color: ${colors.secondary}; font-weight: bold;">${data.company}</p>
          ${data.email ? `<p style="margin: 4px 0;"><img src="${iconUrls.email}" alt="Email" width="14" height="14" style="vertical-align: middle; margin-right: 6px; border:0;" /> <a href="mailto:${data.email}" style="color: ${colors.text}; text-decoration: none;">${data.email}</a></p>` : ''}
          ${data.phone ? `<p style="margin: 4px 0;"><img src="${iconUrls.phone}" alt="Phone" width="14" height="14" style="vertical-align: middle; margin-right: 6px; border:0;" /> <a href="tel:${data.phone}" style="color: ${colors.text}; text-decoration: none;">${data.phone}</a></p>` : ''}
          ${data.website ? `<p style="margin: 4px 0;"><img src="${iconUrls.website}" alt="Website" width="14" height="14" style="vertical-align: middle; margin-right: 6px; border:0;" /> <a href="${data.website}" target="_blank" style="color: ${colors.primary}; text-decoration: none;">${data.website}</a></p>` : ''}
          ${data.calendarUrl ? `<p style="margin: 6px 0 0 0;"><a href="${data.calendarUrl}" target="_blank" style="color: ${colors.primary}; text-decoration: none; font-weight: bold;">→ ${data.calendarText || 'Schedule a meeting'}</a></p>` : ''}
        </td>
      </tr>
    </table>
  `,
  [TemplateId.Classic]: ({ data, colors, imageData }) => `
    <table cellpadding="0" cellspacing="0" style="font-family: 'Times New Roman', Times, serif; font-size: 14px; color: ${colors.text};">
      <tr>
        ${imageData ? `<td style="padding-right: 15px;"><img src="${imageData}" alt="${data.fullName}" style="width: 70px; height: 70px; object-fit: cover;"></td>` : ''}
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
  `,
  [TemplateId.Vertical]: ({ data, colors, imageData }) => `
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="font-family: Calibri, sans-serif; font-size: 14px; color: ${colors.text}; table-layout: fixed;">
      <tr>
        <td valign="top" width="140" style="background-color: ${colors.primary}; padding: 20px; border-radius: 8px 0 0 8px; text-align: center;">
          ${imageData ? `<img src="${imageData}" alt="${data.fullName}" width="80" height="80" style="display:block; border-radius: 50%; margin-bottom: 10px;">` : ''}
          <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: white;">${data.fullName}</h3>
          <p style="margin: 2px 0; color: white; font-size: 12px;">${data.jobTitle}</p>
        </td>
        <td valign="top" style="background-color: ${colors.background}; padding: 20px; border-radius: 0 8px 8px 0;">
          <p style="margin: 0 0 5px 0; font-weight: bold; color: ${colors.primary};">${data.company}</p>
          ${data.email ? `<p style="margin: 4px 0;"><img src="${iconUrls.email}" alt="Email" width="14" height="14" style="vertical-align: middle; margin-right: 6px; border:0;" /> <a href="mailto:${data.email}" style="color: ${colors.text}; text-decoration: none;">${data.email}</a></p>` : ''}
          ${data.phone ? `<p style="margin: 4px 0;"><img src="${iconUrls.phone}" alt="Phone" width="14" height="14" style="vertical-align: middle; margin-right: 6px; border:0;" /> <a href="tel:${data.phone}" style="color: ${colors.text}; text-decoration: none;">${data.phone}</a></p>` : ''}
          ${data.address ? `<p style="margin: 4px 0;"><strong>A:</strong> ${data.address}</p>` : ''}
          ${data.calendarUrl ? `<div style="margin-top:10px;"><a href="${data.calendarUrl}" target="_blank" style="color: ${colors.primary}; text-decoration: none; font-weight: bold;">${data.calendarText || 'Schedule a meeting'}</a></div>` : ''}
          <div style="margin-top: 10px;">${generateSocialIcons(data)}</div>
        </td>
      </tr>
    </table>
  `,
  [TemplateId.Compact]: ({ data, colors, imageData }) => `
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="font-family: Arial, sans-serif; font-size: 12px; color: ${colors.text}; table-layout: fixed;">
      <tr>
        <td style="font-weight: bold; color: ${colors.primary};">${data.fullName}</td>
        <td style="padding: 0 5px; color: #cccccc;">|</td>
        <td>${data.jobTitle}</td>
      </tr>
      <tr>
        <td colspan="3" style="font-size: 11px; color: ${colors.secondary};">
          ${data.email ? `<span><img src="${iconUrls.email}" alt="Email" width="12" height="12" style="vertical-align: middle; margin-right: 4px; border:0;" /><a href="mailto:${data.email}" style="color: ${colors.secondary}; text-decoration: none;">${data.email}</a></span>` : ''}
          ${data.phone ? ` <span style="margin-left:8px;"><img src="${iconUrls.phone}" alt="Phone" width="12" height="12" style="vertical-align: middle; margin-right: 4px; border:0;" />${data.phone}</span>` : ''}
          ${data.website ? ` <span style="margin-left:8px;"><img src="${iconUrls.website}" alt="Website" width="12" height="12" style="vertical-align: middle; margin-right: 4px; border:0;" /><a href="${data.website}" target="_blank" style="color: ${colors.primary}; text-decoration: none;">Website</a></span>` : ''}
        </td>
      </tr>
      ${data.calendarUrl ? `<tr><td colspan="3" style="padding-top: 5px;"><a href="${data.calendarUrl}" target="_blank" style="color: ${colors.primary}; text-decoration: none; font-weight: bold;">${data.calendarText || 'Schedule a meeting'}</a></td></tr>` : ''}
    </table>
  `,
  [TemplateId.SocialFocus]: ({ data, colors, imageData }) => `
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="font-family: 'Verdana', sans-serif; color: ${colors.text}; font-size: 14px; width: 450px; table-layout: fixed;">
      <tr>
        ${imageData ? `<td valign="top" width="80" style="padding-right: 15px;"><img src="${imageData}" alt="${data.fullName}" width="60" height="60" style="display:block; border-radius: 8px;"></td>` : ''}
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
                ${data.email ? `<p style="margin: 0 0 5px 0;"><img src="${iconUrls.email}" alt="Email" width="14" height="14" style="vertical-align: middle; margin-right: 6px; border:0;" /><a href="mailto:${data.email}" style="color: ${colors.text}; text-decoration: none;">${data.email}</a></p>` : ''}
                ${data.phone ? `<p style="margin: 0;"><img src="${iconUrls.phone}" alt="Phone" width="14" height="14" style="vertical-align: middle; margin-right: 6px; border:0;" /><a href="tel:${data.phone}" style="color: ${colors.text}; text-decoration: none;">${data.phone}</a></p>` : ''}
                ${data.calendarUrl ? `<p style="margin: 8px 0 0 0;"><a href="${data.calendarUrl}" target="_blank" style="color: ${colors.primary}; text-decoration: none; font-weight: bold;">${data.calendarText || 'Schedule a meeting'}</a></p>` : ''}
              </td>
              <td style="vertical-align: top; text-align: right;">
                ${generateSocialIcons(data)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `,
};

export const generateSignatureHtml = (templateId: TemplateId, params: GeneratorParams): string => {
  const generator = generators[templateId];
  if (!generator) {
    return `<p>Error: Template not found.</p>`;
  }
  return generator(params);
};
