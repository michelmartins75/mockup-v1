import React, { useState, useEffect } from "react";

export default function PDFSearchApp() {
  const [language, setLanguage] = useState("en");
  const [category, setCategory] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [selectedPart, setSelectedPart] = useState(null);
  const [search, setSearch] = useState("");
  const [parts, setParts] = useState([]);
  const [mainImage, setMainImage] = useState("");
  const [secondaryImage, setSecondaryImage] = useState("");
  const [showIntro, setShowIntro] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [selectedLangForVideo, setSelectedLangForVideo] = useState(null);
  const [videoFinished, setVideoFinished] = useState(false);
  const [infoBadge, setInfoBadge] = useState(false);

  useEffect(() => {
    fetch("/data/parts.json")
      .then((res) => res.json())
      .then((data) => setParts(data))
      .catch((err) => console.error("Erro ao carregar parts.json:", err));
  }, []);

  useEffect(() => {
    const storedLang = localStorage.getItem("preferredLanguage");
    if (storedLang) {
      setLanguage(storedLang);
      setSelectedLangForVideo(storedLang);
      setShowIntro(false);
    }
  }, []);

  useEffect(() => {
    if (selectedPart) {
      setMainImage(selectedPart.main_image);
      setSecondaryImage(selectedPart.secondary_image);
    }
  }, [selectedPart]);

  const labels = {
    en: {
      language: "Language",
      category: "Category",
      vehicle: "Vehicle",
      part: "Part Number",
      techArea: "Technical Area",
      slogan: "Combining the right people, processes and technologies",
      select: "Select",
      search: "Search part by name or code",
      description: "Description",
      sku: "Part Number", // Alterado conforme solicitado
      welcome: "Welcome!",
      chooseLang: "Select your language to start:",
      replayHint: "You can replay the video by clicking the Info icon."
    },
    de: {
      language: "Sprache",
      category: "Kategorie",
      vehicle: "Fahrzeug",
      part: "Teilenummer",
      techArea: "Technischer Bereich",
      slogan: "Die richtigen Personen, Prozesse und Technologien vereint",
      select: "Auswählen",
      search: "Teil nach Name oder Nummer suchen",
      description: "Beschreibung",
      sku: "Artikelnummer",
      welcome: "Willkommen!",
      chooseLang: "Bitte wählen Sie Ihre Sprache:",
      replayHint: "Sie können das Video über das Info-Icon erneut abspielen."
    }
  };

  const t = labels[language];

  const allCategories =
    parts.length > 0
      ? Array.from(
          parts.reduce((map, part) => {
            const key = part.category.en;
            if (!map.has(key)) {
              const fileSafe = part.category.en.toLowerCase().replace(/ /g, "_");
              map.set(key, {
                key,
                label: part.category[language],
                image: `/images/${fileSafe}.jpg`
              });
            }
            return map;
          }, new Map()).values()
        )
      : [];

  const selectedCategoryObject = allCategories.find((c) => c.key === category);
  const filteredByCategory = category ? parts.filter((p) => p.category.en === category) : [];
  const vehicles = [...new Set(filteredByCategory.map((p) => p.model))];
  const currentParts = vehicle ? filteredByCategory.filter((p) => p.model === vehicle) : [];

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    const match = parts.find(
      (p) =>
        p["description_" + language]?.toLowerCase().includes(value.toLowerCase()) ||
        p.sku?.toLowerCase().includes(value.toLowerCase())
    );
    if (match) {
      setCategory(match.category.en);
      setVehicle(match.model);
      setSelectedPart(match);
    }
  };

  const swapImages = () => {
    setMainImage((prev) => {
      const temp = secondaryImage;
      setSecondaryImage(prev);
      return temp;
    });
  };

  const getStartscreen = () => (
    <img
      src={`/images/startscreen_${language.toUpperCase()}.jpg`}
      alt="Startscreen"
      className="w-full h-full object-cover pointer-events-none"
    />
  );

  const getBackscreen = () => (
    <img
      src={`/images/backscreen_${language.toUpperCase()}.jpg`}
      alt="Backscreen"
      className="w-full h-full object-contain object-left pt-[3.2rem] pointer-events-none"
    />
  );

  const getFooter = () => `/images/footer_${language.toUpperCase()}.jpg`;
  const isBackscreen = category && !selectedPart;

  // Função para o botão Home: cancela o vídeo (se ativo) e reseta filtros
  const handleHome = () => {
    if (showVideo) {
      setShowVideo(false);
      setVideoFinished(false);
    }
    setCategory("");
    setVehicle("");
    setSelectedPart(null);
    setSearch("");
  };

  // Função para o botão Info: retorna à exibição original com a seleção de idioma 
  // (a janela de boas-vindas ficará sobreposta e interativa)
  const handleInfo = () => {
    localStorage.removeItem("preferredLanguage");
    setSelectedLangForVideo(null);
    setShowIntro(true);
    setVideoFinished(false);
    setShowVideo(false); // Esconde o vídeo para liberar a interação com a janela de boas-vindas
    setInfoBadge(false);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex flex-1">
        {/* Sidebar com controles */}
        <div className="w-64 bg-[#002b5c] text-white p-4 space-y-4 overflow-y-auto flex flex-col justify-between">
          {/* Controles de navegação (logo, inputs e selects) com bloqueio se o vídeo estiver ativo */}
          <div className={`${showVideo ? "pointer-events-none opacity-50" : ""}`}>
            <img src="/logo-trigo.png" alt="TRIGO Logo" className="w-72 mb-6" />

            <label>
              {t.language}:
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-black w-full"
              >
                <option value="en">English</option>
                <option value="de">Deutsch</option>
              </select>
            </label>

            <label>
              {t.category}:
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setVehicle("");
                  setSelectedPart(null);
                }}
                className="text-black w-full"
              >
                <option value="">{t.select}</option>
                {allCategories.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </label>

            {category && (
              <label>
                {t.vehicle}:
                <select
                  value={vehicle}
                  onChange={(e) => {
                    setVehicle(e.target.value);
                    setSelectedPart(null);
                  }}
                  className="text-black w-full"
                >
                  <option value="">{t.select}</option>
                  {vehicles.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {vehicle && (
              <label>
                {t.part}:
                <select
                  value={selectedPart?.sku || ""}
                  onChange={(e) => {
                    const part = currentParts.find((p) => p.sku === e.target.value);
                    setSelectedPart(part);
                  }}
                  className="text-black w-full"
                >
                  <option value="">{t.select}</option>
                  {currentParts.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {`${p["description_" + language]} (${p.sku})`}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label>
              {t.search}:
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder={t.search}
                className="text-black w-full"
              />
            </label>
          </div>

          {/* Botões Home e Info permanecem ativos durante a exibição do vídeo */}
          <div className="flex justify-center items-end space-x-4 pt-4 relative">
            <button onClick={handleHome} className="hover:opacity-80 transition" title="Go to Start">
              <img src="/icons/Homebutton.jpg" alt="Home" className="w-12 h-12 object-contain" />
            </button>
            <button onClick={handleInfo} className="hover:opacity-80 transition relative" title="Information">
              <img src="/icons/Informations-i.jpg" alt="Info" className="w-12 h-12 object-contain" />
              {infoBadge && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                  1
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 bg-white overflow-hidden relative">
          <div className="flex justify-between items-center bg-[#002b5c] text-white px-4 py-2">
            <div className="text-center w-full font-semibold">{t.slogan}</div>
          </div>

          <div className="relative min-h-[80vh] w-full">
            {!selectedPart && (
              <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
                {isBackscreen ? getBackscreen() : getStartscreen()}
              </div>
            )}

            <div className={`text-xl font-bold mb-2 relative z-10 px-4 pt-4 ${isBackscreen ? "text-black" : "text-white"}`}>
              {t.techArea}
            </div>

            {/* Janela de boas-vindas com seleção de idioma */}
            {showIntro && !selectedLangForVideo && (
              <div className="absolute z-60 left-1/2 top-20 transform -translate-x-1/2 w-[400px]">
                <div className="bg-white p-6 rounded shadow text-center space-y-4">
                  <h2 className="text-xl font-bold">Welcome! / Willkommen!</h2>
                  <p>
                    {labels.en.chooseLang}
                    <br />
                    {labels.de.chooseLang}
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => {
                        setSelectedLangForVideo("en");
                        setLanguage("en");
                        localStorage.setItem("preferredLanguage", "en");
                        setShowVideo(true);
                        setShowIntro(false);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                      English
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLangForVideo("de");
                        setLanguage("de");
                        localStorage.setItem("preferredLanguage", "de");
                        setShowVideo(true);
                        setShowIntro(false);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                      Deutsch
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Exibição do vídeo */}
            {showVideo && (
              <div className="absolute z-50 top-[4.5rem] left-0 w-full px-4 flex justify-center">
                <video
                  src={`/videos/${selectedLangForVideo}_Tarnung.mp4`}
                  autoPlay
                  className={`w-full max-w-5xl rounded shadow-lg transition-transform duration-1000 ${videoFinished ? "scale-50 translate-x-[-420px] translate-y-[300px]" : ""}`}
                  onEnded={() => {
                    setVideoFinished(true);
                    setInfoBadge(true);
                    setTimeout(() => {
                      setShowVideo(false);
                      setShowIntro(false);
                    }, 1000);
                  }}
                />
              </div>
            )}

            {category && !selectedPart && selectedCategoryObject?.image && (
              <div className="flex justify-center relative z-10">
                <img
                  src={selectedCategoryObject.image}
                  alt="Kategorie Übersicht"
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>
            )}

            {selectedPart && (
              <div className="relative z-10 px-4 pt-0">
                <div className="flex gap-4 mb-2 text-center">
                  <div className="border border-gray-400 p-2 rounded bg-white flex-1 shadow">
                    <div className="text-sm text-blue-700 font-semibold mb-1">{t.sku}</div>
                    {selectedPart.sku}
                  </div>
                  <div className="border border-gray-400 p-2 rounded bg-white flex-1 shadow">
                    <div className="text-sm text-blue-700 font-semibold mb-1">{t.description}</div>
                    {selectedPart[`description_${language}`]}
                  </div>
                </div>

                <div className="relative w-full max-w-5xl mx-auto mb-6">
                  <img
                    src={mainImage}
                    className="w-full h-auto max-h-[60vh] rounded shadow-md transition-transform duration-300 transform scale-100 hover:scale-105"
                    alt="Main part"
                  />
                  {/* Imagem secundária reposicionada para a direita da principal, sem sobreposição */}
                  <img
                    src={secondaryImage}
                    onClick={swapImages}
                    className="absolute top-[90%] right-[-7rem] transform -translate-y-1/2 w-24 h-24 object-contain border-2 border-white rounded shadow cursor-pointer transition-transform duration-300 hover:scale-110 z-20"
                    alt="Secondary"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="relative z-10 w-full">
            <img src={getFooter()} alt="Footer" className="w-full h-auto object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}
