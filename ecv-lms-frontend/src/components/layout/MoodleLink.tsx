'use client';

import type { ReactNode } from 'react';

interface MoodleLinkProps {
  targetUrl: string;
  issuerId?: number;
  children: ReactNode;
  className?: string;
}

const MOODLE_URL = process.env.NEXT_PUBLIC_MOODLE_URL ?? '';

/**
 * Constructs a Moodle OAuth2 SSO login URL and renders an anchor tag.
 * URL format: {MOODLE_URL}/auth/oauth2/login.php?id={issuerId}&wantsurl={encodedTargetUrl}
 */
export function MoodleLink({
  targetUrl,
  issuerId = 1,
  children,
  className,
}: MoodleLinkProps) {
  const wantsurl = encodeURIComponent(targetUrl);
  const href = `${MOODLE_URL}/auth/oauth2/login.php?id=${issuerId}&wantsurl=${wantsurl}`;

  return (
    <a
      href={href}
      className={className}
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}
