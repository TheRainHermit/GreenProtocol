from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import cv2
import torch
from ultralytics import YOLO
from ultralytics.nn.tasks import DetectionModel
from torch.nn.modules.container import Sequential
from ultralytics.nn.modules.conv import Conv
from torch.nn.modules.conv import Conv2d
from torch.nn.modules.batchnorm import BatchNorm2d
from torch.nn.modules.activation import SiLU
from ultralytics.nn.modules.block import C3, C2f, C3k2
import threading
import os
from web3 import Web3
import supabase
from dotenv import load_dotenv
load_dotenv()

# Permitir clases necesarias para cargar el modelo YOLO personalizado
torch.serialization.add_safe_globals([
    DetectionModel, Sequential, Conv, Conv2d, BatchNorm2d, SiLU, C3, C2f, C3k2
])

# Cargar el modelo avanzado
model = YOLO(r'runs/detect/train/weights/best.pt')

# Inicializar la cámara
cap = cv2.VideoCapture(0)

app = Flask(__name__)
CORS(app)

frame_lock = threading.Lock()
latest_frame = None
latest_prediction = {"material": None, "confidence": None}

# --- Mapeo de materiales a recompensa ---
MATERIAL_REWARD = {
    "Plástico PET": 2.00,
    "Plástico HDPE": 1.80,
    "Vidrio": 1.50,
    "Aluminio": 3.00,
    "Cartón": 1.00,
    "Papel": 0.80,
    "Acero": 2.50,
    "Tetra Pak": 1.20,
}

# --- Configuración de Supabase ---
SUPABASE_URL = "https://cdixwmhuzdsnakfbxzyv.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # Usa variable de entorno segura
supabase_client = supabase.create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Configuración de Web3 y contrato GREENSEED ---
WEB3_PROVIDER = "https://ethereum-sepolia-rpc.publicnode.com"  # O tu nodo privado
GREENSEED_CONTRACT_ADDRESS = "0xC7C31F6dba3fbbb00d9E2d73F6cF34A5A85E0E51"
GREENSEED_ABI = [
    {
        "constant": False,
        "inputs": [
            {"name": "to", "type": "address"},
            {"name": "amount", "type": "uint256"}
        ],
        "name": "transfer",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
    }
]
PRIVATE_KEY = os.getenv("BACKEND_PRIVATE_KEY")  # Usa variable de entorno segura

w3 = Web3(Web3.HTTPProvider(WEB3_PROVIDER))
greenseed_contract = w3.eth.contract(address=GREENSEED_CONTRACT_ADDRESS, abi=GREENSEED_ABI)
backend_wallet = w3.eth.account.from_key(PRIVATE_KEY)

def send_greenseed(to_address, amount):
    amount_wei = int(amount * (10 ** 18))
    nonce = w3.eth.get_transaction_count(backend_wallet.address)
    tx = greenseed_contract.functions.transfer(to_address, amount_wei).build_transaction({
        "from": backend_wallet.address,
        "nonce": nonce,
        "gas": 100000,
        "gasPrice": w3.to_wei("5", "gwei"),
    })
    signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    return tx_hash.hex()

def capture_frames():
    global latest_frame, latest_prediction
    while True:
        success, frame = cap.read()
        if not success:
            continue
        results = model(frame)
        annotated_frame = results[0].plot()
        with frame_lock:
            latest_frame = annotated_frame
            if results[0].boxes and len(results[0].boxes) > 0:
                best_box = max(results[0].boxes, key=lambda b: b.conf)
                material = results[0].names[int(best_box.cls)]
                confidence = float(best_box.conf)
                latest_prediction = {"material": material, "confidence": confidence}
            else:
                latest_prediction = {"material": None, "confidence": None}

def gen_frames():
    while True:
        with frame_lock:
            frame = latest_frame
        if frame is not None:
            ret, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/predict')
def predict():
    with frame_lock:
        return jsonify(latest_prediction)

@app.route('/deposit', methods=['POST'])
def deposit():
    data = request.get_json()
    material = data.get("material")
    wallet = data.get("wallet")

    if not material or not wallet or material not in MATERIAL_REWARD:
        return jsonify({"success": False, "error": "Datos inválidos"}), 400

    gseed_amount = MATERIAL_REWARD[material]

    # Realiza la transacción de GREENSEED y obtiene el hash
    try:
        tx_hash = send_greenseed(wallet, gseed_amount)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

    # Guarda el depósito en eco_transactions
    result = supabase_client.table("eco_transactions").insert({
        "wallet_id": wallet,
        "material_type": material,
        "gseed_amount": gseed_amount,
        "transaction_hash": tx_hash
    }).execute()

    return jsonify({
        "success": True,
        "material": material,
        "gseed_amount": gseed_amount,
        "transaction_hash": tx_hash,
        "db_result": result.data
    })

# Inicia el thread de captura al arrancar el servidor
if __name__ == "__main__":
    t = threading.Thread(target=capture_frames, daemon=True)
    t.start()
    app.run(host="0.0.0.0", port=5000)