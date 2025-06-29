import React, {useState, useEffect} from "react";
import axios from "axios";
import "./App.css";
import GraficoCotacao from "./GraficoCotacao.jsx";
import Select from "react-select";

function App() {

    const [de, setDe] = useState("USD");
    const [para, setPara] = useState("BRL");
    const [cotacao, setCotacao] = useState(null);
    const [loading, setLoading] = useState(false);
    const [periodo, setPeriodo] = useState("1D");
    const periodos = ["1D", "5D", "1M"];
    const [historico, setHistorico] = useState([]);

    const opcoesMoeda = [
        { value: 'BRL', label: 'BRL - Real Brasileiro' },
        { value: 'USD', label: 'USD - Dólar Americano' },
        { value: 'EUR', label: 'EUR - Euro' },
        { value: 'GBP', label: 'GBP - Libra Esterlina' },
        { value: 'JPY', label: 'JPY - Iene Japonês' },
        { value: 'AUD', label: 'AUD - Dólar Australiano' },
        { value: 'CHF', label: 'CHF - Franco Suíço' },
        { value: 'CAD', label: 'CAD - Dólar Canadense' },
        { value: 'CNY', label: 'CNY - Yuan Chinês' },
        { value: 'ARS', label: 'ARS - Peso Argentino' },
    ];

    const customStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: '#1f2937',
            borderColor: state.isFocused ? '#4b5563' : '#1f2937',
            boxShadow: state.isFocused ? '0 0 0 2px #4b5563' : 'none',
            color: '#fff',
            borderRadius: '.5rem',
            padding: '.5rem',
            transition: 'all 0.2s ease-in-out',
        }),
        singleValue: (base) => ({
            ...base,
            color: '#fff',
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: '#111827',
            marginTop: 4,
        }),
        option: (base, { isFocused }) => ({
            ...base,
            backgroundColor: isFocused ? '#374151' : '#111827',
            color: '#fff',
            cursor: 'pointer',
            padding: '10px 12px',
        }),
    };


    useEffect(() => {
        const fetchHistorico = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/historico`, {
                    params: { de, para, periodo },
                });

                const dados = res.data.dados
                    .map((item) => {
                        const timestamp =
                            periodo === "1D"
                                ? new Date(item.timestamp).getTime()
                                : parseInt(item.timestamp) * 1000;

                        return {
                            timestamp,
                            valor: parseFloat(item.valor),
                        };
                    })
                    .sort((a, b) => a.timestamp - b.timestamp);

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
            .get(`${import.meta.env.VITE_API_URL}/cotacao`, {
                params: { de, para },
            })
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
                    <Select
                        value={opcoesMoeda.find((opt) => opt.value === de)}
                        onChange={(opcao) => setDe(opcao.value)}
                        options={opcoesMoeda}
                        styles={customStyles}
                    />
                </div>

                <div className="mb-8">
                    <label className="block mb-2 text-sm font-medium tracking-wide">Para</label>
                    <Select
                        value={opcoesMoeda.find((opt) => opt.value === para)}
                        onChange={(opcao) => setPara(opcao.value)}
                        options={opcoesMoeda}
                        styles={customStyles}
                    />
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