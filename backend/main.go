package main

import (
	"encoding/json"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"io"
	"io/ioutil"
	"net/http"
	"os"
)

type CotacaoResponse struct {
	USDBRL struct {
		Bid string `json:"bid"`
	} `json:"USDBRL"`
}

func main() {
	
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

	router.Use(cors.Default())

	router.GET("/cotacao", func(c *gin.Context) {
		moedaDe := c.Query("de")
		moedaPara := c.Query("para")

		if moedaDe == "" || moedaPara == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetros 'de' e 'para' são obrigatórios"})
			return
		}

		url := "https://economia.awesomeapi.com.br/json/last/" + moedaDe + "-" + moedaPara
		resp, err := http.Get(url)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar cotação"})
			return
		}
		defer func(Body io.ReadCloser) {
			err := Body.Close()
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao fechar resposta"})
				return
			}
		}(resp.Body)

		body, _ := ioutil.ReadAll(resp.Body)

		var dados map[string]map[string]string

		if err := json.Unmarshal(body, &dados); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao interpretar resposta"})
			return
		}

		chave := moedaDe + moedaPara
		cotacao := dados[chave]["bid"]

		c.JSON(http.StatusOK, gin.H{"cotacao": cotacao})
	})

	router.GET("/historico", func(c *gin.Context) {
		moedaDe := c.Query("de")
		moedaPara := c.Query("para")
		periodo := c.DefaultQuery("periodo", "1D")

		if moedaDe == "" || moedaPara == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetros 'de' e 'para' são obrigatórios"})
			return
		}

		var url string
		var dados []map[string]interface{}

		if periodo == "1D" {

			apiKey := os.Getenv("API_KEY")
			if apiKey == "" {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "API key não configurada"})
				return
			}

			url = "https://api.twelvedata.com/time_series?symbol=" + moedaDe + "/" + moedaPara + "&interval=1h&outputsize=24&apikey=" + apiKey

			resp, err := http.Get(url)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar histórico"})
				return
			}
			defer func(Body io.ReadCloser) {
				err := Body.Close()
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao fechar resposta"})
					return
				}
			}(resp.Body)

			body, _ := ioutil.ReadAll(resp.Body)

			var response map[string]interface{}
			if err := json.Unmarshal(body, &response); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao interpretar resposta da TwelveData"})
				return
			}

			if values, ok := response["values"].([]interface{}); ok {
				for _, item := range values {
					if entry, ok := item.(map[string]interface{}); ok {
						dados = append(dados, map[string]interface{}{
							"timestamp": entry["datetime"],
							"valor":     entry["close"],
						})
					}
				}
			}
		} else {
			dias := map[string]string{
				"5D": "5",
				"1M": "30",
			}
			limit := dias[periodo]
			if limit == "" {
				limit = "30"
			}

			url = "https://economia.awesomeapi.com.br/json/daily/" + moedaDe + "-" + moedaPara + "/" + limit

			resp, err := http.Get(url)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar histórico"})
				return
			}
			defer func(Body io.ReadCloser) {
				err := Body.Close()
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao fechar resposta"})
					return
				}
			}(resp.Body)

			body, _ := ioutil.ReadAll(resp.Body)

			var response []map[string]interface{}
			if err := json.Unmarshal(body, &response); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao interpretar resposta da AwesomeAPI"})
				return
			}

			for _, item := range response {
				dados = append(dados, map[string]interface{}{
					"timestamp": item["timestamp"],
					"valor":     item["bid"],
				})
			}
		}

		c.JSON(http.StatusOK, gin.H{"dados": dados})
	})

	err := router.Run(":8080")
	if err != nil {
		return
	}
}
