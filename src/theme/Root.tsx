import React from 'react';
import IconifyInline from '../components/IconifyInline';

export default function Root({children}) {
  return (
    <>
      <IconifyInline />
      {children}
    </>
  );
}