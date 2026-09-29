"use client" // Tilføj denne linje, hvis du bruger Next.js (App Router)

import React, { useState } from 'react'

const Header = () => {
  return (
    <div className='bg-black w-full h-[80px] font-bold text-white'>
        <nav className='flex justify-between p-5 [&_a]:hover:bg-white [&_a]:hover:text-black [&_a]:p-2 [&_a]:transition-all [&_a]:duration-250 [&_a]:ease-in-out [&_a]:hover:rounded-tl-2xl'>
            <a href="#" className='text-5xl'>...news</a>
            <div className='flex gap-5 text-xl'>
                <a href="/">Nyheder</a>
                <a href="/sport">Sport</a>
                <a href="/vejret">Vejret</a>
                <a href="/podcast">Podcast</a>
            </div>
            <input type="text" placeholder='Søg på news' className='bg-white text-black p-2 rounded-xl text-sm h-[70%]' />
        </nav>
    </div>
  )
}

export default Header
