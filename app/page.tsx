'use client'

import { useEffect, useState } from "react";

type mainData = {

}

export default function Home() {
  return (
    <div className="">
      <main className="">
        {/* Artikler */}
        <div>
          <h1>Lorem Ipsum Article 1</h1>
          <p><span className="text-amber-600">Nyheder</span> | 29 dage siden</p>
          <div>
            <img src="" alt="" />
            <div>
              {/* article 2 */}
              <div>
                <h2>Lorem Ipsum Article 2</h2>
                <p>Lorem ipsum, dolor sit amet consectetur adipisicing.</p>
                <strong><span className="text-amber-600">nyheder</span> | 25 dage siden</strong>
              </div>
              {/* article 3 */}
              <div>
                <h2>Lorem Ipsum Article 2</h2>
                <p>Lorem ipsum, dolor sit amet consectetur adipisicing.</p>
                <strong><span className="text-amber-600">nyheder</span> | 25 dage siden</strong>
              </div>
              </div>
            <img src="" alt="" />
            <img src="" alt="" />
            </div>
        </div>

        {/* Seneste */}

        {/* Video */}

        {/* Podcast */}
      </main>
    </div>
  );
}
