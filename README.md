# Green Protocol

Green Protocol es una plataforma que incentiva el reciclaje y la economía circular mediante recompensas en tokens $GSEED y su conversión automática a PYUSD en la red Ethereum Sepolia.

---

## 🚀 ¿Cómo funciona?

1. **Depósito de Materiales:**  
   El usuario selecciona el material reciclable desde el frontend (o mediante reconocimiento automático si está habilitado).
2. **Recompensa en $GSEED:**  
   Por cada depósito, el backend transfiere tokens $GSEED reales al wallet del usuario en Sepolia.
3. **Swap Automático a PYUSD:**  
   El backend realiza automáticamente el swap de $GSEED a PYUSD y transfiere PYUSD al usuario.
4. **Historial y Balance:**  
   El usuario puede ver su balance real en blockchain, historial de transacciones y canjear recompensas.

---

## 🛠️ Instalación y ejecución

### 1. Clona el repositorio

```bash
git clone https://github.com/tuusuario/green-protocol.git
cd green-protocol
```

### 2. Variables de entorno

Crea un archivo `.env` en la raíz del backend con:

```
SUPABASE_SERVICE_ROLE_KEY=tu_clave_supabase
BACKEND_COINBASE_PRIVATE_KEY=tu_clave_privada_wallet_backend
```

Asegúrate de tener fondos de ETH (para gas), $GSEED y PYUSD en la wallet del backend.

### 3. Instala dependencias

#### Backend (Flask)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # En Windows
pip install -r requirements.txt
```

#### Frontend (Next.js)

```bash
cd ..
npm install
```

### 4. Ejecuta el backend

```bash
cd backend
python app.py
```

### 5. Ejecuta el frontend

```bash
cd ..
npm run dev
```

---

## 🧪 Pruebas de endpoints con Postman

### Transferir GSEED

- **POST** `http://localhost:5000/send_gseed`
- **Body:**
  ```json
  {
    "to_address": "0xTuWalletDestino",
    "amount": 2.0
  }
  ```

### Swap a PYUSD

- **POST** `http://localhost:5000/swap`
- **Body:**
  ```json
  {
    "wallet": "0xTuWalletDestino",
    "gseed_amount": 2.0
  }
  ```

---

## 📝 Notas importantes

- El contrato de $GSEED está desplegado en Sepolia:  
  `0xC7C31F6dba3fbbb00d9E2d73F6cF34A5A85E0E51`
- El contrato de PYUSD está desplegado en Sepolia:  
  `0xcac524bca292aaade2df8a05cc58f0a65b1b3bb9`
- El backend debe tener fondos de ambos tokens y ETH para gas.
- El frontend muestra el balance real consultando la blockchain.
- El endpoint `/predict` es dummy por defecto, puedes habilitar el reconocimiento automático si tienes el modelo y hardware.

---

## 📂 Estructura del proyecto

```
/backend
  app.py
  requirements.txt
/components
  Dashboard.tsx
  MaterialDeposit.tsx
  ...
/lib
  supabase.ts
  wallet-utils.ts
...
```

---

## 🤝 Contribuciones

¡Pull requests y sugerencias son bienvenidas!

---

## 📄 Licencia

MIT