import React from "react";
import Chart from "react-apexcharts";

const GraficoCotacao = ({ dados, periodo }) => {
    const options = {
        chart: {
            type: "area",
            toolbar: { show: false },
            zoom: { enabled: false },
        },
        dataLabels: { enabled: false },
        stroke: { curve: "smooth", width: 2 },
        xaxis: {
            type: "datetime",
            labels: {
                datetimeUTC: false,
                style: { colors: "#ccc" },
            },
        },
        yaxis: {
            labels: {
                style: { colors: "#ccc" },
                formatter: (val) => `R$ ${val.toFixed(2)}`,
            },
        },
        tooltip: {
            x: {
                format: periodo === "1D" ? "dd/MM HH:mm" : "dd/MM/yyyy",
            },
        },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0,
                stops: [0, 90, 100],
            },
        },
        colors: ["#10b981"],
        theme: { mode: "dark" },
    };

    const series = [
        {
            name: "Cotação",
            data: dados.map((item) => [item.timestamp, item.valor]),
        },
    ];

    return (
        <div className="mt-10 bg-white/5 p-4 rounded-xl border border-white/10">
            <h4 className="text-gray-200 text-lg font-semibold mb-4">Histórico da Cotação</h4>
            <Chart options={options} series={series} type="area" height={300} />
        </div>
    );
};

export default GraficoCotacao;