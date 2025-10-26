# EcoChain ReFi

**EcoChain ReFi** es una plataforma para el reconocimiento y depósito de materiales reciclables, que recompensa a los usuarios con la moneda digital $EC0 por cada depósito exitoso. El sistema integra un frontend moderno (Next.js/React), un backend avanzado en Python con detección de materiales en tiempo real usando YOLO y OpenCV, y una base de datos en Supabase.

---

## Características

- **Reconocimiento de materiales reciclables en tiempo real** usando cámara y modelos YOLO personalizados.
- **Recompensas automáticas en $EC0** por cada depósito registrado.
- **Integración con Supabase** para registro de transacciones y usuarios.
- **Visualización de saldo y transacciones** en la wallet del usuario.
- **Frontend intuitivo y responsivo** para simular y visualizar el proceso de depósito.

---

## Estructura del proyecto

```
EcoChainReFi/
│
├── backend/           # Backend Python (Flask, YOLO, Supabase)
│   ├── app.py         # API principal y lógica de reconocimiento
│   ├── requirements.txt
│   └── ...            
│
├── frontend/          # Frontend Next.js/React
│   ├── components/
│   ├── pages/
│   └── ...
│
├── .env               # Variables de entorno (Supabase, contrato, backend)
└── README.md
```

---

## Instalación y ejecución

### 1. Clona el repositorio

```bash
git clone https://github.com/tuusuario/EcoChainReFi.git
cd EcoChainReFi
```

### 2. Configura las variables de entorno

Crea un archivo `.env` en la raíz y/o en `backend/` con tus claves de Supabase y contrato:

```env
NEXT_PUBLIC_SUPABASE_URL=https://itbbjpupkzjinulppsso.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
ECOCOIN_CONTRACT_ADDRESS=0x256492d87947589e589FE58805AC1D36E5488b07
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### 3. Instala dependencias del backend

```bash
cd backend
pip install -r requirements.txt
```

### 4. Instala dependencias del frontend

```bash
cd ../frontend
npm install
```

### 5. Ejecuta el backend

```bash
cd ../backend
python app.py
```

### 6. Ejecuta el frontend

```bash
cd ../frontend
npm run dev
```

---

## Uso

1. Accede al frontend en [http://localhost:3000](http://localhost:3000).
2. Simula el depósito de materiales reciclables usando la cámara.
3. Visualiza el material detectado y la recompensa en $EC0.
4. Consulta tu historial y saldo en la wallet.

---

## Despliegue

- **Frontend:** Puede desplegarse en Vercel, Netlify, o cualquier plataforma de hosting para Next.js.
- **Backend:** Requiere un entorno persistente (VPS, Docker, Railway, Render, etc.) por las dependencias de IA y procesamiento de video. No es compatible con serverless puro en Vercel.

---

## Notas de seguridad

- **No compartas claves privadas ni service role keys en repositorios públicos.**
- Usa wallets dedicadas para el backend y nunca expongas tus claves en el frontend.

---

## Licencia

MIT

---

## Contacto

Para dudas, sugerencias o soporte, abre un issue en el repositorio o contacta a [tuusuario@correo.com](mailto:tuusuario@correo.com).