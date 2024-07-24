import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, title }) => {
  return (
    <>
      <h1 className="mb-4">{title}</h1>
      {children}
    </>
  );
};

export default PageLayout;
