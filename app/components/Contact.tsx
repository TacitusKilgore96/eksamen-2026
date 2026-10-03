"use client"

import { useEffect, useState } from "react"

const Contact = () => {
  // Tilstand til at styre om modalen/kontaktformularen er åben eller lukket.
  const [isOpen, setIsOpen] = useState(false)

  // Tilstand til at holde styr på indtastningerne i formularens felter.
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  // Tilstand til at håndtere processens status: inaktiv, i gang med at sende, succes eller fejl.
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle") /* idle = neutralt kontrolpunkt */

  // Lukker modalen, når man trykker på [esc]-tasten på tastaturet.
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
    }

    document.addEventListener("keydown", handleEscape)
    // Rydder op i event-listeneren, når modalen lukkes eller komponenten unmountes.
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen])

  // Opdaterer det specifikke felt i formularen dynamisk baseret på input-elementets 'name'-attribut.
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  // Åbner modalen og nulstiller eventuelle tidligere fejl- eller succes-statusser.
  const openModal = () => {
    setStatus("idle")
    setIsOpen(true)
  }

  // Lukker modalen ned.
  const closeModal = () => setIsOpen(false)

  // Håndterer indsendelsen af formularen til backend-API'en.
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault() // Forhindrer standard HTML-formularindlæsning (side-refresh).
    setStatus("sending") // Sætter status til at vise, at beskeden er undervejs.

    try {
      // Henter API-URL fra miljøvariabler eller falder tilbage på localhost i udviklingsmiljøet.
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "")
      
      const response = await fetch(`${apiUrl}/contact/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Kontaktformularen kunne ikke sendes")

      // Hvis alt gik vel, markeres det som succes, og inputfelterne tømmes.
      setStatus("success")
      setFormData({ name: "", email: "", subject: "", message: "" })
    } catch {
      // Hvis der opstår en fejl undervejs, sættes status til "error".
      setStatus("error")
    }
  }

  return (
    <div>
      {/* Knap der åbner kontaktmodalen */}
      <button
        type="button"
        onClick={openModal}
        className="bg-[#f2a900] p-3 mt-2 font-extrabold text-white hover:bg-white hover:text-black"
      >
        Kontakt os
      </button>

      {/* Modal-overlay der kun vises, når isOpen er sand */}
      {isOpen && (
        <div
          className="fixed inset-0 z-100 grid place-items-center bg-black/60 p-4"
          role="presentation"
          // Lukker modalen, hvis brugeren klikker uden for selve dialogboksen (på baggrunden).
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
            {/* Modal-header med titel og lukke-knap */}
            <div className="mb-5 flex items-start justify-between gap-4">
              <h2 id="contact-title" className="text-2xl font-bold">Kontakt os</h2>
              <button type="button" onClick={closeModal} aria-label="Luk kontaktformular" className="text-2xl leading-none">
                ×
              </button>
            </div>

            {/* Betinget visning. Vis succes-besked eller selve formularen */}
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
                
                {/* Fejlmeddelelse, hvis API-kaldet fejler */}
                {status === "error" && <p className="text-red-700">Beskeden kunne ikke sendes. Prøv igen.</p>}
                
                {/* Indsendelsesknap (deaktiveres mens der sendes) */}
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