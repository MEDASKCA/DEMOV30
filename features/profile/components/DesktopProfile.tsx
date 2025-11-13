'use client';

import React from 'react';
import MobileProfile from './MobileProfile';

interface DesktopProfileProps {
  staffProfile?: any;
  isEditable?: boolean;
  onSave?: (profile: any) => void;
}

export default function DesktopProfile({
  staffProfile,
  isEditable = false,
  onSave,
}: DesktopProfileProps) {
  return (
    <MobileProfile
      staffProfile={staffProfile}
      isEditable={isEditable}
      onSave={onSave}
    />
  );
}
