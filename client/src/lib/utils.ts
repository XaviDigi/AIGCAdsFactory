import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertGoogleDriveUrl(url: string): string {
  // Check if it's a Google Drive share URL
  const driveMatch = url.match(/https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  
  if (driveMatch) {
    const fileId = driveMatch[1];
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  
  // Return original URL if not a Google Drive share link
  return url;
}

export function validateDialogue(dialogue: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (dialogue.length > 200) {
    errors.push('Dialogue must be 200 characters or less');
  }
  
  if (dialogue.includes('-') || dialogue.includes('—')) {
    errors.push('Dialogue cannot contain hyphens or em dashes');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function downloadFile(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
