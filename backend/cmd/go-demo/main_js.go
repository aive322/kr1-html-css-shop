package main

import (
	"strconv"
	"syscall/js"
)

func formatPrice(price int) string {
	return strconv.Itoa(price) + " ₽"
}

func calculateDiscount(price, oldPrice int) int {
	return max(0, oldPrice-price)
}

func getProductStatus(isAvailable bool) string {
	if isAvailable {
		return "В наличии"
	}
	return "Нет в наличии"
}

func createProductSummary(title string, price int, isAvailable bool) string {
	return title + " — " + formatPrice(price) + ". " + getProductStatus(isAvailable) + "."
}

func main() {
	// Аргументы проверяет JS-обёртка перед вызовом этих функций.
	js.Global().Call("__tehnomarketGoReady", map[string]any{
		"formatPrice": js.FuncOf(func(_ js.Value, args []js.Value) any {
			return formatPrice(args[0].Int())
		}),
		"calculateDiscount": js.FuncOf(func(_ js.Value, args []js.Value) any {
			return calculateDiscount(args[0].Int(), args[1].Int())
		}),
		"getProductStatus": js.FuncOf(func(_ js.Value, args []js.Value) any {
			return getProductStatus(args[0].Bool())
		}),
		"createProductSummary": js.FuncOf(func(_ js.Value, args []js.Value) any {
			return createProductSummary(args[0].String(), args[1].Int(), args[2].Bool())
		}),
	})
	// WebAssembly остаётся запущенным, чтобы функции можно было вызвать из DevTools.
	select {}
}
