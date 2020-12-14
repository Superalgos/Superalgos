# telegram-typings

Full types parsed from core.telegram.org/bots/api for TypeScript and Flowtype

## Installation

Just install it as your dependency and use

```bash
npm install --save telegram-typings
```

```ts
// typescript
import { User, Chat, Voice } from 'telegram-typings'
```

### Flow

```bash
# Search in flow-typed
flow-typed search telegram-typings

# if not found, copy content of ./javascript/index.js.flow to your flow-typed
wget https://raw.githubusercontent.com/sergeysova/telegram-typings/master/javascript/index.js.flow -O ./flow-typed/npm/telegram-typings_vx.x.x.js
# next use as normal module
```

```js
// flow
import type { User, Chat, Voice } from 'telegram-typings'
```
