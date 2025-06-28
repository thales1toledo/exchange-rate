import React, {useState, useEffect} from "react";
import axios from "axios";
import "./App.css";
import GraficoCotacao from "./GraficoCotacao.jsx";

function App() {
    const [de, setDe] = useState("USD");
    const [para, setPara] = useState("BRL");
    const [cotacao, setCotacao] = useState(null);
    const [loading, setLoading] = useState(false);

    const [periodo, setPeriodo] = useState("1D");
    const periodos = ["1D", "5D", "1M"];

    const [historico, setHistorico] = useState([]);

    useEffect(() => {
        const fetchHistorico = async () => {
            try {

                const res = await axios.get("http://localhost:8080/historico", {
                    params: { de, para, periodo },
                });

                const agora = Date.now();
                const ontem = agora - 24 * 60 * 60 * 1000;

                const dados = res.data.dados
                    .map((item) => {
                        const timestamp =
                            periodo === "1D"
                                ? new Date(item.timestamp).getTime() // ex: "2025-06-28 08:00:00"
                                : parseInt(item.timestamp) * 1000; // ex: "1751058943" (segundos)

                        return {
                            timestamp,
                            valor: parseFloat(item.valor),
                        };
                    })
                    .filter((item) => {
                        if (periodo === "1D") {
                            return item.timestamp >= ontem && item.timestamp <= agora;
                        }

                        return true;
                    })
                    .sort((a, b) => a.timestamp - b.timestamp); // Ordena por ordem crescente de timestamp

                setHistorico(dados);

            } catch (err) {
                console.error("Erro ao buscar histórico", err);
                setHistorico([]);
            }
        };

        fetchHistorico();
    }, [de, para, periodo]);

    useEffect(() => {
        if (!de || !para) return;

        setLoading(true);
        axios
            .get(`http://localhost:8080/cotacao?de=${de}&para=${para}`)
            .then((res) => {
                setCotacao(res.data.cotacao);
            })
            .catch(() => setCotacao(null))
            .finally(() => setLoading(false));
    }, [de, para]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center p-6">
            <div className="bg-black/40 backdrop-blur-md rounded-3xl shadow-2xl min-w-1/4 w-full max-w-md p-8 text-gray-100 border border-white/20">

                <div className="d-flex flex-col gap-3">

                    <p className="inline-block px-4 py-2 bg-emerald-400/10 bg-opacity-20 text-emerald-300 rounded-full text-sm mb-4">
                        <span className="mr-1.25">📈</span> Cotação em Tempo Real
                    </p>

                    <h3 className="text-4xl font-bold drop-shadow-md mb-4">
                        Conversor de Moedas
                    </h3>

                    <p className="text-sm text-gray-400 mb-4">
                        Atualizado em: {new Date().toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </p>
                </div>

                <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium tracking-wide">De</label>
                    <select
                        value={de}
                        onChange={(e) => setDe(e.target.value)}
                        className="w-full rounded-lg bg-white/10 px-4 py-3 border border-white/30 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                    >
                        <option value="USD">USD - Dólar Americano</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - Libra Esterlina</option>
                        <option value="JPY">JPY - Iene Japonês</option>
                        <option value="AUD">AUD - Dólar Australiano</option>
                        <option value="CHF">CHF - Franco Suíço</option>
                        <option value="CAD">CAD - Dólar Canadense</option>
                        <option value="CNY">CNY - Yuan Chinês</option>
                        <option value="ARS">ARS - Peso Argentino</option>
                        <option value="TRY">TRY - Lira Turca</option>
                        <option value="BRL">BRL - Real Brasileiro</option>
                    </select>
                </div>

                <div className="mb-8">
                    <label className="block mb-2 text-sm font-medium tracking-wide">Para</label>
                    <select
                        value={para}
                        onChange={(e) => setPara(e.target.value)}
                        className="w-full rounded-lg bg-white/10 px-4 py-3 border border-white/30 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                    >
                        <option value="BRL">BRL - Real Brasileiro</option>
                        <option value="USD">USD - Dólar Americano</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - Libra Esterlina</option>
                        <option value="JPY">JPY - Iene Japonês</option>
                        <option value="AUD">AUD - Dólar Australiano</option>
                        <option value="CHF">CHF - Franco Suíço</option>
                        <option value="CAD">CAD - Dólar Canadense</option>
                        <option value="CNY">CNY - Yuan Chinês</option>
                        <option value="ARS">ARS - Peso Argentino</option>
                        <option value="TRY">TRY - Lira Turca</option>
                    </select>
                </div>

                {loading ? (
                    <p className="text-center text-indigo-300 font-medium animate-pulse">Carregando...</p>
                ) : cotacao ? (
                    <>
                        <p className="text-center text-2xl font-semibold drop-shadow-md">
                            1 {de} = {parseFloat(cotacao).toFixed(2)} {para}
                        </p>

                        <div className="flex flex-wrap gap-2 justify-center mt-6">
                            {periodos.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriodo(p)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                                        periodo === p
                                            ? "bg-purple-600 text-white"
                                            : "bg-white/10 text-gray-300 hover:bg-white/20"
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        <GraficoCotacao dados={historico} periodo={periodo} />
                    </>
                ) : (
                    <p className="text-center text-red-400 font-semibold">
                        Erro ao buscar cotação
                    </p>
                )}
            </div>
        </div>
    );
}

export default App;