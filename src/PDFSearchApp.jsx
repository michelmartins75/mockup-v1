import React, { useState, useEffect } from "react";

export default function PDFSearchApp() {
  const [language, setLanguage] = useState("en");
  const [vehicle, setVehicle] = useState("");
  const [selectedPart, setSelectedPart] = useState(null);
  const [search, setSearch] = useState("");
  const [partsByVehicle, setPartsByVehicle] = useState({});
  const [mainImage, setMainImage] = useState("");
  const [secondaryImage, setSecondaryImage] = useState("");

  useEffect(() => {
    fetch("/data/parts.json")
      .then(res => res.json())
      .then(data => {
        const grouped = {};
        data.forEach(part => {
          const key = part.group || `${part.description_2} - ${part.model}`;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(part);
        });
        setPartsByVehicle(grouped);
      })
      .catch(err => console.error("Erro ao carregar parts.json:", err));
  }, []);

  useEffect(() => {
    if (vehicle) {
      const parts = partsByVehicle[vehicle];
      if (parts && parts.length > 0) {
        setSelectedPart(parts[0]);
      }
    }
  }, [vehicle, partsByVehicle]);

  useEffect(() => {
    if (selectedPart) {
      setMainImage(selectedPart.main_image);
      setSecondaryImage(selectedPart.secondary_image);
    }
  }, [selectedPart]);

  const labels = {
    en: {
      language: "Language",
      vehicle: "Vehicle",
      part: "Part Number",
      techArea: "Technical Area",
      slogan: "Combining the right people, processes and technologies",
      select: "Select",
      search: "Search part by name or code",
      description: "Description",
      desc1: "Description 1",
      desc2: "Description 2",
      sku: "SKU",
      pdfPreview: "PDF Preview",
      viewPDF: "View Technical Sheet"
    },
    de: {
      language: "Sprache",
      vehicle: "Fahrzeug",
      part: "Teilenummer",
      techArea: "Technischer Bereich",
      slogan: "Die richtigen Personen, Prozesse und Technologien vereint",
      select: "Auswählen",
      search: "Teil nach Name oder Nummer suchen",
      description: "Beschreibung",
      desc1: "Beschreibung 1",
      desc2: "Beschreibung 2",
      sku: "Artikelnummer",
      pdfPreview: "PDF Vorschau",
      viewPDF: "Technisches Datenblatt anzeigen"
    },
    pt: {
      language: "Idioma",
      vehicle: "Veículo",
      part: "Número da Peça",
      techArea: "Área Técnica",
      slogan: "Combinando as pessoas, processos e tecnologias certas",
      select: "Selecionar",
      search: "Buscar peça por nome ou código",
      description: "Descrição",
      desc1: "Descrição 1",
      desc2: "Descrição 2",
      sku: "SKU",
      pdfPreview: "Visualização do PDF",
      viewPDF: "Ver Ficha Técnica"
    }
  };

  const t = labels[language];
  const vehicles = partsByVehicle ? Object.keys(partsByVehicle) : [];
  const currentParts = vehicle ? partsByVehicle[vehicle] || [] : [];
  const allParts = vehicles.flatMap(v => partsByVehicle[v].map(p => ({ ...p, vehicle: v })));

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    const match = allParts.find(p =>
      p.description_en.toLowerCase().includes(value.toLowerCase()) ||
      p.sku.toLowerCase().includes(value.toLowerCase())
    );
    if (match) {
      setVehicle(match.vehicle);
      setSelectedPart(match);
    }
  };

  const swapImages = () => {
    setMainImage((prev) => {
      const currentMain = prev;
      setSecondaryImage(currentMain);
      return secondaryImage;
    });
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-[#002b5c] text-white p-4 space-y-4 overflow-y-auto">
        <img src="/logo-trigo.png" alt="TRIGO Logo" className="w-72 mb-6" />

        <label>{t.language}:
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="text-black w-full">
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="pt">Português</option>
          </select>
        </label>

        <label>{t.search}:
          <input type="text" value={search} onChange={handleSearch} placeholder={t.search} className="text-black w-full" />
        </label>

        <label>{t.vehicle}:
          <select value={vehicle} onChange={(e) => {
            setVehicle(e.target.value);
            setSelectedPart(null);
          }} className="text-black w-full">
            <option value="">{t.select}</option>
            {vehicles.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>

        {vehicle && (
          <label>{t.part}:
            <select
              value={selectedPart?.sku || ""}
              onChange={(e) => {
                const part = currentParts.find(p => p.sku === e.target.value);
                setSelectedPart(part);
              }}
              className="text-black w-full"
            >
              <option value="">{t.select}</option>
              {currentParts.map(p => (
                <option key={p.sku} value={p.sku}>{`${p.description_en} (${p.sku})`}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="flex-1 bg-gray-100 overflow-y-auto">
        <div className="flex justify-between items-center bg-[#002b5c] text-white px-4 py-2">
          <div className="text-center w-full font-semibold">{t.slogan}</div>
        </div>

        <div className="p-4">
          <div className="text-xl font-bold mb-4">{t.techArea}</div>

          {selectedPart && (
            <>
              <div className="flex gap-4 mb-4 text-center">
                <div className="border border-gray-400 p-2 rounded bg-white flex-1 shadow">
                  <div className="text-sm text-blue-700 font-semibold mb-1">{t.sku}</div>{selectedPart.sku}
                </div>
                <div className="border border-gray-400 p-2 rounded bg-white flex-1 shadow">
                  <div className="text-sm text-blue-700 font-semibold mb-1">{t.desc1}</div>{selectedPart.description_en}
                </div>
                <div className="border border-gray-400 p-2 rounded bg-white flex-1 shadow">
                  <div className="text-sm text-blue-700 font-semibold mb-1">{t.desc2}</div>{selectedPart.description_2}
                </div>
              </div>

              <div className="relative w-full max-w-3xl mx-auto mb-6">
                <img
                  src={mainImage}
                  className="w-full max-w-3xl h-auto rounded shadow-md transition-transform duration-300 transform scale-100 hover:scale-105"
                  alt="Main part"
                />
                <img
                  src={secondaryImage}
                  onClick={swapImages}
                  className="absolute bottom-4 right-4 w-24 h-24 object-cover border-2 border-white rounded shadow cursor-pointer transition-transform duration-300 hover:scale-110"
                  alt="Secondary"
                />
              </div>

              {selectedPart.pdf && (
                <div className="text-center">
                  <a
                    href={selectedPart.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-700 text-white px-4 py-2 rounded shadow hover:bg-blue-800"
                  >
                    {t.viewPDF}
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
