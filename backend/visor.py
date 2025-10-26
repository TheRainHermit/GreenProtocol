"""Módulo para detección de objetos en tiempo real usando YOLO y OpenCV."""

from ultralytics import YOLO
import cv2
import torch
from ultralytics.nn.tasks import DetectionModel
from torch.nn.modules.container import Sequential
from ultralytics.nn.modules.conv import Conv
from torch.nn.modules.conv import Conv2d
from torch.nn.modules.batchnorm import BatchNorm2d
from torch.nn.modules.activation import SiLU
from ultralytics.nn.modules.block import C3, C2f  # Solo si existen

torch.serialization.add_safe_globals([
    DetectionModel, Sequential, Conv, Conv2d, BatchNorm2d, SiLU, C3, C2f
])

# ✅ RUTA CORREGIDA
try:
    model = YOLO(r'runs/detect/train\weights/best.pt')  # Raw string
except (FileNotFoundError, RuntimeError):  # pylint: disable=broad-exception-caught
    try:
        model = YOLO('runs/detect/train/weights/best.pt')  # Forward slashes
    except (FileNotFoundError, RuntimeError):  # pylint: disable=broad-exception-caught
        # Si no existe el modelo personalizado, usar YOLO preentrenado
        model = YOLO('yolov8n.pt')
        print("⚠️  Usando modelo YOLOv8n preentrenado")

# Cargamos el video de entrada
cap = cv2.VideoCapture(0)  # pylint: disable=no-member

while cap.isOpened():
    # Leemos el frame del video
    ret, frame = cap.read()
    if not ret:
        break

    # Realizamos la inferencia de YOLO sobre el frame
    results = model(frame)

    # Extraemos los resultados
    annotated_frame = results[0].plot()

    # Visualizamos los resultados
    cv2.imshow("YOLO Inference", annotated_frame)
    # El ciclo se rompe al presionar "Esc"
    if cv2.waitKey(1) & 0xFF == 27:  # pylint: disable=no-member
        break

# Liberar recursos
cap.release()
cv2.destroyAllWindows()  # pylint: disable=no-member