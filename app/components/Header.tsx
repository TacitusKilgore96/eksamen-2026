"use client"

import React from 'react'
import { usePathname } from 'next/navigation'

const Header = () => {
  const pathname = usePathname()

  const getLinkClasses = (path: string) => {
    const isActive = pathname === path
    
    
    return `px-4 h-[50px] flex items-center transition-all duration-250 ease-in-out hover:bg-white hover:text-black hover:rounded-tl-2xl ${
      isActive ? 'bg-white text-black rounded-tl-2xl' : ''
    }`
  }

  return (
    <div className='bg-black w-full h-[80px] font-bold text-white'>
        <nav className='flex justify-between items-end h-full px-5 pb-0'>
            <a href="/" className='text-5xl pb-2'>...news</a>
            
            
            <div className='flex h-full text-xl items-end'>
                <a href="/nyheder" className={getLinkClasses('/nyheder')}>Nyheder</a>
                <a href="/sport" className={getLinkClasses('/sport')}>Sport</a>
                <a href="/vejret" className={getLinkClasses('/vejret')}>Vejret</a>
                <a href="/podcast" className={getLinkClasses('/podcast')}>Podcast</a>
            </div>

            <input type="text" placeholder='Søg på news' className='bg-white text-black p-2 rounded-xl text-sm h-[60%] mb-2' />
        </nav>
    </div>
  )
}

export default Header