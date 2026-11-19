// Бэкенд интернет-магазина «ТехноМаркет» (практическая работа 15).
//
// Сервер отдаёт список товаров в формате JSON:
//
//	GET /api/products
//
// и, если собран фронтенд (frontend/dist), раздаёт React-приложение.
//
// Запуск: go run .   (адрес по умолчанию http://localhost:8080)
package main

import (
	"compress/gzip"
	_ "embed"
	"encoding/json"
	"flag"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// Список товаров встраивается в программу при сборке.
//
//go:embed data/products.json
var productsJSON []byte

// Spec — одна строка таблицы характеристик: [название, значение].
type Spec [2]string

// Review — отзыв покупателя.
type Review struct {
	Author string `json:"author"`
	Rating int    `json:"rating"`
	Text   string `json:"text"`
	Date   string `json:"date"`
}

// Product — товар магазина.
type Product struct {
	ID               int      `json:"id"`
	Slug             string   `json:"slug"`
	Title            string   `json:"title"`
	ShortDescription string   `json:"shortDescription"`
	Description      string   `json:"description"`
	Price            int      `json:"price"`
	OldPrice         int      `json:"oldPrice"`
	DiscountPercent  int      `json:"discountPercent"`
	Badge            string   `json:"badge"`
	BadgeType        string   `json:"badgeType"`
	IsAvailable      bool     `json:"isAvailable"`
	Rating           float64  `json:"rating"`
	ReviewsCount     int      `json:"reviewsCount"`
	Image            string   `json:"image"`
	ImageWidth       int      `json:"imageWidth"`
	ImageHeight      int      `json:"imageHeight"`
	Specs            []Spec   `json:"specs"`
	Reviews          []Review `json:"reviews"`
}

// loadProducts разбирает встроенный JSON в срез товаров.
func loadProducts() ([]Product, error) {
	var products []Product
	if err := json.Unmarshal(productsJSON, &products); err != nil {
		return nil, err
	}
	return products, nil
}

// productsHandler отвечает на GET /api/products.
func productsHandler(products []Product) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			w.Header().Set("Allow", "GET, HEAD")
			http.Error(w, "метод не поддерживается", http.StatusMethodNotAllowed)
			return
		}
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store")
		if err := json.NewEncoder(w).Encode(products); err != nil {
			log.Printf("ошибка записи ответа: %v", err)
		}
	}
}

// spaHandler раздаёт собранный React-сайт. Для адресов вида /catalog или
// /product/3, которых нет на диске, возвращается index.html — дальше
// страницу выбирает React Router.
func spaHandler(dir string) http.Handler {
	files := http.FileServer(http.Dir(dir))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := filepath.Join(dir, filepath.FromSlash(filepath.Clean("/"+r.URL.Path)))
		if info, err := os.Stat(path); err == nil && !info.IsDir() {
			files.ServeHTTP(w, r)
			return
		}
		if strings.HasPrefix(r.URL.Path, "/api/") {
			http.NotFound(w, r)
			return
		}
		http.ServeFile(w, r, filepath.Join(dir, "index.html"))
	})
}

// gzipResponseWriter сжимает ответ «на лету». Сжатие включается только при
// первой записи данных, поэтому пустые ответы (например, 304) не портятся.
type gzipResponseWriter struct {
	http.ResponseWriter
	gz *gzip.Writer
}

func (g *gzipResponseWriter) WriteHeader(code int) {
	if code != http.StatusNoContent && code != http.StatusNotModified {
		g.Header().Del("Content-Length") // длина после сжатия будет другой
		g.Header().Set("Content-Encoding", "gzip")
	}
	g.ResponseWriter.WriteHeader(code)
}

func (g *gzipResponseWriter) Write(b []byte) (int, error) {
	if g.gz == nil {
		if g.Header().Get("Content-Encoding") == "" {
			g.WriteHeader(http.StatusOK)
		}
		g.gz = gzip.NewWriter(g.ResponseWriter)
	}
	return g.gz.Write(b)
}

func (g *gzipResponseWriter) close() {
	if g.gz != nil {
		g.gz.Close()
	}
}

// compress сжимает текстовые ответы (HTML, CSS, JS, JSON) — страницы грузятся быстрее.
// Файлы из /assets/ с хешем в имени кешируются браузером на год.
func compress(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/assets/") {
			w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
		}
		ext := strings.ToLower(filepath.Ext(r.URL.Path))
		compressible := ext == "" || ext == ".html" || ext == ".css" || ext == ".js" || ext == ".json" || ext == ".svg" || ext == ".txt"
		if !compressible || r.Method == http.MethodHead || !strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
			next.ServeHTTP(w, r)
			return
		}
		w.Header().Add("Vary", "Accept-Encoding")
		r.Header.Del("Range") // сжатый ответ отдаём целиком
		gw := &gzipResponseWriter{ResponseWriter: w}
		defer gw.close()
		next.ServeHTTP(gw, r)
	})
}

// logRequests печатает в консоль каждый запрос и время ответа.
func logRequests(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s (%s)", r.Method, r.URL.Path, time.Since(start).Round(time.Millisecond))
	})
}

func newServer(products []Product, staticDir string) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/products", productsHandler(products))

	if info, err := os.Stat(filepath.Join(staticDir, "index.html")); err == nil && !info.IsDir() {
		mux.Handle("/", spaHandler(staticDir))
		log.Printf("раздаю фронтенд из папки %s", staticDir)
	} else {
		mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path != "/" {
				http.NotFound(w, r)
				return
			}
			w.Header().Set("Content-Type", "text/plain; charset=utf-8")
			w.Write([]byte("Сервер ТехноМаркет работает. Список товаров: /api/products\nЧтобы открыть сайт, соберите фронтенд: cd ../frontend && npm run build\n"))
		})
		log.Printf("папка %s не найдена — работает только API", staticDir)
	}
	return logRequests(compress(mux))
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	addr := flag.String("addr", ":"+port, "адрес сервера")
	static := flag.String("static", filepath.Join("..", "frontend", "dist"), "папка собранного фронтенда")
	flag.Parse()

	products, err := loadProducts()
	if err != nil {
		log.Fatalf("не удалось прочитать товары: %v", err)
	}
	log.Printf("загружено товаров: %d", len(products))
	log.Printf("сервер запущен: http://localhost%s (API: http://localhost%s/api/products)", *addr, *addr)
	log.Fatal(http.ListenAndServe(*addr, newServer(products, *static)))
}
