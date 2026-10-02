"use client"

import { useEffect, useState } from "react"

const Contact = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")

  // Lukker modalen med Escape.
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen])

  // Feltets name bestemmer, hvilken værdi der bliver opdateret.
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const openModal = () => {
    setStatus("idle")
    setIsOpen(true)
  }

  const closeModal = () => setIsOpen(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus("sending")

    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "")
      const response = await fetch(`${apiUrl}/contact/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Kontaktformularen kunne ikke sendes")

      setStatus("success")
      setFormData({ name: "", email: "", subject: "", message: "" })
    } catch {
      setStatus("error")
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={openModal}
        className="bg-[#f2a900] p-3 mt-2 font-extrabold text-white hover:bg-white hover:text-black"
      >
        Kontakt os
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-100 grid place-items-center bg-black/60 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal()
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white p-6 text-black shadow-xl"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <h2 id="contact-title" className="text-2xl font-bold">Kontakt os</h2>
              <button type="button" onClick={closeModal} aria-label="Luk kontaktformular" className="text-2xl leading-none">
                ×
              </button>
            </div>

            {status === "success" ? (
              <div>
                <p className="mb-4">Tak for din besked. Vi vender tilbage hurtigst muligt.</p>
                <button type="button" onClick={closeModal} className="bg-black px-4 py-2 text-white">
                  Luk
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
                <label className="block">
                  Navn
                  <input name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full border p-2" />
                </label>
                <label className="block">
                  E-mail
                  <input name="email" type="email" value={formData.email} onChange={handleChange} required className="mt-1 w-full border p-2" />
                </label>
                <label className="block">
                  Emne
                  <input name="subject" value={formData.subject} onChange={handleChange} required className="mt-1 w-full border p-2" />
                </label>
                <label className="block">
                  Besked
                  <textarea name="message" value={formData.message} onChange={handleChange} required rows={5} className="mt-1 w-full border p-2" />
                </label>
                {status === "error" && <p className="text-red-700">Beskeden kunne ikke sendes. Prøv igen.</p>}
                <button type="submit" disabled={status === "sending"} className="bg-black px-4 py-2 text-white disabled:opacity-50">
                  {status === "sending" ? "Sender..." : "Send besked"}
                </button>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default Contact
