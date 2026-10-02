"use client"

import Contact from "./Contact"

const Footer = () => {
  return (
    <div className="[&_p]:text-lg [&_h1]:text-2xl [&_h1]:font-extrabold bg-black text-white">
        <footer className="grid grid-cols-1 justify-items-center gap-8 border-b px-6 py-10 sm:px-10 md:grid-cols-2 md:justify-center lg:flex lg:justify-evenly">
        <div className="w-full max-w-sm md:w-auto md:max-w-none p-2">
            <h1>Nyheder</h1>
          <p className="w-full text-left md:w-50">Lorem ipsum dolor sit amet consectetur.</p>
        </div>
        <div className="w-full max-w-sm md:w-auto md:max-w-none p-2">
            <h1>lorum</h1>
          <p className="w-full text-left md:w-50">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ea hic rerum totam at.</p>
            <div>
              <Contact />
            </div>
        </div>
        <div className="w-full max-w-sm md:w-auto md:max-w-none p-2">
            <h1>lorum</h1>
          <p className="w-full text-left md:w-50">Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur quae adipisci illo porro iure.</p>
        </div>
        <div className="w-full max-w-sm md:w-auto md:max-w-none p-2">
            <h1>Om news</h1>
          <p className="w-full text-left md:w-50">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Culpa.</p>
        </div>
      </footer>
      <div className="grid justify-center">
        <small className="p-5 text-center">© Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sit, odit?</small>
      </div>
    </div>
  )
}

export default Footer
