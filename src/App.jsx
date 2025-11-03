import React, { useEffect, useRef, useState } from "react";

export default function BirthdaySite() {
  const [page, setPage] = useState(0);
  const messages = Array.from({ length: 29 }, (_, i) =>
    `Dummy message ${i + 1} — Stuti is wonderful, kind, and full of surprises! 🎉`
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {page === 0 ? (
          <CoverPage onNext={() => setPage(1)} />
        ) : (
          <CardsPage messages={messages} onBack={() => setPage(0)} />
        )}
      </div>
    </div>
  );
}

function CoverPage({ onNext }) {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-12 shadow-lg text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold text-pink-600">Happy 29th Birthday, Stuti! 🥳</h1>
      <p className="mt-4 text-gray-600">A little surprise full of tiny scratch-cards — click the arrow below to begin.</p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-pink-600 text-white font-semibold shadow hover:scale-[1.02] transition-transform"
        >
          Next
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function CardsPage({ messages, onBack }) {
  const [revealedCount, setRevealedCount] = useState(0);
  const lastRowCols = (messages.length % 4) || 4;

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <button onClick={onBack} className="text-sm text-gray-600 hover:underline">⟵ Back</button>
          <h2 className="text-2xl font-bold text-pink-600">29 Little Surprises</h2>
          <p className="text-sm text-gray-500">Scratch a card to reveal a message about Stuti.</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Revealed</div>
          <div className="text-lg font-semibold text-pink-600">{revealedCount} / {messages.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 place-items-center">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={
              idx === messages.length - 1 && lastRowCols !== 0
                ? "col-span-full flex justify-center"
                : ""
            }
          >
            <ScratchCard message={msg} index={idx} onReveal={() => setRevealedCount((c) => c + 1)} />
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-gray-400">Tip: on mobile, use your finger to scratch. On desktop, click and drag.</p>
    </div>
  );
}

function ScratchCard({ message, index, onReveal }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const isPointerDown = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#9ca3af";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      const fontSize = Math.floor(18 * dpr);
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("Scratch here", canvas.width / 2, canvas.height / 2 + fontSize / 2);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      let x, y;
      if (e.touches && e.touches.length) {
        x = (e.touches[0].clientX - rect.left) * dpr;
        y = (e.touches[0].clientY - rect.top) * dpr;
      } else {
        x = (e.clientX - rect.left) * dpr;
        y = (e.clientY - rect.top) * dpr;
      }
      return { x, y };
    };

    const pointerDown = (e) => {
      isPointerDown.current = true;
      draw(e);
    };
    const pointerUp = () => {
      isPointerDown.current = false;
      try {
        const px = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let transparent = 0;
        for (let i = 3; i < px.length; i += 4) {
          if (px[i] === 0) transparent++;
        }
        const pct = (transparent / (canvas.width * canvas.height)) * 100;
        if (pct > 45) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          setRevealed(true);
          onReveal && onReveal();
        }
      } catch (err) {}
    };

    const draw = (e) => {
      if (!isPointerDown.current && e.type !== "pointerdown" && e.type !== "touchstart") return;
      const pos = getPos(e);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 25 * (window.devicePixelRatio || 1), 0, Math.PI * 2, false);
      ctx.fill();
      ctx.closePath();
    };

    canvas.addEventListener("pointerdown", pointerDown);
    window.addEventListener("pointerup", pointerUp);
    canvas.addEventListener("pointermove", draw);

    canvas.addEventListener("touchstart", pointerDown, { passive: true });
    window.addEventListener("touchend", pointerUp);
    canvas.addEventListener("touchmove", draw, { passive: true });

    return () => {
      canvas.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("pointermove", draw);
      canvas.removeEventListener("touchstart", pointerDown);
      window.removeEventListener("touchend", pointerUp);
      canvas.removeEventListener("touchmove", draw);
    };
  }, [revealed, onReveal]);

  return (
    <div
      ref={containerRef}
      className="relative rounded-lg overflow-hidden border shadow-sm bg-gradient-to-br from-white to-pink-50"
      style={{ minHeight: 120 }}
    >
      <div className="p-4 h-full flex flex-col justify-center items-center text-center">
        <div className="text-sm text-gray-600">Card #{index + 1}</div>
        <div className="mt-2 text-base font-medium text-pink-700">{message}</div>
      </div>
      {!revealed && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full touch-none" aria-label={`Scratch card ${index + 1}`} />
      )}
      {revealed && (
        <div className="absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 00-1.414-1.414L7 12.172 4.707 9.879a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l9-9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
