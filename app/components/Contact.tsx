"use client"

import { useState } from "react"



const Contact = () => {
  /* Gemmer alle formularfelter samlet i ét objekt. */
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  return (
    <div>
      Konkakt formular her
    </div>
  )
}

export default Contact
