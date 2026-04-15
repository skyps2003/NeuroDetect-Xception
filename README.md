# 🧠 NeuroDetect AI - despliegue en Render

Bienvenido a la guía de despliegue para la aplicación full-stack **NeuroDetect AI** (Sistema de detección de tumores cerebrales utilizando Inteligencia Artificial).

Este documento te guiará paso a paso para subir tu proyecto (Frontend y Backend) a **Render**, una de las plataformas de alojamiento gratuito más populares e intuitivas.

---

## 🛠️ Modificaciones Preparativas (Ya Aplicadas)

Antes de empezar, he optimizado tu código para la web:
1. **TensorFlow Lite/CPU:** En `backend/requirements.txt`, cambiamos `tensorflow` por `tensorflow-cpu`. Render en su capa gratuita tiene 512 MB de RAM; la versión de CPU consume mucha menos memoria e impide que tu servidor colapse al analizar una resonancia.
2. **Conexión Dinámica entre Front y Back:** En `App.jsx`, modifiqué de `http://localhost:8000` a una variable de entorno `VITE_API_URL`. Así, en tu computadora funciona con localhost, pero en Render usará la URL correcta de producción automáticamente.

---

## 🚀 Paso 1: Subir tu código a GitHub

Para que Render pueda alojar tu código, primero debes tenerlo en un repositorio alojado.

1. Abre tu terminal en la carpeta principal del proyecto (`Proyecto/`).
2. Sube el código ejecutando:
   ```bash
   git init
   git add .
   git commit -m "Versión lista para producción"
   ```
3. Ve a [GitHub](https://github.com/), crea un nuevo repositorio y sigue las instrucciones que aparecen allí para vincular tu repositorio local con el remoto (`git remote add origin...` y luego `git push -u origin main`).

---

## ⚙️ Paso 2: Desplegar el Backend (FastAPI / IA)

1. Ingresa a tu cuenta de [Render.com](https://render.com/) y entra a tu "Dashboard".
2. Haz clic en el botón **"New"** y selecciona **"Web Service"**.
3. Conecta tu cuenta de GitHub y selecciona el repositorio de tu proyecto.
4. Completa el formulario de configuración con estos valores:
   - **Name:** neurodetect-backend (puedes elegir el que quieras).
   - **Root Directory:** `backend` *(⚠️ MUY IMPORTANTE: Esto le dice a Render que entre a la carpeta del backend)*.
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Al final de la configuración, escoge el **Free plan** (Gratis) y haz clic en **"Create Web Service"**.
6. Render tardará unos minutos instalando TensorFlow y todo lo demás. Una vez termine dirá "Live". **Copia la URL que genera**, se verá parecida a `https://neurodetect-backend.onrender.com`.

---

## 💻 Paso 3: Desplegar el Frontend (React)

1. En el **Dashboard** de Render, haz clic nuevamente en **"New"** y esta vez selecciona **"Static Site"**.
2. Selecciona el mismo repositorio de GitHub de tu proyecto.
3. Completa el formulario con estos valores:
   - **Name:** neurodetect-frontend (el que prefieras).
   - **Root Directory:** `frontend` *(⚠️ MUY IMPORTANTE)*.
   - **Build Command:** `npm install && npm run build`
   - **Publish directory:** `dist`
4. Expande la sección que dice **"Advanced"** y haz clic en **"Add Environment Variable"** (Variables de Entorno). 
5. Añade la siguiente variable:
   - **Key:** `VITE_API_URL`
   - **Value:** *(Pega aquí la URL de tu Backend que copiaste en el paso anterior y asegúrate de que no tenga barra `/` final, debe verse así: `https://neurodetect-backend.onrender.com`)*.
6. Haz clic en **"Create Static Site"**.
7. ¡Espera un par de minutos a que finalice y te dará un nuevo link público donde ya podrás usar tu webapp de NeuroDetect AI con Inteligencia Artificial desde cualquier parte del mundo!

---

## ⚠️ Posibles Problemas y Soluciones

- **Render dice "Memory Limit Exceeded" en tu backend**: Como el modelo Xception de TensorFlow que usamos es grande, las cuentas gratuitas (512mb de RAM) a veces se asfixian. Si el backend muere al momento de tratar de analizar una imagen, podrías requerir un plan de pago básico o usar modelos más pequeños (MobileNet).
- **El Frontend dice "Network Error" o no analiza la imagen:** Cerciórate de que agregaste la variable `VITE_API_URL` en tu Static Site, asegurándote de usar `https://` y de no acabar el link con una `/`.
- **CORS Error:** Si el navegador bloquea la comunicación entre el Front y el Back en Render, debes de verificar que en `backend/main.py` tu método `CORSMiddleware` tenga configurado `allow_origins=["*"]`.
