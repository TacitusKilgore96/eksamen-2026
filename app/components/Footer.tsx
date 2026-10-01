"use client"

import useRequestData from "../hooks/useRequestData"
import Contact from "./Contact"

const Footer = () => {
  return (
    <div className="[&_p]:text-lg [&_h1]:text-2xl [&_h1]:font-extrabold bg-black text-white">
      <footer className="flex justify-evenly [&_p]:w-50 border-b-1 p-10">
        <div>
            <h1>Nyheder</h1>
            <p>Lorem ipsum dolor sit amet consectetur.</p>
        </div>
        <div>
            <h1>lorum</h1>
            <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ea hic rerum totam at.</p>
        </div>
        <div>
            <h1>lorum</h1>
            <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Pariatur quae adipisci illo porro iure.</p>
        </div>
        <div>
            <h1>Om news</h1>
            <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Culpa.</p>
        </div>
      </footer>
      <div className="grid justify-center">
        <p className="p-5">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sit, odit?</p>
      </div>
    </div>
  )
}

export default Footer
