import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import GraficoCotacao from "./GraficoCotacao.jsx";
import Select from "react-select";
import { GoArrowSwitch } from "react-icons/go";
import { NumericFormat } from 'react-number-format';

function App() {

    const [valor, setValor] = useState(1);
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
        { value: 'BTC', label: 'BTC - Bitcoin' },
        { value: 'AUD', label: 'AUD - Dólar Australiano' },
        { value: 'CHF', label: 'CHF - Franco Suíço' },
        { value: 'CAD', label: 'CAD - Dólar Canadense' },
        { value: 'CNY', label: 'CNY - Yuan Chinês' },
        { value: 'ARS', label: 'ARS - Peso Argentino' },
    ];

    const moedaSimbolos = {
        'BRL': 'R$',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'BTC': '₿',
        'AUD': 'A$',
        'CHF': 'CHF',
        'CAD': 'C$',
        'CNY': '¥',
        'ARS': '$'
    };

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
            zIndex: 100,
        }),
        input: (base) => ({
            ...base,
            color: '#fff',
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
                        const timestamp = parseInt(item.timestamp) * 1000;

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

    const trocarMoedas = () => {
        const temp = de;
        setDe(para);
        setPara(temp);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-6">
            <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl shadow-2xl min-w-1/3 w-full max-w-md p-8 text-gray-100 border border-white/10 ring-1 ring-white/5">

                <div className="d-flex flex-col gap-3">

                    <p className="inline-block px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 border border-emerald-500/20">
                        <span className="mr-2">📈</span> Cotação em Tempo Real
                    </p>

                    <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
                        Conversor
                    </h3>
                    <p className="text-gray-400 mb-8 text-sm">
                        Atualizado em: {new Date().toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </p>
                </div>

                <div className="flex flex-col items-center justify-between mb-8 relative">
                    <div className="w-full group">
                        <label className="block mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider group-focus-within:text-emerald-400 transition-colors">De</label>
                        <Select
                            value={opcoesMoeda.find((opt) => opt.value === de)}
                            onChange={(opcao) => setDe(opcao.value)}
                            options={opcoesMoeda}
                            styles={customStyles}
                        />
                    </div>

                    <button
                        onClick={trocarMoedas}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-gray-800 border border-gray-700 hover:bg-gray-700 text-emerald-400 hover:text-emerald-300 hover:scale-110 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"
                        title="Trocar moedas"
                    >
                        <GoArrowSwitch className="text-xl rotate-90" />
                    </button>

                    <div className="w-full mt-6 group">
                        <label className="block mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider group-focus-within:text-emerald-400 transition-colors">Para</label>
                        <Select
                            value={opcoesMoeda.find((opt) => opt.value === para)}
                            onChange={(opcao) => setPara(opcao.value)}
                            options={opcoesMoeda}
                            styles={customStyles}
                        />
                    </div>
                </div>

                {loading ? (
                    <p className="text-center text-indigo-300 font-medium animate-pulse">Carregando...</p>
                ) : cotacao ? (
                    <>
                        <div className="my-10">
                            <label className="block mb-2 text-sm font-medium tracking-wide">Valor</label>
                            <NumericFormat
                                value={valor}
                                onValueChange={(values) => {
                                    if (values.floatValue !== undefined) {
                                        setValor(values.floatValue);
                                    }
                                }}
                                thousandSeparator="."
                                decimalSeparator=","
                                allowNegative={false}
                                allowLeadingZeros={false}
                                isNumericString
                                className="w-full bg-white/10 text-gray-100 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-600"
                            />
                        </div>

                        <p className="text-center text-xl font-semibold drop-shadow-md flex items-center justify-center gap-3">
                            <span>{moedaSimbolos[de]} {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            <GoArrowSwitch className="text-gray-300 text-xl" />
                            <span>{moedaSimbolos[para]} {(parseFloat(cotacao) * valor).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
                        </p>

                        <div className="flex flex-wrap gap-2 justify-center mt-6">
                            {periodos.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriodo(p)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${periodo === p
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