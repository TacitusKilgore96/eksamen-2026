"use client"

import { useCallback, useState } from 'react'

// Mulighederne, som komponenterne kan sende med til et API-kald.
type RequestOptions = {
    // Data, der sendes med ved POST, PUT eller PATCH.
    body?: unknown;
    // Ekstra headers, som for eksempel Content-Type.
    headers?: Record<string, string>;
    // Parametre, der bliver til query strings i URL'en.
    params?: Record<string, string | number | undefined>;
    // Valgfri API-nøgle, der sendes som Bearer-token.
    apiKey?: string;
};

export default function useRequestData() {
    // Viser om et API-kald stadig er i gang.
    const [isLoading, setIsLoading] = useState(false);
    // Gemmer det seneste svar, så komponenten kan bruge data fra API'et.
    const [data, setData] = useState<unknown>(null);
    // Bliver true, hvis API-kaldet fejler.
    const [error, setError] = useState(false);

    // Genbrugelig funktion til alle HTTP-kald fra frontend til backend.
    const makeRequest = useCallback(async <T = unknown>(
        url: string,
        method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
        options: RequestOptions = {}
    ): Promise<T | null> => {
        // Hent de valgfrie indstillinger og brug tomme standardværdier.
        const { body = null, headers = {}, params = {}, apiKey } = options;
        // En relativ URL kombineres med API-basens URL fra miljøvariablen.
        const requestUrl = new URL(url, process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001");

        // Tilføj kun query-parametre, der har en værdi.
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                requestUrl.searchParams.set(key, String(value));
            }
        });

        // Sæt loading til true og nulstil en eventuel tidligere fejl.
        setIsLoading(true);
        setError(false);

        try {
            // Send requesten til backend med den valgte metode, headers og body.
            const response = await fetch(requestUrl, {
                method,
                headers: {
                    // Bevar headers, som den kaldende komponent selv har sendt.
                    ...headers,
                    // Send API-nøglen som Bearer-token, hvis der findes en nøgle.
                    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
                    // Objekter bliver sendt som JSON, mens FormData og tekst sendes direkte.
                    ...(body && !(body instanceof FormData) && typeof body !== "string"
                        ? { "Content-Type": "application/json" }
                        : {}),
                },
                // GET-kald uden body får undefined; andre data konverteres til det rigtige format.
                body: body === null ? undefined : body instanceof FormData || typeof body === "string"
                    ? body
                    : JSON.stringify(body),
            });

            // HTTP-statusser uden for 200-299 behandles som fejl.
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            // DELETE-routes kan svare med 200 eller 204 uden en body.
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : null;
            // Gem svaret i state, så komponenter kan læse det via hookens data-værdi.
            setData(responseData);
            // Den generiske type gør det muligt for den kaldende komponent at type-sætte svaret.
            return responseData as T | null;
        } catch {
            // Ved fejl nulstilles data, og komponenten får et tydeligt fejlflag.
            setError(true);
            setData(null);
            return null;
        } finally {
            // Loading slås fra både efter succes og efter fejl.
            setIsLoading(false);
        }
    }, []);

    // Gør request-funktionen og dens statusværdier tilgængelige for komponenterne.
    return { makeRequest, data, isLoading, error };
}
