import React from 'react'
import { Navbar } from './Navbar'
import { variantType, Wrapper } from './Wrapper'

interface LayoutProps {
  variant?: variantType
}

export const Layout: React.FC<LayoutProps> = ({ children, variant = 'regular' }) => {
  return (
    <>
      <Navbar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </>
  )
}
