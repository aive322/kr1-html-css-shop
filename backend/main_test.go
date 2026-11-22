package main

import (
	"compress/gzip"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestProductsAPI(t *testing.T) {
	products, err := loadProducts()
	if err != nil {
		t.Fatal(err)
	}
	server := newServer(products, t.TempDir())

	rec := httptest.NewRecorder()
	server.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/api/products", nil))

	if rec.Code != http.StatusOK {
		t.Fatalf("код ответа %d, ожидался 200", rec.Code)
	}
	if ct := rec.Header().Get("Content-Type"); ct != "application/json; charset=utf-8" {
		t.Fatalf("Content-Type = %q", ct)
	}
	var got []Product
	if err := json.Unmarshal(rec.Body.Bytes(), &got); err != nil {
		t.Fatal(err)
	}
	if len(got) != 18 {
		t.Fatalf("товаров %d, ожидалось 18", len(got))
	}
	if got[2].Title != "Power Bank 20000" || got[2].Price != 2000 || got[2].OldPrice != 2500 {
		t.Fatalf("неверные данные Power Bank: %+v", got[2])
	}
}

func TestOnlyGetAllowed(t *testing.T) {
	products, _ := loadProducts()
	server := newServer(products, t.TempDir())
	rec := httptest.NewRecorder()
	server.ServeHTTP(rec, httptest.NewRequest(http.MethodPost, "/api/products", nil))
	if rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("POST вернул %d, ожидался 405", rec.Code)
	}
}

func TestGzip(t *testing.T) {
	products, _ := loadProducts()
	server := newServer(products, t.TempDir())
	req := httptest.NewRequest(http.MethodGet, "/api/products", nil)
	req.Header.Set("Accept-Encoding", "gzip")
	rec := httptest.NewRecorder()
	server.ServeHTTP(rec, req)
	if rec.Header().Get("Content-Encoding") != "gzip" {
		t.Fatalf("ответ не сжат")
	}
	zr, err := gzip.NewReader(rec.Body)
	if err != nil {
		t.Fatal(err)
	}
	var got []Product
	if err := json.NewDecoder(zr).Decode(&got); err != nil || len(got) != 18 {
		t.Fatalf("сжатый ответ не читается: %v, товаров %d", err, len(got))
	}
}
