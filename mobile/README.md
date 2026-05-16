# NOMAD Centinela — Mobile (Flutter)

## Requisitos

- Flutter SDK 3.3+
- Backend corriendo en `http://localhost:3001`

## Ejecutar

```bash
cd mobile
flutter pub get
flutter run
```

### Android emulator

```bash
flutter run --dart-define=API_BASE=http://10.0.2.2:3001
```

### iOS simulator

```bash
flutter run --dart-define=API_BASE=http://localhost:3001
```

## Fase 0

Pantalla de lista de instituciones desde `GET /api/institutions`.

Check ciudadano y chat: Fase 1.
