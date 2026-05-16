import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

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
