import React from 'react';

interface Props {
  title: string;
  content: string;
}

const ProfileStatic: React.FC<Props> = ({ title, content }) => {
  return (
    <div className="profile-payments-pane">
      <h3 className="pane-title">{title}</h3>
      <div className="divider" style={{ margin: '20px 0' }} />
      <div style={{ fontSize: '14px', color: '#535766', lineHeight: '1.6' }}>
        {content}
      </div>
    </div>
  );
};

export default ProfileStatic;
