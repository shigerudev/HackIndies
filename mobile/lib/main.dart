import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert' as convert;
import 'package:crypto/crypto.dart';

/// Base URL del backend. Override: `flutter run --dart-define=API_BASE=http://10.0.2.2:3001`
const String apiBase = String.fromEnvironment(
  'API_BASE',
  defaultValue: 'http://localhost:3001',
);

void main() {
  runApp(const NomadCentinelaApp());
}

class NomadCentinelaApp extends StatelessWidget {
  const NomadCentinelaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NOMAD Centinela',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF22D3EE),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: const InstitutionsScreen(),
    );
  }
}

class Institution {
  Institution({
    required this.id,
    required this.name,
    required this.sector,
    required this.domainObfuscated,
  });

  final String id;
  final String name;
  final String sector;
  final String domainObfuscated;

  factory Institution.fromJson(Map<String, dynamic> json) {
    return Institution(
      id: json['id'] as String,
      name: json['name'] as String,
      sector: json['sector'] as String,
      domainObfuscated: json['domain_obfuscated'] as String,
    );
  }
}

/// SHA-1 hash of email, returns first 5 chars (k-anonymity prefix)
String emailToHashPrefix(String email) {
  final normalized = email.trim().toLowerCase();
  final bytes = utf8.encode(normalized);
  final digest = sha1.convert(bytes);
  return digest.toString().substring(0, 5);
}

class InstitutionsScreen extends StatefulWidget {
  const InstitutionsScreen({super.key});

  @override
  State<InstitutionsScreen> createState() => _InstitutionsScreenState();
}

class _InstitutionsScreenState extends State<InstitutionsScreen> {
  List<Institution> _institutions = [];
  bool _loading = true;
  bool _mock = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final res = await http.get(Uri.parse('$apiBase/api/institutions'));
      if (res.statusCode != 200) {
        throw Exception('HTTP ${res.statusCode}');
      }
      final body = jsonDecode(res.body) as Map<String, dynamic>;
      final list = (body['data'] as List)
          .map((e) => Institution.fromJson(e as Map<String, dynamic>))
          .toList();
      setState(() {
        _institutions = list;
        _mock = body['mock'] == true;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('NOMAD Centinela'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            tooltip: 'Chequeo ciudadano',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const CitizenCheckScreen()),
              );
            },
          ),
          IconButton(icon: const Icon(Icons.refresh), onPressed: _load),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('Error: $_error', textAlign: TextAlign.center),
                        const SizedBox(height: 8),
                        Text('API: $apiBase', style: Theme.of(context).textTheme.bodySmall),
                        const SizedBox(height: 16),
                        FilledButton(onPressed: _load, child: const Text('Reintentar')),
                      ],
                    ),
                  ),
                )
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (_mock)
                      Container(
                        margin: const EdgeInsets.all(12),
                        padding: const EdgeInsets.all(8),
                        color: Colors.amber.withValues(alpha: 0.2),
                        child: const Text('API en modo mock', textAlign: TextAlign.center),
                      ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text(
                        'Instituciones (${_institutions.length})',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                    ),
                    Expanded(
                      child: ListView.builder(
                        itemCount: _institutions.length,
                        itemBuilder: (context, i) {
                          final inst = _institutions[i];
                          return Card(
                            margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            child: ListTile(
                              title: Text(inst.name),
                              subtitle: Text(
                                '${inst.sector}\n${inst.domainObfuscated}',
                              ),
                              isThreeLine: true,
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
    );
  }
}

class CitizenCheckScreen extends StatefulWidget {
  const CitizenCheckScreen({super.key});

  @override
  State<CitizenCheckScreen> createState() => _CitizenCheckScreenState();
}

class _CitizenCheckScreenState extends State<CitizenCheckScreen> {
  final _emailController = TextEditingController();
  bool _loading = false;
  String? _error;
  Map<String, dynamic>? _result;
  bool _mock = false;

  Future<void> _check() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      setState(() => _error = 'Ingresá tu correo');
      return;
    }
    if (!email.contains('@')) {
      setState(() => _error = 'Correo inválido');
      return;
    }

    final prefix = emailToHashPrefix(email);

    setState(() {
      _loading = true;
      _error = null;
      _result = null;
    });

    try {
      final res = await http.post(
        Uri.parse('$apiBase/api/citizen/check'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'hash_prefix': prefix}),
      );
      final body = jsonDecode(res.body) as Map<String, dynamic>;
      setState(() {
        _result = body;
        _mock = body['mock'] == true;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chequeo k-anonymity'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(Icons.security, size: 48, color: Color(0xFF22D3EE)),
            const SizedBox(height: 16),
            Text(
              '¿Fui comprometido?',
              style: Theme.of(context).textTheme.headlineSmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Tu correo nunca sale del dispositivo. Solo el prefijo SHA-1 (5 chars) viaja al servidor.',
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(
                labelText: 'Correo electrónico',
                hintText: 'tu@email.com',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.email),
              ),
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.done,
              onSubmitted: (_) => _check(),
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: _loading ? null : _check,
              child: _loading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Verificar'),
            ),
            if (_mock)
              Container(
                margin: const EdgeInsets.only(top: 12),
                padding: const EdgeInsets.all(8),
                color: Colors.amber.withValues(alpha: 0.2),
                child: const Text('API en modo mock — resultados de demostración',
                  textAlign: TextAlign.center, style: TextStyle(fontSize: 12)),
              ),
            if (_error != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                color: Colors.red.withValues(alpha: 0.2),
                child: Text(_error!, style: const TextStyle(color: Colors.red)),
              ),
            ],
            if (_result != null) ...[
              const SizedBox(height: 24),
              _buildResultCard(_result!),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildResultCard(Map<String, dynamic> result) {
    final exposed = result['exposed'] as bool? ?? false;
    final events = result['events'] as List? ?? [];
    final recommendations = result['recommendations'] as List? ?? [];

    return Card(
      color: exposed
          ? Colors.red.withValues(alpha: 0.15)
          : Colors.green.withValues(alpha: 0.15),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  exposed ? Icons.warning : Icons.check_circle,
                  color: exposed ? Colors.red : Colors.green,
                ),
                const SizedBox(width: 8),
                Text(
                  exposed
                      ? 'Tu prefijo aparece en ${events.length} brechan${events.length != 1 ? 's' : ''} de demostración'
                      : 'No encontramos tu prefijo en brechas publicadas de demo',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: exposed ? Colors.red : Colors.green,
                  ),
                ),
              ],
            ),
            if (events.isNotEmpty) ...[
              const SizedBox(height: 12),
              const Text('Eventos relacionados:', style: TextStyle(fontWeight: FontWeight.w500)),
              const SizedBox(height: 4),
              ...events.map((e) => Padding(
                padding: const EdgeInsets.only(left: 8, top: 4),
                child: Text('• ${e['title'] ?? 'Sin título'} — ${e['institution_name'] ?? ''}'),
              )),
            ],
            if (recommendations.isNotEmpty) ...[
              const SizedBox(height: 12),
              const Text('Recomendaciones:', style: TextStyle(fontWeight: FontWeight.w500)),
              ...recommendations.map((r) => Padding(
                padding: const EdgeInsets.only(left: 8, top: 4),
                child: Text('• $r'),
              )),
            ],
          ],
        ),
      ),
    );
  }
}