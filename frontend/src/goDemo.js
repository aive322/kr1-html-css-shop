const assets = import.meta.glob('./generated/go-demo/*.{js,wasm}', {
  eager: true,
  import: 'default',
  query: '?url&no-inline'
});

const label = 'Практика №15 (Go / WebAssembly)';
const sample = Object.freeze({
  title: 'Power Bank 20000',
  price: 2000,
  oldPrice: 2500,
  isAvailable: true
});

function requirePrice(value, name) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new TypeError(`${name} должна быть целым неотрицательным числом`);
  }
}

function createCommands(go) {
  const commands = {
    sample,
    help() {
      console.info([
        'goDemo.run()',
        'goDemo.formatPrice(1990)',
        'goDemo.calculateDiscount(1990, 2490)',
        'goDemo.getProductStatus(false)',
        'goDemo.createProductSummary(goDemo.sample)',
        'goDemo.run({ title: "Мышь", price: 1990, oldPrice: 2490, isAvailable: true })'
      ].join('\n'));
    },
    formatPrice(price) {
      requirePrice(price, 'Цена');
      return go.formatPrice(price);
    },
    calculateDiscount(price, oldPrice) {
      requirePrice(price, 'Цена');
      requirePrice(oldPrice, 'Старая цена');
      return go.calculateDiscount(price, oldPrice);
    },
    getProductStatus(isAvailable) {
      if (typeof isAvailable !== 'boolean') throw new TypeError('Наличие должно быть true или false');
      return go.getProductStatus(isAvailable);
    },
    createProductSummary(product) {
      const { title, price, isAvailable } = product ?? {};
      if (typeof title !== 'string' || !title.trim()) {
        throw new TypeError('У товара должно быть название');
      }
      requirePrice(price, 'Цена');
      if (typeof isAvailable !== 'boolean') throw new TypeError('Наличие должно быть true или false');
      return go.createProductSummary(title, price, isAvailable);
    },
    run(product = sample) {
      const summary = commands.createProductSummary(product);
      const result = {
        'Цена': commands.formatPrice(product.price),
        'Скидка': commands.formatPrice(commands.calculateDiscount(product.price, product.oldPrice ?? product.price)),
        'Наличие': commands.getProductStatus(product.isAvailable),
        'Описание': summary
      };
      console.group(label);
      console.table(result);
      console.info('Ручной запуск: goDemo.run(). Все команды: goDemo.help()');
      console.groupEnd();
      return result;
    }
  };
  return Object.freeze(commands);
}

async function loadCommands(runtimeUrl, wasmUrl) {
  await import(/* @vite-ignore */ runtimeUrl);
  const go = new globalThis.Go();
  const response = await fetch(wasmUrl);
  if (!response.ok) throw new Error(`WebAssembly: HTTP ${response.status}`);

  const { instance } = await WebAssembly.instantiate(await response.arrayBuffer(), go.importObject);
  return new Promise((resolve, reject) => {
    globalThis.__tehnomarketGoReady = (functions) => {
      delete globalThis.__tehnomarketGoReady;
      resolve(createCommands(functions));
    };
    go.run(instance).then(() => {
      throw new Error('Go завершился');
    }).catch((error) => {
      delete globalThis.__tehnomarketGoReady;
      reject(error);
    });
  });
}

export function startGoDemo() {
  const runtimeUrl = assets['./generated/go-demo/wasm_exec.js'];
  const wasmUrl = assets['./generated/go-demo/go-demo.wasm'];
  if (!runtimeUrl || !wasmUrl) {
    console.info(`${label}: выполните npm run build:go-demo и перезапустите Vite.`);
    return;
  }

  globalThis.goDemoReady ??= loadCommands(runtimeUrl, wasmUrl).then((commands) => {
    globalThis.goDemo = commands;
    commands.run();
    return commands;
  });
  globalThis.goDemoReady.catch((error) => console.error(label, error));
}
