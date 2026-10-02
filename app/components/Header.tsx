"use client"

import { useState } from 'react'
import { usePathname } from 'next/navigation'

const Header = () => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const getLinkClasses = (path: string) => {
    const isActive = pathname === path
    return `px-4 h-[50px] flex items-center transition-all duration-250 ease-in-out hover:bg-white hover:text-black hover:rounded-tl-2xl ${
      isActive ? 'bg-white text-black rounded-tl-2xl' : ''
    }`
  }

  const getMobileLinkClasses = (path: string) => {
    const isActive = pathname === path
    return `px-4 py-3 flex items-center  ${
      isActive ? 'bg-black text-white' : 'text-black hover:bg-gray-100'
    }`
  }

  return (
    <header className='sticky top-0 lg:static bg-black w-full font-bold text-white z-50'>
      <nav className='flex justify-between items-center h-[80px] px-5'>
        
        {/* Logo */}
        <a href="/" className='text-4xl lg:text-5xl pb-1'>...news</a>
        
        {/* Desktop Navigation */}
        <div className='hidden lg:flex h-full text-xl items-end'>
          <a href="/nyheder" className={getLinkClasses('/nyheder')}>Nyheder</a>
          <a href="/sport" className={getLinkClasses('/sport')}>Sport</a>
          <a href="/vejret" className={getLinkClasses('/vejret')}>Vejret</a>
          <a href="/podcast" className={getLinkClasses('/podcast')}>Podcast</a>
        </div>

        {/* Desktop Søgefelt */}
        <div className='hidden lg:flex items-center h-full pb-2'>
          <input 
            type="text" 
            placeholder='Søg på news' 
            className='bg-white text-black p-2 rounded-xl text-sm h-[40px]' 
          />
        </div>

        {/* Burger Knap (med animation af stregerne til et X) */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className='lg:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5 focus:outline-none'
          aria-label="Toggle Menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-white transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </nav>

    
      <div 
        className={`lg:hidden bg-white border-t border-gray-800 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[400px] opacity-100 py-6 px-5 shadow-xl' : 'max-h-0 opacity-0 py-0 px-5'
        }`}
      >
        <div className='space-y-4'>
          {/* Søgefelt til mobil */}
          <div className='relative w-full'>
            <div className='absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none'>
              <img 
                src="/magnifying-glass-solid.svg" 
                alt="søg" 
                className='opacity-50 h-auto w-9'
              />
            </div>

            <input 
              type="text" 
              placeholder='Søg på news'
              className='w-full text-gray-600 pl-6 pr-12 py-4 rounded-4xl border-gray-600 border text-xl focus:outline-none'
            />
          </div>
          
          {/* Links til mobil */}
          <div className='flex flex-col space-y-2 text-xl text-black'>
            <a href="/nyheder" onClick={() => setIsOpen(false)} className={getMobileLinkClasses('/nyheder')}>Nyheder</a>
            <a href="/sport" onClick={() => setIsOpen(false)} className={getMobileLinkClasses('/sport')}>Sport</a>
            <a href="/vejret" onClick={() => setIsOpen(false)} className={getMobileLinkClasses('/vejret')}>Vejret</a>
            <a href="/podcast" onClick={() => setIsOpen(false)} className={getMobileLinkClasses('/podcast')}>Podcast</a>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header